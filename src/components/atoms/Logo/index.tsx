import { Typography } from "../Typography";
import styles from "./Logo.module.css";

export function Logo() {
    return (
        <div className={styles.logo}>
        <Typography variant="h1" as="p" className={styles.mainLogo}>
            Baka
        </Typography>
                <Typography className={styles.subLogo}>
            SUB
        </Typography>
        </div>
    );
}   