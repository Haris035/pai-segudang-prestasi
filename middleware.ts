import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    COOKIE_NAME,
    verifyAdminToken,
} from "@/lib/admin-auth";

export async function middleware(
    request: NextRequest
) {
    const { pathname } =
        request.nextUrl;

    // =====================================================
    // LOGIN ADMIN
    // =====================================================

    if (
        pathname ===
        "/admin/login"
    ) {
        return NextResponse.next();
    }

    // =====================================================
    // PROTEKSI SEMUA HALAMAN ADMIN
    // =====================================================

    if (
        pathname.startsWith("/admin")
    ) {
        const token =
            request.cookies.get(
                COOKIE_NAME
            )?.value;

        const authenticated =
            await verifyAdminToken(
                token
            );

        if (!authenticated) {
            const loginUrl =
                new URL(
                    "/admin/login",
                    request.url
                );

            loginUrl.searchParams.set(
                "from",
                pathname
            );

            return NextResponse.redirect(
                loginUrl
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
    ],
};