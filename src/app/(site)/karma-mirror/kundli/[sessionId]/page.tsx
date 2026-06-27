import KundliForm from "@/components/karma-mirror/KundliForm";

export default async function KundliPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16">
      <KundliForm sessionId={sessionId} />
    </div>
  );
}
