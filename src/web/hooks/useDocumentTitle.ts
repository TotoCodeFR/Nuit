import { useEffect } from "react";

export default function useDocumentTitle(title: string) {
    useEffect(() => {
        const previous = document.title;
        document.title = title;

        return () => {
            document.title = previous;
        };
    }, [title]);
}
