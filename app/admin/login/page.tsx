"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Lock,
    ShieldCheck,
    Loader2,
    Eye,
    EyeOff,
    ArrowRight,
} from "lucide-react";

function AdminLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (!password.trim()) {
            setError("Password admin wajib diisi.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/admin/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Password admin salah."
                );
            }

            const from = searchParams.get("from");

            router.replace(
                from && from.startsWith("/admin")
                    ? from
                    : "/admin"
            );

            router.refresh();
        } catch (error) {
            console.error(
                "ADMIN LOGIN ERROR:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Gagal masuk ke dashboard admin."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-5 text-white">

            {/* Background */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

                <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-sky-500/5 blur-[100px]" />

                <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px]" />

            </div>

            {/* Card */}

            <div className="relative z-10 w-full max-w-md">

                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B2342] shadow-2xl shadow-black/30">

                    {/* Header */}

                    <div className="border-b border-white/10 px-7 py-8 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">

                            <ShieldCheck size={30} />

                        </div>

                        <h1 className="mt-5 text-2xl font-black">
                            Admin Dashboard
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Masuk untuk mengelola
                            PAI Segudang Prestasi.
                        </p>

                    </div>

                    {/* Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="p-7"
                    >

                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-slate-300"
                        >
                            Password Admin
                        </label>

                        <div className="relative">

                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                placeholder="Masukkan password admin"
                                autoComplete="current-password"
                                className="w-full rounded-xl border border-white/10 bg-[#071A33] py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-500/10"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (value) => !value
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Sembunyikan password"
                                        : "Tampilkan password"
                                }
                                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>

                        </div>

                        {/* Error */}

                        {error && (
                            <div className="mt-4 rounded-xl border border-red-400/10 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-300">
                                {error}
                            </div>
                        )}

                        {/* Button */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Memverifikasi...
                                </>
                            ) : (
                                <>
                                    Masuk Dashboard

                                    <ArrowRight
                                        size={17}
                                        className="transition-transform group-hover:translate-x-1"
                                    />
                                </>
                            )}
                        </button>

                    </form>

                </div>

                <p className="mt-5 text-center text-xs text-slate-600">
                    PAI Segudang Prestasi · HIMA PAI
                    UIKA Bogor
                </p>

            </div>

        </main>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[#071A33] text-white">
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                        <Loader2
                            size={20}
                            className="animate-spin"
                        />
                        Memuat halaman login...
                    </div>
                </main>
            }
        >
            <AdminLoginForm />
        </Suspense>
    );
}