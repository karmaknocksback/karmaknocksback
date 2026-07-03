"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.1 });

// Inject gold-colored progress bar CSS
const STYLE = `
#nprogress .bar { background: #c89b3c !important; height: 3px !important; }
#nprogress .peg { box-shadow: 0 0 10px #c89b3c, 0 0 5px #c89b3c !important; }
`;

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept link clicks to start progress
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || target.target === "_blank") return;
      NProgress.start();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
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
