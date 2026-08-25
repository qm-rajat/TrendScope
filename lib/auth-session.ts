'use client';

import { useSyncExternalStore } from 'react';

export const CODE_ADVANCE_PANEL = '7492';
export const CODE_HASHTAG_SEARCH = '7491';

export const MASTER_ACTIVATION_CODE = CODE_ADVANCE_PANEL;
export const HASHTAG_SEARCH_CODE = CODE_HASHTAG_SEARCH;

export const SESSION_STORAGE_KEY = 'trendscope_active_portal_session';

export type PortalSessionType = 'advance_7492' | 'hashtags_7491' | null;

export function getActiveSession(): PortalSessionType {
  if (typeof window === 'undefined') return null;
  try {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    if (session === 'advance_7492' || session === 'hashtags_7491') {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export function subscribeToSession(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('trendscope_session_change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('trendscope_session_change', callback);
    window.removeEventListener('storage', callback);
  };
}

export function usePortalSession(): PortalSessionType {
  return useSyncExternalStore<PortalSessionType>(
    subscribeToSession,
    getActiveSession,
    () => null
  );
}

export function setActiveSession(sessionType: 'advance_7492' | 'hashtags_7491'): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionType);
    window.dispatchEvent(new Event('trendscope_session_change'));
  } catch {}
}

export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event('trendscope_session_change'));
  } catch {}
}
