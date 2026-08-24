import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// GET — DATA PRESTASI UNTUK PUBLIK
// HANYA APPROVED
// =====================================================

export async function GET() {
    try {
        const achievements =
            await prisma.achievement.findMany({
                where: {
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
                        "no-store, no-cache, must-revalidate",
                },
            }
        );
    } catch (error) {
        console.error(
            "GET PUBLIC ACHIEVEMENTS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Gagal mengambil data prestasi publik.",
                data: [],
            },
            {
                status: 500,
            }
        );
    }
}