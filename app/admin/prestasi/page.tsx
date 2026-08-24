"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Award,
    Check,
    Eye,
    FileImage,
    Loader2,
    MessageCircle,
    RefreshCw,
    Search,
    Trash2,
    Trophy,
    User,
    X,
} from "lucide-react";

type Student = {
    id: string;
    name: string;
    nim: string;
    semester: string | null;
    className: string | null;
    phone: string;
};

type Achievement = {
    id: string;
    achievementName: string;
    category: string;
    level: string;
    rank: string | null;
    competitionName: string | null;
    organizer: string | null;
    achievementDate: string;
    description: string | null;
    proofImageUrl: string | null;
    studentPhotoUrl: string | null;
    status: string;
    createdAt: string;
    student: Student;
};

type FilterStatus =
    | "ALL"
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export default function AdminPrestasiPage() {
    const [achievements, setAchievements] = useState<
        Achievement[]
    >([]);

    const [loading, setLoading] = useState(true);

    const [processingId, setProcessingId] =
        useState<string | null>(null);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState<FilterStatus>("PENDING");

    const [selectedAchievement, setSelectedAchievement] =
        useState<Achievement | null>(null);

    // =====================================================
    // LOAD DATA
    // =====================================================

    async function loadAchievements() {
        try {
            setLoading(true);
            setError("");

            console.log(
                "===================================="
            );

            console.log(
                "ADMIN: Mengambil semua laporan prestasi..."
            );

            const response =
                await fetch(
                    "/api/achievements?admin=true",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

            console.log(
                "ADMIN API STATUS:",
                response.status
            );

            const text =
                await response.text();

            console.log(
                "ADMIN API RESPONSE:",
                text
            );

            if (!text) {
                throw new Error(
                    "API mengembalikan response kosong."
                );
            }

            let result: any;

            try {
                result =
                    JSON.parse(text);
            } catch {
                console.error(
                    "Response bukan JSON:",
                    text
                );

                throw new Error(
                    "API mengembalikan response bukan JSON."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Gagal mengambil data prestasi."
                );
            }

            const data =
                result?.data ?? [];

            if (!Array.isArray(data)) {
                throw new Error(
                    "Format data prestasi tidak valid."
                );
            }

            console.log(
                "JUMLAH LAPORAN ADMIN:",
                data.length
            );

            console.log(
                "DATA ADMIN:",
                data
            );

            setAchievements(
                data
            );
        } catch (error) {
            console.error(
                "ADMIN FETCH ACHIEVEMENTS ERROR:",
                error
            );

            setAchievements([]);

            setError(
                error instanceof Error
                    ? error.message
                    : "Gagal mengambil data prestasi."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAchievements();
    }, []);

    // =====================================================
    // WHATSAPP
    // =====================================================

    function normalizeWhatsAppNumber(
        phone: string
    ) {
        let number = phone
            .trim()
            .replace(/\s+/g, "")
            .replace(/-/g, "")
            .replace(/\(/g, "")
            .replace(/\)/g, "");

        if (number.startsWith("+")) {
            number = number.substring(1);
        }

        if (number.startsWith("0")) {
            number = "62" + number.substring(1);
        }

        return number;
    }

    function contactStudentWhatsApp(
        achievement: Achievement
    ) {
        const phone =
            achievement.student?.phone?.trim();

        if (!phone) {
            window.alert(
                "Nomor WhatsApp pengirim tidak tersedia."
            );
            return;
        }

        const whatsappNumber =
            normalizeWhatsAppNumber(phone);

        if (
            !whatsappNumber ||
            whatsappNumber.length < 10
        ) {
            window.alert(
                "Nomor WhatsApp pengirim tidak valid."
            );
            return;
        }

        const studentName =
            achievement.student?.name ||
            "Mahasiswa";

        const achievementName =
            achievement.achievementName ||
            "prestasi";

        const message = `Assalamu'alaikum ${studentName}.

Kami dari Admin PAI Segudang Prestasi ingin melakukan konfirmasi terkait pengajuan prestasi Anda.

Nama Prestasi:
${achievementName}

Mohon melakukan konfirmasi kepada admin terkait data atau dokumentasi prestasi tersebut.

Terima kasih.`;

        const whatsappUrl =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                message
            )}`;

        window.open(
            whatsappUrl,
            "_blank",
            "noopener,noreferrer"
        );
    }

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    async function updateStatus(
        id: string,
        status: "APPROVED" | "REJECTED"
    ) {
        const confirmed = window.confirm(
            status === "APPROVED"
                ? "Setujui prestasi ini?"
                : "Tolak prestasi ini?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(id);
            setError("");

            const response = await fetch(
                `/api/achievements/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Gagal memperbarui status."
                );
            }

            setAchievements((current) =>
                current.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            status,
                        }
                        : item
                )
            );

            setSelectedAchievement(null);
        } catch (error) {
            console.error(
                "UPDATE STATUS ERROR:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui status."
            );
        } finally {
            setProcessingId(null);
        }
    }

    // =====================================================
    // DELETE
    // =====================================================

    async function deleteAchievement(
        id: string
    ) {
        const confirmed = window.confirm(
            "Yakin ingin menghapus prestasi ini? Data yang dihapus tidak dapat dikembalikan."
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(id);
            setError("");

            const response = await fetch(
                `/api/achievements/${id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Gagal menghapus prestasi."
                );
            }

            setAchievements((current) =>
                current.filter(
                    (item) =>
                        item.id !== id
                )
            );

            setSelectedAchievement(null);
        } catch (error) {
            console.error(
                "DELETE ACHIEVEMENT ERROR:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Gagal menghapus prestasi."
            );
        } finally {
            setProcessingId(null);
        }
    }

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
                    const matchesStatus =
                        statusFilter ===
                        "ALL" ||
                        item.status ===
                        statusFilter;

                    const matchesSearch =
                        !keyword ||
                        item.student?.name
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.student?.nim
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.achievementName
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.category
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.level
                            ?.toLowerCase()
                            .includes(keyword) ||
                        item.competitionName
                            ?.toLowerCase()
                            .includes(keyword);

                    return (
                        matchesStatus &&
                        matchesSearch
                    );
                }
            );
        }, [
            achievements,
            search,
            statusFilter,
        ]);

    // =====================================================
    // COUNTER
    // =====================================================

    const pendingCount =
        achievements.filter(
            (item) =>
                item.status === "PENDING"
        ).length;

    const approvedCount =
        achievements.filter(
            (item) =>
                item.status === "APPROVED"
        ).length;

    const rejectedCount =
        achievements.filter(
            (item) =>
                item.status === "REJECTED"
        ).length;

    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(
        value: string
    ) {
        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
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

    function formatDateTime(
        value: string
    ) {
        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        return date.toLocaleString(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }

    // =====================================================
    // STATUS BADGE
    // =====================================================

    function statusBadge(
        status: string
    ) {
        if (status === "APPROVED") {
            return (
                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    APPROVED
                </span>
            );
        }

        if (status === "REJECTED") {
            return (
                <span className="inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300">
                    REJECTED
                </span>
            );
        }

        return (
            <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                PENDING
            </span>
        );
    }

    // =====================================================
    // DETAIL ITEM
    // =====================================================

    function DetailItem({
        label,
        value,
    }: {
        label: string;
        value?: string | null;
    }) {
        return (
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {label}
                </p>

                <p className="mt-1.5 break-words text-sm font-semibold text-white">
                    {value || "-"}
                </p>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <main className="min-h-screen bg-[#071A33] text-white">

            {/* HEADER */}

            <header className="border-b border-white/10 bg-[#041225]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                            <Trophy size={21} />
                        </div>

                        <div>
                            <h1 className="text-lg font-black">
                                Verifikasi Prestasi
                            </h1>

                            <p className="text-xs text-slate-500">
                                PAI Segudang Prestasi
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={loadAchievements}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                        Refresh
                    </button>

                </div>
            </header>

            {/* CONTENT */}

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* ERROR */}

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* STATS */}

                <div className="grid gap-4 sm:grid-cols-3">

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter("PENDING")
                        }
                        className={`rounded-2xl border p-5 text-left transition ${statusFilter === "PENDING"
                            ? "border-amber-400/30 bg-amber-400/10"
                            : "border-white/10 bg-[#0B2342] hover:bg-white/5"
                            }`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Menunggu
                        </p>

                        <p className="mt-2 text-3xl font-black text-amber-300">
                            {pendingCount}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter("APPROVED")
                        }
                        className={`rounded-2xl border p-5 text-left transition ${statusFilter === "APPROVED"
                            ? "border-emerald-400/30 bg-emerald-400/10"
                            : "border-white/10 bg-[#0B2342] hover:bg-white/5"
                            }`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Disetujui
                        </p>

                        <p className="mt-2 text-3xl font-black text-emerald-300">
                            {approvedCount}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter("REJECTED")
                        }
                        className={`rounded-2xl border p-5 text-left transition ${statusFilter === "REJECTED"
                            ? "border-red-400/30 bg-red-400/10"
                            : "border-white/10 bg-[#0B2342] hover:bg-white/5"
                            }`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Ditolak
                        </p>

                        <p className="mt-2 text-3xl font-black text-red-300">
                            {rejectedCount}
                        </p>
                    </button>

                </div>

                {/* SEARCH */}

                <div className="mt-8 flex flex-col gap-4 lg:flex-row">

                    <div className="relative flex-1">

                        <Search
                            size={18}
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
                            placeholder="Cari nama mahasiswa, NIM, atau prestasi..."
                            className="h-12 w-full rounded-xl border border-white/10 bg-[#0B2342] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                        />

                    </div>

                    <div className="flex gap-2 overflow-x-auto">

                        {(
                            [
                                "ALL",
                                "PENDING",
                                "APPROVED",
                                "REJECTED",
                            ] as FilterStatus[]
                        ).map(
                            (status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() =>
                                        setStatusFilter(
                                            status
                                        )
                                    }
                                    className={`whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold ${statusFilter ===
                                        status
                                        ? "bg-blue-600 text-white"
                                        : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                                        }`}
                                >
                                    {status === "ALL"
                                        ? "Semua"
                                        : status}
                                </button>
                            )
                        )}

                    </div>

                </div>

                {/* TITLE */}

                <div className="mt-8">

                    <h2 className="text-xl font-black">
                        Data Prestasi
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        {filteredAchievements.length} data
                        ditampilkan
                    </p>

                </div>

                {/* LOADING */}

                {loading && (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="text-center">

                            <Loader2
                                size={35}
                                className="mx-auto animate-spin text-blue-400"
                            />

                            <p className="mt-4 text-sm text-slate-500">
                                Mengambil data prestasi...
                            </p>

                        </div>
                    </div>
                )}

                {/* EMPTY */}

                {!loading &&
                    filteredAchievements.length === 0 && (
                        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B2342] px-6 py-20 text-center">

                            <Award
                                size={45}
                                className="mx-auto text-slate-600"
                            />

                            <h3 className="mt-5 text-lg font-bold">
                                Tidak Ada Data
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Tidak ada prestasi dengan
                                filter yang dipilih.
                            </p>

                        </div>
                    )}

                {/* CARDS */}

                {!loading &&
                    filteredAchievements.length > 0 && (
                        <div className="mt-6 grid gap-5 lg:grid-cols-2">

                            {filteredAchievements.map(
                                (item) => (
                                    <article
                                        key={item.id}
                                        className="overflow-hidden rounded-3xl border border-white/10 bg-[#0B2342]"
                                    >

                                        <div className="grid sm:grid-cols-[220px_1fr]">

                                            {/* PROOF IMAGE */}

                                            <div className="relative min-h-[220px] bg-[#081d37]">

                                                {item.proofImageUrl ? (
                                                    <img
                                                        src={
                                                            item.proofImageUrl
                                                        }
                                                        alt={`Bukti ${item.achievementName}`}
                                                        className="h-full min-h-[220px] w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full min-h-[220px] items-center justify-center">
                                                        <FileImage
                                                            size={45}
                                                            className="text-slate-700"
                                                        />
                                                    </div>
                                                )}

                                            </div>

                                            {/* CONTENT */}

                                            <div className="p-5">

                                                <div className="flex items-start justify-between gap-3">

                                                    <div>

                                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                                            {
                                                                item.category
                                                            }
                                                        </p>

                                                        <h3 className="mt-2 text-lg font-black leading-6">
                                                            {
                                                                item.achievementName
                                                            }
                                                        </h3>

                                                    </div>

                                                    {statusBadge(
                                                        item.status
                                                    )}

                                                </div>

                                                <div className="mt-4 space-y-2 text-xs">

                                                    <p className="text-slate-400">
                                                        <b className="text-white">
                                                            Mahasiswa:
                                                        </b>{" "}
                                                        {
                                                            item.student?.name
                                                        }
                                                    </p>

                                                    <p className="text-slate-400">
                                                        <b className="text-white">
                                                            NIM:
                                                        </b>{" "}
                                                        {
                                                            item.student?.nim
                                                        }
                                                    </p>

                                                    <p className="text-slate-400">
                                                        <b className="text-white">
                                                            Tingkat:
                                                        </b>{" "}
                                                        {item.level}
                                                    </p>

                                                    {item.rank && (
                                                        <p className="text-slate-400">
                                                            <b className="text-white">
                                                                Peringkat:
                                                            </b>{" "}
                                                            {item.rank}
                                                        </p>
                                                    )}

                                                    {item.competitionName && (
                                                        <p className="text-slate-400">
                                                            <b className="text-white">
                                                                Kompetisi:
                                                            </b>{" "}
                                                            {
                                                                item.competitionName
                                                            }
                                                        </p>
                                                    )}

                                                    <p className="text-slate-400">
                                                        <b className="text-white">
                                                            Tanggal:
                                                        </b>{" "}
                                                        {formatDate(
                                                            item.achievementDate
                                                        )}
                                                    </p>

                                                </div>

                                                {/* ACTION */}

                                                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedAchievement(
                                                                item
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                                                    >
                                                        <Eye size={14} />
                                                        Detail
                                                    </button>

                                                    {item.status ===
                                                        "PENDING" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processingId ===
                                                                        item.id
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            item.id,
                                                                            "APPROVED"
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold hover:bg-emerald-500 disabled:opacity-50"
                                                                >
                                                                    <Check
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                    Setujui
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        processingId ===
                                                                        item.id
                                                                    }
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            item.id,
                                                                            "REJECTED"
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold hover:bg-red-500 disabled:opacity-50"
                                                                >
                                                                    <X size={14} />
                                                                    Tolak
                                                                </button>
                                                            </>
                                                        )}

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            deleteAchievement(
                                                                item.id
                                                            )
                                                        }
                                                        className="ml-auto flex items-center gap-2 rounded-lg border border-red-400/10 bg-red-500/5 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10"
                                                    >
                                                        <Trash2
                                                            size={14}
                                                        />
                                                        Hapus
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

            </section>

            {/* =====================================================
                DETAIL MODAL
            ===================================================== */}

            {selectedAchievement && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedAchievement(null)
                    }
                >

                    <div
                        className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#071A33] shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#071A33] p-5">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                    Detail Pengajuan Prestasi
                                </p>

                                <h2 className="mt-1 text-xl font-black">
                                    {
                                        selectedAchievement.achievementName
                                    }
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedAchievement(
                                        null
                                    )
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="p-5">

                            {/* =================================================
                                DUA FOTO
                            ================================================= */}

                            <div className="grid gap-5 md:grid-cols-2">

                                {/* FOTO MAHASISWA */}

                                <div>

                                    <div className="mb-3 flex items-center gap-2">

                                        <User
                                            size={17}
                                            className="text-blue-400"
                                        />

                                        <h3 className="text-sm font-bold">
                                            Foto Mahasiswa
                                        </h3>

                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#041225]">

                                        {selectedAchievement.studentPhotoUrl ? (
                                            <img
                                                src={
                                                    selectedAchievement.studentPhotoUrl
                                                }
                                                alt={`Foto ${selectedAchievement.student?.name}`}
                                                className="h-[350px] w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-[350px] items-center justify-center">

                                                <div className="text-center">

                                                    <User
                                                        size={50}
                                                        className="mx-auto text-slate-700"
                                                    />

                                                    <p className="mt-3 text-xs text-slate-500">
                                                        Foto mahasiswa
                                                        tidak tersedia
                                                    </p>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                </div>

                                {/* BUKTI PRESTASI */}

                                <div>

                                    <div className="mb-3 flex items-center gap-2">

                                        <FileImage
                                            size={17}
                                            className="text-blue-400"
                                        />

                                        <h3 className="text-sm font-bold">
                                            Bukti Prestasi
                                        </h3>

                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#041225]">

                                        {selectedAchievement.proofImageUrl ? (
                                            <img
                                                src={
                                                    selectedAchievement.proofImageUrl
                                                }
                                                alt="Bukti prestasi"
                                                className="h-[350px] w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-[350px] items-center justify-center">

                                                <FileImage
                                                    size={50}
                                                    className="text-slate-700"
                                                />

                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                DATA MAHASISWA
                            ================================================= */}

                            <div className="mt-8">

                                <h3 className="mb-4 text-lg font-black">
                                    Data Mahasiswa
                                </h3>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                    <DetailItem
                                        label="Nama Mahasiswa"
                                        value={
                                            selectedAchievement.student?.name
                                        }
                                    />

                                    <DetailItem
                                        label="NIM"
                                        value={
                                            selectedAchievement.student?.nim
                                        }
                                    />

                                    <DetailItem
                                        label="Semester"
                                        value={
                                            selectedAchievement.student?.semester
                                        }
                                    />

                                    <DetailItem
                                        label="Kelas"
                                        value={
                                            selectedAchievement.student?.className
                                        }
                                    />

                                    <DetailItem
                                        label="Nomor HP"
                                        value={
                                            selectedAchievement.student?.phone
                                        }
                                    />

                                </div>

                            </div>

                            {/* =================================================
                                HUBUNGI PENGIRIM
                            ================================================= */}

                            <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-5">

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-start gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                            <MessageCircle
                                                size={20}
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-white">
                                                Konfirmasi Pengirim
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                                Hubungi mahasiswa secara
                                                langsung melalui WhatsApp
                                                jika diperlukan konfirmasi
                                                data atau dokumentasi.
                                            </p>
                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            contactStudentWhatsApp(
                                                selectedAchievement
                                            )
                                        }
                                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white transition hover:bg-emerald-500"
                                    >
                                        <MessageCircle
                                            size={16}
                                        />
                                        Hubungi Pengirim
                                    </button>

                                </div>

                            </div>

                            {/* =================================================
                                DATA PRESTASI
                            ================================================= */}

                            <div className="mt-8">

                                <h3 className="mb-4 text-lg font-black">
                                    Data Prestasi
                                </h3>

                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                                    <DetailItem
                                        label="Nama Prestasi"
                                        value={
                                            selectedAchievement.achievementName
                                        }
                                    />

                                    <DetailItem
                                        label="Kategori"
                                        value={
                                            selectedAchievement.category
                                        }
                                    />

                                    <DetailItem
                                        label="Tingkat"
                                        value={
                                            selectedAchievement.level
                                        }
                                    />

                                    <DetailItem
                                        label="Peringkat"
                                        value={
                                            selectedAchievement.rank
                                        }
                                    />

                                    <DetailItem
                                        label="Nama Kompetisi"
                                        value={
                                            selectedAchievement.competitionName
                                        }
                                    />

                                    <DetailItem
                                        label="Penyelenggara"
                                        value={
                                            selectedAchievement.organizer
                                        }
                                    />

                                    <DetailItem
                                        label="Tanggal Prestasi"
                                        value={
                                            formatDate(
                                                selectedAchievement.achievementDate
                                            )
                                        }
                                    />

                                    <DetailItem
                                        label="Status"
                                        value={
                                            selectedAchievement.status
                                        }
                                    />

                                    <DetailItem
                                        label="Tanggal Pengajuan"
                                        value={
                                            formatDateTime(
                                                selectedAchievement.createdAt
                                            )
                                        }
                                    />

                                </div>

                            </div>

                            {/* =================================================
                                DESKRIPSI
                            ================================================= */}

                            <div className="mt-5">

                                <h3 className="mb-3 text-lg font-black">
                                    Deskripsi
                                </h3>

                                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">

                                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                        {
                                            selectedAchievement.description ||
                                            "Tidak ada deskripsi."
                                        }
                                    </p>

                                </div>

                            </div>

                            {/* =================================================
                                STATUS
                            ================================================= */}

                            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5">

                                <div>

                                    <p className="text-xs text-slate-500">
                                        Status Verifikasi
                                    </p>

                                    <div className="mt-2">
                                        {statusBadge(
                                            selectedAchievement.status
                                        )}
                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                ACTION
                            ================================================= */}

                            {selectedAchievement.status ===
                                "PENDING" && (
                                    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">

                                        <button
                                            type="button"
                                            disabled={
                                                processingId ===
                                                selectedAchievement.id
                                            }
                                            onClick={() =>
                                                updateStatus(
                                                    selectedAchievement.id,
                                                    "APPROVED"
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50"
                                        >
                                            <Check size={18} />
                                            Setujui Prestasi
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                processingId ===
                                                selectedAchievement.id
                                            }
                                            onClick={() =>
                                                updateStatus(
                                                    selectedAchievement.id,
                                                    "REJECTED"
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold hover:bg-red-500 disabled:opacity-50"
                                        >
                                            <X size={18} />
                                            Tolak Prestasi
                                        </button>

                                    </div>
                                )}

                        </div>

                    </div>

                </div>
            )}

        </main>
    );
}