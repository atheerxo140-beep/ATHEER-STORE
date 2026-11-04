'use client';

import { useState, useEffect } from 'react';
import { StoreSettings } from '@/types';
import { defaultStoreSettings } from '@/data/defaultStoreSettings';

let cachedSettings: StoreSettings = { ...defaultStoreSettings };
const listeners = new Set<(s: StoreSettings) => void>();

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listener = (newSettings: StoreSettings) => {
      setSettings(newSettings);
    };
    listeners.add(listener);

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          cachedSettings = { ...cachedSettings, ...data.settings };
          listeners.forEach((l) => l(cachedSettings));
        }
      })
      .catch((err) => {
        console.warn('Failed to load store settings:', err);
      });

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { settings, loading };
}
