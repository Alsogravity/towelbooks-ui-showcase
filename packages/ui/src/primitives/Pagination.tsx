import { type ChangeEvent, type ReactNode } from 'react';

import { classNames } from '../className';
import { Select } from './Field';
import { Icon } from './Icon';

export type PaginationItem = number | 'ellipsis';

export interface PaginationProps {
  className?: string;
  currentPageLabel?: (page: number) => string;
  navLabel?: string;
  nextLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  page: number;
  pageLabel?: (page: number) => string;
  pageSize?: number;
  pageSizeLabel?: ReactNode;
  pageSizeOptions?: readonly number[];
  pageSizeSelectLabel?: string;
  previousLabel?: string;
  showPageSizeSelector?: boolean;
  siblingCount?: number;
  totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_SIBLING_COUNT = 1;

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(page), 1), Math.max(totalPages, 1));
}

function visiblePageNumbers(
  page: number,
  totalPages: number,
  siblingCount: number,
) {
  const currentPage = clampPage(page, totalPages);
  const pageCount = Math.max(Math.trunc(totalPages), 0);
  const siblings = Math.max(Math.trunc(siblingCount), 0);

  if (pageCount <= 0) {
    return [];
  }

  const expandedWindow = 2 * siblings + 3;
  const maxBeforeTruncation = expandedWindow + 2;

  if (pageCount <= maxBeforeTruncation) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount]);
  const nearStart = currentPage <= siblings + 3;
  const nearEnd = currentPage >= pageCount - siblings - 2;

  if (nearStart) {
    for (let pageNumber = 2; pageNumber <= expandedWindow; pageNumber += 1) {
      pages.add(pageNumber);
    }
  } else if (nearEnd) {
    for (
      let pageNumber = pageCount - expandedWindow + 1;
      pageNumber < pageCount;
      pageNumber += 1
    ) {
      pages.add(pageNumber);
    }
  } else {
    for (
      let pageNumber = currentPage - siblings;
      pageNumber <= currentPage + siblings;
      pageNumber += 1
    ) {
      pages.add(pageNumber);
    }
  }

  return [...pages]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= pageCount)
    .sort((first, second) => first - second);
}

export function paginationItems(
  page: number,
  totalPages: number,
  siblingCount: number = DEFAULT_SIBLING_COUNT,
): PaginationItem[] {
  const pages = visiblePageNumbers(page, totalPages, siblingCount);
  const items: PaginationItem[] = [];

  pages.forEach((pageNumber, index) => {
    const previousPage = pages[index - 1];

    if (previousPage !== undefined && pageNumber - previousPage > 1) {
      items.push('ellipsis');
    }

    items.push(pageNumber);
  });

  return items;
}

export function Pagination({
  className = '',
  currentPageLabel = (pageNumber) => `Page ${pageNumber}, current page`,
  navLabel = 'Pagination',
  nextLabel = 'Next page',
  onPageChange,
  onPageSizeChange,
  page,
  pageLabel = (pageNumber) => `Go to page ${pageNumber}`,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeLabel = 'Rows per page',
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  pageSizeSelectLabel = 'Rows per page',
  previousLabel = 'Previous page',
  showPageSizeSelector = false,
  siblingCount = DEFAULT_SIBLING_COUNT,
  totalPages,
}: PaginationProps) {
  const pageCount = Math.max(Math.trunc(totalPages), 0);
  const currentPage = clampPage(page, pageCount);
  const canGoPrevious = pageCount > 0 && currentPage > 1;
  const canGoNext = pageCount > 0 && currentPage < pageCount;
  const items = paginationItems(currentPage, pageCount, siblingCount);
  const shouldRenderPageSizeSelector =
    showPageSizeSelector === true && onPageSizeChange !== undefined;

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange?.(Number(event.currentTarget.value));
  };

  return (
    <div className={classNames('vui-pagination', className)}>
      <nav className="vui-pagination__nav" aria-label={navLabel}>
        <button
          type="button"
          className="vui-pagination__control"
          aria-label={previousLabel}
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <Icon name="chevron-left" size={18} />
        </button>

        <ol className="vui-pagination__list">
          {items.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <li
                  key={`ellipsis-${index}`}
                  className="vui-pagination__list-item"
                >
                  <span className="vui-pagination__ellipsis" aria-hidden="true">
                    ...
                  </span>
                </li>
              );
            }

            const isCurrent = item === currentPage;

            return (
              <li key={item} className="vui-pagination__list-item">
                <button
                  type="button"
                  className="vui-pagination__page"
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={
                    isCurrent ? currentPageLabel(item) : pageLabel(item)
                  }
                  data-current={isCurrent || undefined}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </button>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          className="vui-pagination__control"
          aria-label={nextLabel}
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </nav>

      {shouldRenderPageSizeSelector ? (
        <label className="vui-pagination__page-size">
          <span className="vui-pagination__page-size-label">
            {pageSizeLabel}
          </span>
          <Select
            className="vui-pagination__page-size-select"
            aria-label={pageSizeSelectLabel}
            value={String(pageSize)}
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </label>
      ) : null}
    </div>
  );
}
