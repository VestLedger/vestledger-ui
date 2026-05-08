"use client";

import { useMemo } from "react";
import { useAuth, type User } from "@/contexts/auth-context";
import {
  DEFAULT_SEGMENT_KEY,
  getSegmentConfig,
  resolveSegmentKey,
} from "@/config/segment-config";
import { normalizeSegmentKey } from "@/types/segments";

export function useSegmentConfig(userOverride?: User | null) {
  const { user: authUser } = useAuth();
  const user = userOverride === undefined ? authUser : userOverride;
  const explicitSegment = normalizeSegmentKey(user?.segment);
  const segmentKey = explicitSegment ?? resolveSegmentKey(null);

  return useMemo(
    () => ({
      segmentKey,
      config: getSegmentConfig(segmentKey),
      isDefaulted: !explicitSegment && segmentKey === DEFAULT_SEGMENT_KEY,
    }),
    [explicitSegment, segmentKey],
  );
}
