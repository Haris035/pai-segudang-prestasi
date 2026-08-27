import {
    handleUpload,
    type HandleUploadBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// =====================================================
// VERCEL BLOB CLIENT UPLOAD
// =====================================================
//
// Browser mengirim permintaan kecil ke route ini untuk
// mendapatkan client upload token.
//
// File BESAR tidak melewati route ini.
// Setelah token didapat, browser meng-upload langsung
// ke Vercel Blob.
//

export async function POST(
    request: Request,
) {
    try {
        const body =
            (await request.json()) as HandleUploadBody;

        const jsonResponse =
            await handleUpload({
                body,
                request,

                onBeforeGenerateToken:
                    async (pathname) => {
                        // Hanya izinkan file yang berada
                        // di folder achievements/.
                        if (
                            !pathname.startsWith(
                                "achievements/",
                            )
                        ) {
                            throw new Error(
                                "Path upload tidak valid.",
                            );
                        }

                        return {
                            allowedContentTypes: [
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                            ],

                            maximumSizeInBytes:
                                5 * 1024 * 1024,

                            addRandomSuffix:
                                false,
                        };
                    },
            });

        return NextResponse.json(
            jsonResponse,
        );
    } catch (error) {
        console.error(
            "BLOB CLIENT UPLOAD ERROR:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Gagal menyiapkan upload gambar.",
            },
            {
                status: 400,
            },
        );
    }
}
