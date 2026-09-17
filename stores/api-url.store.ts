import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export const API_URL_STORAGE_KEY = "apiUrl";

const IP_PORT_REGEX = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
const URL_REGEX = /^https?:\/\/[^\s/]+/i;

export const normalizeApiUrl = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  if (IP_PORT_REGEX.test(trimmed)) {
    candidate = `http://${trimmed}`;
  }

  if (!URL_REGEX.test(candidate)) return null;
  return candidate.replace(/\/+$/, "");
};

type ApiUrlState = {
  isLoaded: boolean;
  apiUrl: string | null;
  initApiUrl: () => Promise<void>;
  saveApiUrl: (url: string) => Promise<void>;
  clearApiUrl: () => Promise<void>;
};

export const useApiUrlStore = create<ApiUrlState>((set) => ({
  isLoaded: false,
  apiUrl: null,

  initApiUrl: async () => {
    let stored: string | null = null;
    try {
      stored = await SecureStore.getItemAsync(API_URL_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (__DEV__) {
      console.log("[apiUrl] hydrated:", stored);
    }
    set({ isLoaded: true, apiUrl: stored || null });
  },

  saveApiUrl: async (url) => {
    const normalized = normalizeApiUrl(url);
    if (!normalized) return;
    await SecureStore.setItemAsync(API_URL_STORAGE_KEY, normalized);
    set({ apiUrl: normalized });
  },

  clearApiUrl: async () => {
    await SecureStore.deleteItemAsync(API_URL_STORAGE_KEY);
    set({ apiUrl: null });
  },
}));

export const getApiUrl = (): string | null => {
  return useApiUrlStore.getState().apiUrl;
};