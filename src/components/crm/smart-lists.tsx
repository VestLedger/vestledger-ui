'use client';

import { Card, Button, Input, Badge } from '@/ui';
import { Filter, Plus, Save, Trash2, Star, Users, TrendingDown, Calendar, Briefcase, X, ChevronDown } from 'lucide-react';
import { useUIKey } from '@/store/ui';

export interface FilterCondition {
  id: string;
  field: 'role' | 'tags' | 'location' | 'relationshipScore' | 'lastContact' | 'deals' | 'starred';
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'inLast' | 'notInLast';
  value: string | number | boolean;
  label?: string;
}

export interface SmartList {
  id: string;
  name: string;
  description?: string;
  conditions: FilterCondition[];
  count?: number;
  starred?: boolean;
  lastUpdated?: Date;
}

interface SmartListsProps {
  lists: SmartList[];
  onListSelect: (list: SmartList) => void;
  onListSave: (list: SmartList) => void;
  onListDelete: (listId: string) => void;
  selectedListId?: string;
}

const fieldOptions = [
  { value: 'role', label: 'Role' },
  { value: 'tags', label: 'Tags' },
  { value: 'location', label: 'Location' },
  { value: 'relationshipScore', label: 'Relationship Score' },
  { value: 'lastContact', label: 'Last Contact' },
  { value: 'deals', label: 'Deals' },
  { value: 'starred', label: 'Starred' },
];

const operatorOptions: Record<string, { value: string; label: string }[]> = {
  role: [
    { value: 'equals', label: 'is' },
    { value: 'contains', label: 'contains' },
  ],
  tags: [
    { value: 'contains', label: 'contains' },
  ],
  location: [
    { value: 'contains', label: 'contains' },
  ],
  relationshipScore: [
    { value: 'greaterThan', label: 'greater than' },
    { value: 'lessThan', label: 'less than' },
  ],
  lastContact: [
    { value: 'inLast', label: 'in last' },
    { value: 'notInLast', label: 'not in last' },
  ],
  deals: [
    { value: 'greaterThan', label: 'has more than' },
  ],
  starred: [
    { value: 'equals', label: 'is' },
  ],
};

export function SmartLists({ lists, onListSelect, onListSave, onListDelete, selectedListId }: SmartListsProps) {
  const { value: ui, patch: patchUI } = useUIKey<{
    isCreating: boolean;
    editingList: SmartList | null;
    showSaved: boolean;
  }>('crm-smart-lists', {
    isCreating: false,
    editingList: null,
    showSaved: true,
  });
  const { isCreating, editingList, showSaved } = ui;

  const handleCreateNew = () => {
    patchUI({
      editingList: {
        id: `temp-${Date.now()}`,
        name: '',
        conditions: [],
      },
      isCreating: true,
    });
  };

  const handleSave = () => {
    if (editingList && editingList.name.trim()) {
      onListSave(editingList);
      patchUI({ isCreating: false, editingList: null });
    }
  };

  const handleCancel = () => {
    patchUI({ isCreating: false, editingList: null });
  };

  const addCondition = () => {
    if (!editingList) return;

    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      field: 'role',
      operator: 'equals',
      value: '',
    };

    patchUI({
      editingList: {
        ...editingList,
        conditions: [...editingList.conditions, newCondition],
      },
    });
  };

  const removeCondition = (conditionId: string) => {
    if (!editingList) return;

    patchUI({
      editingList: {
        ...editingList,
        conditions: editingList.conditions.filter((condition) => condition.id !== conditionId),
      },
    });
  };

  const updateCondition = (conditionId: string, updates: Partial<FilterCondition>) => {
    if (!editingList) return;

    patchUI({
      editingList: {
        ...editingList,
        conditions: editingList.conditions.map((condition) =>
          condition.id === conditionId ? { ...condition, ...updates } : condition
        ),
      },
    });
  };

  const getListIcon = (list: SmartList) => {
    // Detect list type by conditions
    if (list.conditions.some(c => c.field === 'starred')) return Star;
    if (list.conditions.some(c => c.field === 'relationshipScore')) return TrendingDown;
    if (list.conditions.some(c => c.field === 'lastContact')) return Calendar;
    if (list.conditions.some(c => c.field === 'deals')) return Briefcase;
    return Users;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--app-primary)]" />
          <h3 className="text-lg font-semibold">Smart Lists</h3>
        </div>
        <Button
          size="sm"
          color="primary"
          startContent={<Plus className="w-4 h-4" />}
          onPress={handleCreateNew}
        >
          New List
        </Button>
      </div>

      {/* Saved Lists */}
      <Card padding="sm">
        <button
          className="w-full flex items-center justify-between p-2 hover:bg-[var(--app-surface-hover)] rounded-lg transition-colors"
          onClick={() => patchUI({ showSaved: !showSaved })}
        >
          <span className="text-sm font-medium">Saved Lists ({lists.length})</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSaved ? 'rotate-180' : ''}`} />
        </button>

        {showSaved && (
          <div className="mt-2 space-y-1">
            {lists.length === 0 ? (
              <div className="text-center py-6 text-sm text-[var(--app-text-muted)]">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No saved lists yet</p>
                <p className="text-xs mt-1">Create a smart list to save custom filters</p>
              </div>
            ) : (
              lists.map((list) => {
                const Icon = getListIcon(list);
                const isSelected = list.id === selectedListId;

                return (
                  <div
                    key={list.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--app-primary-bg)] border border-[var(--app-primary)]'
                        : 'hover:bg-[var(--app-surface-hover)]'
                    }`}
                  >
                    <button
                      onClick={() => onListSelect(list)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{list.name}</span>
                          {list.starred && <Star className="w-3 h-3 fill-[var(--app-warning)] text-[var(--app-warning)]" />}
                        </div>
                        {list.description && (
                          <p className="text-xs text-[var(--app-text-muted)] truncate">{list.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge size="sm" variant="flat" className="bg-[var(--app-surface-hover)] text-[var(--app-text-muted)]">
                            {list.conditions.length} {list.conditions.length === 1 ? 'filter' : 'filters'}
                          </Badge>
                          {list.count !== undefined && (
                            <span className="text-xs text-[var(--app-text-subtle)]">{list.count} contacts</span>
                          )}
                        </div>
                      </div>
                    </button>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      onPress={() => onListDelete(list.id)}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-[var(--app-danger)]" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* List Builder */}
      {isCreating && editingList && (
        <Card padding="md" className="border-2 border-[var(--app-primary)]">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">List Name</label>
              <Input
                placeholder="e.g., Hot Leads, Inactive Contacts, Top Founders"
                value={editingList.name}
                onChange={(e) => patchUI({ editingList: { ...editingList, name: e.target.value } })}
                size="sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Input
                placeholder="Brief description of this list"
                value={editingList.description || ''}
                onChange={(e) => patchUI({ editingList: { ...editingList, description: e.target.value } })}
                size="sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Filters</label>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<Plus className="w-3 h-3" />}
                  onPress={addCondition}
                >
                  Add Filter
                </Button>
              </div>

              {editingList.conditions.length === 0 ? (
                <div className="text-center py-4 text-xs text-[var(--app-text-muted)] bg-[var(--app-surface-hover)] rounded-lg">
                  Add filters to define who appears in this list
                </div>
              ) : (
                <div className="space-y-2">
                  {editingList.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center gap-2 p-3 bg-[var(--app-surface-hover)] rounded-lg">
                      {index > 0 && (
                        <Badge size="sm" variant="flat" className="bg-[var(--app-primary-bg)] text-[var(--app-primary)]">
                          AND
                        </Badge>
                      )}

                      <select
                        className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                        value={condition.field}
                        onChange={(e) => updateCondition(condition.id, { field: e.target.value as any })}
                      >
                        {fieldOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)]"
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, { operator: e.target.value as any })}
                      >
                        {operatorOptions[condition.field]?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <Input
                        size="sm"
                        placeholder="value"
                        value={String(condition.value)}
                        onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                        className="flex-1"
                      />

                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onPress={() => removeCondition(condition.id)}
                      >
                        <X className="w-4 h-4 text-[var(--app-danger)]" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[var(--app-border)]">
              <Button
                color="primary"
                startContent={<Save className="w-4 h-4" />}
                onPress={handleSave}
                isDisabled={!editingList.name.trim()}
              >
                Save List
              </Button>
              <Button variant="flat" onPress={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Filter Presets */}
      {!isCreating && (
        <div>
          <h4 className="text-sm font-medium mb-2">Quick Filters</h4>
          <div className="flex flex-wrap gap-2">
            <Badge
              size="md"
              className="cursor-pointer hover:bg-[var(--app-primary)] hover:text-white transition-colors"
              onClick={() => {
                const list: SmartList = {
                  id: 'preset-starred',
                  name: 'Starred Contacts',
                  conditions: [{ id: '1', field: 'starred', operator: 'equals', value: true }],
                };
                onListSelect(list);
              }}
            >
              <Star className="w-3 h-3 mr-1" />
              Starred
            </Badge>
            <Badge
              size="md"
              className="cursor-pointer hover:bg-[var(--app-primary)] hover:text-white transition-colors"
              onClick={() => {
                const list: SmartList = {
                  id: 'preset-cold',
                  name: 'Cold Relationships',
                  conditions: [{ id: '1', field: 'relationshipScore', operator: 'lessThan', value: 30 }],
                };
                onListSelect(list);
              }}
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              Cold
            </Badge>
            <Badge
              size="md"
              className="cursor-pointer hover:bg-[var(--app-primary)] hover:text-white transition-colors"
              onClick={() => {
                const list: SmartList = {
                  id: 'preset-inactive',
                  name: 'Inactive (90d)',
                  conditions: [{ id: '1', field: 'lastContact', operator: 'notInLast', value: '90 days' }],
                };
                onListSelect(list);
              }}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Inactive 90d
            </Badge>
            <Badge
              size="md"
              className="cursor-pointer hover:bg-[var(--app-primary)] hover:text-white transition-colors"
              onClick={() => {
                const list: SmartList = {
                  id: 'preset-founders',
                  name: 'Founders Only',
                  conditions: [{ id: '1', field: 'role', operator: 'equals', value: 'founder' }],
                };
                onListSelect(list);
              }}
            >
              <Users className="w-3 h-3 mr-1" />
              Founders
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
