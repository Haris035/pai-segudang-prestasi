import { NextResponse } from "next/server";
import {
    ADMIN_SESSION_COOKIE,
    createAdminSession,
    getAdminCredentials,
} from "@/lib/auth";

export async function POST(
    request: Request
) {
    try {
        const body =
            await request.json();

        const username =
            String(body?.username || "").trim();

        const password =
            String(body?.password || "");

        const credentials =
            getAdminCredentials();

        if (
            !credentials.password
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password admin belum dikonfigurasi.",
                },
                { status: 500 }
            );
        }

        if (
            username !==
            credentials.username ||
            password !==
            credentials.password
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Username atau password salah.",
                },
                { status: 401 }
            );
        }

        const session =
            await createAdminSession();

        const response =
            NextResponse.json({
                success: true,
                message:
                    "Login admin berhasil.",
            });

        response.cookies.set(
            ADMIN_SESSION_COOKIE,
            session,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
                maxAge:
                    60 * 60 * 24 * 7,
            }
        );

        return response;
    } catch (error) {
        console.error(
            "ADMIN LOGIN ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Terjadi kesalahan saat login.",
            },
            { status: 500 }
        );
    }
}