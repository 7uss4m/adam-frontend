import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Note } from "../types/types";
import getUserNotes from "../api/getUserNotes";

export default function usePaymentsFetch() {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const filter = params.get("filter") || "all";
  const pageFromUrl = Number(params.get("page") || 1);

  const token = localStorage.getItem("token");

  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [notes, setNotes] = useState<Note[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // keep state in sync with URL page
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["user-notes", filter, currentPage],
    queryFn: async () => {
      if (!token) throw new Error("No authentication token");
      const res = await getUserNotes(token, currentPage.toString(), filter);
      return res.data.result as { notes: Note[]; totalPages: number };
    },
    retry: 2,
     placeholderData: (prev) => prev,
  });

  // reset when filter changes
  useEffect(() => {
    setNotes([]);
    setHasMore(true);
  }, [filter]);

  // merge results
  useEffect(() => {
    if (!data?.notes) return;

    setNotes((prev) => {
      const existing = new Set(prev.map((n) => n.id));
      const fresh = data.notes.filter((n) => !existing.has(n.id));
      return currentPage === 1 ? data.notes : [...prev, ...fresh];
    });

    setHasMore(currentPage < data.totalPages);
  }, [data, currentPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isFetching) return;
    setCurrentPage((prev) => prev + 1);
  }, [hasMore, isLoading, isFetching]);

  return {
    notes,
    hasMore,
    loading: isLoading || isFetching,
    error,
    currentPage,
    setCurrentPage,
    loadMore,
    filter,
  };
}
