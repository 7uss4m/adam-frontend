// components/PaginationBar.tsx
import { Button } from "../components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select"

export interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

type Props = {
  pagination: Pagination
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  isLoading?: boolean
  pageSizeOptions?: number[]
  className?: string
}

export default function PaginationBar({
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeOptions = [5, 10, 20, 30, 50, 100],
  className,
}: Props) {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination

  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages && totalPages > 0

  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 ${className ?? ""}`}>
      {/* Left: range */}
      <div className="text-sm opacity-80">
        {totalItems > 0
          ? <>Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{totalItems}</strong></>
          : "No results"}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm">Rows:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(v) => onPageSizeChange?.(Number(v))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[88px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="hidden sm:block text-sm">
          Page <strong>{Math.max(1, Math.min(currentPage, Math.max(1, totalPages)))}</strong> / <strong>{Math.max(1, totalPages)}</strong>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canPrev || isLoading}
        >
          « First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev || isLoading}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext || isLoading}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNext || isLoading}
        >
          Last »
        </Button>
      </div>
    </div>
  )
}
