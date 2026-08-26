import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VedaAI",
  description: "Assessment Extraction & Answer Mapping",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F5F5F5]">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
