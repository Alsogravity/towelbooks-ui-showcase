import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

export type UseUrlSearchOptions = {
  paramName?: string;
  debounceMs?: number;
  resetParams?: ReadonlyArray<string>;
};

export type UseUrlSearchResult = {
  /** Trimmed query currently encoded in the URL — feed this into queryKey/queryFn. */
  submittedQuery: string;
  /** Current draft value to bind to a controlled input. */
  draft: string;
  /** Controlled onChange handler. Empty values commit immediately, others debounce. */
  setDraft: (value: string) => void;
  /** Force-commit the current draft to the URL right now, bypassing the debounce. */
  submit: () => void;
  /** Clear both draft and the URL parameter immediately. */
  clear: () => void;
};

function readParam(searchParams: URLSearchParams, paramName: string): string {
  return (searchParams.get(paramName) ?? '').trim();
}

/**
 * URL-backed search state with debounced commits, immediate clear, pagination
 * reset, and resilience to external URL changes (back/forward, links).
 *
 * The hook is intentionally UI-agnostic — bind `draft` and `setDraft` to any
 * controlled input. Loading and result rendering remain the caller's concern
 * (typically a `useQuery` keyed on `submittedQuery`).
 */
export function useUrlSearch(
  options: UseUrlSearchOptions = {},
): UseUrlSearchResult {
  const { paramName = 'q', debounceMs = 500, resetParams } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  const submittedQuery = readParam(searchParams, paramName);

  const [draft, setDraftState] = useState(submittedQuery);

  const resetParamsKey = useMemo(
    () => (resetParams ?? []).join('|'),
    [resetParams],
  );
  const stableResetParams = useMemo(
    () => Object.freeze([...(resetParams ?? [])]),
    // We re-derive only when the joined key changes, keeping the array
    // identity stable across renders so dependents don't churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resetParamsKey],
  );

  // Track the most recent value we ourselves wrote to the URL so we can tell
  // an external URL change (back/forward, link click) apart from our own
  // debounced commit. External changes adopt into the draft; our own commits
  // are no-ops here because the draft already matches.
  const lastWrittenRef = useRef(submittedQuery);

  useEffect(() => {
    if (submittedQuery !== lastWrittenRef.current) {
      lastWrittenRef.current = submittedQuery;
      setDraftState(submittedQuery);
    }
  }, [submittedQuery]);

  const commit = useCallback(
    (nextValue: string) => {
      const normalized = nextValue.trim();
      lastWrittenRef.current = normalized;

      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);

          if (normalized.length > 0) {
            nextParams.set(paramName, normalized);
          } else {
            nextParams.delete(paramName);
          }

          for (const resetParam of stableResetParams) {
            nextParams.delete(resetParam);
          }

          return nextParams;
        },
        // We intentionally do not pass { replace: true } so the user can
        // navigate back through searches; callers that want replace semantics
        // can wrap this hook.
      );
    },
    [paramName, setSearchParams, stableResetParams],
  );

  // Debounced URL sync. Empty drafts commit immediately so clearing the input
  // feels instantaneous; non-empty drafts wait for the user to pause typing.
  useEffect(() => {
    const normalized = draft.trim();

    if (normalized === submittedQuery) {
      return;
    }

    if (normalized.length === 0) {
      commit('');
      return;
    }

    const timeoutId = window.setTimeout(() => {
      commit(normalized);
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [commit, debounceMs, draft, submittedQuery]);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
  }, []);

  const submit = useCallback(() => {
    commit(draft);
  }, [commit, draft]);

  const clear = useCallback(() => {
    setDraftState('');
    commit('');
  }, [commit]);

  return { clear, draft, setDraft, submit, submittedQuery };
}
