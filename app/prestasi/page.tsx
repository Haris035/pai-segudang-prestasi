"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Award,
    CalendarDays,
    Camera,
    CheckCircle2,
    FileImage,
    Loader2,
    Search,
    Trophy,
} from "lucide-react";

type Achievement = {
    id: string;
    name: string;
    achievement: string;
    level: string;
    date: string;
    category: string;
    rank: string | null;
    competitionName: string | null;
    organizer: string | null;
    description: string | null;
    proofImageUrl: string | null;
    studentPhotoUrl: string | null;
    status: "APPROVED";
};

const categories = [
    "Semua",
    "Akademik",
    "Keagamaan",
    "Olahraga",
    "Seni",
    "Organisasi",
    "Teknologi",
    "Kewirausahaan",
    "Lainnya",
];

export default function PrestasiPage() {
    const [achievements, setAchievements] = useState<
        Achievement[]
    >([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Semua");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // AMBIL DATA DARI API
    // =====================================================

    useEffect(() => {
        let mounted = true;

        async function loadAchievements() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "/api/achievements",
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: {
                            "Cache-Control":
                                "no-cache",
                        },
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message ||
                        "Gagal mengambil data prestasi."
                    );
                }

                const rawData =
                    result?.data ?? [];

                if (!Array.isArray(rawData)) {
                    throw new Error(
                        "Format data prestasi tidak valid."
                    );
                }

                // =================================================
                // KEAMANAN PUBLIK
                //
                // WALaupun API sudah melakukan filter APPROVED,
                // halaman publik tetap melakukan filter kedua.
                //
                // PENDING  -> TIDAK BOLEH MUNCUL
                // REJECTED -> TIDAK BOLEH MUNCUL
                // APPROVED -> BOLEH MUNCUL
                // =================================================

                const approvedData =
                    rawData.filter(
                        (item: any) =>
                            String(
                                item?.status || ""
                            ).toUpperCase() ===
                            "APPROVED"
                    );

                // =================================================
                // FORMAT DATA DATABASE
                // =================================================

                const formattedData: Achievement[] =
                    approvedData.map(
                        (item: any) => {
                            const studentName =
                                item?.student
                                    ?.name ??
                                "Nama Mahasiswa";

                            const achievementName =
                                item?.achievementName ??
                                "Prestasi Mahasiswa";

                            let formattedDate =
                                "-";

                            const rawDate =
                                item?.achievementDate;

                            if (rawDate) {
                                const date =
                                    new Date(
                                        rawDate
                                    );

                                if (
                                    !Number.isNaN(
                                        date.getTime()
                                    )
                                ) {
                                    formattedDate =
                                        date.toLocaleDateString(
                                            "id-ID",
                                            {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            }
                                        );
                                }
                            }

                            return {
                                id: String(
                                    item.id
                                ),

                                name:
                                    studentName,

                                achievement:
                                    achievementName,

                                level:
                                    item?.level ??
                                    "Tidak disebutkan",

                                date:
                                    formattedDate,

                                category:
                                    item?.category ??
                                    "Lainnya",

                                rank:
                                    item?.rank ??
                                    null,

                                competitionName:
                                    item?.competitionName ??
                                    null,

                                organizer:
                                    item?.organizer ??
                                    null,

                                description:
                                    item?.description ??
                                    null,

                                proofImageUrl:
                                    item?.proofImageUrl ??
                                    null,

                                studentPhotoUrl:
                                    item?.studentPhotoUrl ??
                                    null,

                                // Karena yang masuk ke sini
                                // hanya APPROVED
                                status: "APPROVED",
                            };
                        }
                    );

                if (mounted) {
                    setAchievements(
                        formattedData
                    );
                }
            } catch (error) {
                console.error(
                    "FETCH ACHIEVEMENTS ERROR:",
                    error
                );

                if (mounted) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Gagal mengambil data prestasi."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadAchievements();

        return () => {
            mounted = false;
        };
    }, []);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredAchievements =
        useMemo(() => {
            const keyword =
                search
                    .toLowerCase()
                    .trim();

            return achievements.filter(
                (item) => {
                    const matchesCategory =
                        category === "Semua" ||
                        item.category ===
                        category;

                    const matchesSearch =
                        !keyword ||
                        item.name
                            .toLowerCase()
                            .includes(keyword) ||
                        item.achievement
                            .toLowerCase()
                            .includes(keyword) ||
                        item.level
                            .toLowerCase()
                            .includes(keyword) ||
                        item.category
                            .toLowerCase()
                            .includes(keyword) ||
                        (
                            item.competitionName ??
                            ""
                        )
                            .toLowerCase()
                            .includes(keyword);

                    return (
                        matchesCategory &&
                        matchesSearch
                    );
                }
            );
        }, [
            achievements,
            search,
            category,
        ]);

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <main className="min-h-screen bg-[#071A33] text-white">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="border-b border-white/10 bg-[#041225]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">

                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                            <Trophy size={19} />
                        </div>

                        <div>
                            <p className="text-sm font-black">
                                PAI
                            </p>

                            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-300">
                                Segudang Prestasi
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                </div>
            </header>

            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative overflow-hidden border-b border-white/5">

                <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

                <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-24">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-2xl shadow-blue-600/20">
                        <Trophy size={29} />
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-blue-300">
                        PAI SEGUDANG PRESTASI
                    </p>

                    <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                        Semua Prestasi
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                        Dokumentasi pencapaian mahasiswa
                        Pendidikan Agama Islam UIKA Bogor.
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-4 py-2 text-xs font-medium text-emerald-300">
                        <Award size={14} />

                        Semua prestasi dapat dilaporkan
                        tanpa batas waktu
                    </div>

                </div>
            </section>

            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">

                {/* SEARCH */}

                <div className="mx-auto max-w-2xl">

                    <div className="relative">

                        <Search
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Cari nama mahasiswa atau prestasi..."
                            className="h-14 w-full rounded-2xl border border-white/10 bg-[#0B2342] pl-12 pr-5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                        />

                    </div>

                </div>

                {/* CATEGORY */}

                <div className="mt-7 flex gap-2 overflow-x-auto pb-2">

                    {categories.map(
                        (item) => {
                            const active =
                                category === item;

                            return (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() =>
                                        setCategory(
                                            item
                                        )
                                    }
                                    className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold transition ${active
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                            : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {item}
                                </button>
                            );
                        }
                    )}

                </div>

                {/* COUNT */}

                <div className="mt-8">

                    <p className="text-sm font-bold">
                        {loading
                            ? "Memuat prestasi..."
                            : `${filteredAchievements.length} Prestasi`}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Menampilkan hanya prestasi
                        yang telah diverifikasi.
                    </p>

                </div>

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div className="flex min-h-[350px] flex-col items-center justify-center">

                        <Loader2
                            size={38}
                            className="animate-spin text-blue-400"
                        />

                        <p className="mt-4 text-sm text-slate-400">
                            Mengambil data prestasi...
                        </p>

                    </div>
                )}

                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading &&
                    error && (
                        <div className="mt-8 rounded-3xl border border-red-400/10 bg-red-500/5 p-10 text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                                <Award
                                    size={25}
                                    className="text-red-400"
                                />
                            </div>

                            <h2 className="mt-5 text-lg font-bold">
                                Gagal Memuat Prestasi
                            </h2>

                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-500"
                            >
                                Coba Lagi
                            </button>

                        </div>
                    )}

                {/* =================================================
                    CARD PRESTASI
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredAchievements.length >
                    0 && (
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                            {filteredAchievements.map(
                                (item) => (
                                    <article
                                        key={item.id}
                                        className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0B2342] transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-950/30"
                                    >

                                        {/* FOTO */}

                                        <div className="relative aspect-[4/3] overflow-hidden bg-[#0A2042]">

                                            {item.proofImageUrl ? (
                                                item.proofImageUrl
                                                    .toLowerCase()
                                                    .endsWith(
                                                        ".pdf"
                                                    ) ? (
                                                    <div className="flex h-full flex-col items-center justify-center">

                                                        <FileImage
                                                            size={
                                                                42
                                                            }
                                                            className="text-blue-300"
                                                        />

                                                        <p className="mt-3 text-xs font-semibold text-slate-400">
                                                            Bukti Prestasi
                                                            PDF
                                                        </p>

                                                        <a
                                                            href={
                                                                item.proofImageUrl
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
                                                        >
                                                            Lihat
                                                            Bukti
                                                        </a>

                                                    </div>
                                                ) : (
                                                    <img
                                                        src={
                                                            item.proofImageUrl
                                                        }
                                                        alt={`Bukti prestasi ${item.achievement}`}
                                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                )
                                            ) : (
                                                <div className="relative flex h-full items-center justify-center">

                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.20),transparent_55%)]" />

                                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md transition duration-300 group-hover:scale-110">

                                                        <Camera
                                                            size={
                                                                34
                                                            }
                                                            className="text-blue-300"
                                                        />

                                                    </div>

                                                </div>
                                            )}

                                            {/* CATEGORY */}

                                            <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#041225]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-200 backdrop-blur-md">
                                                {item.category}
                                            </span>

                                            {/* LEVEL */}

                                            <span className="absolute bottom-4 right-4 rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-black text-slate-950">
                                                {item.level}
                                            </span>

                                        </div>

                                        {/* CONTENT */}

                                        <div className="p-5">

                                            {/* DATE */}

                                            <div className="flex items-center gap-2 text-xs text-slate-500">

                                                <CalendarDays
                                                    size={13}
                                                />

                                                {item.date}

                                            </div>

                                            {/* ACHIEVEMENT */}

                                            <h2 className="mt-3 text-lg font-black leading-6">
                                                {
                                                    item.achievement
                                                }
                                            </h2>

                                            {/* STUDENT */}

                                            <p className="mt-2 text-sm font-medium text-slate-400">
                                                {item.name}
                                            </p>

                                            {/* RANK */}

                                            {item.rank && (
                                                <div className="mt-3 inline-flex rounded-lg border border-amber-400/10 bg-amber-400/5 px-3 py-1.5 text-xs font-bold text-amber-300">
                                                    {
                                                        item.rank
                                                    }
                                                </div>
                                            )}

                                            {/* COMPETITION */}

                                            {item.competitionName && (
                                                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                                                    {
                                                        item.competitionName
                                                    }
                                                </p>
                                            )}

                                            {/* STATUS
                                                HANYA APPROVED
                                            */}

                                            <div className="mt-4">

                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                                                    <CheckCircle2
                                                        size={
                                                            12
                                                        }
                                                    />

                                                    Terverifikasi
                                                </span>

                                            </div>

                                            {/* FOOTER */}

                                            <div className="mt-5 border-t border-white/10 pt-4">

                                                <div className="flex items-center justify-between">

                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                                        PAI UIKA
                                                        BOGOR
                                                    </span>

                                                    <span className="flex items-center gap-2 text-xs font-bold text-blue-300 transition group-hover:text-white">
                                                        Prestasi

                                                        <ArrowRight
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    filteredAchievements.length ===
                    0 && (
                        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0B2342] px-6 py-16 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">

                                <Search
                                    size={28}
                                    className="text-slate-600"
                                />

                            </div>

                            <h2 className="mt-5 text-lg font-bold">
                                Belum Ada Prestasi
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Belum ada prestasi
                                terverifikasi yang
                                sesuai dengan
                                pencarian atau
                                kategori yang dipilih.
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="mt-5 text-xs font-bold text-blue-400 hover:text-blue-300"
                                >
                                    Hapus pencarian
                                </button>
                            )}

                        </div>
                    )}

                {/* =================================================
                    CTA
                ================================================= */}

                <div className="mt-16 overflow-hidden rounded-3xl border border-blue-400/10 bg-gradient-to-r from-blue-600/15 via-blue-600/5 to-transparent p-8 text-center sm:p-10">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                        <Award
                            size={27}
                            className="text-blue-400"
                        />

                    </div>

                    <h2 className="mt-5 text-2xl font-black">
                        Prestasimu belum ada?
                    </h2>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                        Jangan ragu untuk
                        melaporkannya. Semua
                        pencapaian mahasiswa layak
                        untuk diapresiasi dan
                        didokumentasikan.
                    </p>

                    <Link
                        href="/lapor-prestasi"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                    >
                        <Award size={17} />
                        Laporkan Prestasi
                    </Link>

                </div>

            </section>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="border-t border-white/10 bg-[#041225]">

                <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">

                    <p className="text-xs text-slate-500">
                        © 2026 PAI Segudang Prestasi
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                        HIMA PAI UIKA Bogor
                    </p>

                </div>

            </footer>

        </main>
    );
}