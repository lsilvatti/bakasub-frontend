import { useTheme } from "@/contexts";
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() { 

    const {theme, toggleTheme} = useTheme();

    return (
        <button onClick={toggleTheme}>
            {theme === 'light' ? <Sun /> : <Moon />}
        </button>
    )
}