import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Input } from '@/components/atoms';
import { useDebounce } from '@/hooks';
import styles from './AsyncSearch.module.css';
import { useTranslation } from 'react-i18next';

export interface AsyncSearchProps<T> {
  label?: string;
  placeholder?: string;
  delay?: number;
  isLoading?: boolean;
  results: T[];
  value: string; // Trocamos initialValue por value controlado!
  onChange: (value: string) => void;
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
  value,
  onChange,
  onSearch,
  onSelect,
  renderResult,
  keyExtractor,
  className,
  fullWidth = true,
}: AsyncSearchProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // O debounce agora observa o valor controlado que vem do pai
  const debouncedValue = useDebounce(value, delay);

  // Efeito responsável apenas por buscar quando o texto "assentar"
  useEffect(() => {
    if (debouncedValue.trim()) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  // Fechar ao clicar fora
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
  };

  const loadingIcon = (
    <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );

  return (
    <div className={clsx(styles.container, className)} ref={containerRef}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true); // Só abre automaticamente se o usuário estiver digitando
        }}
        onFocus={() => {
          if (value.trim() && results.length > 0) setIsOpen(true);
        }}
        fullWidth={fullWidth}
        rightIcon={isLoading ? loadingIcon : undefined}
      />

      {isOpen && (
        <div className={styles.dropdown}>
          {isLoading && results.length === 0 ? (
            <div className={styles.loadingState}>{t('components.asyncSearch.loading', 'Carregando...')}</div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>{t('components.asyncSearch.noResults', 'Sem resultados')}</div>
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