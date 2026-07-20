import type { Metadata } from "next";
import { ResultView } from "@/components/result/result-view";

export const metadata: Metadata = { title: "結果" };

type PageProps = {
  params: Promise<{ attemptId: string }>;
};

export default async function ResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  return <ResultView attemptId={attemptId} />;
}
