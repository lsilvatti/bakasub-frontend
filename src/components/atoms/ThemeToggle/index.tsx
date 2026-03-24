import { useTheme } from "@/contexts";
import { Sun, Moon } from 'lucide-react';
import styles from './ThemeToggle.module.css';
import { IconButton } from "../IconButton";

export function ThemeToggle() { 

    const {theme, toggleTheme} = useTheme();

    return (
        <IconButton className={styles.toggle} onClick={toggleTheme}>
            {theme === 'light' ? <Sun /> : <Moon />}
        </IconButton>
    )
}