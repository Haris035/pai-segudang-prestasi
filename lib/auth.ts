import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE =
    "pai_admin_session";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 hari

function getSecret() {
    const secret =
        process.env.ADMIN_SESSION_SECRET;

    if (!secret) {
        throw new Error(
            "ADMIN_SESSION_SECRET belum diatur di .env.local"
        );
    }

    return secret;
}

function toBase64Url(input: string) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function fromBase64Url(input: string) {
    const normalized = input
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padding =
        normalized.length % 4 === 0
            ? ""
            : "=".repeat(
                4 - (normalized.length % 4)
            );

    return Buffer.from(
        normalized + padding,
        "base64"
    ).toString("utf8");
}

async function createSignature(
    payload: string
) {
    const secret = new TextEncoder().encode(
        getSecret()
    );

    const data = new TextEncoder().encode(
        payload
    );

    const key =
        await crypto.subtle.importKey(
            "raw",
            secret,
            {
                name: "HMAC",
                hash: "SHA-256",
            },
            false,
            ["sign", "verify"]
        );

    const signature =
        await crypto.subtle.sign(
            "HMAC",
            key,
            data
        );

    return Buffer.from(signature)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function createAdminSession() {
    const payload = {
        username:
            process.env.ADMIN_USERNAME ||
            "admin",

        expiresAt:
            Date.now() +
            SESSION_DURATION * 1000,
    };

    const encodedPayload =
        toBase64Url(
            JSON.stringify(payload)
        );

    const signature =
        await createSignature(
            encodedPayload
        );

    return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSession(
    token: string | undefined
) {
    if (!token) {
        return false;
    }

    try {
        const parts = token.split(".");

        if (parts.length !== 2) {
            return false;
        }

        const [
            encodedPayload,
            providedSignature,
        ] = parts;

        const expectedSignature =
            await createSignature(
                encodedPayload
            );

        if (
            providedSignature !==
            expectedSignature
        ) {
            return false;
        }

        const payload = JSON.parse(
            fromBase64Url(
                encodedPayload
            )
        );

        if (
            !payload?.expiresAt ||
            Date.now() >
            Number(payload.expiresAt)
        ) {
            return false;
        }

        if (
            payload.username !==
            (process.env.ADMIN_USERNAME ||
                "admin")
        ) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export async function getAdminSession() {
    const cookieStore =
        await cookies();

    const token =
        cookieStore.get(
            ADMIN_SESSION_COOKIE
        )?.value;

    return verifyAdminSession(token);
}

export function getAdminCredentials() {
    return {
        username:
            process.env.ADMIN_USERNAME ||
            "admin",

        password:
            process.env.ADMIN_PASSWORD ||
            "",
    };
}