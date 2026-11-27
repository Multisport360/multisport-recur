import type { Metadata } from "next";
import { DemoAccount } from "@/components/demo/screens/DemoAccount";

export const metadata: Metadata = { title: "Account" };

export default function DemoAccountPage() {
  return <DemoAccount />;
}
