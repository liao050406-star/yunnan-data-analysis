/**
 * 自定义 React Hooks - 封装 API 调用与状态管理
 */

import { useState, useEffect, useCallback } from 'react';
import {
  filingApi, submissionApi, analyticsApi,
  cyclesApi, policyApi, complianceApi,
  gridsApi, auditLogsApi, feedbackApi, adminFilingApi,
} from '../api/client';

// ─── Generic useFetch hook ────────────────────────────────────────────────────
function useFetch<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

// ─── Enterprise Filing hooks ──────────────────────────────────────────────────
export function useMyFiling() {
  return useFetch(() => filingApi.getMyFiling().then(r => r.filing));
}

export function useCurrentSubmission() {
  return useFetch(() => submissionApi.getCurrent());
}

export function useMySubmissions() {
  return useFetch(() => submissionApi.getMy().then(r => r.submissions));
}

// ─── Admin hooks ──────────────────────────────────────────────────────────────
export function useAdminFilings(params?: { status?: string; keyword?: string; page?: number }) {
  return useFetch(
    () => adminFilingApi.list(params),
    [params?.status, params?.keyword, params?.page]
  );
}

// ─── Analytics hooks ──────────────────────────────────────────────────────────
export function useAnalyticsOverview() {
  return useFetch(() => analyticsApi.overview());
}

export function useAnalyticsTrend() {
  return useFetch(() => analyticsApi.trend().then(r => r.trend));
}

export function useAnalyticsByIndustry() {
  return useFetch(() => analyticsApi.byIndustry().then(r => r.distribution));
}

export function useAnalyticsByRegion() {
  return useFetch(() => analyticsApi.byRegion().then((r) => r.regions));
}

// ─── Survey Cycles ────────────────────────────────────────────────────────────
export function useSurveyCycles() {
  return useFetch(() => cyclesApi.list().then(r => r.cycles));
}

// ─── Policy Library ───────────────────────────────────────────────────────────
export function usePolicies(keyword?: string, category?: string) {
  return useFetch(
    () => policyApi.list({ keyword, category }).then(r => r.policies),
    [keyword, category]
  );
}

// ─── Compliance ───────────────────────────────────────────────────────────────
export function useComplianceCheck() {
  return useFetch(() => complianceApi.check());
}

// ─── Regional Grids ───────────────────────────────────────────────────────────
export function useGrids() {
  return useFetch(() => gridsApi.list().then(r => r.grids));
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export function useAuditLogs(page = 1) {
  return useFetch(() => auditLogsApi.list(page), [page]);
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export function useMyFeedback() {
  return useFetch(() => feedbackApi.getMy().then(r => r.tickets));
}

// ─── Mutation helper ──────────────────────────────────────────────────────────
export function useMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const mutate = useCallback(async (args: TArgs) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mutationFn(args);
      setData(result);
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn]);

  return { mutate, isLoading, error, data };
}
