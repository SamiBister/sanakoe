'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { WordItem } from '@/lib/types';
import { nanoid } from 'nanoid';
import { useTranslations } from 'next-intl';
import React, { ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';

export interface ManualEntryTableProps {
  onWordsLoaded: (words: WordItem[]) => void;
  className?: string;
}

interface TableRow {
  id: string;
  prompt: string;
  answer: string;
}

const INITIAL_ROW_COUNT = 10;
const STORAGE_KEY = 'sanakoe_manual_entry';

/**
 * ManualEntryTable Component
 *
 * Allows users to manually enter vocabulary words in a two-column table.
 * Features:
 * - Starts with 10 empty rows
 * - Auto-expands when typing in the last row
 * - Keyboard navigation (Tab, Shift+Tab, Enter)
 * - Validates that both cells are filled
 * - Clear All button with confirmation
 * - localStorage persistence
 * - Tab-separated paste support
 */
export const ManualEntryTable = React.forwardRef<HTMLDivElement, ManualEntryTableProps>(
  ({ onWordsLoaded, className = '' }, ref) => {
    const t = useTranslations('manual');
    const tCommon = useTranslations('common');
    const [rows, setRows] = useState<TableRow[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
    const isInitialMount = useRef(true);
    const isClearing = useRef(false);

    // Initialize rows from localStorage or create empty rows
    useEffect(() => {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRows(parsed);
            return;
          }
        } catch (error) {
          console.error('Failed to parse saved table data:', error);
        }
      }

      // Create initial empty rows
      setRows(createEmptyRows(INITIAL_ROW_COUNT));
    }, []);

    // Save to localStorage whenever rows change (except initial mount and clearing)
    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (isClearing.current) {
        isClearing.current = false;
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    }, [rows]);

    // Update parent with valid words whenever rows change
    useEffect(() => {
      const validWords = getValidWords();
      onWordsLoaded(validWords);
    }, [rows, onWordsLoaded]);

    /**
     * Create empty rows with unique IDs
     */
    const createEmptyRows = (count: number): TableRow[] => {
      return Array.from({ length: count }, () => ({
        id: nanoid(),
        prompt: '',
        answer: '',
      }));
    };

    /**
     * Get valid words (both cells filled)
     */
    const getValidWords = (): WordItem[] => {
      return rows
        .filter((row) => row.prompt.trim() !== '' && row.answer.trim() !== '')
        .map((row) => ({
          id: row.id,
          prompt: row.prompt.trim(),
          answer: row.answer.trim(),
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        }));
    };

    /**
     * Get valid row count
     */
    const validRowCount = getValidWords().length;

    /**
     * Update a specific cell value
     */
    const updateCell = (rowId: string, field: 'prompt' | 'answer', value: string) => {
      setRows((prevRows) => {
        const updatedRows = prevRows.map((row) =>
          row.id === rowId ? { ...row, [field]: value } : row,
        );

        // Check if we need to add a new row
        const lastRow = updatedRows[updatedRows.length - 1];
        const isLastRowFilled = lastRow.prompt.trim() !== '' || lastRow.answer.trim() !== '';

        if (isLastRowFilled) {
          return [...updatedRows, ...createEmptyRows(1)];
        }

        return updatedRows;
      });
    };

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = (
      e: KeyboardEvent<HTMLInputElement>,
      rowIndex: number,
      field: 'prompt' | 'answer',
    ) => {
      const rowId = rows[rowIndex].id;

      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();

        let nextRowIndex = rowIndex;
        let nextField = field;

        if (e.shiftKey && e.key === 'Tab') {
          // Shift+Tab: move backward
          if (field === 'answer') {
            nextField = 'prompt';
          } else if (rowIndex > 0) {
            nextRowIndex = rowIndex - 1;
            nextField = 'answer';
          } else {
            // Already at first cell
            return;
          }
        } else {
          // Tab or Enter: move forward
          if (field === 'prompt') {
            nextField = 'answer';
          } else if (rowIndex < rows.length - 1) {
            nextRowIndex = rowIndex + 1;
            nextField = 'prompt';
          } else {
            // Last cell - add new row and move focus
            const newRow = createEmptyRows(1)[0];
            setRows((prev) => [...prev, newRow]);

            // Focus will be set after state update
            setTimeout(() => {
              const nextKey = `${newRow.id}-prompt`;
              const nextInput = inputRefs.current.get(nextKey);
              nextInput?.focus();
            }, 0);
            return;
          }
        }

        const nextRowId = rows[nextRowIndex].id;
        const nextKey = `${nextRowId}-${nextField}`;
        const nextInput = inputRefs.current.get(nextKey);
        nextInput?.focus();
      }
    };

    /**
     * Handle paste event (supports tab-separated values)
     */
    const handlePaste = (
      e: ClipboardEvent<HTMLInputElement>,
      rowIndex: number,
      field: 'prompt' | 'answer',
    ) => {
      const pastedText = e.clipboardData.getData('text');

      // Check if paste contains tabs (tab-separated values)
      if (pastedText.includes('\t') || pastedText.includes('\n')) {
        e.preventDefault();

        // Parse tab-separated or newline-separated data
        const lines = pastedText.split('\n').filter((line) => line.trim() !== '');
        const parsedRows: Array<{ prompt: string; answer: string }> = [];

        lines.forEach((line) => {
          const parts = line.split('\t');
          if (parts.length >= 2) {
            parsedRows.push({
              prompt: parts[0].trim(),
              answer: parts[1].trim(),
            });
          } else if (parts.length === 1 && parts[0].trim() !== '') {
            // Single value - put in current cell and let user continue normally
            // This is handled by default paste behavior, so we'll skip it
          }
        });

        if (parsedRows.length > 0) {
          setRows((prevRows) => {
            const newRows = [...prevRows];

            // Start from current row
            parsedRows.forEach((parsed, index) => {
              const targetIndex = rowIndex + index;

              if (targetIndex < newRows.length) {
                // Update existing row
                newRows[targetIndex] = {
                  id: newRows[targetIndex].id,
                  prompt: parsed.prompt,
                  answer: parsed.answer,
                };
              } else {
                // Add new row
                newRows.push({
                  id: nanoid(),
                  prompt: parsed.prompt,
                  answer: parsed.answer,
                });
              }
            });

            // Ensure we have at least one empty row at the end
            const lastRow = newRows[newRows.length - 1];
            if (lastRow.prompt.trim() !== '' || lastRow.answer.trim() !== '') {
              newRows.push(...createEmptyRows(1));
            }

            return newRows;
          });

          // Focus the cell after the pasted content
          setTimeout(() => {
            const lastPastedRowIndex = rowIndex + parsedRows.length;
            if (lastPastedRowIndex < rows.length) {
              const nextRowId = rows[lastPastedRowIndex].id;
              const nextKey = `${nextRowId}-prompt`;
              const nextInput = inputRefs.current.get(nextKey);
              nextInput?.focus();
            }
          }, 0);
        }
      }
    };

    /**
     * Clear all rows with confirmation
     */
    const handleClearAll = () => {
      setShowConfirmation(true);
    };

    const confirmClearAll = () => {
      setShowConfirmation(false);

      // Remove from localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Set flag to prevent useEffect from saving empty rows
      isClearing.current = true;

      // Clear rows
      setRows(createEmptyRows(INITIAL_ROW_COUNT));

      // Focus first cell after clearing
      setTimeout(() => {
        const firstInput = inputRefs.current.values().next().value;
        firstInput?.focus();
      }, 0);
    };

    const cancelClearAll = () => {
      setShowConfirmation(false);
    };

    return (
      <div ref={ref} className={`space-y-4 ${className}`}>
        {/* Header with valid row count */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-gray-600">
            {t('validCount', { count: validRowCount })}
          </div>
          <Button
            variant="danger"
            onClick={handleClearAll}
            disabled={rows.every((row) => row.prompt === '' && row.answer === '')}
            aria-label={t('clearAll')}
          >
            {t('clearAll')}
          </Button>
        </div>

        {/* Mobile: stacked card layout */}
        <div className="sm:hidden space-y-2">
          {rows.map((row, index) => (
            <div key={row.id} className="flex gap-2 items-center bg-gray-50 rounded-xl p-2">
              <span className="text-xs text-gray-400 w-5 shrink-0 text-center">{index + 1}</span>
              <input
                ref={(el) => {
                  if (el) inputRefs.current.set(`${row.id}-prompt`, el);
                  else inputRefs.current.delete(`${row.id}-prompt`);
                }}
                type="text"
                value={row.prompt}
                onChange={(e) => updateCell(row.id, 'prompt', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index, 'prompt')}
                onPaste={(e) => handlePaste(e, index, 'prompt')}
                className="flex-1 min-w-0 px-3 py-2 min-h-[44px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={index === 0 ? t('headerWord') : ''}
                aria-label={`${t('headerWord')} ${index + 1}`}
              />
              <span className="text-gray-400 shrink-0">→</span>
              <input
                ref={(el) => {
                  if (el) inputRefs.current.set(`${row.id}-answer`, el);
                  else inputRefs.current.delete(`${row.id}-answer`);
                }}
                type="text"
                value={row.answer}
                onChange={(e) => updateCell(row.id, 'answer', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index, 'answer')}
                onPaste={(e) => handlePaste(e, index, 'answer')}
                className="flex-1 min-w-0 px-3 py-2 min-h-[44px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={index === 0 ? t('headerTranslation') : ''}
                aria-label={`${t('headerTranslation')} ${index + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse min-w-[400px]">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 text-sm sm:text-base">
                  {t('headerWord')}
                </th>
                <th className="p-2 sm:p-3 text-left font-semibold text-gray-700 text-sm sm:text-base">
                  {t('headerTranslation')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-1.5 sm:p-2">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(`${row.id}-prompt`, el);
                        else inputRefs.current.delete(`${row.id}-prompt`);
                      }}
                      type="text"
                      value={row.prompt}
                      onChange={(e) => updateCell(row.id, 'prompt', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'prompt')}
                      onPaste={(e) => handlePaste(e, index, 'prompt')}
                      className="w-full px-2 sm:px-3 py-2 min-h-[44px] text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={index === 0 ? t('headerWord') : ''}
                      aria-label={`${t('headerWord')} ${index + 1}`}
                    />
                  </td>
                  <td className="p-1.5 sm:p-2">
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(`${row.id}-answer`, el);
                        else inputRefs.current.delete(`${row.id}-answer`);
                      }}
                      type="text"
                      value={row.answer}
                      onChange={(e) => updateCell(row.id, 'answer', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'answer')}
                      onPaste={(e) => handlePaste(e, index, 'answer')}
                      className="w-full px-2 sm:px-3 py-2 min-h-[44px] text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={index === 0 ? t('headerTranslation') : ''}
                      aria-label={`${t('headerTranslation')} ${index + 1}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Keyboard hints */}
        <div className="text-xs text-gray-500 italic">
          <p>{t('instructions')}</p>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={cancelClearAll}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <Card className="max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <h3 id="confirm-dialog-title" className="text-xl font-bold text-gray-800">
                  {t('clearConfirm')}
                </h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-6">
                  {t('clearConfirm')}
                </p>
                <div className="flex gap-3 justify-end">
                  <Button variant="secondary" onClick={cancelClearAll}>
                    {tCommon('cancel')}
                  </Button>
                  <Button variant="danger" onClick={confirmClearAll}>
                    {t('clearAll')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    );
  },
);

ManualEntryTable.displayName = 'ManualEntryTable';
