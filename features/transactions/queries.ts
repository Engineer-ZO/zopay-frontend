"use client";

import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "./api";
import { TransactionFilters } from "./types";

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionsApi.list(filters),
  });
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => (id ? transactionsApi.getById(id) : null),
    enabled: !!id,
  });
}
