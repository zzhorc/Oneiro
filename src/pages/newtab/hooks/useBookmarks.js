import { useState, useEffect, useCallback, useRef } from "react";
import { browser } from "wxt/browser";

const BOOKMARKS_BAR_ID = "1";
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 500;
const DEBOUNCE_DELAY_MS = 300;
const STORAGE_KEY_BOOKMARKS_CACHE = "bookmarksCache";
const STORAGE_KEY_SYNC_ERRORS = "syncErrors";

function getFaviconUrl(pageUrl) {
    try {
        new URL(pageUrl);
        const faviconBase = browser.runtime.getURL("_favicon/");
        return `${faviconBase}?pageUrl=${encodeURIComponent(pageUrl)}&size=128`;
    } catch {
        return "";
    }
}

function parseBookmarkNodes(nodes, depth = 0) {
    if (!nodes) return [];
    return nodes.map((node) => {
        if (node.children) {
            return {
                id: node.id,
                title: node.title || "未命名文件夹",
                children: parseBookmarkNodes(node.children, depth + 1),
                isFolder: true,
                depth,
                dateAdded: node.dateAdded,
                dateGroupModified: node.dateGroupModified,
                parentId: node.parentId
            };
        }
        return {
            id: node.id,
            title: node.title || "未命名书签",
            url: node.url,
            favicon: getFaviconUrl(node.url),
            isFolder: false,
            depth,
            dateAdded: node.dateAdded,
            parentId: node.parentId
        };
    });
}

function flattenBookmarks(bookmarks, result = []) {
    for (const item of bookmarks) {
        result.push(item);
        if (item.children) {
            flattenBookmarks(item.children, result);
        }
    }
    return result;
}

function calculateBookmarksHash(bookmarks) {
    const flat = flattenBookmarks(bookmarks);
    const ids = flat.map(b => `${b.id}-${b.title}-${b.url || ''}`).sort().join('|');
    let hash = 0;
    for (let i = 0; i < ids.length; i++) {
        const char = ids.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

class SyncErrorHandler {
    constructor() {
        this.errors = this.loadErrors();
    }

    loadErrors() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_SYNC_ERRORS);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    saveErrors() {
        try {
            const recent = this.errors.slice(-50);
            localStorage.setItem(STORAGE_KEY_SYNC_ERRORS, JSON.stringify(recent));
        } catch (e) {
            console.error('Failed to save sync errors:', e);
        }
    }

    addError(error, operation) {
        const errorEntry = {
            timestamp: Date.now(),
            operation,
            message: error?.message || String(error),
            stack: error?.stack
        };
        this.errors.push(errorEntry);
        this.saveErrors();
        console.error(`Bookmark sync error during ${operation}:`, error);
    }

    getRecentErrors(limit = 10) {
        return [...this.errors].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }

    clearErrors() {
        this.errors = [];
        this.saveErrors();
    }
}

const syncErrorHandler = new SyncErrorHandler();

async function loadBookmarksWithRetry(retryCount = 0) {
    try {
        const tree = await browser.bookmarks.getSubTree(BOOKMARKS_BAR_ID);
        if (tree && tree[0] && tree[0].children) {
            const bookmarks = parseBookmarkNodes(tree[0].children);
            
            try {
                const cacheData = {
                    bookmarks,
                    timestamp: Date.now(),
                    hash: calculateBookmarksHash(bookmarks)
                };
                localStorage.setItem(STORAGE_KEY_BOOKMARKS_CACHE, JSON.stringify(cacheData));
            } catch (cacheError) {
                console.warn('Failed to cache bookmarks:', cacheError);
            }
            
            return bookmarks;
        }
        return [];
    } catch (error) {
        syncErrorHandler.addError(error, 'loadBookmarks');
        
        if (retryCount < MAX_RETRY_ATTEMPTS) {
            console.warn(`Retrying bookmark load (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retryCount + 1)));
            return loadBookmarksWithRetry(retryCount + 1);
        }
        
        try {
            const cached = localStorage.getItem(STORAGE_KEY_BOOKMARKS_CACHE);
            if (cached) {
                const cacheData = JSON.parse(cached);
                console.warn('Using cached bookmarks due to load failure');
                return cacheData.bookmarks || [];
            }
        } catch (cacheError) {
            console.error('Failed to load cached bookmarks:', cacheError);
        }
        
        return [];
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncState, setSyncState] = useState({
        isSyncing: false,
        lastSync: null,
        hasError: false,
        lastError: null
    });
    const [cacheInfo, setCacheInfo] = useState({
        usingCache: false,
        lastCacheTime: null
    });
    
    const isInitialized = useRef(false);
    const debouncedLoadBookmarks = useRef(
        debounce(async () => {
            setSyncState(prev => ({ ...prev, isSyncing: true, hasError: false }));
            try {
                const loadedBookmarks = await loadBookmarksWithRetry();
                setBookmarks(loadedBookmarks);
                setSyncState(prev => ({ 
                    ...prev, 
                    isSyncing: false, 
                    lastSync: Date.now(),
                    hasError: false 
                }));
                setCacheInfo(prev => ({ ...prev, usingCache: false }));
            } catch (error) {
                syncErrorHandler.addError(error, 'debouncedLoad');
                setSyncState(prev => ({ 
                    ...prev, 
                    isSyncing: false, 
                    hasError: true,
                    lastError: error?.message || String(error)
                }));
            } finally {
                setLoading(false);
            }
        }, DEBOUNCE_DELAY_MS)
    ).current;

    const initialLoad = useCallback(async () => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        setLoading(true);
        setSyncState(prev => ({ ...prev, isSyncing: true }));

        try {
            const loadedBookmarks = await loadBookmarksWithRetry();
            setBookmarks(loadedBookmarks);
            setSyncState(prev => ({ 
                ...prev, 
                isSyncing: false, 
                lastSync: Date.now() 
            }));
        } catch (error) {
            syncErrorHandler.addError(error, 'initialLoad');
            setSyncState(prev => ({ 
                ...prev, 
                isSyncing: false, 
                hasError: true,
                lastError: error?.message || String(error)
            }));

            try {
                const cached = localStorage.getItem(STORAGE_KEY_BOOKMARKS_CACHE);
                if (cached) {
                    const cacheData = JSON.parse(cached);
                    setBookmarks(cacheData.bookmarks || []);
                    setCacheInfo({
                        usingCache: true,
                        lastCacheTime: cacheData.timestamp
                    });
                }
            } catch (cacheError) {
                console.error('Failed to load cached bookmarks:', cacheError);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const forceRefresh = useCallback(async () => {
        setLoading(true);
        setSyncState(prev => ({ ...prev, isSyncing: true }));
        
        try {
            const loadedBookmarks = await loadBookmarksWithRetry(0);
            setBookmarks(loadedBookmarks);
            setSyncState(prev => ({ 
                ...prev, 
                isSyncing: false, 
                lastSync: Date.now(),
                hasError: false 
            }));
            setCacheInfo(prev => ({ ...prev, usingCache: false }));
        } catch (error) {
            syncErrorHandler.addError(error, 'forceRefresh');
            setSyncState(prev => ({ 
                ...prev, 
                isSyncing: false, 
                hasError: true,
                lastError: error?.message || String(error)
            }));
        } finally {
            setLoading(false);
        }
    }, []);

    const getSyncErrors = useCallback((limit = 10) => {
        return syncErrorHandler.getRecentErrors(limit);
    }, []);

    const clearSyncErrors = useCallback(() => {
        syncErrorHandler.clearErrors();
        setSyncState(prev => ({ ...prev, hasError: false, lastError: null }));
    }, []);

    useEffect(() => {
        initialLoad();

        const handleBookmarkChange = (id, changeInfo) => {
            console.log('Bookmark changed:', id, changeInfo);
            debouncedLoadBookmarks();
        };

        const handleBookmarkCreated = (id, bookmark) => {
            console.log('Bookmark created:', id, bookmark);
            debouncedLoadBookmarks();
        };

        const handleBookmarkRemoved = (id, removeInfo) => {
            console.log('Bookmark removed:', id, removeInfo);
            debouncedLoadBookmarks();
        };

        const handleBookmarkMoved = (id, moveInfo) => {
            console.log('Bookmark moved:', id, moveInfo);
            debouncedLoadBookmarks();
        };

        try {
            if (browser.bookmarks?.onChanged) {
                browser.bookmarks.onChanged.addListener(handleBookmarkChange);
            }
            if (browser.bookmarks?.onCreated) {
                browser.bookmarks.onCreated.addListener(handleBookmarkCreated);
            }
            if (browser.bookmarks?.onRemoved) {
                browser.bookmarks.onRemoved.addListener(handleBookmarkRemoved);
            }
            if (browser.bookmarks?.onMoved) {
                browser.bookmarks.onMoved.addListener(handleBookmarkMoved);
            }
        } catch (error) {
            console.error('Failed to add bookmark listeners:', error);
            syncErrorHandler.addError(error, 'setupListeners');
        }

        return () => {
            try {
                if (browser.bookmarks?.onChanged) {
                    browser.bookmarks.onChanged.removeListener(handleBookmarkChange);
                }
                if (browser.bookmarks?.onCreated) {
                    browser.bookmarks.onCreated.removeListener(handleBookmarkCreated);
                }
                if (browser.bookmarks?.onRemoved) {
                    browser.bookmarks.onRemoved.removeListener(handleBookmarkRemoved);
                }
                if (browser.bookmarks?.onMoved) {
                    browser.bookmarks.onMoved.removeListener(handleBookmarkMoved);
                }
            } catch (error) {
                console.error('Failed to remove bookmark listeners:', error);
            }
        };
    }, [initialLoad, debouncedLoadBookmarks]);

    return { 
        bookmarks, 
        loading, 
        syncState,
        cacheInfo,
        forceRefresh,
        getSyncErrors,
        clearSyncErrors
    };
}

export {
    parseBookmarkNodes,
    flattenBookmarks,
    calculateBookmarksHash,
    syncErrorHandler,
    loadBookmarksWithRetry
};
