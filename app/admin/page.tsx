"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Award,
    CheckCircle2,
    Clock3,
    MessageCircle,
    ShieldCheck,
    Trophy,
    Users,
    LogOut,
    Loader2,
} from "lucide-react";

type DashboardData = {
    achievements: number;
    pending: number;
    approved: number;
    rejected: number;
    suggestions: number;
};

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData>({
        achievements: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suggestions: 0,
    });

    const [loading, setLoading] = useState(true);
    const [logoutLoading, setLogoutLoading] =
        useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // AMBIL DATA DASHBOARD
    // =====================================================

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const [achievementResponse, suggestionResponse] =
                    await Promise.all([
                        fetch("/api/achievements?admin=true", {
                            method: "GET",
                            cache: "no-store",
                        }),

                        fetch("/api/suggestions", {
                            method: "GET",
                            cache: "no-store",
                        }),
                    ]);

                const achievementResult =
                    await achievementResponse.json();

                const suggestionResult =
                    await suggestionResponse.json();

                if (
                    !achievementResponse.ok ||
                    !achievementResult.success
                ) {
                    throw new Error(
                        achievementResult.message ||
                        "Gagal mengambil data prestasi."
                    );
                }

                if (
                    !suggestionResponse.ok ||
                    !suggestionResult.success
                ) {
                    throw new Error(
                        suggestionResult.message ||
                        "Gagal mengambil data saran."
                    );
                }

                const achievements =
                    achievementResult.data || [];

                const suggestions =
                    suggestionResult.data || [];

                const pending = achievements.filter(
                    (item: { status?: string }) =>
                        String(item.status).toUpperCase() ===
                        "PENDING"
                ).length;

                const approved = achievements.filter(
                    (item: { status?: string }) =>
                        String(item.status).toUpperCase() ===
                        "APPROVED"
                ).length;

                const rejected = achievements.filter(
                    (item: { status?: string }) =>
                        String(item.status).toUpperCase() ===
                        "REJECTED"
                ).length;

                setData({
                    achievements: achievements.length,
                    pending,
                    approved,
                    rejected,
                    suggestions: suggestions.length,
                });
            } catch (error) {
                console.error(
                    "LOAD ADMIN DASHBOARD ERROR:",
                    error
                );

                setError(
                    error instanceof Error
                        ? error.message
                        : "Gagal memuat dashboard."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    // =====================================================
    // LOGOUT
    // =====================================================

    async function handleLogout() {
        try {
            setLogoutLoading(true);

            const response = await fetch(
                "/api/admin/login/logout",
                {
                    method: "POST",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Gagal logout."
                );
            }

            window.location.href =
                "/admin/login";
        } catch (error) {
            console.error(
                "ADMIN LOGOUT ERROR:",
                error
            );

            setLogoutLoading(false);

            alert(
                error instanceof Error
                    ? error.message
                    : "Gagal logout."
            );
        }
    }

    // =====================================================
    // STAT CARD
    // =====================================================

    const statCards = [
        {
            title: "Total Prestasi",
            value: data.achievements,
            description:
                "Seluruh laporan prestasi",
            icon: Trophy,
            iconClass:
                "text-blue-300",
            bgClass:
                "bg-blue-500/10",
        },

        {
            title: "Menunggu Verifikasi",
            value: data.pending,
            description:
                "Laporan perlu diperiksa",
            icon: Clock3,
            iconClass:
                "text-amber-300",
            bgClass:
                "bg-amber-500/10",
        },

        {
            title: "Terverifikasi",
            value: data.approved,
            description:
                "Prestasi telah disetujui",
            icon: CheckCircle2,
            iconClass:
                "text-emerald-300",
            bgClass:
                "bg-emerald-500/10",
        },

        {
            title: "Saran & Masukan",
            value: data.suggestions,
            description:
                "Masukan dari pengunjung",
            icon: MessageCircle,
            iconClass:
                "text-sky-300",
            bgClass:
                "bg-sky-500/10",
        },
    ];

    return (
        <main className="min-h-screen bg-[#071A33] text-white">

            {/* =====================================================
          HEADER
      ====================================================== */}

            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071A33]/90 backdrop-blur-xl">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

                    {/* Logo / Brand */}

                    <Link
                        href="/admin"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">

                            <ShieldCheck
                                size={22}
                            />

                        </div>

                        <div>

                            <p className="text-sm font-black sm:text-base">
                                Admin Dashboard
                            </p>

                            <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                PAI Segudang Prestasi
                            </p>

                        </div>

                    </Link>

                    {/* Logout */}

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-300 transition hover:border-red-400/20 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                    >

                        {logoutLoading ? (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <LogOut
                                size={16}
                            />
                        )}

                        {logoutLoading
                            ? "Keluar..."
                            : "Logout"}

                    </button>

                </div>

            </header>

            {/* =====================================================
          CONTENT
      ====================================================== */}

            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">

                {/* ===================================================
            TITLE
        ==================================================== */}

                <div className="mb-10">

                    <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">

                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />

                        Dashboard

                    </div>

                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

                        <div>

                            <h1 className="text-3xl font-black sm:text-4xl">

                                Selamat Datang, Admin

                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">

                                Kelola laporan prestasi serta
                                saran dan masukan dari
                                pengunjung PAI Segudang Prestasi.

                            </p>

                        </div>

                        <Link
                            href="/"
                            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-bold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-600 hover:text-white"
                        >

                            Lihat Website

                            <ArrowRight
                                size={15}
                            />

                        </Link>

                    </div>

                </div>

                {/* ===================================================
            ERROR
        ==================================================== */}

                {error && (

                    <div className="mb-8 rounded-2xl border border-red-400/10 bg-red-500/5 px-5 py-4">

                        <p className="text-sm font-semibold text-red-300">
                            Gagal memuat data dashboard
                        </p>

                        <p className="mt-1 text-xs text-red-300/70">
                            {error}
                        </p>

                    </div>

                )}

                {/* ===================================================
            STATISTICS
        ==================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {statCards.map(
                        (card) => {
                            const Icon =
                                card.icon;

                            return (
                                <div
                                    key={card.title}
                                    className="rounded-2xl border border-white/10 bg-[#0B2342] p-5 transition hover:-translate-y-1 hover:border-blue-400/20"
                                >

                                    <div className="flex items-start justify-between">

                                        <div>

                                            <p className="text-xs font-semibold text-slate-500">
                                                {card.title}
                                            </p>

                                            <p className="mt-3 text-3xl font-black">
                                                {loading
                                                    ? "..."
                                                    : card.value}
                                            </p>

                                        </div>

                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bgClass}`}
                                        >

                                            <Icon
                                                size={21}
                                                className={
                                                    card.iconClass
                                                }
                                            />

                                        </div>

                                    </div>

                                    <p className="mt-4 text-xs text-slate-500">
                                        {card.description}
                                    </p>

                                </div>
                            );
                        }
                    )}

                </div>

                {/* ===================================================
            MENU UTAMA
        ==================================================== */}

                <div className="mt-10">

                    <div className="mb-5">

                        <h2 className="text-xl font-black">
                            Kelola Sistem
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Pilih menu yang ingin dikelola.
                        </p>

                    </div>

                    <div className="grid gap-5 md:grid-cols-2">

                        {/* ===============================================
                LAPORAN PRESTASI
            ================================================ */}

                        <Link
                            href="/admin/prestasi"
                            className="group rounded-3xl border border-white/10 bg-[#0B2342] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-950/30"
                        >

                            <div className="flex items-start justify-between">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                                    <Trophy
                                        size={27}
                                        className="text-blue-300"
                                    />

                                </div>

                                <ArrowRight
                                    size={19}
                                    className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-300"
                                />

                            </div>

                            <h3 className="mt-6 text-xl font-black">
                                Laporan Prestasi
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Periksa, verifikasi, setujui,
                                atau tolak laporan prestasi
                                mahasiswa yang masuk.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2">

                                <span className="rounded-lg border border-amber-400/10 bg-amber-400/5 px-3 py-1.5 text-[10px] font-bold text-amber-300">
                                    {loading
                                        ? "..."
                                        : data.pending}{" "}
                                    Menunggu
                                </span>

                                <span className="rounded-lg border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
                                    {loading
                                        ? "..."
                                        : data.approved}{" "}
                                    Disetujui
                                </span>

                            </div>

                        </Link>

                        {/* ===============================================
                SARAN
            ================================================ */}

                        <Link
                            href="/admin/saran"
                            className="group rounded-3xl border border-white/10 bg-[#0B2342] p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-2xl hover:shadow-blue-950/30"
                        >

                            <div className="flex items-start justify-between">

                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10">

                                    <MessageCircle
                                        size={27}
                                        className="text-sky-300"
                                    />

                                </div>

                                <ArrowRight
                                    size={19}
                                    className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-sky-300"
                                />

                            </div>

                            <h3 className="mt-6 text-xl font-black">
                                Saran & Masukan
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Lihat saran, kritik, pertanyaan,
                                dan masukan yang dikirim oleh
                                pengunjung website.
                            </p>

                            <div className="mt-5">

                                <span className="rounded-lg border border-sky-400/10 bg-sky-400/5 px-3 py-1.5 text-[10px] font-bold text-sky-300">
                                    {loading
                                        ? "..."
                                        : data.suggestions}{" "}
                                    Masukan
                                </span>

                            </div>

                        </Link>

                    </div>

                </div>

                {/* ===================================================
            QUICK INFO
        ==================================================== */}

                <div className="mt-10 rounded-3xl border border-blue-400/10 bg-gradient-to-br from-blue-600/10 via-blue-900/10 to-transparent p-6 sm:p-8">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">

                            <ShieldCheck
                                size={27}
                            />

                        </div>

                        <div>

                            <h3 className="font-black">
                                Sistem Administrasi
                                Terlindungi
                            </h3>

                            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">

                                Dashboard ini digunakan untuk
                                mengelola data internal PAI
                                Segudang Prestasi. Pastikan
                                seluruh laporan diperiksa
                                sebelum dipublikasikan.

                            </p>

                        </div>

                    </div>

                </div>

                {/* ===================================================
            FOOTER
        ==================================================== */}

                <footer className="mt-14 border-t border-white/10 pt-7 text-center">

                    <p className="text-xs text-slate-600">

                        © 2026 PAI Segudang Prestasi
                        · HIMA PAI UIKA Bogor

                    </p>

                </footer>

            </div>

        </main>
    );
}