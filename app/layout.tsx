import type { Metadata } from "next";
import { Crimson_Pro, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
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

export const metadata: Metadata = {
  title: "DelayKit. Durable wake-ups for TypeScript apps and agents.",
  description:
    "An open-source TypeScript library for durable wake-ups. Reminders, expirations, agent timeouts, retries, debounces. Backed by Postgres or SQLite. Works on Node, Bun, and Vercel.",
};

// Theme override is stored in a cookie so the server can apply it
// before paint. If no cookie is set, the @media query in globals.css
// picks up the OS default automatically.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const stored = cookieStore.get("delaykit-theme")?.value;
  const themeAttr = stored === "light" || stored === "dark" ? stored : undefined;

  return (
    <html
      lang="en"
      className={`${crimson.variable} ${jetbrains.variable} h-full`}
      data-theme={themeAttr}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
