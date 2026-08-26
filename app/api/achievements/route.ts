import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

import {
    COOKIE_NAME,
    verifyAdminToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// CEK ADMIN
// =====================================================

async function isAdmin() {
    const cookieStore = await cookies();

    const token = cookieStore.get(COOKIE_NAME)?.value;

    return verifyAdminToken(token);
}

// =====================================================
// GET
//
// PUBLIC:
// /api/achievements
// hanya APPROVED
//
// ADMIN:
// /api/achievements?admin=true
// semua status
// =====================================================

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);

        const adminRequested =
            url.searchParams.get("admin") === "true";

        const authenticated = await isAdmin();

        if (adminRequested && !authenticated) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Akses admin diperlukan.",
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
                message: "Gagal mengambil data prestasi.",
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
// PUBLIC
// =====================================================

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // =================================================
        // DATA MAHASISWA
        // =================================================

        const studentName = String(
            formData.get("studentName") || ""
        ).trim();

        const nim = String(
            formData.get("nim") || ""
        ).trim();

        const semester = String(
            formData.get("semester") || ""
        ).trim();

        const className = String(
            formData.get("className") || ""
        ).trim();

        const phone = String(
            formData.get("phone") || ""
        ).trim();

        // =================================================
        // DATA PRESTASI
        // =================================================

        const achievementName = String(
            formData.get("achievementName") || ""
        ).trim();

        const category = String(
            formData.get("category") || ""
        ).trim();

        const level = String(
            formData.get("level") || ""
        ).trim();

        const rank = String(
            formData.get("rank") || ""
        ).trim();

        const competitionName = String(
            formData.get("competitionName") || ""
        ).trim();

        const organizer = String(
            formData.get("organizer") || ""
        ).trim();

        const achievementDate = String(
            formData.get("achievementDate") || ""
        ).trim();

        const description = String(
            formData.get("description") || ""
        ).trim();

        // =================================================
        // FILE
        // =================================================

        const proofFile = formData.get("proofFile");

        const studentPhoto =
            formData.get("studentPhoto");

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
                    message: "Data wajib belum lengkap.",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // VALIDASI BUKTI
        // =================================================

        if (
            !proofFile ||
            !(proofFile instanceof File) ||
            proofFile.size <= 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Bukti prestasi wajib diupload.",
                },
                {
                    status: 400,
                }
            );
        }

        // =================================================
        // VALIDASI FILE
        // =================================================

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        const maxFileSize =
            5 * 1024 * 1024;

        function validateImage(file: File) {
            return (
                allowedTypes.includes(file.type) &&
                file.size > 0 &&
                file.size <= maxFileSize
            );
        }

        if (!validateImage(proofFile)) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Bukti prestasi harus berupa JPG, PNG, atau WEBP dengan ukuran maksimal 5 MB.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            studentPhoto instanceof File &&
            studentPhoto.size > 0
        ) {
            if (!validateImage(studentPhoto)) {
                return NextResponse.json(
                    {
                        success: false,
                        message:
                            "Foto mahasiswa harus berupa JPG, PNG, atau WEBP dengan ukuran maksimal 5 MB.",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // =================================================
        // FUNCTION UPLOAD KE VERCEL BLOB
        // =================================================

        async function uploadFile(file: File) {
            const extension =
                file.type === "image/png"
                    ? "png"
                    : file.type === "image/webp"
                        ? "webp"
                        : "jpg";

            const fileName =
                `achievements/${crypto.randomUUID()}.${extension}`;

            const blob = await put(
                fileName,
                file,
                {
                    access: "public",
                    addRandomSuffix: false,
                }
            );

            return blob.url;
        }

        // =================================================
        // UPLOAD BUKTI PRESTASI
        // =================================================

        const proofImageUrl =
            await uploadFile(proofFile);

        // =================================================
        // UPLOAD FOTO MAHASISWA
        // =================================================

        let studentPhotoUrl:
            | string
            | null = null;

        if (
            studentPhoto instanceof File &&
            studentPhoto.size > 0
        ) {
            studentPhotoUrl =
                await uploadFile(studentPhoto);
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
        // ACHIEVEMENT
        // =================================================

        const achievement =
            await prisma.achievement.create({
                data: {
                    studentId: student.id,

                    achievementName,

                    category,

                    level,

                    rank:
                        rank || null,

                    competitionName,

                    organizer:
                        organizer || null,

                    achievementDate:
                        new Date(
                            achievementDate
                        ),

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