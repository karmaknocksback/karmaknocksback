"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, speed: 250, minimum: 0.15, trickleSpeed: 100 });

const STYLE = `
#nprogress .bar {
  background: linear-gradient(90deg,#FFD700,#FF9800,#E91E63) !important;
  height: 4px !important;
  box-shadow: 0 0 8px #FFD700 !important;
}
#nprogress .peg {
  box-shadow: 0 0 12px #FFD700, 0 0 6px #FF9800 !important;
  width: 120px !important;
}
`;

function ProgressBar() {
  const pathname  = usePathname();
  const searchParams = useSearchParams();

  // Done when pathname changes (navigation complete)
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) return;

      // Start progress immediately on click
      NProgress.start();
      // Ensure it keeps moving even if navigation is slow
      timer = setTimeout(() => NProgress.set(0.6), 500);
    };

    document.addEventListener("click", handleClick, true); // capture phase = instant
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimeout(timer);
    };
  }, []);

  return <style>{STYLE}</style>;
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
