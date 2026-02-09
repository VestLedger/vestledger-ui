'use client'

import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Button, Input, Select } from '@/ui';

export interface SearchToolbarFilter {
  id: string;
  label: string;
}

export interface SearchToolbarDropdown {
  label?: string;
  selectedValue: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export interface SearchToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: SearchToolbarFilter[];
  activeFilterId?: string;
  onFilterChange?: (id: string) => void;
  dropdown?: SearchToolbarDropdown;
  rightActions?: ReactNode;
}

export function SearchToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  activeFilterId,
  onFilterChange,
  dropdown,
  rightActions,
}: SearchToolbarProps) {
  const showSearch = searchValue !== undefined || !!onSearchChange;
  const showFilters = !!filters && filters.length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {showSearch && (
          <div className="flex-1 sm:flex-initial sm:w-80">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue ?? ''}
              onChange={(event) => onSearchChange?.(event.target.value)}
              startContent={<Search className="w-4 h-4 text-[var(--app-text-subtle)]" />}
            />
          </div>
        )}

        {showFilters && (
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                variant={activeFilterId === filter.id ? 'solid' : 'flat'}
                color={activeFilterId === filter.id ? 'primary' : 'default'}
                onPress={() => onFilterChange?.(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        )}

        {dropdown && (
          <div className="flex items-center gap-2">
            {dropdown.label && (
              <span className="text-sm text-[var(--app-text-muted)]">{dropdown.label}</span>
            )}
            <Select
              aria-label={dropdown.label ?? 'Filter'}
              size="sm"
              className="w-48"
              selectedKeys={[dropdown.selectedValue]}
              onChange={(event) => dropdown.onChange(event.target.value)}
              disallowEmptySelection
              options={dropdown.options}
            />
          </div>
        )}
      </div>

      {rightActions && (
        <div className="flex items-center gap-2">
          {rightActions}
        </div>
      )}
    </div>
  );
}
