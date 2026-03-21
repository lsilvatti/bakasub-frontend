import React from "react";
import { Outlet } from "react-router-dom";
import styles from './RootLayout.module.css';

export function RootLayout() {
    return (
        <div className={styles.container}>
            <header>
                <h1>Bakasub</h1>
            </header>
            
            <main className={styles.mainContent}> 
                <Outlet />
            </main>

            <footer>
                <p>bakasub</p>
            </footer>
        </div>
    )
}