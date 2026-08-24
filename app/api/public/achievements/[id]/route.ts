import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

// =====================================================
// GET DETAIL PRESTASI PUBLIK
// HANYA PRESTASI YANG SUDAH APPROVED
// =====================================================

export async function GET(
    request: Request,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const achievement =
            await prisma.achievement.findFirst({
                where: {
                    id,
                    status: "APPROVED",
                },
                include: {
                    student: true,
                },
            });

        if (!achievement) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Prestasi tidak ditemukan atau belum diverifikasi.",
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
            "GET PUBLIC ACHIEVEMENT ERROR:",
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