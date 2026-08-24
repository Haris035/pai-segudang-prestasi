"use client";

import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useState,
} from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Award,
    Camera,
    CheckCircle2,
    FileImage,
    Send,
    Trophy,
    Upload,
    X,
} from "lucide-react";

// =====================================================
// OPTIONS
// =====================================================

const categories = [
    "Akademik",
    "Keagamaan",
    "Olahraga",
    "Seni",
    "Organisasi",
    "Teknologi",
    "Kewirausahaan",
    "Lainnya",
];

const levels = [
    "Internasional",
    "Nasional",
    "Provinsi",
    "Kabupaten/Kota",
    "Universitas",
    "Fakultas",
    "Program Studi",
    "Lainnya",
];

// =====================================================
// PAGE
// =====================================================

export default function LaporPrestasiPage() {
    // ===================================================
    // FILE STATE
    // ===================================================

    const [proofFile, setProofFile] =
        useState<File | null>(null);

    const [studentPhoto, setStudentPhoto] =
        useState<File | null>(null);

    const [proofPreview, setProofPreview] =
        useState<string | null>(null);

    const [studentPhotoPreview, setStudentPhotoPreview] =
        useState<string | null>(null);

    // ===================================================
    // SUBMIT STATE
    // ===================================================

    const [submitted, setSubmitted] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    // ===================================================
    // CLEANUP PREVIEW
    // ===================================================

    useEffect(() => {
        return () => {
            if (proofPreview) {
                URL.revokeObjectURL(proofPreview);
            }

            if (studentPhotoPreview) {
                URL.revokeObjectURL(
                    studentPhotoPreview,
                );
            }
        };
    }, [
        proofPreview,
        studentPhotoPreview,
    ]);

    // ===================================================
    // PROOF FILE
    // ===================================================

    const handleProofChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setSubmitted(false);
        setErrorMessage("");

        if (!file.type.startsWith("image/")) {
            setErrorMessage(
                "Bukti prestasi harus berupa file gambar.",
            );

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage(
                "Ukuran bukti prestasi maksimal 5 MB.",
            );

            event.target.value = "";
            return;
        }

        if (proofPreview) {
            URL.revokeObjectURL(
                proofPreview,
            );
        }

        const preview =
            URL.createObjectURL(file);

        setProofFile(file);
        setProofPreview(preview);
    };

    // ===================================================
    // STUDENT PHOTO
    // ===================================================

    const handleStudentPhotoChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setSubmitted(false);
        setErrorMessage("");

        if (!file.type.startsWith("image/")) {
            setErrorMessage(
                "Foto mahasiswa harus berupa file gambar.",
            );

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage(
                "Ukuran foto mahasiswa maksimal 5 MB.",
            );

            event.target.value = "";
            return;
        }

        if (studentPhotoPreview) {
            URL.revokeObjectURL(
                studentPhotoPreview,
            );
        }

        const preview =
            URL.createObjectURL(file);

        setStudentPhoto(file);
        setStudentPhotoPreview(preview);
    };

    // ===================================================
    // REMOVE PROOF
    // ===================================================

    const removeProof = () => {
        if (proofPreview) {
            URL.revokeObjectURL(
                proofPreview,
            );
        }

        setProofFile(null);
        setProofPreview(null);

        const input =
            document.getElementById(
                "proof",
            ) as HTMLInputElement | null;

        if (input) {
            input.value = "";
        }
    };

    // ===================================================
    // REMOVE STUDENT PHOTO
    // ===================================================

    const removeStudentPhoto = () => {
        if (studentPhotoPreview) {
            URL.revokeObjectURL(
                studentPhotoPreview,
            );
        }

        setStudentPhoto(null);
        setStudentPhotoPreview(null);

        const input =
            document.getElementById(
                "studentPhoto",
            ) as HTMLInputElement | null;

        if (input) {
            input.value = "";
        }
    };

    // ===================================================
    // SUBMIT
    // ===================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setSubmitted(false);
        setErrorMessage("");

        // -----------------------------------------------
        // VALIDASI BUKTI
        // -----------------------------------------------

        if (!proofFile) {
            setErrorMessage(
                "Silakan upload bukti prestasi terlebih dahulu.",
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        try {
            setIsSubmitting(true);

            // ---------------------------------------------
            // AMBIL SEMUA DATA FORM
            // ---------------------------------------------

            const form =
                event.currentTarget;

            const formData =
                new FormData(form);

            // ---------------------------------------------
            // FILE BUKTI
            // ---------------------------------------------

            formData.set(
                "proofFile",
                proofFile,
            );

            // ---------------------------------------------
            // FOTO MAHASISWA
            // ---------------------------------------------

            if (studentPhoto) {
                formData.set(
                    "studentPhoto",
                    studentPhoto,
                );
            }

            // ---------------------------------------------
            // KIRIM KE API
            // ---------------------------------------------

            const response =
                await fetch(
                    "/api/achievements",
                    {
                        method: "POST",
                        body: formData,
                    },
                );

            const result =
                await response.json();

            // ---------------------------------------------
            // ERROR DARI API
            // ---------------------------------------------

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Gagal menyimpan prestasi.",
                );
            }

            // ---------------------------------------------
            // BERHASIL
            // ---------------------------------------------

            setSubmitted(true);
            setErrorMessage("");

            // Reset form
            form.reset();

            // Reset file
            removeProof();
            removeStudentPhoto();

            // Scroll ke atas
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error(
                "SUBMIT PRESTASI ERROR:",
                error,
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Terjadi kesalahan saat mengirim prestasi.",
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===================================================
    // RETURN
    // ===================================================

    return (
        <main className="min-h-screen bg-[#071A33] text-white">

            {/* =================================================
          HEADER
      ================================================= */}

            <header className="border-b border-white/10 bg-[#041225]/80 backdrop-blur-xl">

                <div className="container-main flex h-20 items-center justify-between">

                    {/* LOGO */}

                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">

                            <Trophy size={18} />

                        </div>

                        <div>

                            <p className="font-bold text-white">
                                PAI
                            </p>

                            <p className="text-[9px] uppercase tracking-[0.18em] text-blue-300">
                                Segudang Prestasi
                            </p>

                        </div>

                    </Link>

                    {/* BACK */}

                    <Link
                        href="/prestasi"
                        className="flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
                    >

                        <ArrowLeft size={15} />

                        Kembali

                    </Link>

                </div>

            </header>

            {/* =================================================
          HERO
      ================================================= */}

            <section className="relative overflow-hidden bg-grid">

                <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

                <div className="container-main relative py-16 text-center sm:py-20">

                    {/* ICON */}

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">

                        <Award size={27} />

                    </div>

                    {/* LABEL */}

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                        Kontribusi Mahasiswa
                    </p>

                    {/* TITLE */}

                    <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                        Laporkan Prestasimu
                    </h1>

                    {/* DESCRIPTION */}

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                        Bagikan pencapaianmu agar dapat
                        diapresiasi, didokumentasikan,
                        dan menjadi inspirasi bagi
                        mahasiswa lainnya.
                    </p>

                    {/* BADGE */}

                    <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-300">

                        <CheckCircle2 size={14} />

                        Semua prestasi boleh dilaporkan
                        tanpa batas waktu

                    </div>

                </div>

            </section>

            {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

            {submitted && (
                <div className="container-main pb-6">

                    <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-emerald-200">

                        <CheckCircle2
                            size={21}
                            className="mt-0.5 shrink-0"
                        />

                        <div>

                            <p className="font-bold">
                                Prestasi berhasil dikirim!
                            </p>

                            <p className="mt-1 text-sm text-emerald-200/70">
                                Data prestasi telah berhasil
                                disimpan dan akan melalui
                                proses verifikasi sebelum
                                ditampilkan.
                            </p>

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
          ERROR MESSAGE
      ================================================= */}

            {errorMessage && (
                <div className="container-main pb-6">

                    <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-red-200">

                        <X
                            size={21}
                            className="mt-0.5 shrink-0"
                        />

                        <div>

                            <p className="font-bold">
                                Gagal mengirim laporan
                            </p>

                            <p className="mt-1 text-sm text-red-200/70">
                                {errorMessage}
                            </p>

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
          FORM
      ================================================= */}

            <section className="container-main pb-20 sm:pb-28">

                <form
                    onSubmit={handleSubmit}
                    className="mx-auto max-w-4xl space-y-6"
                >

                    {/* ===========================================
              DATA MAHASISWA
          ============================================ */}

                    <div className="rounded-3xl border border-white/10 bg-[#0B2342] p-6 shadow-xl sm:p-8">

                        <div className="mb-7">

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                                Bagian 01
                            </p>

                            <h2 className="mt-2 text-2xl font-black">
                                Data Mahasiswa
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Isi data diri sesuai identitas
                                mahasiswa.
                            </p>

                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">

                            <InputField
                                label="Nama Lengkap"
                                name="studentName"
                                placeholder="Contoh: Ahmad Fauzan"
                                required
                            />

                            <InputField
                                label="NIM"
                                name="nim"
                                placeholder="Contoh: 241234567"
                                required
                            />

                            <SelectField
                                label="Semester"
                                name="semester"
                                options={[
                                    "Semester 1",
                                    "Semester 2",
                                    "Semester 3",
                                    "Semester 4",
                                    "Semester 5",
                                    "Semester 6",
                                    "Semester 7",
                                    "Semester 8",
                                    "Lainnya",
                                ]}
                                required
                            />

                            <InputField
                                label="Kelas"
                                name="className"
                                placeholder="Contoh: PAI 4A"
                            />

                            <div className="sm:col-span-2">

                                <InputField
                                    label="Nomor WhatsApp"
                                    name="phone"
                                    type="tel"
                                    placeholder="Contoh: 089xxxxxxxxx"
                                    required
                                />

                            </div>

                        </div>

                    </div>

                    {/* ===========================================
              DATA PRESTASI
          ============================================ */}

                    <div className="rounded-3xl border border-white/10 bg-[#0B2342] p-6 shadow-xl sm:p-8">

                        <div className="mb-7">

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                                Bagian 02
                            </p>

                            <h2 className="mt-2 text-2xl font-black">
                                Data Prestasi
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Ceritakan pencapaian yang ingin
                                kamu dokumentasikan.
                            </p>

                        </div>

                        <div className="space-y-5">

                            {/* NAMA PRESTASI */}

                            <InputField
                                label="Nama Prestasi"
                                name="achievementName"
                                placeholder="Contoh: Juara 1 Lomba Debat Nasional"
                                required
                            />

                            {/* CATEGORY + LEVEL */}

                            <div className="grid gap-5 sm:grid-cols-2">

                                <SelectField
                                    label="Kategori"
                                    name="category"
                                    options={categories}
                                    required
                                />

                                <SelectField
                                    label="Tingkat"
                                    name="level"
                                    options={levels}
                                    required
                                />

                            </div>

                            {/* RANK */}

                            <InputField
                                label="Peringkat / Pencapaian"
                                name="rank"
                                placeholder="Contoh: Juara 1 / Finalis / Best Speaker"
                            />

                            {/* COMPETITION */}

                            <InputField
                                label="Nama Lomba / Kegiatan"
                                name="competitionName"
                                placeholder="Nama kompetisi atau kegiatan"
                                required
                            />

                            {/* ORGANIZER */}

                            <InputField
                                label="Penyelenggara"
                                name="organizer"
                                placeholder="Nama lembaga / organisasi penyelenggara"
                            />

                            {/* DATE */}

                            <div>

                                <label
                                    htmlFor="achievementDate"
                                    className="mb-2 block text-sm font-semibold text-slate-200"
                                >

                                    Tanggal Prestasi

                                    <span className="ml-1 text-blue-400">
                                        *
                                    </span>

                                </label>

                                <input
                                    id="achievementDate"
                                    name="achievementDate"
                                    type="date"
                                    required
                                    className="h-12 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                                />

                                <p className="mt-2 text-xs text-slate-600">
                                    Prestasi lama tetap dapat
                                    dilaporkan. Tanggal hanya
                                    digunakan sebagai informasi
                                    dokumentasi.
                                </p>

                            </div>

                            {/* DESCRIPTION */}

                            <div>

                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-semibold text-slate-200"
                                >
                                    Cerita Singkat / Deskripsi
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    placeholder="Ceritakan secara singkat tentang prestasi ini..."
                                    className="w-full resize-none rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                                />

                            </div>

                        </div>

                    </div>

                    {/* ===========================================
              FOTO
          ============================================ */}

                    <div className="rounded-3xl border border-white/10 bg-[#0B2342] p-6 shadow-xl sm:p-8">

                        <div className="mb-7">

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                                Bagian 03
                            </p>

                            <h2 className="mt-2 text-2xl font-black">
                                Bukti & Foto
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Upload bukti yang dapat
                                membantu proses verifikasi
                                prestasimu.
                            </p>

                        </div>

                        <div className="grid gap-6 md:grid-cols-2">

                            {/* =======================================
                  BUKTI PRESTASI
              ======================================== */}

                            <div>

                                <label className="mb-3 block text-sm font-semibold text-slate-200">

                                    Bukti Prestasi

                                    <span className="ml-1 text-blue-400">
                                        *
                                    </span>

                                </label>

                                {!proofPreview ? (
                                    <label
                                        htmlFor="proof"
                                        className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-400/20 bg-[#071A33] p-6 text-center transition hover:border-blue-400/40 hover:bg-blue-500/5"
                                    >

                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-300 transition group-hover:scale-110">

                                            <Upload size={24} />

                                        </div>

                                        <p className="mt-5 text-sm font-bold">
                                            Upload bukti prestasi
                                        </p>

                                        <p className="mt-2 text-xs text-slate-600">
                                            JPG, PNG, WEBP ·
                                            Maksimal 5 MB
                                        </p>

                                        <input
                                            id="proof"
                                            name="proofFile"
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleProofChange
                                            }
                                            className="hidden"
                                        />

                                    </label>
                                ) : (
                                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#071A33]">

                                        <img
                                            src={proofPreview}
                                            alt="Preview bukti prestasi"
                                            className="aspect-[4/3] w-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={removeProof}
                                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-red-500"
                                            aria-label="Hapus bukti"
                                        >

                                            <X size={17} />

                                        </button>

                                        <div className="border-t border-white/10 p-3">

                                            <p className="truncate text-xs font-medium text-slate-300">
                                                {proofFile?.name}
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>

                            {/* =======================================
                  FOTO MAHASISWA
              ======================================== */}

                            <div>

                                <label className="mb-3 block text-sm font-semibold text-slate-200">

                                    Foto Mahasiswa

                                    <span className="ml-2 text-xs font-normal text-slate-600">
                                        opsional
                                    </span>

                                </label>

                                {!studentPhotoPreview ? (
                                    <label
                                        htmlFor="studentPhoto"
                                        className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#071A33] p-6 text-center transition hover:border-blue-400/30 hover:bg-blue-500/5"
                                    >

                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400 transition group-hover:scale-110 group-hover:text-blue-300">

                                            <Camera size={24} />

                                        </div>

                                        <p className="mt-5 text-sm font-bold">
                                            Upload foto mahasiswa
                                        </p>

                                        <p className="mt-2 text-xs text-slate-600">
                                            JPG, PNG, WEBP ·
                                            Maksimal 5 MB
                                        </p>

                                        <input
                                            id="studentPhoto"
                                            name="studentPhoto"
                                            type="file"
                                            accept="image/*"
                                            onChange={
                                                handleStudentPhotoChange
                                            }
                                            className="hidden"
                                        />

                                    </label>
                                ) : (
                                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#071A33]">

                                        <img
                                            src={studentPhotoPreview}
                                            alt="Preview foto mahasiswa"
                                            className="aspect-[4/3] w-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={
                                                removeStudentPhoto
                                            }
                                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-red-500"
                                            aria-label="Hapus foto mahasiswa"
                                        >

                                            <X size={17} />

                                        </button>

                                        <div className="border-t border-white/10 p-3">

                                            <p className="truncate text-xs font-medium text-slate-300">
                                                {studentPhoto?.name}
                                            </p>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* INFO */}

                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-400/10 bg-blue-400/5 p-4">

                            <FileImage
                                size={18}
                                className="mt-0.5 shrink-0 text-blue-300"
                            />

                            <p className="text-xs leading-5 text-slate-400">
                                Bukti prestasi digunakan sebagai
                                bahan verifikasi sebelum data
                                ditampilkan secara publik.
                                Jangan mengunggah dokumen yang
                                mengandung data pribadi sensitif
                                yang tidak diperlukan.
                            </p>

                        </div>

                    </div>

                    {/* ===========================================
              SUBMIT
          ============================================ */}

                    <div className="rounded-3xl border border-blue-400/10 bg-gradient-to-br from-blue-600/10 to-transparent p-6 sm:p-8">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <h2 className="font-bold">
                                    Siap mengirim prestasimu?
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Pastikan data yang kamu
                                    masukkan sudah benar sebelum
                                    dikirim.
                                </p>

                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {isSubmitting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send size={17} />

                                        Kirim Prestasi
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </form>

            </section>

            {/* =================================================
          FOOTER
      ================================================= */}

            <footer className="border-t border-white/10 bg-[#041225]">

                <div className="container-main py-8 text-center">

                    <p className="text-xs text-slate-600">
                        © 2026 PAI Segudang Prestasi ·
                        HIMA PAI UIKA Bogor
                    </p>

                </div>

            </footer>

        </main>
    );
}

// =====================================================
// INPUT COMPONENT
// =====================================================

function InputField({
    label,
    name,
    placeholder,
    type = "text",
    required = false,
}: {
    label: string;
    name: string;
    placeholder: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div>

            <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-slate-200"
            >

                {label}

                {required && (
                    <span className="ml-1 text-blue-400">
                        *
                    </span>
                )}

            </label>

            <input
                id={name}
                name={name}
                type={type}
                required={required}
                placeholder={placeholder}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            />

        </div>
    );
}

// =====================================================
// SELECT COMPONENT
// =====================================================

function SelectField({
    label,
    name,
    options,
    required = false,
}: {
    label: string;
    name: string;
    options: string[];
    required?: boolean;
}) {
    return (
        <div>

            <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-slate-200"
            >

                {label}

                {required && (
                    <span className="ml-1 text-blue-400">
                        *
                    </span>
                )}

            </label>

            <select
                id={name}
                name={name}
                required={required}
                defaultValue=""
                className="h-12 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
            >

                <option
                    value=""
                    disabled
                    className="bg-[#071A33]"
                >
                    Pilih {label.toLowerCase()}
                </option>

                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                        className="bg-[#071A33]"
                    >
                        {option}
                    </option>
                ))}

            </select>

        </div>
    );
}