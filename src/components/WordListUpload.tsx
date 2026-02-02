'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { CSVParseError, parseCSV } from '@/lib/csv-parser';
import type { WordItem } from '@/lib/types';
import React, { useRef, useState } from 'react';

export interface WordListUploadProps {
  /**
   * Callback when words are successfully parsed
   */
  onWordsLoaded: (words: WordItem[]) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

interface UploadState {
  status: 'idle' | 'loading' | 'success' | 'error';
  words: WordItem[];
  error: string | null;
  fileName: string | null;
}

/**
 * CSV Upload Component - Allows users to upload vocabulary word lists
 *
 * Features:
 * - File input with button click
 * - Drag-and-drop support
 * - CSV and TXT file validation
 * - FileReader API integration
 * - CSV parsing with error handling
 * - Word preview (first 5 words)
 * - Total word count display
 * - Loading spinner
 * - Success feedback
 * - User-friendly error messages
 *
 * @example
 * ```tsx
 * <WordListUpload onWordsLoaded={(words) => quizStore.loadWords(words)} />
 * ```
 */
export const WordListUpload = React.forwardRef<HTMLDivElement, WordListUploadProps>(
  ({ onWordsLoaded, className = '' }, ref) => {
    const [uploadState, setUploadState] = useState<UploadState>({
      status: 'idle',
      words: [],
      error: null,
      fileName: null,
    });
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Validate file type (.csv, .txt)
     */
    const validateFileType = (file: File): boolean => {
      const validExtensions = ['.csv', '.txt'];
      const fileName = file.name.toLowerCase();
      return validExtensions.some((ext) => fileName.endsWith(ext));
    };

    /**
     * Process uploaded file
     */
    const processFile = async (file: File) => {
      // Start loading
      setUploadState({
        status: 'loading',
        words: [],
        error: null,
        fileName: file.name,
      });

      try {
        // Read file content using FileReader API
        const content = await readFileContent(file);

        // Parse CSV content
        const words = parseCSV(content);

        // Check if any words were parsed
        if (words.length === 0) {
          setUploadState({
            status: 'error',
            words: [],
            error: 'No valid word pairs found in the file.',
            fileName: file.name,
          });
          return;
        }

        // Success!
        setUploadState({
          status: 'success',
          words,
          error: null,
          fileName: file.name,
        });

        // Notify parent component
        onWordsLoaded(words);
      } catch (error) {
        let errorMessage = 'Failed to parse file. Please check the format.';

        if (error instanceof CSVParseError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setUploadState({
          status: 'error',
          words: [],
          error: errorMessage,
          fileName: file.name,
        });
      }
    };

    /**
     * Read file content as text
     */
    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result;
          if (typeof content === 'string') {
            resolve(content);
          } else {
            reject(new Error('Failed to read file as text'));
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
      });
    };

    /**
     * Handle file input change
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type first
        if (!validateFileType(file)) {
          setUploadState({
            status: 'error',
            words: [],
            error: 'Please upload a CSV or TXT file',
            fileName: file.name,
          });
          return;
        }
        processFile(file);
      }
    };

    /**
     * Handle drag enter
     */
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    /**
     * Handle drag leave
     */
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    /**
     * Handle drag over
     */
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    /**
     * Handle drop
     */
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        // Validate file type first
        if (!validateFileType(file)) {
          setUploadState({
            status: 'error',
            words: [],
            error: 'Please upload a CSV or TXT file',
            fileName: file.name,
          });
          return;
        }
        processFile(file);
      }
    };

    /**
     * Trigger file input click
     */
    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    /**
     * Reset upload state
     */
    const handleReset = () => {
      setUploadState({
        status: 'idle',
        words: [],
        error: null,
        fileName: null,
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const { status, words, error, fileName } = uploadState;

    return (
      <div ref={ref} className={className}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload CSV file"
        />

        {/* Upload area - show when idle or loading */}
        {(status === 'idle' || status === 'loading') && (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              border-4 border-dashed rounded-2xl p-8 text-center transition-all
              ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50'}
            `}
          >
            {/* Icon */}
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            {/* Instructions */}
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your CSV file here
            </p>
            <p className="text-base text-gray-500 mb-4">or</p>

            {/* Upload button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleButtonClick}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Loading...' : 'Choose File'}
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              Supported formats: CSV, TXT (comma or semicolon separated)
            </p>
          </div>
        )}

        {/* Loading state */}
        {status === 'loading' && fileName && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                <span className="text-lg">Parsing {fileName}...</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Error state */}
        {status === 'error' && error && (
          <Card variant="outlined" className="border-danger-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 text-danger-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-danger-600">Upload Failed</h3>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-base text-gray-700 mb-4">{error}</p>
              <Button variant="secondary" onClick={handleReset}>
                Try Again
              </Button>
            </CardBody>
          </Card>
        )}

        {/* Success state with preview */}
        {status === 'success' && words.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 text-success-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-success-600">Upload Successful!</h3>
              </div>
            </CardHeader>
            <CardBody>
              {/* Word count */}
              <p className="text-lg font-medium text-gray-700 mb-4">
                Loaded <span className="text-primary-600 font-bold">{words.length}</span>{' '}
                {words.length === 1 ? 'word' : 'words'}
              </p>

              {/* Preview (first 5 words) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-base font-medium text-gray-700 mb-3">Preview:</h4>
                <div className="space-y-2">
                  {words.slice(0, 5).map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between bg-white rounded px-3 py-2 text-base"
                    >
                      <span className="font-medium text-gray-800">{word.prompt}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className="text-gray-600">{word.answer}</span>
                    </div>
                  ))}
                  {words.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      ...and {words.length - 5} more {words.length - 5 === 1 ? 'word' : 'words'}
                    </p>
                  )}
                </div>
              </div>

              {/* Upload another button */}
              <div className="mt-4">
                <Button variant="secondary" size="md" onClick={handleReset}>
                  Upload Different File
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  },
);

WordListUpload.displayName = 'WordListUpload';
