import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json({
        success: false,
        message: "Endpoint logout ini tidak digunakan.",
    });
}