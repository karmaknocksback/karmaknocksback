import Link from "next/link";
import KMPracticeForm from "@/components/admin/KMPracticeForm";

export default function NewKMPracticePage() {
  return (
    <div>
      <Link href="/admin/karma-mirror/practices" className="font-hindi text-xs text-charcoal/50">← अभ्यास प्रबंधन</Link>
      <h1 className="font-display-hi text-3xl text-charcoal mt-1 mb-6">नया अभ्यास</h1>
      <KMPracticeForm />
    </div>
  );
}
