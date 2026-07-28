import TestDetailPage from "@/components/dashboard/student/TestDetailPage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TestDetailPage id={Number(id)} />;
}
