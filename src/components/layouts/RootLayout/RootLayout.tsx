import { Outlet } from "react-router-dom";
import styles from './RootLayout.module.css';
import Typography from "@/components/atoms/Typography/Typography";
import ThemeToggle from "@/components/atoms/ThemeToggle";

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