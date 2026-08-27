import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

import {
    COOKIE_NAME,
    verifyAdminToken,
} from "@/lib/admin-auth";

import { createSlug } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// CEK ADMIN
// =====================================================

async function isAdmin() {
    const cookieStore = await cookies();

    const token =
        cookieStore.get(COOKIE_NAME)?.value;

    return verifyAdminToken(token);
}

// =====================================================
// GET
// =====================================================

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);

        const adminRequested =
            url.searchParams.get("admin") === "true";

        const authenticated =
            await isAdmin();

        if (
            adminRequested &&
            !authenticated
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Akses admin diperlukan.",
                },
                {
                    status: 401,
                }
            );
        }

        const achievements =
            await prisma.achievement.findMany({
                where: adminRequested
                    ? {}
                    : {
                        status: "APPROVED",
                    },

                include: {
                    student: true,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return NextResponse.json(
            {
                success: true,
                data: achievements,
            },
            {
                status: 200,

                headers: {
                    "Cache-Control":
                        "no-store, no-cache, must-revalidate, proxy-revalidate",

                    Pragma: "no-cache",

                    Expires: "0",
                },
            }
        );
    } catch (error) {
        console.error(
            "GET ACHIEVEMENTS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal mengambil data prestasi.",
                data: [],
            },
            {
                status: 500,
            }
        );
    }
}

// =====================================================
// POST
//
// PUBLIC
//
// Browser mengirim JSON:
// - data mahasiswa
// - data prestasi
// - URL Vercel Blob
// =====================================================

export async function POST(request: Request) {
    try {
        const body =
            await request.json();

        // =================================================
        // DATA MAHASISWA
        // =================================================

        const studentName =
            String(
                body?.studentName || ""
            ).trim();

        const nim =
            String(
                body?.nim || ""
            ).trim();

        const semester =
            String(
                body?.semester || ""
            ).trim();

        const className =
            String(
                body?.className || ""
            ).trim();

        const phone =
            String(
                body?.phone || ""
            ).trim();

        // =================================================
        // DATA PRESTASI
        // =================================================

        const achievementName =
            String(
                body?.achievementName || ""
            ).trim();

        const category =
            String(
                body?.category || ""
            ).trim();

        const level =
            String(
                body?.level || ""
            ).trim();

        const rank =
            String(
                body?.rank || ""
            ).trim();

        const competitionName =
            String(
                body?.competitionName || ""
            ).trim();

        const organizer =
            String(
                body?.organizer || ""
            ).trim();

        const achievementDate =
            String(
                body?.achievementDate || ""
            ).trim();

        const description =
            String(
                body?.description || ""
            ).trim();

        // =================================================
        // URL FILE
        // =================================================

        const proofImageUrl =
            String(
                body?.proofImageUrl || ""
            ).trim();

        const studentPhotoUrl =
            body?.studentPhotoUrl
                ? String(
                    body.studentPhotoUrl
                ).trim()
                : null;

        // =================================================
        // VALIDASI DATA
        // =================================================

        if (
            !studentName ||
            !nim ||
            !phone ||
            !achievementName ||
            !category ||
            !level ||
            !competitionName ||
            !achievementDate
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Data wajib belum lengkap.",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // VALIDASI URL BUKTI
        // =================================================

        if (
            !isValidBlobUrl(
                proofImageUrl
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "URL bukti prestasi tidak valid.",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // VALIDASI URL FOTO MAHASISWA
        // =================================================

        if (
            studentPhotoUrl &&
            !isValidBlobUrl(
                studentPhotoUrl
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "URL foto mahasiswa tidak valid.",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // VALIDASI TANGGAL
        // =================================================

        const parsedAchievementDate =
            new Date(
                achievementDate
            );

        if (
            Number.isNaN(
                parsedAchievementDate.getTime()
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Tanggal prestasi tidak valid.",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // STUDENT
        // =================================================

        const student =
            await prisma.student.upsert({
                where: {
                    nim,
                },

                update: {
                    name: studentName,

                    semester:
                        semester || null,

                    className:
                        className || null,

                    phone,
                },

                create: {
                    name: studentName,

                    nim,

                    semester:
                        semester || null,

                    className:
                        className || null,

                    phone,
                },
            });

        // =================================================
        // GENERATE SLUG
        // =================================================

        const baseSlug =
            createSlug(
                `${achievementName}-${studentName}`
            );

        let slug =
            baseSlug ||
            `prestasi-${Date.now()}`;

        let counter = 2;

        while (true) {
            const existing =
                await prisma.achievement.findUnique(
                    {
                        where: {
                            slug,
                        },

                        select: {
                            id: true,
                        },
                    }
                );

            if (!existing) {
                break;
            }

            slug =
                `${baseSlug}-${counter}`;

            counter++;
        }

        // =================================================
        // ACHIEVEMENT
        // =================================================

        const achievement =
            await prisma.achievement.create({
                data: {
                    slug,

                    studentId:
                        student.id,

                    achievementName,

                    category,

                    level,

                    rank:
                        rank || null,

                    competitionName,

                    organizer:
                        organizer || null,

                    achievementDate:
                        parsedAchievementDate,

                    description:
                        description || null,

                    proofImageUrl,

                    studentPhotoUrl,

                    status: "PENDING",
                },

                include: {
                    student: true,
                },
            });

        // =================================================
        // RESPONSE
        // =================================================

        return NextResponse.json(
            {
                success: true,

                message:
                    "Prestasi berhasil dilaporkan dan menunggu verifikasi admin.",

                data: achievement,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "POST ACHIEVEMENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,

                message:
                    "Terjadi kesalahan saat menyimpan prestasi.",
            },
            {
                status: 500,
            }
        );
    }
}

// =====================================================
// VALIDASI URL VERCEL BLOB
// =====================================================

function isValidBlobUrl(
    value: string
) {
    try {
        const url =
            new URL(value);

        if (
            url.protocol !==
            "https:"
        ) {
            return false;
        }

        return (
            url.hostname.endsWith(
                ".blob.vercel-storage.com"
            ) ||
            url.hostname.endsWith(
                ".public.blob.vercel-storage.com"
            )
        );
    } catch {
        return false;
    }
}