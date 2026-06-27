import { Sparkles, BookOpenText, Inbox, Briefcase } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { countJaps } from "@/lib/repo/japs";
import { countArticles } from "@/lib/repo/articles";
import { listCustomJapRequests, listServiceRequests } from "@/lib/repo/requests";

export const dynamic = "force-dynamic";

async function getCounts() {
  try {
    const japs = await countJaps();
    const articles = await countArticles();
    const [customJap, services] = await Promise.all([listCustomJapRequests(), listServiceRequests()]);
    const requests = customJap.length + services.length;
    return { japs, articles, requests };
  } catch {
    return { japs: 0, articles: 0, requests: 0 };
  }
}

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  return (
    <div>
      <h1 className="font-display-hi text-3xl text-charcoal mb-1">डैशबोर्ड</h1>
      <p className="font-hindi text-sm text-charcoal/55 mb-8">
        KarmaKnocksBack एडमिन पैनल में आपका स्वागत है
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard label="कुल जाप" value={counts.japs} icon={Sparkles} />
        <StatCard label="कुल लेख" value={counts.articles} icon={BookOpenText} />
        <StatCard label="कुल रिक्वेस्ट्स" value={counts.requests} icon={Inbox} />
      </div>

      <div className="mt-10 glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase size={16} className="text-gold-deep" />
          <p className="font-hindi text-sm font-semibold text-charcoal">त्वरित सुझाव</p>
        </div>
        <p className="font-hindi text-sm text-charcoal/60">
          नया जाप जोड़ने के लिए &ldquo;जाप प्रबंधन&rdquo; में जाएं, या नए
          प्राप्त रिक्वेस्ट्स देखने के लिए &ldquo;रिक्वेस्ट्स&rdquo; सेक्शन
          खोलें।
        </p>
      </div>
    </div>
  );
}
