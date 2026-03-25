import type { ParseKeys } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PageTitleProps {
  titleKey: ParseKeys;
}

export function PageTitle({ titleKey }: PageTitleProps) {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t(titleKey)} | BakaSub`;
  }, [t, titleKey]);

  return null;
}