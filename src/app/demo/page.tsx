import type { Metadata } from "next";
import { DemoReport } from "@/components/demo/screens/DemoReport";

export const metadata: Metadata = { title: "Gap report" };

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function DemoReportPage({ searchParams }: Props) {
  const { saved } = await searchParams;
  return <DemoReport saved={saved} />;
}
