"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Menu,
    X,
    Trophy,
    FilePlus2,
} from "lucide-react";

const navigation = [
    {
        label: "Prestasi",
        href: "#prestasi",
    },
    {
        label: "Tentang",
        href: "#tentang",
    },
    {
        label: "Kontak",
        href: "#kontak",
    },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="fixed left-0 right-0 top-0 z-50">
            <div className="container-main pt-4">
                <nav className="glass flex h-16 items-center justify-between rounded-2xl px-4 shadow-2xl sm:px-6">

                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-3"
                        onClick={() => setOpen(false)}
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
                            <Trophy
                                size={21}
                                strokeWidth={2.2}
                                className="text-white"
                            />
                        </div>

                        <div className="hidden sm:block">
                            <p className="text-sm font-bold tracking-wide text-white">
                                PAI
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blue-300">
                                Segudang Prestasi
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-8 md:flex">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-slate-300 transition hover:text-white"
                            >
                                {item.label}
                            </Link>
                        ))}

                        <Link
                            href="/lapor-prestasi"
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                        >
                            <FilePlus2 size={17} />
                            Laporkan Prestasi
                        </Link>
                    </div>

                    {/* Mobile Button */}
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white transition hover:bg-white/10 md:hidden"
                        aria-label="Menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {open && (
                    <div className="glass mt-2 rounded-2xl p-3 shadow-2xl md:hidden">
                        <div className="flex flex-col gap-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <Link
                                href="#laporkan"
                                onClick={() => setOpen(false)}
                                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                            >
                                <FilePlus2 size={17} />
                                Laporkan Prestasi
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}