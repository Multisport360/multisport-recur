import type { Metadata } from "next";
import { DemoSubscribe } from "@/components/demo/screens/DemoSubscribe";

export const metadata: Metadata = { title: "Subscribe to the training plan" };

export default function DemoSubscribePage() {
  return <DemoSubscribe />;
}
