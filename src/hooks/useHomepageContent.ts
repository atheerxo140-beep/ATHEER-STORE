'use client';

import { useState, useEffect } from 'react';
import { HomepageContent } from '@/types';
import { defaultHomepageContent } from '@/data/defaultHomepageContent';
import { adminFetch } from '@/lib/adminAuthClient';

let cachedContent: HomepageContent = { ...defaultHomepageContent };
const listeners = new Set<(c: HomepageContent) => void>();

export function useHomepageContent() {
  const [content, setContent] = useState<HomepageContent>(cachedContent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listener = (newContent: HomepageContent) => {
      setContent(newContent);
    };
    listeners.add(listener);

    // Initial fetch without stale cache
    fetch('/api/homepage-content', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content) {
          cachedContent = data.content;
          listeners.forEach((l) => l(data.content));
        }
      })
      .catch((err) => {
        console.warn('Failed to load dynamic homepage content:', err);
      });

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateContent = async (updates: Partial<HomepageContent>) => {
    try {
      const res = await adminFetch('/api/admin/homepage-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.content) {
        cachedContent = data.content;
        listeners.forEach((l) => l(data.content));
        return data.content;
      }
    } catch (err) {
      console.error('Failed to update homepage content:', err);
    }
    return null;
  };

  return { content, loading, updateContent };
}
