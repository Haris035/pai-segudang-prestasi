import Link from "next/link";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    Award,
    CalendarDays,
    GraduationCap,
    Medal,
    Phone,
    School,
    Trophy,
    UserRound,
    Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

interface PrestasiDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatDate(
    value: Date | string | null
) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        }
    );
}

// =====================================================
// STATUS / LEVEL
// =====================================================

function getLevelLabel(
    level: string
) {
    if (!level) {
        return "-";
    }

    return level;
}

// =====================================================
// PAGE
// =====================================================

export default async function PrestasiDetailPage({
    params,
}: PrestasiDetailPageProps) {

    const { id: slug } =
        await params;

    // =================================================
    // AMBIL DATA BERDASARKAN SLUG
    // HANYA APPROVED
    // =================================================

    const achievement =
        await prisma.achievement.findFirst({
            where: {
                slug,
                status: "APPROVED",
            },

            include: {
                student: true,
            },
        });

    // =================================================
    // TIDAK DITEMUKAN
    // =================================================

    if (!achievement) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#061A32] text-white">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#041225]/95 backdrop-blur-xl">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                    {/* LOGO */}

                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">

                            <Trophy
                                size={20}
                                className="text-white"
                            />

                        </div>

                        <div>

                            <p className="text-sm font-black leading-none">
                                PAI Segudang Prestasi
                            </p>

                            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                PAI UIKA Bogor
                            </p>

                        </div>

                    </Link>

                    {/* BACK */}

                    <Link
                        href="/prestasi"
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >

                        <ArrowLeft size={15} />

                        Kembali

                    </Link>

                </div>

            </header>

            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                {/* BREADCRUMB */}

                <div className="mb-8">

                    <Link
                        href="/prestasi"
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-300 transition hover:text-blue-200"
                    >

                        <ArrowLeft size={14} />

                        Kembali ke semua prestasi

                    </Link>

                </div>

                {/* TITLE */}

                <div className="mb-8">

                    <div className="mb-4 flex flex-wrap items-center gap-3">

                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">

                            <Award size={14} />

                            {achievement.category}

                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">

                            <Trophy size={14} />

                            Terverifikasi

                        </span>

                    </div>

                    <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">

                        {achievement.achievementName}

                    </h1>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">

                        Dokumentasi prestasi mahasiswa
                        Program Studi Pendidikan Agama Islam
                        Universitas Ibn Khaldun Bogor.

                    </p>

                </div>

                {/* =================================================
                    FOTO AREA
                ================================================= */}

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* FOTO MAHASISWA */}

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A2343]">

                        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15">

                                <UserRound
                                    size={18}
                                    className="text-blue-300"
                                />

                            </div>

                            <div>

                                <h2 className="text-sm font-black">
                                    Foto Mahasiswa
                                </h2>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Dokumentasi mahasiswa
                                </p>

                            </div>

                        </div>

                        <div className="flex min-h-[380px] items-center justify-center bg-[#06182E] p-5 sm:min-h-[450px]">

                            {achievement.studentPhotoUrl ? (

                                <img
                                    src={
                                        achievement.studentPhotoUrl
                                    }
                                    alt={`Foto ${achievement.student.name}`}
                                    className="max-h-[500px] w-full rounded-2xl object-contain"
                                />

                            ) : (

                                <div className="flex flex-col items-center justify-center text-center">

                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">

                                        <UserRound
                                            size={35}
                                            className="text-slate-600"
                                        />

                                    </div>

                                    <p className="mt-4 text-sm font-bold text-slate-500">
                                        Foto mahasiswa tidak tersedia
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                    {/* BUKTI PRESTASI */}

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0A2343]">

                        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15">

                                <Award
                                    size={18}
                                    className="text-blue-300"
                                />

                            </div>

                            <div>

                                <h2 className="text-sm font-black">
                                    Bukti Prestasi
                                </h2>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Dokumen yang telah diverifikasi
                                </p>

                            </div>

                        </div>

                        <div className="flex min-h-[380px] items-center justify-center bg-[#06182E] p-5 sm:min-h-[450px]">

                            {achievement.proofImageUrl ? (

                                <img
                                    src={
                                        achievement.proofImageUrl
                                    }
                                    alt={`Bukti prestasi ${achievement.achievementName}`}
                                    className="max-h-[500px] w-full rounded-2xl object-contain"
                                />

                            ) : (

                                <div className="flex flex-col items-center justify-center text-center">

                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">

                                        <Award
                                            size={35}
                                            className="text-slate-600"
                                        />

                                    </div>

                                    <p className="mt-4 text-sm font-bold text-slate-500">
                                        Bukti prestasi tidak tersedia
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

                {/* =================================================
                    DATA MAHASISWA
                ================================================= */}

                <section className="mt-8">

                    <div className="mb-5 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15">

                            <GraduationCap
                                size={20}
                                className="text-blue-300"
                            />

                        </div>

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                                Data Mahasiswa
                            </p>

                            <h2 className="mt-1 text-xl font-black">
                                Informasi Mahasiswa
                            </h2>

                        </div>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* NAMA */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <UserRound
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Nama Mahasiswa
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black leading-6">
                                {achievement.student.name}
                            </p>

                        </div>

                        {/* NIM */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <School
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    NIM
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black leading-6">
                                {achievement.student.nim}
                            </p>

                        </div>

                        {/* SEMESTER */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <GraduationCap
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Semester
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black leading-6">
                                {achievement.student.semester ||
                                    "-"}
                            </p>

                        </div>

                        {/* KELAS */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <Users
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Kelas
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black leading-6">
                                {achievement.student.className ||
                                    "-"}
                            </p>

                        </div>

                    </div>

                    {/* PHONE */}

                    {achievement.student.phone && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-[#0A2343] p-5 sm:max-w-md">

                            <div className="flex items-center gap-3">

                                <Phone
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Kontak
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black">
                                {achievement.student.phone}
                            </p>

                        </div>
                    )}

                </section>

                {/* =================================================
                    DATA PRESTASI
                ================================================= */}

                <section className="mt-10">

                    <div className="mb-5 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15">

                            <Trophy
                                size={20}
                                className="text-blue-300"
                            />

                        </div>

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                                Detail Prestasi
                            </p>

                            <h2 className="mt-1 text-xl font-black">
                                Informasi Pencapaian
                            </h2>

                        </div>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {/* PRESTASI */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <Trophy
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Nama Prestasi
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black leading-6">
                                {achievement.achievementName}
                            </p>

                        </div>

                        {/* KATEGORI */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <Award
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Kategori
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black">
                                {achievement.category}
                            </p>

                        </div>

                        {/* TINGKAT */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <Medal
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Tingkat
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black">
                                {getLevelLabel(
                                    achievement.level
                                )}
                            </p>

                        </div>

                        {/* PERINGKAT */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <Medal
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Peringkat
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black">
                                {achievement.rank ||
                                    "-"}
                            </p>

                        </div>

                        {/* KOMPETISI */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <Trophy
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Nama Kompetisi
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black leading-6">
                                {achievement.competitionName ||
                                    "-"}
                            </p>

                        </div>

                        {/* PENYELENGGARA */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5">

                            <div className="flex items-center gap-3">

                                <School
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Penyelenggara
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black leading-6">
                                {achievement.organizer ||
                                    "-"}
                            </p>

                        </div>

                        {/* TANGGAL */}

                        <div className="rounded-2xl border border-white/10 bg-[#0A2343] p-5 sm:col-span-2 lg:col-span-3">

                            <div className="flex items-center gap-3">

                                <CalendarDays
                                    size={17}
                                    className="text-blue-300"
                                />

                                <p className="text-xs font-bold text-slate-500">
                                    Tanggal Prestasi
                                </p>

                            </div>

                            <p className="mt-3 text-sm font-black">
                                {formatDate(
                                    achievement.achievementDate
                                )}
                            </p>

                        </div>

                    </div>

                </section>

                {/* =================================================
                    DESKRIPSI
                ================================================= */}

                {achievement.description && (
                    <section className="mt-10">

                        <div className="rounded-3xl border border-white/10 bg-[#0A2343] p-6 sm:p-8">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15">

                                    <Award
                                        size={20}
                                        className="text-blue-300"
                                    />

                                </div>

                                <div>

                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                                        Tentang Pencapaian
                                    </p>

                                    <h2 className="mt-1 text-xl font-black">
                                        Deskripsi Prestasi
                                    </h2>

                                </div>

                            </div>

                            <p className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-300">
                                {achievement.description}
                            </p>

                        </div>

                    </section>
                )}

                {/* =================================================
                    VERIFIED
                ================================================= */}

                <section className="mt-10">

                    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-6 sm:p-8">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">

                                <Trophy
                                    size={27}
                                    className="text-emerald-300"
                                />

                            </div>

                            <div>

                                <h2 className="text-lg font-black">
                                    Prestasi Telah Diverifikasi
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Prestasi ini telah melalui
                                    proses verifikasi dan telah
                                    disetujui untuk ditampilkan
                                    pada PAI Segudang Prestasi.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* BACK HOME */}

                <div className="mt-10 flex justify-center">

                    <Link
                        href="/prestasi"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                    >

                        <ArrowLeft size={16} />

                        Kembali ke Prestasi

                    </Link>

                </div>

            </section>

            {/* FOOTER */}

            <footer className="mt-16 border-t border-white/10 bg-[#041225]">

                <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">

                        <Trophy size={18} />

                    </div>

                    <p className="mt-3 text-sm font-black">
                        PAI Segudang Prestasi
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        HIMA PAI UIKA Bogor
                    </p>

                    <p className="mt-5 text-[11px] text-slate-600">
                        © 2026 PAI Segudang Prestasi.
                        Seluruh prestasi telah melalui
                        proses verifikasi.
                    </p>

                </div>

            </footer>

        </main>
    );
}