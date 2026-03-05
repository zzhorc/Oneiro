import { useState, useCallback, useEffect } from "react";
import { browser } from "wxt/browser";

// 安全获取 storage API 的辅助函数
const getStorage = () => {
    try {
        if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
            return browser.storage.local;
        }
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
            return chrome.storage.local;
        }
    } catch (e) {
        console.warn("Storage API access inhibited:", e);
    }
    return null;
};

const DEFAULT_VISIBLE_ROWS = 2;
const DEFAULT_ICON_TYPE = "favicon"; // "favicon" | "bw-favicon" | "letter"

/**
 * 管理书签与显示设置的 hook
 */
export function useBookmarkSettings() {
    const [visibleRows, setVisibleRows] = useState(() =>
        Number.parseInt(localStorage.getItem("bookmarkVisibleRows") || String(DEFAULT_VISIBLE_ROWS), 10)
    );
    const [isExpanded, setIsExpanded] = useState(false);
    const [iconType, setIconType] = useState(() =>
        localStorage.getItem("bookmarkIconType") || DEFAULT_ICON_TYPE
    );
    const [showBookmarks, setShowBookmarks] = useState(() =>
        localStorage.getItem("showBookmarks") !== "false"
    );
    const [showQuickSites, setShowQuickSites] = useState(() =>
        localStorage.getItem("showQuickSites") !== "false"
    );
    const [bookmarkLayout, setBookmarkLayout] = useState(() =>
        localStorage.getItem("bookmarkLayout") || "grid"
    );

    const [isLoaded, setIsLoaded] = useState(false);

    // Initial async load from Chrome Storage
    useEffect(() => {
        (async () => {
            const storage = getStorage();
            if (!storage) {
                console.warn("Storage API not available for settings.");
                setIsLoaded(true);
                return;
            }

            try {
                const keys = ["bookmarkVisibleRows", "bookmarkIconType", "showBookmarks", "showQuickSites", "bookmarkLayout"];
                const res = await storage.get(keys);

                if (res.bookmarkVisibleRows !== undefined) setVisibleRows(Number.parseInt(res.bookmarkVisibleRows, 10));
                if (res.bookmarkIconType !== undefined) setIconType(res.bookmarkIconType);
                if (res.showBookmarks !== undefined) setShowBookmarks(res.showBookmarks === "true");
                if (res.showQuickSites !== undefined) setShowQuickSites(res.showQuickSites === "true");
                if (res.bookmarkLayout !== undefined) setBookmarkLayout(res.bookmarkLayout);
            } catch (e) {
                console.error("Settings load error:", e);
            }
            setIsLoaded(true);
        })();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("bookmarkVisibleRows", visibleRows.toString());
        const storage = getStorage();
        if (storage) storage.set({ bookmarkVisibleRows: visibleRows.toString() });
    }, [visibleRows, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("bookmarkIconType", iconType);
        const storage = getStorage();
        if (storage) storage.set({ bookmarkIconType: iconType });
    }, [iconType, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("showBookmarks", String(showBookmarks));
        const storage = getStorage();
        if (storage) storage.set({ showBookmarks: String(showBookmarks) });
    }, [showBookmarks, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("showQuickSites", String(showQuickSites));
        const storage = getStorage();
        if (storage) storage.set({ showQuickSites: String(showQuickSites) });
    }, [showQuickSites, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("bookmarkLayout", bookmarkLayout);
        const storage = getStorage();
        if (storage) storage.set({ bookmarkLayout: bookmarkLayout });
    }, [bookmarkLayout, isLoaded]);

    const toggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    const cycleVisibleRows = useCallback(() => {
        setVisibleRows((prev) => (prev % 4) + 1);
    }, []);

    const toggleIconType = useCallback(() => {
        setIconType((prev) => {
            if (prev === "favicon") return "bw-favicon";
            if (prev === "bw-favicon") return "letter";
            return "favicon";
        });
    }, []);

    const toggleBookmarkLayout = useCallback(() => {
        setBookmarkLayout((prev) => {
            if (prev === "grid") return "magazine";
            if (prev === "magazine") return "list";
            return "grid";
        });
    }, []);

    const toggleShowBookmarks = useCallback(() => {
        setShowBookmarks((prev) => !prev);
    }, []);

    const toggleShowQuickSites = useCallback(() => {
        setShowQuickSites((prev) => !prev);
    }, []);

    return {
        visibleRows, isExpanded, toggleExpand, cycleVisibleRows,
        iconType, toggleIconType,
        showBookmarks, toggleShowBookmarks,
        showQuickSites, toggleShowQuickSites,
        bookmarkLayout, setBookmarkLayout, toggleBookmarkLayout,
    };
}
