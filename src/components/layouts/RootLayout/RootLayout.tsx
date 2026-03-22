import { Outlet } from "react-router-dom";
import styles from './RootLayout.module.css';
import { Typography, ThemeToggle } from "@/components/atoms";

export function RootLayout() {
    return (
        <div className={styles.container}>
            <header>
                <Typography>
                    Bakasub
                    <ThemeToggle />
                </Typography>
            </header>
            
            <main className={styles.mainContent}> 
                <Outlet />
            </main>
        </div>
    )
}