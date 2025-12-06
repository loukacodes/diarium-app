import { useState, useCallback } from 'react';
import API_URL from '@/config/api';
import type { Entry } from '@/types';

export function useEntries(token: string | null) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!token) return;

    setIsLoadingEntries(true);
    try {
      const response = await fetch(`${API_URL}/api/entries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Fetch entries error:', error);
      alert('Failed to load entries. Please try again.');
    } finally {
      setIsLoadingEntries(false);
    }
  }, [token]);

  const fetchEntryDetail = useCallback(
    async (entryId: string) => {
      if (!entryId || !token) return;

      try {
        const response = await fetch(`${API_URL}/api/entries/${entryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch entry');
        }

        const data = await response.json();
        setSelectedEntry(data);
      } catch (error) {
        console.error('Fetch entry detail error:', error);
        alert('Failed to load entry. Please try again.');
        setSelectedEntry(null);
      }
    },
    [token],
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      try {
        const response = await fetch(`${API_URL}/api/entries/${entryId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete entry');
        }

        setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryId));
      } catch (error) {
        console.error('Delete entry error:', error);
        alert('Failed to delete entry. Please try again.');
        throw error;
      }
    },
    [token],
  );

  return {
    entries,
    isLoadingEntries,
    selectedEntry,
    setSelectedEntry,
    fetchEntries,
    fetchEntryDetail,
    deleteEntry,
    setEntries,
  };
}

