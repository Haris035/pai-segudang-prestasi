import { NextResponse } from "next/server";
import {
    COOKIE_NAME,
} from "@/lib/admin-auth";

export async function POST() {
    const response =
        NextResponse.json({
            success: true,
            message:
                "Logout berhasil.",
        });

    response.cookies.set(
        COOKIE_NAME,
        "",
        {
            httpOnly: true,

            secure:
                process.env.NODE_ENV ===
                "production",

            sameSite: "lax",

            path: "/",

            expires: new Date(0),

            maxAge: 0,
        }
    );

    return response;
}