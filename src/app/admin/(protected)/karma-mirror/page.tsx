import Link from "next/link";
import { countSessions, listRecentSessions } from "@/lib/repo/km-assessment";

export default async function AdminKarmaMirrorPage() {
  const { total, completed } = await countSessions();
  const recent = await listRecentSessions(20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display-hi text-3xl text-charcoal">Karma Mirror</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/karma-mirror/questions"
            className="rounded-full border border-gold-deep/30 px-5 py-2.5 font-hindi text-sm text-gold-deep"
          >
            प्रश्न प्रबंधन
          </Link>
          <Link
            href="/admin/karma-mirror/practices"
            className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-5 py-2.5 font-hindi text-sm text-warm-white"
          >
            अभ्यास प्रबंधन
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl bg-warm-white border border-charcoal/10 p-5">
          <p className="font-hindi text-xs text-charcoal/55">कुल सत्र</p>
          <p className="font-display-hi text-3xl text-charcoal mt-1">{total}</p>
        </div>
        <div className="rounded-2xl bg-warm-white border border-charcoal/10 p-5">
          <p className="font-hindi text-xs text-charcoal/55">पूर्ण रिपोर्ट</p>
          <p className="font-display-hi text-3xl text-charcoal mt-1">{completed}</p>
        </div>
      </div>

      <h2 className="font-display-hi text-lg text-charcoal mb-3">हाल के सत्र</h2>
      <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
        <table className="w-full text-left">
          <thead className="bg-charcoal/5">
            <tr>
              <Th>सत्र ID</Th>
              <Th>नाम / ईमेल</Th>
              <Th>स्थिति</Th>
              <Th>अनुभव स्तर</Th>
              <Th>बनाया गया</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/5">
            {recent.map((s) => (
              <tr key={s.id}>
                <Td>{s.id}</Td>
                <Td>
                  {s.name || s.email ? (
                    <>
                      {s.name && <span className="text-charcoal">{s.name}</span>}
                      {s.email && <span className="block text-charcoal/45 text-xs">{s.email}</span>}
                    </>
                  ) : (
                    <span className="text-charcoal/35">— गुमनाम —</span>
                  )}
                </Td>
                <Td>{s.status === "completed" ? "पूर्ण" : "अधूरा"}</Td>
                <Td>{s.experienceLevel}</Td>
                <Td>{new Date(s.createdAt).toLocaleDateString("hi-IN")}</Td>
                <Td>
                  {s.status === "completed" && (
                    <Link href={`/karma-mirror/results/${s.id}`} target="_blank" className="text-gold-deep text-xs underline">
                      रिपोर्ट देखें
                    </Link>
                  )}
                </Td>
              </tr>
            ))}
            {!recent.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-hindi text-sm text-charcoal/50">
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
  return <td className="px-4 py-3 font-sans text-sm text-charcoal/75">{children}</td>;
}
