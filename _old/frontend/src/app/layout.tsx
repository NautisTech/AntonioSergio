import type { Metadata } from "next";
import { AppProvider } from "@/context";

export const metadata: Metadata = {
  title: "António Sérgio",
  description: "Site do Agrupamento de Escolas António Sérgio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="max-w-[100vw] overflow-x-hidden!">
      <body
        className={`antialiased! overflow-x-hidden! max-w-[100vw]`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
