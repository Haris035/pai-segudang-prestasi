"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// =====================================================
// KOMPRESI GAMBAR
// =====================================================

async function compressImage(file: File): Promise<File> {
    const MAX_WIDTH = 2000;
    const MAX_HEIGHT = 2000;
    const QUALITY = 0.82;

    if (
        file.type === "image/jpeg" &&
        file.size <= 1.5 * 1024 * 1024
    ) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let width = image.naturalWidth;
            let height = image.naturalHeight;

            const scale = Math.min(
                1,
                MAX_WIDTH / width,
                MAX_HEIGHT / height,
            );

            width = Math.round(width * scale);
            height = Math.round(height * scale);

            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext("2d");

            if (!context) {
                reject(
                    new Error(
                        "Browser tidak mendukung pemrosesan gambar.",
                    ),
                );
                return;
            }

            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, width, height);

            context.drawImage(
                image,
                0,
                0,
                width,
                height,
            );

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(
                            new Error(
                                "Gagal mengompres gambar.",
                            ),
                        );
                        return;
                    }

                    const compressedFile = new File(
                        [blob],
                        `${crypto.randomUUID()}.jpg`,
                        {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        },
                    );

                    resolve(compressedFile);
                },
                "image/jpeg",
                QUALITY,
            );
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);

            reject(
                new Error(
                    "Gagal membaca gambar.",
                ),
            );
        };

        image.src = objectUrl;
    });
}

// =====================================================
// PAGE
// =====================================================

export default function LaporPrestasiPage() {
    const [proofFile, setProofFile] =
        useState<File | null>(null);

    const [studentPhoto, setStudentPhoto] =
        useState<File | null>(null);

    const [proofPreview, setProofPreview] =
        useState<string | null>(null);

    const [studentPhotoPreview, setStudentPhotoPreview] =
        useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [submitted, setSubmitted] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const [uploadProgress, setUploadProgress] =
        useState(0);

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
    }, [proofPreview, studentPhotoPreview]);

    // =====================================================
    // FILE BUKTI
    // =====================================================

    const handleProofChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSubmitted(false);
        setErrorMessage("");
        setUploadProgress(0);

        if (!file.type.startsWith("image/")) {
            setErrorMessage(
                "Bukti prestasi harus berupa file gambar.",
            );

            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setErrorMessage(
                "Ukuran bukti prestasi maksimal 5 MB.",
            );

            event.target.value = "";
            return;
        }

        if (proofPreview) {
            URL.revokeObjectURL(proofPreview);
        }

        setProofFile(file);
        setProofPreview(URL.createObjectURL(file));
    };

    // =====================================================
    // FOTO MAHASISWA
    // =====================================================

    const handleStudentPhotoChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSubmitted(false);
        setErrorMessage("");
        setUploadProgress(0);

        if (!file.type.startsWith("image/")) {
            setErrorMessage(
                "Foto mahasiswa harus berupa file gambar.",
            );

            event.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
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

        setStudentPhoto(file);
        setStudentPhotoPreview(
            URL.createObjectURL(file),
        );
    };

    // =====================================================
    // HAPUS BUKTI
    // =====================================================

    const removeProof = () => {
        if (proofPreview) {
            URL.revokeObjectURL(proofPreview);
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

    // =====================================================
    // HAPUS FOTO
    // =====================================================

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

    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setSubmitted(false);
        setErrorMessage("");
        setUploadProgress(0);

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

        if (proofFile.size > MAX_FILE_SIZE) {
            setErrorMessage(
                "Ukuran bukti prestasi maksimal 5 MB.",
            );

            return;
        }

        if (
            studentPhoto &&
            studentPhoto.size > MAX_FILE_SIZE
        ) {
            setErrorMessage(
                "Ukuran foto mahasiswa maksimal 5 MB.",
            );

            return;
        }

        try {
            setIsSubmitting(true);
            setUploadProgress(3);

            const form = event.currentTarget;
            const formData = new FormData(form);

            // =================================================
            // KOMPRESI KEDUA FOTO BERSAMAAN
            // =================================================

            setUploadProgress(5);

            const [
                compressedProof,
                compressedStudentPhoto,
            ] = await Promise.all([
                compressImage(proofFile),
                studentPhoto
                    ? compressImage(studentPhoto)
                    : Promise.resolve(null),
            ]);

            setUploadProgress(10);

            // =================================================
            // PROGRESS UPLOAD
            // =================================================

            let proofProgress = 0;
            let studentProgress = studentPhoto
                ? 0
                : 100;

            const updateProgress = () => {
                const combined =
                    proofProgress * 0.5 +
                    studentProgress * 0.25;

                const progress = Math.round(
                    10 + combined,
                );

                setUploadProgress(
                    Math.min(85, progress),
                );
            };

            // =================================================
            // UPLOAD BUKTI
            // =================================================

            const proofUpload = upload(
                `achievements/${crypto.randomUUID()}.jpg`,
                compressedProof,
                {
                    access: "public",
                    handleUploadUrl: "/api/upload",

                    onUploadProgress: ({
                        percentage,
                    }) => {
                        proofProgress =
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    percentage,
                                ),
                            );

                        updateProgress();
                    },
                },
            );

            // =================================================
            // UPLOAD FOTO MAHASISWA
            // =================================================

            const studentUpload =
                compressedStudentPhoto
                    ? upload(
                        `achievements/${crypto.randomUUID()}.jpg`,
                        compressedStudentPhoto,
                        {
                            access: "public",
                            handleUploadUrl:
                                "/api/upload",

                            onUploadProgress: ({
                                percentage,
                            }) => {
                                studentProgress =
                                    Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            percentage,
                                        ),
                                    );

                                updateProgress();
                            },
                        },
                    )
                    : Promise.resolve(null);

            // =================================================
            // KEDUA UPLOAD BERJALAN BERSAMAAN
            // =================================================

            const [
                proofBlob,
                studentBlob,
            ] = await Promise.all([
                proofUpload,
                studentUpload,
            ]);

            setUploadProgress(85);

            // =================================================
            // URL BLOB
            // =================================================

            const proofImageUrl =
                proofBlob.url;

            const studentPhotoUrl =
                studentBlob?.url ?? null;

            // =================================================
            // DATA DARI FORM
            // =================================================

            const payload = {
                studentName: String(
                    formData.get("studentName") ||
                    "",
                ).trim(),

                nim: String(
                    formData.get("nim") || "",
                ).trim(),

                semester: String(
                    formData.get("semester") ||
                    "",
                ).trim(),

                className: String(
                    formData.get("className") ||
                    "",
                ).trim(),

                phone: String(
                    formData.get("phone") || "",
                ).trim(),

                achievementName: String(
                    formData.get(
                        "achievementName",
                    ) || "",
                ).trim(),

                category: String(
                    formData.get("category") ||
                    "",
                ).trim(),

                level: String(
                    formData.get("level") ||
                    "",
                ).trim(),

                rank: String(
                    formData.get("rank") || "",
                ).trim(),

                competitionName: String(
                    formData.get(
                        "competitionName",
                    ) || "",
                ).trim(),

                organizer: String(
                    formData.get(
                        "organizer",
                    ) || "",
                ).trim(),

                achievementDate: String(
                    formData.get(
                        "achievementDate",
                    ) || "",
                ).trim(),

                description: String(
                    formData.get(
                        "description",
                    ) || "",
                ).trim(),

                proofImageUrl,

                studentPhotoUrl,
            };

            // =================================================
            // SIMPAN DATA KE POSTGRESQL
            // =================================================

            setUploadProgress(90);

            const response = await fetch(
                "/api/achievements",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(payload),
                },
            );

            let result: {
                success?: boolean;
                message?: string;
            } | null = null;

            try {
                result = await response.json();
            } catch {
                result = null;
            }

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    "Gagal menyimpan prestasi.",
                );
            }

            // =================================================
            // BERHASIL
            // =================================================

            setUploadProgress(100);
            setSubmitted(true);
            setErrorMessage("");

            form.reset();

            if (proofPreview) {
                URL.revokeObjectURL(
                    proofPreview,
                );
            }

            if (studentPhotoPreview) {
                URL.revokeObjectURL(
                    studentPhotoPreview,
                );
            }

            setProofFile(null);
            setProofPreview(null);

            setStudentPhoto(null);
            setStudentPhotoPreview(null);

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

            setUploadProgress(0);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#071A33] text-white">

            {/* HEADER */}

            <header className="border-b border-white/10 bg-[#041225]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">

                    <Link
                        href="/"
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                            <Trophy size={19} />
                        </div>

                        <div>
                            <p className="font-bold">
                                PAI
                            </p>

                            <p className="text-[9px] uppercase tracking-[0.18em] text-blue-300">
                                Segudang Prestasi
                            </p>
                        </div>
                    </Link>

                    <Link
                        href="/prestasi"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Link>

                </div>
            </header>

            {/* HERO */}

            <section className="relative overflow-hidden border-b border-white/5">

                <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/10 blur-[100px]" />

                <div className="relative mx-auto max-w-6xl px-5 py-16 text-center sm:py-20">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20">
                        <Award size={28} />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                        Kontribusi Mahasiswa
                    </p>

                    <h1 className="mt-3 text-4xl font-black sm:text-5xl">
                        Laporkan Prestasimu
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                        Bagikan pencapaianmu agar dapat
                        diapresiasi, didokumentasikan,
                        dan menjadi inspirasi bagi
                        mahasiswa lainnya.
                    </p>

                    <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-4 py-2 text-xs text-emerald-300">
                        <CheckCircle2 size={14} />
                        Semua prestasi boleh dilaporkan
                        tanpa batas waktu
                    </div>

                </div>
            </section>

            {/* ALERT BERHASIL */}

            {submitted && (
                <div className="mx-auto max-w-4xl px-5 pt-6">

                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-emerald-200">

                        <CheckCircle2
                            size={21}
                            className="mt-0.5 shrink-0"
                        />

                        <div>
                            <p className="font-bold">
                                Prestasi berhasil dikirim!
                            </p>

                            <p className="mt-1 text-sm text-emerald-200/70">
                                Data telah disimpan dan
                                menunggu proses verifikasi
                                admin.
                            </p>
                        </div>

                    </div>

                </div>
            )}

            {/* ALERT ERROR */}

            {errorMessage && (
                <div className="mx-auto max-w-4xl px-5 pt-6">

                    <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-5 text-red-200">

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

            {/* FORM */}

            <section className="mx-auto max-w-4xl px-5 py-8 pb-20">

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* DATA MAHASISWA */}

                    <FormSection
                        number="01"
                        title="Data Mahasiswa"
                        description="Isi data diri sesuai identitas mahasiswa."
                    >

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

                    </FormSection>

                    {/* DATA PRESTASI */}

                    <FormSection
                        number="02"
                        title="Data Prestasi"
                        description="Ceritakan pencapaian yang ingin kamu dokumentasikan."
                    >

                        <div className="space-y-5">

                            <InputField
                                label="Nama Prestasi"
                                name="achievementName"
                                placeholder="Contoh: Juara 1 Lomba Debat Nasional"
                                required
                            />

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

                            <InputField
                                label="Peringkat / Pencapaian"
                                name="rank"
                                placeholder="Contoh: Juara 1 / Finalis / Best Speaker"
                            />

                            <InputField
                                label="Nama Lomba / Kegiatan"
                                name="competitionName"
                                placeholder="Nama kompetisi atau kegiatan"
                                required
                            />

                            <InputField
                                label="Penyelenggara"
                                name="organizer"
                                placeholder="Nama lembaga / organisasi penyelenggara"
                            />

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
                                    dilaporkan.
                                </p>

                            </div>

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

                    </FormSection>

                    {/* FOTO */}

                    <FormSection
                        number="03"
                        title="Bukti & Foto"
                        description="Upload bukti yang dapat membantu proses verifikasi prestasimu."
                    >

                        <div className="grid gap-6 md:grid-cols-2">

                            <ImageUpload
                                id="proof"
                                title="Bukti Prestasi"
                                required
                                file={proofFile}
                                preview={proofPreview}
                                onChange={
                                    handleProofChange
                                }
                                onRemove={removeProof}
                            />

                            <ImageUpload
                                id="studentPhoto"
                                title="Foto Mahasiswa"
                                file={studentPhoto}
                                preview={
                                    studentPhotoPreview
                                }
                                onChange={
                                    handleStudentPhotoChange
                                }
                                onRemove={
                                    removeStudentPhoto
                                }
                            />

                        </div>

                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-400/10 bg-blue-400/5 p-4">

                            <FileImage
                                size={18}
                                className="mt-0.5 shrink-0 text-blue-300"
                            />

                            <p className="text-xs leading-5 text-slate-400">
                                File akan dikompres otomatis
                                sebelum upload agar proses
                                pengiriman lebih cepat. Format
                                JPG, PNG, atau WEBP dengan
                                ukuran maksimal 5 MB.
                            </p>

                        </div>

                    </FormSection>

                    {/* SUBMIT */}

                    <div className="rounded-3xl border border-blue-400/10 bg-blue-600/5 p-6 sm:p-8">

                        <div className="flex flex-col gap-6">

                            <div>
                                <h2 className="font-bold">
                                    Siap mengirim prestasimu?
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Pastikan semua data sudah
                                    benar sebelum dikirim.
                                </p>
                            </div>

                            {isSubmitting && (
                                <div>

                                    <div className="mb-2 flex justify-between text-xs font-semibold">

                                        <span className="text-slate-400">
                                            Mengirim prestasi...
                                        </span>

                                        <span className="text-blue-300">
                                            {uploadProgress}%
                                        </span>

                                    </div>

                                    <div className="h-2 overflow-hidden rounded-full bg-white/10">

                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        />

                                    </div>

                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {isSubmitting ? (
                                    <>
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Kirim Prestasi
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </form>

            </section>

            {/* FOOTER */}

            <footer className="border-t border-white/10 bg-[#041225]">

                <div className="mx-auto max-w-6xl px-5 py-8 text-center">

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
// FORM SECTION
// =====================================================

function FormSection({
    number,
    title,
    description,
    children,
}: {
    number: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-3xl border border-white/10 bg-[#0B2342] p-6 shadow-xl sm:p-8">

            <div className="mb-7">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                    Bagian {number}
                </p>

                <h2 className="mt-2 text-2xl font-black">
                    {title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    {description}
                </p>

            </div>

            {children}

        </div>
    );
}

// =====================================================
// INPUT
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
// SELECT
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

// =====================================================
// IMAGE UPLOAD
// =====================================================

function ImageUpload({
    id,
    title,
    required = false,
    file,
    preview,
    onChange,
    onRemove,
}: {
    id: string;
    title: string;
    required?: boolean;
    file: File | null;
    preview: string | null;
    onChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    onRemove: () => void;
}) {
    return (
        <div>

            <label className="mb-3 block text-sm font-semibold text-slate-200">

                {title}

                {required ? (
                    <span className="ml-1 text-blue-400">
                        *
                    </span>
                ) : (
                    <span className="ml-2 text-xs font-normal text-slate-600">
                        opsional
                    </span>
                )}

            </label>

            {!preview ? (

                <label
                    htmlFor={id}
                    className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#071A33] p-6 text-center transition hover:border-blue-400/40 hover:bg-blue-500/5"
                >

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-300 transition group-hover:scale-110">
                        {id === "proof" ? (
                            <Upload size={24} />
                        ) : (
                            <Camera size={24} />
                        )}
                    </div>

                    <p className="mt-5 text-sm font-bold">
                        Upload {title.toLowerCase()}
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                        JPG, PNG, WEBP · Maksimal 5 MB
                    </p>

                    <input
                        id={id}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={onChange}
                        className="hidden"
                    />

                </label>

            ) : (

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#071A33]">

                    <img
                        src={preview}
                        alt={`Preview ${title}`}
                        className="aspect-[4/3] w-full object-cover"
                    />

                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-red-500"
                        aria-label={`Hapus ${title}`}
                    >
                        <X size={17} />
                    </button>

                    <div className="border-t border-white/10 p-3">

                        <p className="truncate text-xs font-medium text-slate-300">
                            {file?.name}
                        </p>

                        {file && (
                            <p className="mt-1 text-[10px] text-slate-600">
                                {(
                                    file.size /
                                    1024 /
                                    1024
                                ).toFixed(2)}{" "}
                                MB
                            </p>
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}