import { PlayerProvider } from "@/context/PlayerContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SocialFollowWidget from "@/components/shared/SocialFollowWidget";
import NavigationProgress from "@/components/shared/NavigationProgress";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlayerProvider>
    <>
      <NavigationProgress />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SocialFollowWidget />
    </>
    </PlayerProvider>
  );
}
