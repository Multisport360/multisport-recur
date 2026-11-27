import type { Metadata } from "next";
import { DemoAddStat } from "@/components/demo/screens/DemoAddStat";

export const metadata: Metadata = { title: "Enter a number" };

type Props = { searchParams: Promise<{ sport?: string; metric?: string }> };

export default async function DemoAddStatPage({ searchParams }: Props) {
  const { sport, metric } = await searchParams;
  return <DemoAddStat sportId={sport} metric={metric} />;
}
