import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque, Permanent_Marker } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const permanentMarker = Permanent_Marker({
  variable: "--font-creative",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const siteUrl = "https://www.hypethebeats.nl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hype The Beats — Muziekworkshops met impact",
    template: "%s | Hype The Beats",
  },
  description:
    "Hype The Beats verzorgt muziekworkshops voor gemeenten, scholen, zorginstellingen en jongerenorganisaties. Verbinding, expressie en groei door muziek — bewezen impact, professioneel begeleid.",
  keywords: [
    "muziekworkshop",
    "muziekworkshops scholen",
    "muziek zorginstelling",
    "creatieve workshops gemeente",
    "jongerenwerk muziek",
    "muziekeducatie",
  ],
  authors: [{ name: "Hype The Beats" }],
  creator: "Hype The Beats",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: siteUrl,
    siteName: "Hype The Beats",
    title: "Hype The Beats — Muziekworkshops met impact",
    description:
      "Muziekworkshops voor gemeenten, scholen, zorginstellingen en jongerenorganisaties. Verbinding en groei door muziek.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hype The Beats — Muziekworkshops met impact",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hype The Beats — Muziekworkshops met impact",
    description:
      "Muziekworkshops voor gemeenten, scholen, zorginstellingen en jongerenorganisaties.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e9e9e1",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} ${bricolage.variable} ${permanentMarker.variable} h-full`}>
      <body className="min-h-full overflow-x-hidden bg-background text-foreground antialiased selection:bg-accent selection:text-foreground">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-foreground focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-background"
        >
          Naar hoofdinhoud
        </a>
        {children}
      </body>
    </html>
  );
}
