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

const STORAGE_KEY = "quickSites";

/**
 * 获取常用网站的 favicon URL（与书签一致）
 */
function getSiteFavicon(pageUrl) {
    try {
        new URL(pageUrl);
        const faviconBase = browser.runtime.getURL("_favicon/");
        return `${faviconBase}?pageUrl=${encodeURIComponent(pageUrl)}&size=128`;
    } catch {
        return "";
    }
}

/**
 * 生成简短唯一 ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * 管理常用网站的 hook
 * @returns {{ sites: Array, addSite: Function, editSite: Function, removeSite: Function }}
 */
export function useQuickSites() {
    const [sites, setSites] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        } catch {
            return [];
        }
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const storage = getStorage();
            if (!storage) {
                console.warn("Storage API not available, falling back to localStorage.");
                setIsLoaded(true);
                return;
            }

            try {
                const res = await storage.get(STORAGE_KEY);
                if (res[STORAGE_KEY] && Array.isArray(res[STORAGE_KEY])) {
                    setSites(res[STORAGE_KEY]);
                } else {
                    // 平滑迁移：老用户的 localStorage 兜底
                    const localData = localStorage.getItem(STORAGE_KEY);
                    if (localData) {
                        const parsed = JSON.parse(localData);
                        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                            setSites(parsed);
                            await storage.set({ [STORAGE_KEY]: parsed });
                            setIsLoaded(true);
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error("Storage load error:", e);
            }
            setIsLoaded(true);
        })();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            const storage = getStorage();
            if (storage) {
                storage.set({ [STORAGE_KEY]: sites }).catch(err => {
                    console.error("Failed to save to storage:", err);
                });
            }
            // 为了多页面同步，依然在 localStorage 做一个冗余备份
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
        }
    }, [sites, isLoaded]);

    const addSite = useCallback((title, url) => {
        const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
        const newSite = {
            id: generateId(),
            title,
            url: normalizedUrl,
            favicon: getSiteFavicon(normalizedUrl),
        };
        setSites((prev) => [...prev, newSite]);
    }, []);

    const editSite = useCallback((id, title, url) => {
        const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
        setSites((prev) =>
            prev.map((site) =>
                site.id === id
                    ? { ...site, title, url: normalizedUrl, favicon: getSiteFavicon(normalizedUrl) }
                    : site
            )
        );
    }, []);

    const removeSite = useCallback((id) => {
        setSites((prev) => prev.filter((site) => site.id !== id));
    }, []);

    return { sites, addSite, editSite, removeSite };
}
