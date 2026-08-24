const COOKIE_NAME = "admin_auth";

function base64UrlEncode(value: string): string {
    const bytes = new TextEncoder().encode(value);

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
    const normalized = value
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const padded =
        normalized +
        "=".repeat(
            (4 - (normalized.length % 4)) % 4
        );

    const binary = atob(padded);

    const bytes = Uint8Array.from(
        binary,
        (char) => char.charCodeAt(0)
    );

    return new TextDecoder().decode(bytes);
}

function constantTimeEqual(
    a: string,
    b: string
): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;

    for (let i = 0; i < a.length; i++) {
        result |=
            a.charCodeAt(i) ^
            b.charCodeAt(i);
    }

    return result === 0;
}

async function createSignature(
    value: string,
    secret: string
): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        {
            name: "HMAC",
            hash: "SHA-256",
        },
        false,
        ["sign"]
    );

    const signature =
        await crypto.subtle.sign(
            "HMAC",
            key,
            new TextEncoder().encode(value)
        );

    const bytes = new Uint8Array(
        signature
    );

    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

export async function createAdminToken(): Promise<string> {
    const secret =
        process.env.ADMIN_AUTH_SECRET;

    if (!secret) {
        throw new Error(
            "ADMIN_AUTH_SECRET belum dikonfigurasi."
        );
    }

    const payload = JSON.stringify({
        role: "ADMIN",
        iat: Date.now(),
        exp:
            Date.now() +
            1000 * 60 * 60 * 8,
    });

    const encodedPayload =
        base64UrlEncode(payload);

    const signature =
        await createSignature(
            encodedPayload,
            secret
        );

    return `${encodedPayload}.${signature}`;
}

export async function verifyAdminToken(
    token: string | undefined | null
): Promise<boolean> {
    try {
        if (!token) {
            return false;
        }

        const secret =
            process.env.ADMIN_AUTH_SECRET;

        if (!secret) {
            return false;
        }

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
                encodedPayload,
                secret
            );

        if (
            !constantTimeEqual(
                providedSignature,
                expectedSignature
            )
        ) {
            return false;
        }

        const payloadText =
            base64UrlDecode(
                encodedPayload
            );

        const payload =
            JSON.parse(payloadText);

        if (
            payload?.role !== "ADMIN"
        ) {
            return false;
        }

        if (
            typeof payload.exp !==
            "number" ||
            Date.now() > payload.exp
        ) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export { COOKIE_NAME };