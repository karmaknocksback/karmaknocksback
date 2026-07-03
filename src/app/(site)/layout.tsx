import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SupportButton from "@/components/shared/SupportButton";
import NavigationProgress from "@/components/shared/NavigationProgress";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportButton />
    </>
  );
}
