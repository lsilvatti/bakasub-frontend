import { Outlet } from "react-router-dom";
import styles from './RootLayout.module.css';
import Typography from "@/components/atoms/Typography/Typography";

export function RootLayout() {
    return (
        <div className={styles.container}>
            <header>
                <Typography>
                    Bakasub
                </Typography>
            </header>
            
            <main className={styles.mainContent}> 
                <Outlet />
            </main>
        </div>
    )
}