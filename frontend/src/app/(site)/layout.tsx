import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import "./global.scss";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
