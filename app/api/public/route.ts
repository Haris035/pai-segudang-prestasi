import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// =====================================================
// PUBLIC API HEALTH CHECK
// =====================================================

export async function GET() {
    return NextResponse.json(
        {
            success: true,
            message:
                "Public API aktif.",
        },
        {
            status: 200,
        }
    );
}