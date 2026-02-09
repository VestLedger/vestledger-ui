'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button } from '@/ui';
import { ListItemCard, SearchToolbar } from '@/ui/composites';
import { useUIKey } from '@/store/ui';
import type { WaterfallScenario } from '@/types/waterfall';
import { formatCurrencyCompact, formatDate, formatTimestamp } from '@/utils/formatting';
import { safeLocalStorage } from '@/lib/storage/safeLocalStorage';
import {
  Archive,
  Copy,
  Layers,
  RotateCcw,
  Star,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

type ScenarioFilter = 'all' | 'favorites' | 'recent' | 'archived';

type ScenarioManagerUIState = {
  searchQuery: string;
  activeFilter: ScenarioFilter;
  archivedScenarioIds: string[];
};

const RECENT_DAYS = 14;
const ARCHIVE_STORAGE_KEY = 'vestledger-waterfall-archived-scenarios';
const HISTORY_STORAGE_KEY = 'vestledger-waterfall-scenario-history';
const MAX_HISTORY_ENTRIES = 8;

const isRecent = (scenario: WaterfallScenario) => {
  const updated = new Date(scenario.updatedAt).getTime();
  const threshold = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  return Number.isFinite(updated) && updated >= threshold;
};

const getModelLabel = (model: WaterfallScenario['model']) =>
  model === 'european' ? 'European' : model === 'american' ? 'American' : 'Blended';

type ScenarioHistoryEntry = {
  version: number;
  updatedAt: string;
  name: string;
  model: WaterfallScenario['model'];
  exitValue: number;
  totalInvested: number;
  investorClassCount: number;
};

type ScenarioHistoryStore = Record<string, ScenarioHistoryEntry[]>;

const buildHistoryEntry = (scenario: WaterfallScenario): ScenarioHistoryEntry => ({
  version: scenario.version,
  updatedAt: scenario.updatedAt,
  name: scenario.name,
  model: scenario.model,
  exitValue: scenario.exitValue,
  totalInvested: scenario.totalInvested,
  investorClassCount: scenario.investorClasses.length,
});

export interface ScenarioManagerProps {
  scenarios: WaterfallScenario[];
  selectedScenarioId: string | null;
  comparisonScenarioIds: string[];
  onSelectScenario: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicateScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
  onToggleComparison: (id: string) => void;
  onClearComparison: () => void;
}

export function ScenarioManager({
  scenarios,
  selectedScenarioId,
  comparisonScenarioIds,
  onSelectScenario,
  onToggleFavorite,
  onDuplicateScenario,
  onDeleteScenario,
  onToggleComparison,
  onClearComparison,
}: ScenarioManagerProps) {
  const { value: ui, patch: patchUI } = useUIKey<ScenarioManagerUIState>(
    'waterfall-scenario-manager',
    {
      searchQuery: '',
      activeFilter: 'all',
      archivedScenarioIds: [],
    }
  );
  const hasInitialized = useRef(false);
  const historyInitialized = useRef(false);
  const [historyByScenarioId, setHistoryByScenarioId] = useState<ScenarioHistoryStore>({});

  useEffect(() => {
    if (hasInitialized.current) return;
    const stored = safeLocalStorage.getJSON<string[]>(ARCHIVE_STORAGE_KEY);
    if (stored && Array.isArray(stored)) {
      patchUI({ archivedScenarioIds: stored });
    }
    hasInitialized.current = true;
  }, [patchUI]);

  useEffect(() => {
    if (!hasInitialized.current) return;
    safeLocalStorage.setJSON(ARCHIVE_STORAGE_KEY, ui.archivedScenarioIds);
  }, [ui.archivedScenarioIds]);

  useEffect(() => {
    if (historyInitialized.current) return;
    const stored = safeLocalStorage.getJSON<ScenarioHistoryStore>(HISTORY_STORAGE_KEY);
    if (stored) {
      setHistoryByScenarioId(stored);
    }
    historyInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!historyInitialized.current) return;
    setHistoryByScenarioId((prev) => {
      let hasChanges = false;
      const next: ScenarioHistoryStore = { ...prev };

      scenarios.forEach((scenario) => {
        const history = next[scenario.id] ?? [];
        const hasVersion = history.some((entry) => entry.version === scenario.version);
        if (hasVersion) return;

        const updated = [buildHistoryEntry(scenario), ...history]
          .sort((a, b) => b.version - a.version)
          .slice(0, MAX_HISTORY_ENTRIES);
        next[scenario.id] = updated;
        hasChanges = true;
      });

      return hasChanges ? next : prev;
    });
  }, [scenarios]);

  useEffect(() => {
    if (!historyInitialized.current) return;
    safeLocalStorage.setJSON(HISTORY_STORAGE_KEY, historyByScenarioId);
  }, [historyByScenarioId]);

  const archivedSet = useMemo(
    () => new Set(ui.archivedScenarioIds),
    [ui.archivedScenarioIds]
  );

  const selectedScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? null,
    [scenarios, selectedScenarioId]
  );

  const selectedHistory = useMemo(() => {
    if (!selectedScenarioId) return [];
    return historyByScenarioId[selectedScenarioId] ?? [];
  }, [historyByScenarioId, selectedScenarioId]);

  const { activeScenarios, archivedScenarios } = useMemo(() => {
    const active = scenarios.filter((scenario) => !archivedSet.has(scenario.id));
    const archived = scenarios.filter((scenario) => archivedSet.has(scenario.id));
    return { activeScenarios: active, archivedScenarios: archived };
  }, [archivedSet, scenarios]);

  const searchQuery = ui.searchQuery.trim().toLowerCase();

  const filteredActive = useMemo(() => {
    if (!searchQuery) return activeScenarios;
    return activeScenarios.filter((scenario) => {
      const name = scenario.name.toLowerCase();
      const description = scenario.description?.toLowerCase() ?? '';
      return name.includes(searchQuery) || description.includes(searchQuery);
    });
  }, [activeScenarios, searchQuery]);

  const favorites = useMemo(
    () => filteredActive.filter((scenario) => scenario.isFavorite),
    [filteredActive]
  );

  const recent = useMemo(
    () =>
      filteredActive
        .filter(isRecent)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [filteredActive]
  );

  const visibleScenarios = useMemo(() => {
    switch (ui.activeFilter) {
      case 'favorites':
        return favorites;
      case 'recent':
        return recent;
      case 'archived':
        return archivedScenarios;
      case 'all':
      default:
        return filteredActive;
    }
  }, [archivedScenarios, favorites, filteredActive, recent, ui.activeFilter]);

  const showSections = ui.activeFilter === 'all' && !searchQuery;

  const handleArchiveToggle = (id: string, shouldArchive: boolean) => {
    if (shouldArchive) {
      patchUI({ archivedScenarioIds: [...ui.archivedScenarioIds, id] });
    } else {
      patchUI({
        archivedScenarioIds: ui.archivedScenarioIds.filter((scenarioId) => scenarioId !== id),
      });
    }
  };

  const comparisonSet = useMemo(
    () => new Set(comparisonScenarioIds),
    [comparisonScenarioIds]
  );

  const renderScenario = (scenario: WaterfallScenario, isArchived = false) => {
    const isSelected = scenario.id === selectedScenarioId;
    const isInComparison = comparisonSet.has(scenario.id);
    const updatedLabel = formatTimestamp(new Date(scenario.updatedAt));
    const createdLabel = formatDate(scenario.createdAt);
    const tags = scenario.tags ?? [];

    return (
      <ListItemCard
        key={scenario.id}
        title={
          <div className="flex items-center gap-2">
            <span>{scenario.name}</span>
            {isSelected && <CheckCircle2 className="h-4 w-4 text-[var(--app-success)]" />}
          </div>
        }
        description={scenario.description}
        meta={`v${scenario.version} | ${scenario.createdBy} | Created ${createdLabel} | Updated ${updatedLabel}`}
        badges={(
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="sm" variant="flat">{getModelLabel(scenario.model)}</Badge>
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} size="sm" variant="flat">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        actions={(
          <div
            className="flex items-center gap-1"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <Button
              size="sm"
              variant="light"
              isIconOnly
              aria-label={scenario.isFavorite ? 'Remove favorite' : 'Add favorite'}
              onPress={() => onToggleFavorite(scenario.id)}
            >
              <Star
                className={[
                  'h-4 w-4',
                  scenario.isFavorite ? 'text-[var(--app-warning)]' : 'text-[var(--app-text-muted)]',
                ].join(' ')}
                fill={scenario.isFavorite ? 'var(--app-warning)' : 'none'}
              />
            </Button>
            {!isArchived && (
              <Button
                size="sm"
                variant="light"
                isIconOnly
                aria-label={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
                onPress={() => onToggleComparison(scenario.id)}
              >
                <Layers
                  className={[
                    'h-4 w-4',
                    isInComparison ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]',
                  ].join(' ')}
                />
              </Button>
            )}
            <Button
              size="sm"
              variant="light"
              isIconOnly
              aria-label="Duplicate scenario"
              onPress={() => onDuplicateScenario(scenario.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            {isArchived ? (
              <Button
                size="sm"
                variant="light"
                isIconOnly
                aria-label="Restore scenario"
                onPress={() => handleArchiveToggle(scenario.id, false)}
              >
                <RotateCcw className="h-4 w-4 text-[var(--app-success)]" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="light"
                isIconOnly
                aria-label="Archive scenario"
                onPress={() => handleArchiveToggle(scenario.id, true)}
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="light"
              isIconOnly
              aria-label="Delete scenario"
              onPress={() => onDeleteScenario(scenario.id)}
            >
              <Trash2 className="h-4 w-4 text-[var(--app-danger)]" />
            </Button>
          </div>
        )}
        onClick={() => onSelectScenario(scenario.id)}
        className={[
          isSelected ? 'border border-[var(--app-primary)] bg-[var(--app-primary-bg)]' : '',
          isArchived ? 'opacity-70' : '',
        ].join(' ')}
      />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Scenario Manager</h3>
        <Badge size="sm" variant="flat">{activeScenarios.length} active</Badge>
      </div>

      <SearchToolbar
        searchValue={ui.searchQuery}
        onSearchChange={(value) => patchUI({ searchQuery: value })}
        searchPlaceholder="Search scenarios..."
        filters={[
          { id: 'all', label: 'All' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'recent', label: 'Recent' },
          { id: 'archived', label: 'Archived' },
        ]}
        activeFilterId={ui.activeFilter}
        onFilterChange={(id) => patchUI({ activeFilter: id as ScenarioFilter })}
      />

      {comparisonScenarioIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs text-[var(--app-text-muted)]">
          <span>{comparisonScenarioIds.length} scenarios in comparison</span>
          <Button size="sm" variant="light" onPress={onClearComparison}>
            Clear comparison
          </Button>
        </div>
      )}

      {showSections && favorites.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
            Favorites
          </div>
          <div className="space-y-2">
            {favorites.slice(0, 3).map((scenario) => renderScenario(scenario))}
          </div>
        </div>
      )}

      {showSections && recent.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
            Recently Updated
          </div>
          <div className="space-y-2">
            {recent.slice(0, 3).map((scenario) => renderScenario(scenario))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
          {ui.activeFilter === 'archived' ? 'Archived Scenarios' : 'All Scenarios'}
        </div>
        <div className="space-y-2">
          {visibleScenarios.length > 0 ? (
            visibleScenarios.map((scenario) =>
              renderScenario(scenario, ui.activeFilter === 'archived')
            )
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--app-border)] p-4 text-sm text-[var(--app-text-muted)]">
              No scenarios match this filter.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-[var(--app-text-subtle)]">
            Scenario History
          </div>
          {selectedScenario && (
            <Badge size="sm" variant="flat">
              v{selectedScenario.version}
            </Badge>
          )}
        </div>
        {selectedScenario ? (
          selectedHistory.length > 0 ? (
            <div className="space-y-2">
              {selectedHistory.map((entry) => (
                <div
                  key={`${entry.version}-${entry.updatedAt}`}
                  className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">v{entry.version}</div>
                    <div className="text-[var(--app-text-muted)]">
                      {formatTimestamp(new Date(entry.updatedAt))}
                    </div>
                  </div>
                  <div className="mt-1 text-[var(--app-text-muted)]">{entry.name}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[var(--app-text-muted)]">
                    <Badge size="sm" variant="flat">
                      {getModelLabel(entry.model)}
                    </Badge>
                    <span>{formatCurrencyCompact(entry.exitValue)} exit</span>
                    <span>{formatCurrencyCompact(entry.totalInvested)} invested</span>
                    <span>{entry.investorClassCount} classes</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--app-border)] p-3 text-sm text-[var(--app-text-muted)]">
              No history recorded for this scenario yet.
            </div>
          )
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--app-border)] p-3 text-sm text-[var(--app-text-muted)]">
            Select a scenario to view version history.
          </div>
        )}
        <div className="text-xs text-[var(--app-text-subtle)]">
          History snapshots are stored locally when a scenario version changes.
        </div>
      </div>
    </div>
  );
}
