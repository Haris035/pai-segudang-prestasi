import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://prestasipai.my.id"
  ),

  title: {
    default: "PAI Segudang Prestasi | HIMA PAI UIKA Bogor",
    template: "%s | PAI Segudang Prestasi",
  },

  description:
    "PAI Segudang Prestasi merupakan ruang apresiasi dan dokumentasi prestasi mahasiswa Pendidikan Agama Islam UIKA Bogor.",

  keywords: [
    "PAI Segudang Prestasi",
    "HIMA PAI UIKA Bogor",
    "Prestasi Mahasiswa PAI",
    "Prestasi Mahasiswa UIKA",
    "Pendidikan Agama Islam",
    "UIKA Bogor",
    "HIMA PAI",
  ],

  authors: [
    {
      name: "HIMA PAI UIKA Bogor",
    },
  ],

  creator: "HIMA PAI UIKA Bogor",
  publisher: "HIMA PAI UIKA Bogor",

  applicationName: "PAI Segudang Prestasi",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: "/images/Hima-Pai-Uika.png",
    shortcut: "/images/Hima-Pai-Uika.png",
    apple: "/images/Hima-Pai-Uika.png",
  },

  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://prestasipai.my.id",
    siteName: "PAI Segudang Prestasi",
    title: "PAI Segudang Prestasi | HIMA PAI UIKA Bogor",
    description:
      "Ruang apresiasi dan dokumentasi prestasi mahasiswa Pendidikan Agama Islam UIKA Bogor.",
    images: [
      {
        url: "/og-image/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PAI Segudang Prestasi | HIMA PAI UIKA Bogor",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PAI Segudang Prestasi | HIMA PAI UIKA Bogor",
    description:
      "Ruang apresiasi dan dokumentasi prestasi mahasiswa Pendidikan Agama Islam UIKA Bogor.",
    images: ["/images/Hima-Pai-Uika.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}

        {/* Google AdSense */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2731608629666735"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}