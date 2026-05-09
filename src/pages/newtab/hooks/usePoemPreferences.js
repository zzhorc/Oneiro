import { useCallback, useEffect, useMemo, useState } from "react";
import { browser } from "wxt/browser";

const STORAGE_KEY_FAVORITES = "favoriteContentUuids";
const STORAGE_KEY_LEGACY_FAVORITES = "bookmarkedContents";
const STORAGE_KEY_FAVORITES_ONLY = "showFavoriteContentsOnly";
const STORAGE_KEY_SEARCH_ENGINE = "poemSearchEngine";

export const SEARCH_ENGINES = {
    baidu: { label: "百度", url: "https://www.baidu.com/s?wd=" },
    google: { label: "Google", url: "https://www.google.com/search?q=" },
    bing: { label: "Bing", url: "https://www.bing.com/search?q=" },
    duckduckgo: { label: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
};

const SEARCH_ENGINE_KEYS = Object.keys(SEARCH_ENGINES);

function getStorage() {
    try {
        if (typeof browser !== "undefined" && browser.storage?.local) {
            return browser.storage.local;
        }
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            return chrome.storage.local;
        }
    } catch (e) {
        console.warn("Storage API access inhibited:", e);
    }
    return null;
}

function parseJsonArray(value) {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getLocalFavorites() {
    const currentRaw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (currentRaw !== null) return parseJsonArray(currentRaw);
    return parseJsonArray(localStorage.getItem(STORAGE_KEY_LEGACY_FAVORITES));
}

function getValidSearchEngine(value) {
    return SEARCH_ENGINES[value] ? value : "baidu";
}

function persistValue(key, value) {
    localStorage.setItem(key, value);
    const storage = getStorage();
    if (storage) storage.set({ [key]: value });
}

export function buildSearchUrl(engine, query) {
    const selected = SEARCH_ENGINES[getValidSearchEngine(engine)];
    return `${selected.url}${encodeURIComponent(query.trim())}`;
}

export function usePoemPreferences() {
    const [favoriteContentUuids, setFavoriteContentUuids] = useState(() => getLocalFavorites());
    const [showFavoriteContentsOnly, setShowFavoriteContentsOnly] = useState(
        () => localStorage.getItem(STORAGE_KEY_FAVORITES_ONLY) === "true"
    );
    const [poemSearchEngine, setPoemSearchEngine] = useState(() =>
        getValidSearchEngine(localStorage.getItem(STORAGE_KEY_SEARCH_ENGINE) || "baidu")
    );
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            const storage = getStorage();
            if (!storage) {
                setIsLoaded(true);
                return;
            }

            try {
                const res = await storage.get([
                    STORAGE_KEY_FAVORITES,
                    STORAGE_KEY_LEGACY_FAVORITES,
                    STORAGE_KEY_FAVORITES_ONLY,
                    STORAGE_KEY_SEARCH_ENGINE,
                ]);

                const hasStoredFavorites = res[STORAGE_KEY_FAVORITES] !== undefined;
                const storedFavorites = parseJsonArray(res[STORAGE_KEY_FAVORITES]);
                const legacyFavorites = parseJsonArray(res[STORAGE_KEY_LEGACY_FAVORITES]);
                const nextFavorites = hasStoredFavorites ? storedFavorites : legacyFavorites;

                setFavoriteContentUuids(nextFavorites);
                localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(nextFavorites));
                if (!hasStoredFavorites && nextFavorites.length > 0) {
                    storage.set({ [STORAGE_KEY_FAVORITES]: JSON.stringify(nextFavorites) });
                }
                if (res[STORAGE_KEY_FAVORITES_ONLY] !== undefined) {
                    setShowFavoriteContentsOnly(res[STORAGE_KEY_FAVORITES_ONLY] === "true");
                }
                if (res[STORAGE_KEY_SEARCH_ENGINE] !== undefined) {
                    setPoemSearchEngine(getValidSearchEngine(res[STORAGE_KEY_SEARCH_ENGINE]));
                }
            } catch (e) {
                console.error("Poem preferences load error:", e);
            }
            setIsLoaded(true);
        })();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        persistValue(STORAGE_KEY_FAVORITES, JSON.stringify(favoriteContentUuids));
    }, [favoriteContentUuids, isLoaded]);

    useEffect(() => {
        if (favoriteContentUuids.length === 0) {
            setShowFavoriteContentsOnly(false);
        }
    }, [favoriteContentUuids.length]);

    useEffect(() => {
        if (!isLoaded) return;
        persistValue(STORAGE_KEY_FAVORITES_ONLY, String(showFavoriteContentsOnly));
    }, [showFavoriteContentsOnly, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        persistValue(STORAGE_KEY_SEARCH_ENGINE, poemSearchEngine);
    }, [poemSearchEngine, isLoaded]);

    const favoriteContentSet = useMemo(() => new Set(favoriteContentUuids), [favoriteContentUuids]);

    const toggleFavoriteContent = useCallback((uuid) => {
        if (!uuid) return;
        setFavoriteContentUuids((prev) => {
            const next = new Set(prev);
            if (next.has(uuid)) {
                next.delete(uuid);
            } else {
                next.add(uuid);
            }
            return [...next];
        });
    }, []);

    const toggleFavoriteContentsOnly = useCallback(() => {
        setShowFavoriteContentsOnly((prev) => !prev);
    }, []);

    const cyclePoemSearchEngine = useCallback(() => {
        setPoemSearchEngine((prev) => {
            const currentIndex = SEARCH_ENGINE_KEYS.indexOf(getValidSearchEngine(prev));
            return SEARCH_ENGINE_KEYS[(currentIndex + 1) % SEARCH_ENGINE_KEYS.length];
        });
    }, []);

    return {
        favoriteContentUuids,
        favoriteContentSet,
        showFavoriteContentsOnly,
        poemSearchEngine,
        poemSearchEngineLabel: SEARCH_ENGINES[poemSearchEngine].label,
        toggleFavoriteContent,
        toggleFavoriteContentsOnly,
        cyclePoemSearchEngine,
    };
}
