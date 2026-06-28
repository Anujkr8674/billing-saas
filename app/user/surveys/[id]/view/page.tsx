import { getSurveyById } from "@/app/actions/documents";
import { getUserProfile } from "@/app/actions/user";
import HTMLSurveyViewerClient from "./HTMLSurveyViewerClient";

export default async function ViewSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const survey = await getSurveyById(id);
  const profile = await getUserProfile();

  if (!survey) {
    return <div className="p-8 text-center text-danger font-medium">Survey not found.</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden print:block print:h-auto print:overflow-visible">
      <HTMLSurveyViewerClient survey={survey} profile={profile} />
    </div>
  );
}
