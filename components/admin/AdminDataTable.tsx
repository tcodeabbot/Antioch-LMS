"use client";

import { useState, useMemo, useCallback, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  hiddenOnMobile?: boolean;
  render?: (row: T) => ReactNode;
  /** Used for sorting when render is provided. Should return a primitive. */
  getValue?: (row: T) => string | number | boolean | null | undefined;
  /** Mobile card label override. If false, excluded from card. */
  mobileLabel?: string | false;
}

interface SortState {
  key: string;
  direction: "asc" | "desc";
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchableFields?: string[];
  searchPlaceholder?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
  // Bulk selection
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  bulkActions?: ReactNode;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function AdminDataTable<T>({
  columns,
  data,
  searchableFields = [],
  searchPlaceholder = "Search...",
  defaultPageSize = 10,
  pageSizeOptions = [10, 25, 50],
  emptyIcon,
  emptyTitle = "No data",
  emptyDescription = "Nothing to display yet.",
  onRowClick,
  rowKey,
  selectable = false,
  selectedIds,
  onSelectionChange,
  bulkActions,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchableFields.some((field) => {
        const val = getNestedValue(row, field);
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchableFields]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = col.getValue
        ? col.getValue(a)
        : getNestedValue(a, sort.key);
      const bVal = col.getValue
        ? col.getValue(b)
        : getNestedValue(b, sort.key);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp: number;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  );

  const handleSort = useCallback(
    (key: string) => {
      setSort((prev) => {
        if (!prev || prev.key !== key) return { key, direction: "asc" };
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      });
    },
    []
  );

  const handlePageSizeChange = useCallback(
    (val: string) => {
      setPageSize(Number(val));
      setPage(0);
    },
    []
  );

  const allPageIds = new Set(paginated.map(rowKey));
  const allPageSelected =
    selectable &&
    selectedIds &&
    paginated.length > 0 &&
    paginated.every((row) => selectedIds.has(rowKey(row)));
  const someSelected =
    selectable &&
    selectedIds &&
    selectedIds.size > 0 &&
    paginated.some((row) => selectedIds.has(rowKey(row)));

  const toggleSelectAll = useCallback(() => {
    if (!onSelectionChange || !selectedIds) return;
    if (allPageSelected) {
      const next = new Set(selectedIds);
      paginated.forEach((row) => next.delete(rowKey(row)));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      paginated.forEach((row) => next.add(rowKey(row)));
      onSelectionChange(next);
    }
  }, [allPageSelected, paginated, selectedIds, onSelectionChange, rowKey]);

  const toggleSelect = useCallback(
    (id: string) => {
      if (!onSelectionChange || !selectedIds) return;
      const next = new Set(selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onSelectionChange(next);
    },
    [selectedIds, onSelectionChange]
  );

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (!sort || sort.key !== columnKey)
      return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />;
    return sort.direction === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-foreground" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-foreground" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {searchableFields.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {/* Bulk action bar */}
      {selectable && selectedIds && selectedIds.size > 0 && bulkActions && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {bulkActions}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange?.(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          {emptyIcon && <div className="mb-4 flex justify-center">{emptyIcon}</div>}
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {search ? "No results found" : emptyTitle}
          </h3>
          <p className="text-muted-foreground">
            {search
              ? `No matches for "${search}". Try a different search.`
              : emptyDescription}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {selectable && (
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={allPageSelected ?? false}
                          ref={(el) => {
                            if (el) el.indeterminate = !!(someSelected && !allPageSelected);
                          }}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-border"
                        />
                      </th>
                    )}
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={cn(
                          "px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                          col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors"
                        )}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {col.sortable && <SortIcon columnKey={col.key} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((row) => {
                    const id = rowKey(row);
                    const isSelected = selectable && selectedIds?.has(id);
                    return (
                      <tr
                        key={id}
                        className={cn(
                          "transition-colors",
                          onRowClick && "cursor-pointer",
                          isSelected
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => onRowClick?.(row)}
                      >
                        {selectable && (
                          <td
                            className="px-4 py-4 w-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected ?? false}
                              onChange={() => toggleSelect(id)}
                              className="h-4 w-4 rounded border-border"
                            />
                          </td>
                        )}
                        {columns.map((col) => (
                          <td key={col.key} className="px-6 py-4">
                            {col.render
                              ? col.render(row)
                              : (getNestedValue(row, col.key) ?? "—")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {paginated.map((row) => {
              const id = rowKey(row);
              const isSelected = selectable && selectedIds?.has(id);
              return (
                <div
                  key={id}
                  className={cn(
                    "bg-card border border-border rounded-lg p-4 transition-colors",
                    onRowClick && "cursor-pointer active:bg-muted/50",
                    isSelected && "border-primary/40 bg-primary/5"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <div
                      className="flex justify-end mb-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected ?? false}
                        onChange={() => toggleSelect(id)}
                        className="h-4 w-4 rounded border-border"
                      />
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {columns
                      .filter((col) => col.mobileLabel !== false)
                      .map((col) => (
                        <div key={col.key} className="flex items-start justify-between gap-4">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                            {col.mobileLabel ?? col.label}
                          </span>
                          <div className="text-sm text-right">
                            {col.render
                              ? col.render(row)
                              : (getNestedValue(row, col.key) ?? "—")}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Showing {safePage * pageSize + 1}–
              {Math.min((safePage + 1) * pageSize, sorted.length)} of{" "}
              {sorted.length}
              {search && ` (filtered from ${data.length})`}
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger size="sm" className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2 min-w-[80px] text-center">
                  {safePage + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
