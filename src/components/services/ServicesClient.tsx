"use client";

import { useState } from "react";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceInquiryForm from "@/components/services/ServiceInquiryForm";
import { SERVICES } from "@/lib/constants";

export default function ServicesClient() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((s) => (
          <ServiceCard
            key={s.slug}
            titleHi={s.titleHi}
            description={s.description}
            startingPrice={s.startingPrice}
            selected={selected === s.title}
            onSelect={() => {
              setSelected(s.title);
              document.getElementById("service-inquiry")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          />
        ))}
      </div>

      <div id="service-inquiry" className="mt-16 max-w-2xl mx-auto scroll-mt-24">
        <ServiceInquiryForm key={selected ?? "none"} preselected={selected} />
      </div>
    </>
  );
}
