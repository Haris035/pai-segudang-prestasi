"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    MessageCircle,
    Send,
    Sparkles,
    Trophy,
} from "lucide-react";

const suggestionTypes = [
    "Saran Website",
    "Saran Program",
    "Saran Prestasi",
    "Laporan Masalah",
    "Lainnya",
];

export default function SaranPage() {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [type, setType] = useState("Saran Website");
    const [message, setMessage] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setSuccess(false);

        if (!message.trim()) {
            setError("Silakan tuliskan saran terlebih dahulu.");
            return;
        }

        if (message.trim().length < 10) {
            setError(
                "Saran terlalu singkat. Mohon tuliskan saran minimal 10 karakter."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch("/api/suggestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim() || null,
                    contact: contact.trim() || null,
                    type,
                    message: message.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Gagal mengirim saran."
                );
            }

            setSuccess(true);

            setName("");
            setContact("");
            setType("Saran Website");
            setMessage("");
        } catch (err) {
            console.error("SEND SUGGESTION ERROR:", err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Gagal mengirim saran."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#071A33] text-white">

            {/* BACKGROUND */}

            <div className="pointer-events-none fixed inset-0 overflow-hidden">

                <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[130px]" />

                <div className="absolute -left-40 top-1/2 h-80 w-80 rounded-full bg-sky-400/5 blur-[100px]" />

                <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

            </div>

            {/* HEADER */}

            <header className="relative z-10 border-b border-white/10 bg-[#041225]/80 backdrop-blur-xl">

                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">

                    <Link
                        href="/"
                        className="flex items-center gap-3 text-sm font-bold text-slate-300 transition hover:text-white"
                    >

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                            <Trophy size={19} />
                        </div>

                        <div className="hidden sm:block">

                            <p className="text-sm font-black text-white">
                                PAI Segudang Prestasi
                            </p>

                            <p className="text-[10px] uppercase tracking-widest text-slate-500">
                                HIMA PAI UIKA Bogor
                            </p>

                        </div>

                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft size={15} />
                        Kembali
                    </Link>

                </div>

            </header>

            {/* CONTENT */}

            <section className="relative z-10 px-4 py-12 sm:px-6 sm:py-20">

                <div className="mx-auto max-w-3xl">

                    {/* TITLE */}

                    <div className="text-center">

                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-200">

                            <Sparkles
                                size={15}
                                className="text-sky-400"
                            />

                            Ruang Aspirasi

                        </div>

                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

                            Kirim{" "}

                            <span className="text-blue-400">
                                Saran
                            </span>

                        </h1>

                        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">

                            Bantu kami mengembangkan PAI Segudang
                            Prestasi menjadi lebih baik melalui
                            kritik, saran, dan masukan dari Anda.

                        </p>

                    </div>

                    {/* FORM CARD */}

                    <div className="mt-10 rounded-3xl border border-white/10 bg-[#0B2342] p-5 shadow-2xl shadow-blue-950/20 sm:p-8">

                        {/* SUCCESS */}

                        {success && (

                            <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">

                                        <CheckCircle2
                                            size={21}
                                            className="text-emerald-400"
                                        />

                                    </div>

                                    <div>

                                        <h3 className="font-bold text-emerald-300">
                                            Saran berhasil dikirim
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-slate-400">
                                            Terima kasih atas masukan Anda.
                                            Saran akan diterima dan ditinjau
                                            oleh admin PAI Segudang Prestasi.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                        {/* ERROR */}

                        {error && (

                            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
                                {error}
                            </div>

                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* NAME */}

                            <div>

                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-bold text-white"
                                >
                                    Nama
                                    <span className="ml-2 text-xs font-normal text-slate-600">
                                        Opsional
                                    </span>
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Nama Anda"
                                    maxLength={100}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                />

                            </div>

                            {/* CONTACT */}

                            <div>

                                <label
                                    htmlFor="contact"
                                    className="mb-2 block text-sm font-bold text-white"
                                >
                                    Kontak
                                    <span className="ml-2 text-xs font-normal text-slate-600">
                                        Opsional
                                    </span>
                                </label>

                                <input
                                    id="contact"
                                    type="text"
                                    value={contact}
                                    onChange={(event) =>
                                        setContact(event.target.value)
                                    }
                                    placeholder="WhatsApp atau email"
                                    maxLength={100}
                                    className="h-12 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                />

                            </div>

                            {/* TYPE */}

                            <div>

                                <label
                                    htmlFor="type"
                                    className="mb-2 block text-sm font-bold text-white"
                                >
                                    Jenis Saran
                                </label>

                                <select
                                    id="type"
                                    value={type}
                                    onChange={(event) =>
                                        setType(event.target.value)
                                    }
                                    className="h-12 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                >

                                    {suggestionTypes.map(
                                        (suggestionType) => (
                                            <option
                                                key={suggestionType}
                                                value={suggestionType}
                                                className="bg-[#071A33]"
                                            >
                                                {suggestionType}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* MESSAGE */}

                            <div>

                                <div className="mb-2 flex items-center justify-between">

                                    <label
                                        htmlFor="message"
                                        className="text-sm font-bold text-white"
                                    >
                                        Saran atau Masukan
                                    </label>

                                    <span className="text-xs text-slate-600">
                                        {message.length}/1000
                                    </span>

                                </div>

                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(
                                            event.target.value.slice(0, 1000)
                                        )
                                    }
                                    placeholder="Tuliskan saran, kritik, atau masukan Anda..."
                                    rows={7}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                                />

                            </div>

                            {/* SUBMIT */}

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !message.trim()
                                }
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {loading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />

                                        Kirim Saran
                                    </>
                                )}

                            </button>

                        </form>

                    </div>

                    {/* INFO */}

                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-5">

                        <MessageCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-blue-400"
                        />

                        <p className="text-xs leading-6 text-slate-500">
                            Saran yang dikirim melalui halaman ini
                            digunakan sebagai masukan untuk
                            pengembangan PAI Segudang Prestasi.
                            Saran tidak ditampilkan secara publik.
                        </p>

                    </div>

                </div>

            </section>

            {/* FOOTER */}

            <footer className="relative z-10 border-t border-white/10 bg-[#041225]">

                <div className="mx-auto max-w-5xl px-4 py-8 text-center sm:px-6">

                    <p className="text-xs text-slate-600">
                        © 2026 PAI Segudang Prestasi · HIMA PAI UIKA Bogor
                    </p>

                </div>

            </footer>

        </main>
    );
}