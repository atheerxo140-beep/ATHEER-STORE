'use client';

import { useState, useEffect } from 'react';
import { HomepageContent } from '@/types';
import { defaultHomepageContent } from '@/data/defaultHomepageContent';

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

    // Initial fetch once
    fetch('/api/homepage-content')
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

  return { content, loading };
}
