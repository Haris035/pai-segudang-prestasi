import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    cookies,
} from "next/headers";

import {
    COOKIE_NAME,
    verifyAdminToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

async function isAdmin() {
    const cookieStore =
        await cookies();

    const token =
        cookieStore.get(
            COOKIE_NAME
        )?.value;

    return verifyAdminToken(
        token
    );
}

// =====================================================
// GET DETAIL
// PUBLIC:
// hanya APPROVED
//
// ADMIN:
// semua status
// =====================================================

export async function GET(
    request: Request,
    context: RouteContext
) {
    try {
        const { id } =
            await context.params;

        const admin =
            await isAdmin();

        const achievement =
            await prisma.achievement.findUnique(
                {
                    where: {
                        id,
                    },

                    include: {
                        student: true,
                    },
                }
            );

        if (!achievement) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Data prestasi tidak ditemukan.",
                },
                {
                    status: 404,
                }
            );
        }

        // =================================================
        // DATA NON-APPROVED TIDAK BOLEH DILIHAT PUBLIK
        // =================================================

        if (
            !admin &&
            achievement.status !==
            "APPROVED"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Data prestasi tidak tersedia.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: achievement,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "GET DETAIL ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal mengambil detail prestasi.",
            },
            {
                status: 500,
            }
        );
    }
}

// =====================================================
// PATCH STATUS
// ADMIN ONLY
// =====================================================

export async function PATCH(
    request: Request,
    context: RouteContext
) {
    try {
        const admin =
            await isAdmin();

        if (!admin) {
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

        const { id } =
            await context.params;

        const body =
            await request.json();

        const status =
            typeof body?.status ===
                "string"
                ? body.status
                    .trim()
                    .toUpperCase()
                : "";

        const allowedStatuses = [
            "PENDING",
            "APPROVED",
            "REJECTED",
        ];

        if (
            !allowedStatuses.includes(
                status
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Status tidak valid.",
                },
                {
                    status: 400,
                }
            );
        }

        const existing =
            await prisma.achievement.findUnique(
                {
                    where: {
                        id,
                    },
                }
            );

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Data prestasi tidak ditemukan.",
                },
                {
                    status: 404,
                }
            );
        }

        const achievement =
            await prisma.achievement.update(
                {
                    where: {
                        id,
                    },

                    data: {
                        status,
                    },

                    include: {
                        student: true,
                    },
                }
            );

        return NextResponse.json(
            {
                success: true,
                message:
                    "Status prestasi berhasil diperbarui.",
                data: achievement,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "PATCH STATUS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal memperbarui status prestasi.",
            },
            {
                status: 500,
            }
        );
    }
}

// =====================================================
// DELETE
// ADMIN ONLY
// =====================================================

export async function DELETE(
    request: Request,
    context: RouteContext
) {
    try {
        const admin =
            await isAdmin();

        if (!admin) {
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

        const { id } =
            await context.params;

        const existing =
            await prisma.achievement.findUnique(
                {
                    where: {
                        id,
                    },
                }
            );

        if (!existing) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Data prestasi tidak ditemukan.",
                },
                {
                    status: 404,
                }
            );
        }

        await prisma.achievement.delete({
            where: {
                id,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message:
                    "Prestasi berhasil dihapus.",
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "DELETE ACHIEVEMENT ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal menghapus prestasi.",
            },
            {
                status: 500,
            }
        );
    }
}