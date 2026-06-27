import AssessmentQuiz from "@/components/karma-mirror/AssessmentQuiz";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16">
      <AssessmentQuiz sessionId={sessionId} />
    </div>
  );
}
