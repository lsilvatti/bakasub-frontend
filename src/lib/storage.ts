export interface LocalStorageProps { 
    getItem: <T>(key: string) => T | null
    setItem: <T>(key: string, value: T) => void
    removeItem: (key: string) => void
}

export default function LocalStorage(): LocalStorageProps {

    function getItem<T>(key: string): T | null {
        const item = localStorage.getItem(key)

        if(item) { 
            return JSON.parse(item);
        }

        return null;
    }

    function setItem<T>(key: string, value: T) {
        const formattedValue = JSON.stringify(value);
        localStorage.setItem(key, formattedValue);
    }

    function removeItem(key: string) { 
        localStorage.removeItem(key);
    }

    return {
        getItem,
        setItem,
        removeItem
    }
}
