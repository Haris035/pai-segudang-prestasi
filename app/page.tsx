"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  Award,
  CalendarDays,
  Camera,
  Loader2,
  Mail,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

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
  student?: {
    id: string;
    name: string;
    nim: string;
    semester: string | null;
    className: string | null;
    phone: string | null;
  } | null;
};

type ApiResponse = {
  success: boolean;
  data: Achievement[];
  message?: string;
};

export default function Home() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // AMBIL DATA PRESTASI
  // =====================================================

  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/achievements", {
          method: "GET",
          cache: "no-store",
        });

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Gagal mengambil data prestasi."
          );
        }

        // Hanya prestasi yang sudah disetujui
        const approvedAchievements = (result.data || [])
          .filter(
            (item) =>
              String(item.status).toUpperCase() === "APPROVED"
          )
          .sort((a, b) => {
            const dateA = new Date(
              a.achievementDate
            ).getTime();

            const dateB = new Date(
              b.achievementDate
            ).getTime();

            return dateB - dateA;
          });

        setAchievements(approvedAchievements);
      } catch (err) {
        console.error(
          "LOAD HOME ACHIEVEMENTS ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data prestasi."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAchievements();
  }, []);

  // =====================================================
  // PRESTASI TERBARU
  // =====================================================

  const latestAchievements = achievements.slice(0, 3);

  // =====================================================
  // JUMLAH MAHASISWA UNIK
  // =====================================================

  const uniqueStudents = new Set(
    achievements
      .map((item) => item.student?.nim)
      .filter(Boolean)
  ).size;

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // =====================================================
  // CEK FILE PDF
  // =====================================================

  function isPdf(url: string | null) {
    if (!url) return false;

    return url
      .toLowerCase()
      .split("?")[0]
      .endsWith(".pdf");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#071A33] text-white">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-screen overflow-hidden bg-grid">

        {/* Background glow */}

        <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="pointer-events-none absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-sky-400/5 blur-[100px]" />

        <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

        {/* Decorative circles */}

        <div className="pointer-events-none absolute left-[8%] top-[30%] hidden h-20 w-20 rounded-full border border-blue-400/10 lg:block" />

        <div className="pointer-events-none absolute right-[8%] top-[38%] hidden h-32 w-32 rounded-full border border-blue-400/10 lg:block" />

        <div className="container-main relative z-10 flex min-h-screen items-center justify-center pb-20 pt-32">

          <div className="w-full max-w-5xl text-center">

            {/* =================================================
                LOGO HIMA PAI UIKA
            ================================================= */}

            <div className="mb-7 flex justify-center">

              <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">

                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl" />

                <img
                  src="/images/Hima-Pai-Uika.png"
                  alt="Hima-Pai-Uika"
                  className="relative h-full w-full object-contain drop-shadow-2xl"
                />

              </div>

            </div>

            {/* =================================================
                BADGE
            ================================================= */}

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-200 backdrop-blur-sm sm:text-sm">

              <Sparkles
                size={15}
                className="text-sky-400"
              />

              Digital Prestasi Mahasiswa PAI

            </div>

            {/* =================================================
                HEADING
            ================================================= */}

            <h1 className="mx-auto max-w-5xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">

              PAI{" "}

              <span className="gradient-text">
                Segudang
              </span>

              <br />

              <span className="text-white">
                Prestasi
              </span>

            </h1>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base md:text-lg">
              Ruang apresiasi dan dokumentasi prestasi
              mahasiswa Pendidikan Agama Islam
              Universitas Ibn Khaldun Bogor.
            </p>

            {/* =================================================
                CTA
            ================================================= */}

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

              <a
                href="#prestasi"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition duration-300 hover:-translate-y-1 hover:bg-blue-500 sm:w-auto"
              >

                <Trophy size={17} />

                Lihat Prestasi

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />

              </a>

              <a
                href="#laporkan"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/10 sm:w-auto"
              >

                <Award size={17} />

                Laporkan Prestasi

              </a>

            </div>

            {/* =================================================
                STATS
            ================================================= */}

            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-2 sm:gap-4">

              {/* Prestasi */}

              <div className="glass blue-glow rounded-2xl p-4 sm:p-5">

                <Trophy
                  size={20}
                  className="mx-auto mb-2 text-amber-400"
                />

                <p className="text-2xl font-black sm:text-3xl">

                  {loading
                    ? "..."
                    : achievements.length}

                </p>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  Prestasi Terverifikasi
                </p>

              </div>

              {/* Mahasiswa */}

              <div className="glass blue-glow rounded-2xl p-4 sm:p-5">

                <Users
                  size={20}
                  className="mx-auto mb-2 text-sky-400"
                />

                <p className="text-2xl font-black sm:text-3xl">

                  {loading
                    ? "..."
                    : uniqueStudents}

                </p>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  Mahasiswa
                </p>

              </div>

              {/* Tanpa Batas Waktu */}

              <div className="glass blue-glow rounded-2xl p-4 sm:p-5">

                <CalendarDays
                  size={20}
                  className="mx-auto mb-2 text-blue-400"
                />

                <p className="text-2xl font-black sm:text-3xl">
                  ∞
                </p>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  Tanpa Batas Waktu
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          PRESTASI TERBARU
      ====================================================== */}

      <section
        id="prestasi"
        className="relative py-24 sm:py-28"
      >

        <div className="container-main">

          {/* Heading */}

          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">

                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />

                Terverifikasi

              </div>

              <h2 className="text-3xl font-black sm:text-4xl">
                Prestasi Terbaru
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Pencapaian mahasiswa PAI yang telah
                diverifikasi dan disetujui untuk
                dipublikasikan.
              </p>

            </div>

            <Link
              href="/prestasi"
              className="flex w-fit items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-white"
            >

              Lihat Semua

              <ArrowRight size={16} />

            </Link>

          </div>

          {/* ERROR */}

          {error && !loading && (

            <div className="rounded-3xl border border-red-400/10 bg-red-500/5 p-8 text-center">

              <Award
                size={30}
                className="mx-auto text-red-400"
              />

              <h3 className="mt-4 text-lg font-bold">
                Gagal Memuat Prestasi
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-500"
              >
                Coba Lagi
              </button>

            </div>

          )}

          {/* LOADING */}

          {loading && (

            <div className="flex min-h-[350px] flex-col items-center justify-center">

              <Loader2
                size={38}
                className="animate-spin text-blue-400"
              />

              <p className="mt-4 text-sm text-slate-400">
                Memuat prestasi terverifikasi...
              </p>

            </div>

          )}

          {/* CARD PRESTASI */}

          {!loading &&
            !error &&
            latestAchievements.length > 0 && (

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {latestAchievements.map(
                  (item) => (

                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0B2342] transition duration-300 hover:-translate-y-2 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-900/20"
                    >

                      {/* FOTO */}

                      <div className="relative aspect-[4/3] overflow-hidden bg-[#0A2042]">

                        {item.proofImageUrl ? (

                          isPdf(
                            item.proofImageUrl
                          ) ? (

                            <div className="flex h-full flex-col items-center justify-center">

                              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">

                                <Award
                                  size={38}
                                  className="text-blue-300"
                                />

                              </div>

                              <p className="mt-3 text-xs font-bold text-slate-400">
                                Bukti Prestasi
                              </p>

                              <a
                                href={
                                  item.proofImageUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500"
                              >
                                Lihat Bukti
                              </a>

                            </div>

                          ) : (

                            <img
                              src={
                                item.proofImageUrl
                              }
                              alt={`Bukti ${item.achievementName}`}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              loading="lazy"
                            />

                          )

                        ) : (

                          <div className="relative flex h-full items-center justify-center">

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.20),transparent_55%)]" />

                            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">

                              <Camera
                                size={38}
                                className="text-blue-300"
                              />

                            </div>

                          </div>

                        )}

                        {/* Category */}

                        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#071A33]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-200 backdrop-blur-md">
                          {item.category}
                        </div>

                        {/* Level */}

                        <div className="absolute bottom-4 right-4 rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-black text-slate-950">
                          {item.level}
                        </div>

                        {/* APPROVED */}

                        <div className="absolute bottom-4 left-4 rounded-full border border-emerald-400/20 bg-emerald-500/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white">
                          Terverifikasi
                        </div>

                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        {/* Date */}

                        <div className="flex items-center gap-2 text-xs text-slate-500">

                          <CalendarDays size={13} />

                          {formatDate(
                            item.achievementDate
                          )}

                        </div>

                        {/* Achievement */}

                        <h3 className="mt-3 text-lg font-bold leading-6 text-white">
                          {item.achievementName}
                        </h3>

                        {/* Student */}

                        <p className="mt-2 text-sm font-medium text-slate-400">
                          {item.student?.name ||
                            "Mahasiswa PAI"}
                        </p>

                        {/* Competition */}

                        {item.competitionName && (

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {item.competitionName}
                          </p>

                        )}

                        {/* Rank */}

                        {item.rank && (

                          <div className="mt-3 inline-flex rounded-lg border border-amber-400/10 bg-amber-400/5 px-3 py-1.5 text-xs font-bold text-amber-300">
                            {item.rank}
                          </div>

                        )}

                        {/* Footer */}

                        <div className="mt-5 border-t border-white/10 pt-4">

                          <Link
                            href={`/prestasi/${item.id}`}
                            className="flex items-center gap-2 text-xs font-bold text-blue-300 transition hover:text-white"
                          >

                            Lihat Detail

                            <ArrowRight
                              size={14}
                            />

                          </Link>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          {/* BELUM ADA PRESTASI */}

          {!loading &&
            !error &&
            latestAchievements.length === 0 && (

              <div className="rounded-3xl border border-white/10 bg-[#0B2342] px-6 py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">

                  <Trophy
                    size={30}
                    className="text-slate-600"
                  />

                </div>

                <h3 className="mt-5 text-lg font-bold">
                  Belum Ada Prestasi Terverifikasi
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Prestasi yang sudah dilaporkan akan
                  tampil di sini setelah melalui proses
                  verifikasi admin.
                </p>

                <Link
                  href="/lapor-prestasi"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-500"
                >

                  <Award size={16} />

                  Laporkan Prestasi

                </Link>

              </div>

            )}

        </div>
      </section>

      {/* =====================================================
          TENTANG
      ====================================================== */}

      <section
        id="tentang"
        className="relative py-24 sm:py-28"
      >

        <div className="container-main">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Text */}

            <div>

              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">

                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />

                Tentang Program

              </div>

              <h2 className="text-3xl font-black leading-tight sm:text-4xl">

                Satu Prestasi,

                <br />

                <span className="gradient-text">
                  Satu Inspirasi.
                </span>

              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                PAI Segudang Prestasi menjadi ruang
                digital untuk mengapresiasi,
                mendokumentasikan, dan menginspirasi
                melalui pencapaian mahasiswa
                Pendidikan Agama Islam UIKA Bogor.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Prestasi yang ditampilkan pada halaman
                utama adalah prestasi yang telah melalui
                proses verifikasi admin.
              </p>

            </div>

            {/* Visual */}

            <div className="relative">

              <div className="absolute -inset-4 rounded-[2rem] bg-blue-600/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B2342] p-8">

                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">

                    <Trophy size={30} />

                  </div>

                  <h3 className="mt-7 text-2xl font-bold">

                    Bangga dengan
                    <br />
                    prestasi mahasiswa.

                  </h3>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    Karena setiap pencapaian layak untuk
                    diapresiasi dan dapat menjadi inspirasi
                    bagi mahasiswa lainnya.
                  </p>

                  <div className="mt-8 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">

                      <Sparkles
                        size={17}
                        className="text-sky-400"
                      />

                    </div>

                    <p className="text-xs font-semibold text-slate-300">
                      PAI UIKA Bogor
                    </p>

                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section
        id="laporkan"
        className="relative py-24 sm:py-28"
      >

        <div className="container-main">

          <div className="relative overflow-hidden rounded-[2rem] border border-blue-400/20 bg-gradient-to-br from-blue-700/30 via-blue-900/20 to-transparent p-8 text-center shadow-2xl shadow-blue-950/30 sm:p-14">

            <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/30">

                <Award size={25} />

              </div>

              <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                Punya Prestasi?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Jangan biarkan pencapaianmu berlalu
                begitu saja. Bagikan prestasimu dan
                jadilah bagian dari PAI Segudang Prestasi.
              </p>

              <Link
                href="/lapor-prestasi"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
              >

                <Award size={18} />

                Laporkan Prestasi

                <ArrowRight size={17} />

              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <section
        id="kontak"
        className="border-t border-white/5 py-20"
      >

        <div className="container-main">

          <div className="mb-10 text-center">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
              Hubungi Kami
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Contact Person
            </h2>

          </div>

          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">

            {/* WhatsApp */}

            <a
              href="https://wa.me/62895374670466"
              target="_blank"
              rel="noopener noreferrer"
              className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-blue-400/30"
            >

              <MessageCircle
                size={22}
                className="text-sky-400"
              />

              <p className="mt-4 text-sm font-bold">
                WhatsApp
              </p>

              <p className="mt-1 text-xs text-slate-400">
                +62 895-3746-70466
              </p>

            </a>

            {/* Email */}

            <a
              href="mailto:sekretarishimapai26@gmail.com"
              className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-blue-400/30"
            >

              <Mail
                size={22}
                className="text-sky-400"
              />

              <p className="mt-4 text-sm font-bold">
                Email
              </p>

              <p className="mt-1 break-all text-xs text-slate-400">
                sekretarishimapai26@gmail.com
              </p>

            </a>

            {/* Instagram */}

            <a
              href="https://instagram.com/himapaiuikabgr"
              target="_blank"
              rel="noopener noreferrer"
              className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-blue-400/30"
            >

              <Camera
                size={22}
                className="text-sky-400"
              />

              <p className="mt-4 text-sm font-bold">
                Instagram
              </p>

              <p className="mt-1 text-xs text-slate-400">
                @himapaiuikabgr
              </p>

            </a>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {/* =====================================================
    FOOTER
===================================================== */}

      <footer className="border-t border-white/10 bg-[#041225]">

        <div className="container-main py-12">

          {/* FOOTER CONTENT */}

          <div className="flex flex-col justify-between gap-8 sm:flex-row">

            {/* BRAND */}

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <Trophy size={19} />
                </div>

                <div>

                  <p className="font-bold">
                    PAI Segudang Prestasi
                  </p>

                  <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    HIMA PAI UIKA Bogor
                  </p>

                </div>

              </div>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Ruang apresiasi dan dokumentasi prestasi
                mahasiswa Pendidikan Agama Islam UIKA
                Bogor.
              </p>

            </div>

            {/* SARAN */}

            <div className="flex items-start">

              <Link
                href="/saran"
                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300 transition hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-blue-600 hover:text-white"
              >

                <MessageCircle size={17} />

                <span>
                  Kirim Saran
                </span>

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />

              </Link>

            </div>

          </div>

          {/* COPYRIGHT */}

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-600">

            © 2026 PAI Segudang Prestasi · HIMA PAI UIKA Bogor

          </div>

        </div>

      </footer>
    </main>
  );
}