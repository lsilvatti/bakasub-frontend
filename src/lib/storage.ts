export interface LocalStorageProps { 
    getItem: (key: string) => any
    setItem: (key: string, value: any) => void
    removeItem: (key: string) => void
}

export default function LocalStorage(): LocalStorageProps {

    function getItem(key: string){
        const item = localStorage.getItem(key)

        if(item) { 
            return JSON.parse(item);
        }

        return null;
    }

    function setItem(key: string, value: any) {
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
