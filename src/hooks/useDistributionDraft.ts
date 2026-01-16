"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";
import type { DistributionWizardState } from "@/types/distribution";

const DRAFT_PREFIX = "vestledger_draft_distribution_";
const LATEST_PREFIX = "vestledger_draft_distribution_latest_";

const buildDraftKey = (fundId: string, draftId: string) =>
  `${DRAFT_PREFIX}${fundId}_${draftId}`;

const buildLatestKey = (fundId: string) => `${LATEST_PREFIX}${fundId}`;

const getDraftIdFromKey = (fundId: string, key: string) =>
  key.replace(`${DRAFT_PREFIX}${fundId}_`, "");

const isBrowser = () => typeof window !== "undefined";

const getAllDraftKeys = (fundId: string): string[] => {
  if (!isBrowser() || !safeLocalStorage.isAvailable()) return [];
  const prefix = `${DRAFT_PREFIX}${fundId}_`;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
};

const parseDraftTimestamp = (draft: DistributionWizardState) => {
  const value = draft.lastEditedAt ?? draft.draftSavedAt;
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const findLatestDraft = (
  fundId: string,
  explicitDraftId?: string | null
): { draftId: string; draft: DistributionWizardState } | null => {
  if (!safeLocalStorage.isAvailable()) return null;

  const latestKey = buildLatestKey(fundId);
  const preferredId = explicitDraftId ?? safeLocalStorage.getItem(latestKey);

  if (preferredId) {
    const preferredDraft = safeLocalStorage.getJSON<DistributionWizardState>(
      buildDraftKey(fundId, preferredId)
    );
    if (preferredDraft) {
      return { draftId: preferredId, draft: preferredDraft };
    }
  }

  const keys = getAllDraftKeys(fundId);
  let latestDraftId: string | null = null;
  let latestDraft: DistributionWizardState | null = null;
  let latestTimestamp = 0;

  for (const key of keys) {
    const draft = safeLocalStorage.getJSON<DistributionWizardState>(key);
    if (!draft) continue;
    const timestamp = parseDraftTimestamp(draft);
    if (!latestDraft || timestamp > latestTimestamp) {
      latestDraftId = getDraftIdFromKey(fundId, key);
      latestDraft = draft;
      latestTimestamp = timestamp;
    }
  }

  if (!latestDraftId || !latestDraft) return null;
  return { draftId: latestDraftId, draft: latestDraft };
};

const createDraftId = () => `draft-${Date.now()}`;

export function useDistributionDraft(params: {
  fundId: string;
  wizard: DistributionWizardState;
  setWizard: (next: DistributionWizardState) => void;
  patchWizard: (patch: Partial<DistributionWizardState>) => void;
}) {
  const { fundId, wizard, setWizard, patchWizard } = params;
  const hasRestoredRef = useRef(false);
  const previousStepRef = useRef(wizard.currentStep);
  const lastConfirmedUrlRef = useRef<string | null>(null);

  const latestKey = useMemo(() => buildLatestKey(fundId), [fundId]);

  const ensureDraftId = useCallback(() => {
    if (wizard.draftId) return wizard.draftId;
    const draftId = createDraftId();
    patchWizard({ draftId });
    return draftId;
  }, [patchWizard, wizard.draftId]);

  const saveDraft = useCallback(() => {
    if (!fundId || !safeLocalStorage.isAvailable()) return;
    const now = new Date().toISOString();
    const draftId = ensureDraftId();
    const nextState: DistributionWizardState = {
      ...wizard,
      draftId,
      draftSavedAt: now,
    };
    safeLocalStorage.setJSON(buildDraftKey(fundId, draftId), nextState);
    safeLocalStorage.setItem(latestKey, draftId);
    patchWizard({ draftId, draftSavedAt: now });
  }, [ensureDraftId, fundId, latestKey, patchWizard, wizard]);

  const clearDraft = useCallback(() => {
    if (!fundId || !safeLocalStorage.isAvailable()) return;
    const draftId = wizard.draftId;
    if (!draftId) return;
    safeLocalStorage.removeItem(buildDraftKey(fundId, draftId));
    safeLocalStorage.removeItem(latestKey);
  }, [fundId, latestKey, wizard.draftId]);

  useEffect(() => {
    if (!fundId || hasRestoredRef.current) return;
    const latest = findLatestDraft(fundId, wizard.draftId);
    if (latest?.draft) {
      hasRestoredRef.current = true;
      setWizard({
        ...latest.draft,
        draftId: latest.draftId,
      });
      previousStepRef.current = latest.draft.currentStep;
      return;
    }
    hasRestoredRef.current = true;
    ensureDraftId();
  }, [ensureDraftId, fundId, setWizard, wizard.draftId]);

  useEffect(() => {
    if (!wizard.autoSaveEnabled || !fundId || !hasRestoredRef.current) return;
    if (previousStepRef.current === wizard.currentStep) return;
    previousStepRef.current = wizard.currentStep;
    saveDraft();
  }, [fundId, saveDraft, wizard.autoSaveEnabled, wizard.currentStep]);

  const isDirty = useMemo(() => {
    if (!wizard.lastEditedAt) return false;
    if (!wizard.draftSavedAt) return true;
    return new Date(wizard.lastEditedAt).getTime() > new Date(wizard.draftSavedAt).getTime();
  }, [wizard.draftSavedAt, wizard.lastEditedAt]);

  useEffect(() => {
    if (!isDirty || !isBrowser()) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || !isBrowser()) return;
    lastConfirmedUrlRef.current = window.location.href;
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || !isBrowser()) return undefined;
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const destination = new URL(href, window.location.href);
      const current = new URL(window.location.href);
      if (destination.pathname === current.pathname) return;
      const confirmed = window.confirm("You have unsaved changes. Leave this page?");
      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      lastConfirmedUrlRef.current = destination.href;
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || !isBrowser()) return undefined;
    const handlePopState = () => {
      const confirmed = window.confirm("You have unsaved changes. Leave this page?");
      if (confirmed) {
        lastConfirmedUrlRef.current = window.location.href;
        return;
      }
      const fallbackUrl = lastConfirmedUrlRef.current ?? window.location.href;
      window.history.pushState(null, "", fallbackUrl);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  return {
    saveDraft,
    clearDraft,
    isDirty,
  };
}
