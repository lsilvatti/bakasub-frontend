import { useTheme } from "@/contexts";
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() { 

    const {theme, toggleTheme} = useTheme();

    return (
        <button className={styles.toggle} onClick={toggleTheme}>
            {theme === 'light' ? <Sun /> : <Moon />}
        </button>
    )
}