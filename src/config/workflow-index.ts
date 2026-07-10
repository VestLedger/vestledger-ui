import rawIndex from "./mvp-workflow-index.json";
import type { NavGroupId } from "./navigation-stages";

export type WorkflowPatternEntry = {
  primaryStage: NavGroupId;
  secondaryStages: NavGroupId[];
  workflowIds: string[];
};

export type WorkflowIndex = {
  totalRows: number;
  patterns: Record<string, WorkflowPatternEntry>;
};

export const WORKFLOW_INDEX = rawIndex as unknown as WorkflowIndex;

export const ALL_WORKFLOW_PATTERNS: readonly string[] = Object.freeze(
  Object.keys(WORKFLOW_INDEX.patterns),
);

export function patternsForStage(stage: NavGroupId): string[] {
  return Object.entries(WORKFLOW_INDEX.patterns)
    .filter(([, entry]) => entry.primaryStage === stage)
    .map(([pattern]) => pattern);
}
