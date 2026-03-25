import { useTranslation } from 'react-i18next';
import { Dropdown, DropdownItem } from '@/components/atoms';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'pt-BR', label: 'Português (BR)', short: 'PT' },
  { code: 'en-US', label: 'English', short: 'EN' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const triggerButton = (
    <button className={styles.trigger} title="Mudar idioma">
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className={styles.shortLabel}>{currentLang.short}</span>
    </button>
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