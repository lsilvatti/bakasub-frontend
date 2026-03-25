import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Input } from '@/components/atoms';
import { useDebounce } from '@/hooks';
import styles from './AsyncSearch.module.css';
import { useTranslation } from 'node_modules/react-i18next';

export interface AsyncSearchProps<T> {
  label?: string;
  placeholder?: string;
  delay?: number;
  isLoading?: boolean;
  results: T[];
  onSearch: (query: string) => void;
  onSelect: (item: T) => void;
  renderResult: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  className?: string;
  fullWidth?: boolean;
}

export function AsyncSearch<T>({
  label,
  placeholder = 'Buscar...',
  delay = 500,
  isLoading = false,
  results,
  onSearch,
  onSelect,
  renderResult,
  keyExtractor,
  className,
  fullWidth = true,
}: AsyncSearchProps<T>) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const debouncedValue = useDebounce(inputValue, delay);

  useEffect(() => {
    if (debouncedValue.trim()) {
      onSearch(debouncedValue);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedValue, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
    setInputValue(''); 
  };

  const loadingIcon = (
    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  );

  return (
    <div className={clsx(styles.container, className)} ref={containerRef}>
      <Input
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => {
          if (debouncedValue.trim() && results.length > 0) setIsOpen(true);
        }}
        fullWidth={fullWidth}
        rightIcon={isLoading ? loadingIcon : undefined}
      />

      {isOpen && (
        <div className={styles.dropdown}>
          {isLoading && results.length === 0 ? (
            <div className={styles.loadingState}>{t('components.asyncSearch.loading')}</div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>{t('components.asyncSearch.noResults')}</div>
          ) : (
            results.map((item) => (
              <button
                key={keyExtractor(item)}
                className={styles.resultItem}
                onClick={() => handleSelect(item)}
                type="button"
              >
                {renderResult(item)}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}