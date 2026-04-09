import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownItem } from '@/components/atoms';
import { Globe } from 'lucide-react';
import { IconButton } from '../IconButton';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'en-US', label: 'English' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const triggerButton = (
    <IconButton className={styles.trigger} title="Change language">
      <Globe />
    </IconButton>
  );

  return (
    <Dropdown trigger={triggerButton} align="right">
      {LANGUAGES.map((lang) => (
        <DropdownItem
          key={lang.code}
          active={i18n.language === lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}