import NarrativeForm from "@/components/karma-mirror/NarrativeForm";

export default async function NarrativePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16">
      <NarrativeForm sessionId={sessionId} />
    </div>
  );
}
