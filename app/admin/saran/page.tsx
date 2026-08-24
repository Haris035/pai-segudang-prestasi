"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Check,
    Eye,
    Loader2,
    MessageCircle,
    RefreshCw,
    Search,
    Trash2,
    X,
    Mail,
    User,
} from "lucide-react";

type Suggestion = {
    id: string;
    name: string | null;
    contact: string | null;
    type: string;
    message: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

type FilterStatus = "ALL" | "NEW" | "READ" | "DONE";

export default function AdminSaranPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<FilterStatus>("ALL");

    const [selectedSuggestion, setSelectedSuggestion] =
        useState<Suggestion | null>(null);

    const [processingId, setProcessingId] =
        useState<string | null>(null);

    // =====================================================
    // LOAD DATA
    // =====================================================

    async function loadSuggestions() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch("/api/suggestions", {
                method: "GET",
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Gagal mengambil data saran."
                );
            }

            if (!Array.isArray(result?.data)) {
                throw new Error(
                    "Format data saran tidak valid."
                );
            }

            setSuggestions(result.data);
        } catch (error) {
            console.error(
                "LOAD SUGGESTIONS ERROR:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Gagal mengambil data saran."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSuggestions();
    }, []);

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    async function updateStatus(
        id: string,
        status: "READ" | "DONE"
    ) {
        try {
            setProcessingId(id);
            setError("");

            const response = await fetch(
                `/api/suggestions?id=${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
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
                    "Gagal memperbarui status saran."
                );
            }

            setSuggestions((current) =>
                current.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            status,
                        }
                        : item
                )
            );

            setSelectedSuggestion((current) =>
                current?.id === id
                    ? {
                        ...current,
                        status,
                    }
                    : current
            );
        } catch (error) {
            console.error(
                "UPDATE SUGGESTION STATUS ERROR:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui status saran."
            );
        } finally {
            setProcessingId(null);
        }
    }

    // =====================================================
    // DELETE
    // =====================================================

    async function deleteSuggestion(id: string) {
        const confirmed = window.confirm(
            "Yakin ingin menghapus saran ini? Data yang dihapus tidak dapat dikembalikan."
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(id);
            setError("");

            const response = await fetch(
                `/api/suggestions?id=${id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Gagal menghapus saran."
                );
            }

            setSuggestions((current) =>
                current.filter(
                    (item) => item.id !== id
                )
            );

            setSelectedSuggestion(null);
        } catch (error) {
            console.error(
                "DELETE SUGGESTION ERROR:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Gagal menghapus saran."
            );
        } finally {
            setProcessingId(null);
        }
    }

    // =====================================================
    // FILTER
    // =====================================================

    const filteredSuggestions = useMemo(() => {
        const keyword = search
            .toLowerCase()
            .trim();

        return suggestions.filter((item) => {
            const matchesStatus =
                statusFilter === "ALL" ||
                item.status === statusFilter;

            const matchesSearch =
                !keyword ||
                item.name
                    ?.toLowerCase()
                    .includes(keyword) ||
                item.contact
                    ?.toLowerCase()
                    .includes(keyword) ||
                item.type
                    ?.toLowerCase()
                    .includes(keyword) ||
                item.message
                    ?.toLowerCase()
                    .includes(keyword);

            return (
                matchesStatus &&
                matchesSearch
            );
        });
    }, [
        suggestions,
        search,
        statusFilter,
    ]);

    // =====================================================
    // COUNTER
    // =====================================================

    const newCount = suggestions.filter(
        (item) => item.status === "NEW"
    ).length;

    const readCount = suggestions.filter(
        (item) => item.status === "READ"
    ).length;

    const doneCount = suggestions.filter(
        (item) => item.status === "DONE"
    ).length;

    // =====================================================
    // DATE
    // =====================================================

    function formatDate(value: string) {
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

    function formatDateTime(value: string) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
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

    function statusBadge(status: string) {
        if (status === "DONE") {
            return (
                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    SELESAI
                </span>
            );
        }

        if (status === "READ") {
            return (
                <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
                    DIBACA
                </span>
            );
        }

        return (
            <span className="inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
                BARU
            </span>
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
                            <MessageCircle size={21} />
                        </div>

                        <div>
                            <h1 className="text-lg font-black">
                                Saran & Masukan
                            </h1>

                            <p className="text-xs text-slate-500">
                                PAI Segudang Prestasi
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={loadSuggestions}
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
                            setStatusFilter("NEW")
                        }
                        className={`rounded-2xl border p-5 text-left transition ${statusFilter === "NEW"
                                ? "border-amber-400/30 bg-amber-400/10"
                                : "border-white/10 bg-[#0B2342] hover:bg-white/5"
                            }`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Saran Baru
                        </p>

                        <p className="mt-2 text-3xl font-black text-amber-300">
                            {newCount}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter("READ")
                        }
                        className={`rounded-2xl border p-5 text-left transition ${statusFilter === "READ"
                                ? "border-blue-400/30 bg-blue-400/10"
                                : "border-white/10 bg-[#0B2342] hover:bg-white/5"
                            }`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Sudah Dibaca
                        </p>

                        <p className="mt-2 text-3xl font-black text-blue-300">
                            {readCount}
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setStatusFilter("DONE")
                        }
                        className={`rounded-2xl border p-5 text-left transition ${statusFilter === "DONE"
                                ? "border-emerald-400/30 bg-emerald-400/10"
                                : "border-white/10 bg-[#0B2342] hover:bg-white/5"
                            }`}
                    >
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Selesai
                        </p>

                        <p className="mt-2 text-3xl font-black text-emerald-300">
                            {doneCount}
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
                                setSearch(event.target.value)
                            }
                            placeholder="Cari nama, kontak, jenis, atau isi saran..."
                            className="h-12 w-full rounded-xl border border-white/10 bg-[#0B2342] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                        />

                    </div>

                    <div className="flex gap-2 overflow-x-auto">

                        {(
                            [
                                "ALL",
                                "NEW",
                                "READ",
                                "DONE",
                            ] as FilterStatus[]
                        ).map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() =>
                                    setStatusFilter(status)
                                }
                                className={`whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold ${statusFilter === status
                                        ? "bg-blue-600 text-white"
                                        : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                                    }`}
                            >
                                {status === "ALL"
                                    ? "Semua"
                                    : status === "NEW"
                                        ? "Baru"
                                        : status === "READ"
                                            ? "Dibaca"
                                            : "Selesai"}
                            </button>
                        ))}

                    </div>

                </div>

                {/* TITLE */}

                <div className="mt-8">

                    <h2 className="text-xl font-black">
                        Daftar Saran
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        {filteredSuggestions.length} saran
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
                                Mengambil data saran...
                            </p>

                        </div>

                    </div>
                )}

                {/* EMPTY */}

                {!loading &&
                    filteredSuggestions.length === 0 && (
                        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B2342] px-6 py-20 text-center">

                            <MessageCircle
                                size={45}
                                className="mx-auto text-slate-600"
                            />

                            <h3 className="mt-5 text-lg font-bold">
                                Belum Ada Saran
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Belum ada saran atau masukan
                                yang masuk.
                            </p>

                        </div>
                    )}

                {/* CARDS */}

                {!loading &&
                    filteredSuggestions.length > 0 && (
                        <div className="mt-6 grid gap-5 lg:grid-cols-2">

                            {filteredSuggestions.map(
                                (item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-3xl border border-white/10 bg-[#0B2342] p-5 transition hover:border-blue-400/20"
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[10px] font-bold uppercase text-blue-300">
                                                        {item.type}
                                                    </span>

                                                    {statusBadge(
                                                        item.status
                                                    )}

                                                </div>

                                                <h3 className="mt-4 text-lg font-black">
                                                    {item.name ||
                                                        "Anonim"}
                                                </h3>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatDateTime(
                                                        item.createdAt
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                        <p className="mt-5 line-clamp-4 text-sm leading-7 text-slate-300">
                                            {item.message}
                                        </p>

                                        {item.contact && (
                                            <p className="mt-4 text-xs text-slate-500">
                                                Kontak:{" "}
                                                <span className="text-slate-300">
                                                    {item.contact}
                                                </span>
                                            </p>
                                        )}

                                        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedSuggestion(
                                                        item
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                                            >
                                                <Eye size={14} />
                                                Detail
                                            </button>

                                            {item.status ===
                                                "NEW" && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                item.id,
                                                                "READ"
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold hover:bg-blue-500 disabled:opacity-50"
                                                    >
                                                        <Check size={14} />
                                                        Tandai Dibaca
                                                    </button>
                                                )}

                                            {item.status !==
                                                "DONE" && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            processingId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                item.id,
                                                                "DONE"
                                                            )
                                                        }
                                                        className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold hover:bg-emerald-500 disabled:opacity-50"
                                                    >
                                                        <Check size={14} />
                                                        Selesai
                                                    </button>
                                                )}

                                            <button
                                                type="button"
                                                disabled={
                                                    processingId ===
                                                    item.id
                                                }
                                                onClick={() =>
                                                    deleteSuggestion(
                                                        item.id
                                                    )
                                                }
                                                className="ml-auto flex items-center gap-2 rounded-lg border border-red-400/10 bg-red-500/5 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10"
                                            >
                                                <Trash2 size={14} />
                                                Hapus
                                            </button>

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

            {selectedSuggestion && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedSuggestion(null)
                    }
                >

                    <div
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#071A33] shadow-2xl"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#071A33] p-5">

                            <div>

                                <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                    Detail Saran
                                </p>

                                <h2 className="mt-1 text-xl font-black">
                                    {selectedSuggestion.type}
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedSuggestion(null)
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="p-5">

                            {/* PENGIRIM */}

                            <div className="grid gap-3 sm:grid-cols-2">

                                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <User size={14} />
                                        Nama
                                    </div>

                                    <p className="mt-2 text-sm font-semibold text-white">
                                        {selectedSuggestion.name ||
                                            "Anonim"}
                                    </p>

                                </div>

                                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <Mail size={14} />
                                        Kontak
                                    </div>

                                    <p className="mt-2 break-all text-sm font-semibold text-white">
                                        {selectedSuggestion.contact ||
                                            "Tidak dicantumkan"}
                                    </p>

                                </div>

                            </div>

                            {/* TYPE */}

                            <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Jenis Saran
                                </p>

                                <p className="mt-2 text-sm font-semibold text-white">
                                    {selectedSuggestion.type}
                                </p>

                            </div>

                            {/* MESSAGE */}

                            <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.03] p-5">

                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Isi Saran / Masukan
                                </p>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                                    {selectedSuggestion.message}
                                </p>

                            </div>

                            {/* DATE */}

                            <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">

                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Dikirim Pada
                                </p>

                                <p className="mt-2 text-sm font-semibold text-white">
                                    {formatDateTime(
                                        selectedSuggestion.createdAt
                                    )}
                                </p>

                            </div>

                            {/* STATUS */}

                            <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5">

                                <div>

                                    <p className="text-xs text-slate-500">
                                        Status
                                    </p>

                                    <div className="mt-2">
                                        {statusBadge(
                                            selectedSuggestion.status
                                        )}
                                    </div>

                                </div>

                            </div>

                            {/* ACTION */}

                            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">

                                {selectedSuggestion.status ===
                                    "NEW" && (
                                        <button
                                            type="button"
                                            disabled={
                                                processingId ===
                                                selectedSuggestion.id
                                            }
                                            onClick={() =>
                                                updateStatus(
                                                    selectedSuggestion.id,
                                                    "READ"
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold hover:bg-blue-500 disabled:opacity-50"
                                        >
                                            <Check size={18} />
                                            Tandai Dibaca
                                        </button>
                                    )}

                                {selectedSuggestion.status !==
                                    "DONE" && (
                                        <button
                                            type="button"
                                            disabled={
                                                processingId ===
                                                selectedSuggestion.id
                                            }
                                            onClick={() =>
                                                updateStatus(
                                                    selectedSuggestion.id,
                                                    "DONE"
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold hover:bg-emerald-500 disabled:opacity-50"
                                        >
                                            <Check size={18} />
                                            Tandai Selesai
                                        </button>
                                    )}

                                <button
                                    type="button"
                                    disabled={
                                        processingId ===
                                        selectedSuggestion.id
                                    }
                                    onClick={() =>
                                        deleteSuggestion(
                                            selectedSuggestion.id
                                        )
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl border border-red-400/10 bg-red-500/5 px-5 py-3.5 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    <Trash2 size={18} />
                                    Hapus
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </main>
    );
}