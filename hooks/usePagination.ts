"use client";

import { useState, useMemo } from "react";

interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  totalItems?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    defaultPage = 1,
    defaultPageSize = 20,
    totalItems = 0,
  } = options;

  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
  );

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const reset = () => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
  };

  return {
    page,
    pageSize,
    totalPages,
    totalItems,
    setPage,
    setPageSize,
    goToPage,
    nextPage,
    previousPage,
    reset,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
