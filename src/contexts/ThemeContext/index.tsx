import { createContext, useContext, useEffect, useState } from 'react';

type themes = 'light' | 'dark';

interface ThemeContextType {
    theme: themes,
    setTheme: (theme: themes) => void;
    toggleTheme: () => void;
}

interface ThemeProviderProps {
    children: React.ReactNode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProvider({ children} : ThemeProviderProps) { 

    const [theme, setTheme] = useState<themes>('light');

    const toggleTheme = () => setTheme((prev) => prev === 'light' ? 'dark' : 'light');

    useEffect(() => { 
        const root = window.document.documentElement;
        root.setAttribute('data-theme', theme);
    }, [theme])

    return (
        <ThemeContext.Provider value={{theme, setTheme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if(!context) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }

    return context;
}

export default ThemeProvider;