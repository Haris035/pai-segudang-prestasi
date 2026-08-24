import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    cookies,
} from "next/headers";

import {
    COOKIE_NAME,
    verifyAdminToken,
} from "@/lib/admin-auth";

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
// GET
// ADMIN ONLY
// =====================================================

export async function GET() {
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

        const suggestions =
            await prisma.suggestion.findMany(
                {
                    orderBy: {
                        createdAt:
                            "desc",
                    },
                }
            );

        return NextResponse.json({
            success: true,
            data: suggestions,
        });
    } catch (error) {
        console.error(
            "GET SUGGESTIONS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal mengambil data saran.",
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

export async function POST(
    request: Request
) {
    try {
        const body =
            await request.json();

        const name =
            typeof body.name ===
                "string"
                ? body.name.trim()
                : null;

        const contact =
            typeof body.contact ===
                "string"
                ? body.contact.trim()
                : null;

        const type =
            typeof body.type ===
                "string"
                ? body.type.trim()
                : "";

        const message =
            typeof body.message ===
                "string"
                ? body.message.trim()
                : "";

        if (!type) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Jenis saran wajib diisi.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!message) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Isi saran wajib diisi.",
                },
                {
                    status: 400,
                }
            );
        }

        const suggestion =
            await prisma.suggestion.create(
                {
                    data: {
                        name,
                        contact,
                        type,
                        message,
                    },
                }
            );

        return NextResponse.json(
            {
                success: true,
                data: suggestion,
                message:
                    "Saran berhasil dikirim.",
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "POST SUGGESTION ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal menyimpan saran.",
            },
            {
                status: 500,
            }
        );
    }
}

// =====================================================
// PATCH
// ADMIN ONLY
// =====================================================

export async function PATCH(
    request: Request
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

        const {
            searchParams,
        } = new URL(request.url);

        const id =
            searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "ID saran tidak ditemukan.",
                },
                {
                    status: 400,
                }
            );
        }

        const body =
            await request.json();

        const status =
            typeof body.status ===
                "string"
                ? body.status
                : "";

        if (
            ![
                "NEW",
                "READ",
                "DONE",
            ].includes(status)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Status saran tidak valid.",
                },
                {
                    status: 400,
                }
            );
        }

        const suggestion =
            await prisma.suggestion.update(
                {
                    where: {
                        id,
                    },

                    data: {
                        status,
                    },
                }
            );

        return NextResponse.json({
            success: true,
            data: suggestion,
            message:
                "Status saran berhasil diperbarui.",
        });
    } catch (error) {
        console.error(
            "PATCH SUGGESTION ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal memperbarui status saran.",
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
    request: Request
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

        const {
            searchParams,
        } = new URL(request.url);

        const id =
            searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "ID saran tidak ditemukan.",
                },
                {
                    status: 400,
                }
            );
        }

        await prisma.suggestion.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            message:
                "Saran berhasil dihapus.",
        });
    } catch (error) {
        console.error(
            "DELETE SUGGESTION ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal menghapus saran.",
            },
            {
                status: 500,
            }
        );
    }
}