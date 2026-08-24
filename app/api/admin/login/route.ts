import { NextResponse } from "next/server";
import {
    createAdminToken,
    COOKIE_NAME,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(
    request: Request
) {
    try {
        const configuredPassword =
            process.env.ADMIN_PASSWORD;

        if (!configuredPassword) {
            console.error(
                "ADMIN_PASSWORD belum dikonfigurasi."
            );

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Konfigurasi login admin belum tersedia.",
                },
                {
                    status: 500,
                }
            );
        }

        const body =
            await request.json();

        const password =
            typeof body?.password ===
                "string"
                ? body.password
                : "";

        if (!password) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password admin wajib diisi.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            password !==
            configuredPassword
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Password admin salah.",
                },
                {
                    status: 401,
                }
            );
        }

        const token =
            await createAdminToken();

        const response =
            NextResponse.json({
                success: true,
                message:
                    "Login admin berhasil.",
            });

        response.cookies.set(
            COOKIE_NAME,
            token,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite: "lax",

                path: "/",

                maxAge:
                    60 * 60 * 8,
            }
        );

        return response;
    } catch (error) {
        console.error(
            "ADMIN LOGIN API ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Terjadi kesalahan pada server.",
            },
            {
                status: 500,
            }
        );
    }
}