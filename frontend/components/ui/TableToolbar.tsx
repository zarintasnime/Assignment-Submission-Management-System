import React from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
}

export default function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterOptions,
  selectedFilter = 'all',
  onFilterChange,
  filterLabel = 'Filter',
}: TableToolbarProps) {
  return (
    <div className="table-toolbar">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          viewBox="0 0 20 20"
          fill="currentColor"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="table-search-input"
          aria-label={searchPlaceholder}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="search-clear-btn"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {filterOptions && filterOptions.length > 0 && onFilterChange && (
        <div className="filter-select-wrapper">
          <label htmlFor="tableFilterSelect" className="sr-only">
            {filterLabel}
          </label>
          <select
            id="tableFilterSelect"
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="table-filter-select"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
