'use client';

import { useEffect } from 'react';

export default function DarkModeScript() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (
        saved === 'dark' ||
        (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
