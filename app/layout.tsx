import type { Metadata } from "next";
import { Crimson_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const title = "DelayKit. Durable wake-ups for TypeScript apps and agents.";
const description =
  "An open-source TypeScript library for durable wake-ups. Reminders, expirations, agent timeouts, retries, debounces. Backed by Postgres or SQLite. Works on Node, Bun, and Vercel.";

export const metadata: Metadata = {
  metadataBase: new URL("https://delaykit.dev"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://delaykit.dev",
    siteName: "DelayKit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// Theme override is read from localStorage by an inline script that runs
// before the first paint, so we can apply `data-theme` synchronously.
// This used to be a server-side cookie read, but cookies() forces every
// page in the layout into dynamic rendering — which blocks static
// generation and hurts SEO. localStorage + inline script gets the same
// no-FOUC behavior without a request-time dependency.
const themeBootScript = `(function(){try{var t=localStorage.getItem('delaykit-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${crimson.variable} ${jetbrains.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
