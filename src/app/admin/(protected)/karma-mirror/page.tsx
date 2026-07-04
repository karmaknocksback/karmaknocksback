import Link from "next/link";
import { countSessions, listRecentSessions, getReportRow } from "@/lib/repo/km-assessment";
import AdminKMActions from "@/components/admin/AdminKMActions";
import type { KMReport } from "@/types";

export default async function AdminKarmaMirrorPage() {
  const { total, completed } = await countSessions();
  const recent = await listRecentSessions(20);

  // Pre-fetch report data for completed sessions
  const sessionReports: Record<string, KMReport | null> = {};
  await Promise.all(
    recent
      .filter((s) => s.status === "completed")
      .map(async (s) => {
        const row = await getReportRow(s.id);
        if (row) {
          try { sessionReports[s.id] = JSON.parse(row.sections_json) as KMReport; } catch { sessionReports[s.id] = null; }
        }
      })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-hi text-3xl text-charcoal">Karma Mirror</h1>
        <div className="flex gap-3">
          <Link href="/admin/karma-mirror/questions"
            className="rounded-full border border-gold-deep/30 px-5 py-2.5 font-hindi text-sm text-gold-deep">
            प्रश्न प्रबंधन
          </Link>
          <Link href="/admin/karma-mirror/practices"
            className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white">
            अभ्यास प्रबंधन
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "कुल सत्र", value: total },
          { label: "पूर्ण रिपोर्ट", value: completed },
          { label: "इस माह", value: recent.filter(s => { const d = new Date(s.createdAt); const month = new Date(); month.setDate(month.getDate() - 30); return d > month; }).length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-warm-white border border-charcoal/10 p-5">
            <p className="font-hindi text-xs text-charcoal/55">{label}</p>
            <p className="font-display-hi text-3xl text-charcoal mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Sessions table */}
      <h2 className="font-display-hi text-lg text-charcoal mb-3">हाल के सत्र</h2>
      <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
        <table className="w-full text-left">
          <thead className="bg-charcoal/5">
            <tr>
              <Th>ID</Th>
              <Th>नाम / ईमेल</Th>
              <Th>आर्किटाइप</Th>
              <Th>स्थिति</Th>
              <Th>Unlocked</Th>
              <Th>दिनांक</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {recent.map((s) => {
              const report = sessionReports[s.id];
              return (
                <tr key={s.id} className="hover:bg-charcoal/[0.02]">
                  <Td><span className="font-sans text-xs text-charcoal/40">{s.id}</span></Td>
                  <Td>
                    {s.name || s.email ? (
                      <>
                        {s.name && <p className="font-hindi text-sm text-charcoal">{s.name}</p>}
                        {s.email && <p className="font-sans text-xs text-charcoal/45">{s.email}</p>}
                      </>
                    ) : (
                      <span className="text-charcoal/30 text-xs">— गुमनाम —</span>
                    )}
                  </Td>
                  <Td>
                    {report?.archetype ? (
                      <span className="font-hindi text-xs font-medium text-charcoal">
                        {report.archetype.nameHi}
                      </span>
                    ) : s.status === "completed" ? (
                      <span className="text-xs text-charcoal/30">—</span>
                    ) : null}
                  </Td>
                  <Td>
                    <span className={`rounded-full px-2 py-0.5 font-hindi text-xs ${s.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.status === "completed" ? "पूर्ण" : "अधूरा"}
                    </span>
                  </Td>
                  <Td>
                    <span className={`rounded-full px-2 py-0.5 font-sans text-xs ${s.reportUnlocked ? "bg-gold/15 text-gold-deep" : "bg-charcoal/5 text-charcoal/35"}`}>
                      {s.reportUnlocked ? "✓" : "—"}
                    </span>
                  </Td>
                  <Td><span className="text-xs">{new Date(s.createdAt).toLocaleDateString("en-IN")}</span></Td>
                  <Td>
                    <AdminKMActions
                      sessionId={s.id}
                      status={s.status}
                      email={s.email}
                      name={s.name}
                      archetypeHi={report?.archetype?.nameHi}
                      reportUnlocked={s.reportUnlocked}
                    />
                  </Td>
                </tr>
              );
            })}
            {!recent.length && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center font-hindi text-sm text-charcoal/50">
                  अभी तक कोई सत्र नहीं
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-4 py-3 text-sm text-charcoal/75">{children}</td>;
}
