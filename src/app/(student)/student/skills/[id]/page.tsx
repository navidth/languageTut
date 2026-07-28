import SkillDetail from "@/components/dashboard/skills/SkillDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SkillDetail id={Number(id)} />;
}
