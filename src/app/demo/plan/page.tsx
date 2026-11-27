import type { Metadata } from "next";
import { DemoPlan } from "@/components/demo/screens/DemoPlan";

export const metadata: Metadata = { title: "Training plan" };

type Props = { searchParams: Promise<{ week?: string }> };

export default async function DemoPlanPage({ searchParams }: Props) {
  const { week } = await searchParams;
  return <DemoPlan week={week} />;
}
