import { PentagramLoader } from "@/components/atoms";
import styles from "./Loading.module.css";

function Loading() {
    return <div className={styles.container}>
        <div className={styles.loaderWrapper}>
            <PentagramLoader />
        </div>
    </div>;
}

export default Loading;