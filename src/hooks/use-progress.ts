"use client";

import { useSyncExternalStore } from "react";
import {
  getProgressService,
  type ProgressService,
} from "@/lib/progress-service";
import type { LocalProgress } from "@/types";

function subscribe(onStoreChange: () => void): () => void {
  return getProgressService().subscribe(onStoreChange);
}

function getSnapshot(): LocalProgress {
  return getProgressService().getProgress();
}

// SSR・ハイドレーション中は「未読込」を表す null を返し、
// マウント後に localStorage の実データへ切り替わる(不一致を防ぐ)。
function getServerSnapshot(): null {
  return null;
}

/** 進捗データを購読するフック */
export function useProgress(): {
  ready: boolean;
  progress: LocalProgress | null;
  service: ProgressService | null;
} {
  const progress = useSyncExternalStore<LocalProgress | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    ready: progress !== null,
    progress,
    service: progress !== null ? getProgressService() : null,
  };
}
