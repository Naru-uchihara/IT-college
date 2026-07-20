import type { Metadata } from "next";
import { ReviewList } from "@/components/review/review-list";

export const metadata: Metadata = { title: "復習" };

export default function ReviewPage() {
  return <ReviewList />;
}
