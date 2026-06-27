import TimelineForm from "@/components/karma-mirror/TimelineForm";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16">
      <TimelineForm sessionId={sessionId} />
    </div>
  );
}
