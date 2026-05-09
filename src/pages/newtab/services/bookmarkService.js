import { browser } from "wxt/browser";

const STORAGE_KEY_BOOKMARK_GROUPS = "bookmarkGroups";
const STORAGE_KEY_ARCHIVED_BOOKMARKS = "archivedBookmarks";
const STORAGE_KEY_BOOKMARK_SETTINGS = "bookmarkAdvancedSettings";
const STORAGE_KEY_SYNC_STATE = "bookmarkSyncState";

const BOOKMARK_BAR_ID = "1";

function getFaviconUrl(pageUrl) {
    try {
        new URL(pageUrl);
        const faviconBase = browser.runtime.getURL("_favicon/");
        return `${faviconBase}?pageUrl=${encodeURIComponent(pageUrl)}&size=128`;
    } catch {
        return "";
    }
}

function normalizeUrl(url) {
    if (!url) return "";
    try {
        const parsed = new URL(url);
        parsed.hash = "";
        parsed.search = "";
        let normalized = parsed.toString();
        if (normalized.endsWith("/")) {
            normalized = normalized.slice(0, -1);
        }
        return normalized.replace(/^https?:\/\//, "").replace(/^www\./, "");
    } catch {
        return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    }
}

function extractDomain(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

function getUrlCategory(url) {
    const domain = extractDomain(url);
    if (!domain) return "other";

    const categories = {
        social: ["facebook", "twitter", "instagram", "linkedin", "weibo", "weixin", "qq", "douban", "xiaohongshu", "zhihu"],
        news: ["news", "bbc", "cnn", "nytimes", "guardian", "huxiu", "36kr", "ithome", "ifeng", "sina"],
        search: ["google", "baidu", "bing", "duckduckgo", "yandex"],
        shopping: ["amazon", "taobao", "tmall", "jd", "pdd", "ebay", "aliexpress", "suning", "gome"],
        video: ["youtube", "bilibili", "youku", "tudou", "iqiyi", "tencent", "vimeo", "netflix"],
        music: ["spotify", "music.163", "qqmusic", "kugou", "kuwo", "apple", "pandora", "deezer"],
        learning: ["wikipedia", "zhihu", "stackoverflow", "github", "gitlab", "mdn", "w3schools", "csdn", "juejin", "segmentfault"],
        tools: ["gmail", "outlook", "notion", "trello", "slack", "figma", "canva", "adobe", "office", "google"]
    };

    for (const [category, domains] of Object.entries(categories)) {
        if (domains.some(d => domain.includes(d))) {
            return category;
        }
    }

    return "other";
}

function getCategoryName(category) {
    const names = {
        social: "社交媒体",
        news: "新闻资讯",
        search: "搜索引擎",
        shopping: "购物网站",
        video: "视频网站",
        music: "音乐网站",
        learning: "学习编程",
        tools: "效率工具",
        other: "其他网站"
    };
    return names[category] || "其他网站";
}

function parseBookmarkNodes(nodes, depth = 0) {
    if (!nodes) return [];
    return nodes.map((node) => {
        if (node.children) {
            return {
                id: node.id,
                title: node.title,
                children: parseBookmarkNodes(node.children, depth + 1),
                isFolder: true,
                depth,
                dateAdded: node.dateAdded,
                dateGroupModified: node.dateGroupModified
            };
        }
        return {
            id: node.id,
            title: node.title,
            url: node.url,
            favicon: getFaviconUrl(node.url),
            isFolder: false,
            depth,
            domain: extractDomain(node.url),
            category: getUrlCategory(node.url),
            normalizedUrl: normalizeUrl(node.url),
            dateAdded: node.dateAdded
        };
    });
}

function flattenBookmarks(bookmarks, result = []) {
    for (const item of bookmarks) {
        if (item.isFolder && item.children) {
            result.push({
                ...item,
                children: undefined
            });
            flattenBookmarks(item.children, result);
        } else if (!item.isFolder) {
            result.push(item);
        }
    }
    return result;
}

class BookmarkService {
    constructor() {
        this.groups = {};
        this.archived = [];
        this.settings = {};
        this.syncState = {
            lastSync: 0,
            conflicts: [],
            isSyncing: false
        };
        this.listeners = new Set();
        this.loadFromStorage();
    }

    async loadFromStorage() {
        try {
            const storage = this.getStorage();
            if (storage) {
                const [groupsData, archivedData, settingsData, syncStateData] = await Promise.all([
                    storage.get(STORAGE_KEY_BOOKMARK_GROUPS),
                    storage.get(STORAGE_KEY_ARCHIVED_BOOKMARKS),
                    storage.get(STORAGE_KEY_BOOKMARK_SETTINGS),
                    storage.get(STORAGE_KEY_SYNC_STATE)
                ]);

                if (groupsData[STORAGE_KEY_BOOKMARK_GROUPS]) {
                    this.groups = JSON.parse(groupsData[STORAGE_KEY_BOOKMARK_GROUPS]);
                }
                if (archivedData[STORAGE_KEY_ARCHIVED_BOOKMARKS]) {
                    this.archived = JSON.parse(archivedData[STORAGE_KEY_ARCHIVED_BOOKMARKS]);
                }
                if (settingsData[STORAGE_KEY_BOOKMARK_SETTINGS]) {
                    this.settings = JSON.parse(settingsData[STORAGE_KEY_BOOKMARK_SETTINGS]);
                }
                if (syncStateData[STORAGE_KEY_SYNC_STATE]) {
                    this.syncState = JSON.parse(syncStateData[STORAGE_KEY_SYNC_STATE]);
                }
            }
        } catch (e) {
            console.error('Failed to load bookmark data from storage:', e);
        }
    }

    async saveToStorage() {
        try {
            const storage = this.getStorage();
            if (storage) {
                await Promise.all([
                    storage.set({ [STORAGE_KEY_BOOKMARK_GROUPS]: JSON.stringify(this.groups) }),
                    storage.set({ [STORAGE_KEY_ARCHIVED_BOOKMARKS]: JSON.stringify(this.archived) }),
                    storage.set({ [STORAGE_KEY_BOOKMARK_SETTINGS]: JSON.stringify(this.settings) }),
                    storage.set({ [STORAGE_KEY_SYNC_STATE]: JSON.stringify(this.syncState) })
                ]);
            }
        } catch (e) {
            console.error('Failed to save bookmark data to storage:', e);
        }
    }

    getStorage() {
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
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
    }

    async getBookmarksTree() {
        try {
            const tree = await browser.bookmarks.getSubTree(BOOKMARKS_BAR_ID);
            if (tree && tree[0] && tree[0].children) {
                return parseBookmarkNodes(tree[0].children);
            }
        } catch (error) {
            console.error("Failed to get bookmarks tree:", error);
        }
        return [];
    }

    detectDuplicates(bookmarks) {
        const flat = flattenBookmarks(bookmarks);
        const urlMap = new Map();
        const duplicates = [];

        for (const bookmark of flat) {
            if (bookmark.isFolder) continue;
            
            const normalizedUrl = bookmark.normalizedUrl;
            if (urlMap.has(normalizedUrl)) {
                const existing = urlMap.get(normalizedUrl);
                if (!duplicates.some(d => d.url === normalizedUrl)) {
                    duplicates.push({
                        url: normalizedUrl,
                        originalUrl: bookmark.url,
                        items: [existing, bookmark],
                        title: bookmark.title
                    });
                } else {
                    const dup = duplicates.find(d => d.url === normalizedUrl);
                    if (!dup.items.some(i => i.id === bookmark.id)) {
                        dup.items.push(bookmark);
                    }
                }
            } else {
                urlMap.set(normalizedUrl, bookmark);
            }
        }

        return duplicates;
    }

    async removeDuplicate(bookmarkId) {
        try {
            await browser.bookmarks.remove(bookmarkId);
            this.syncState.lastSync = Date.now();
            await this.saveToStorage();
            return true;
        } catch (e) {
            console.error('Failed to remove duplicate bookmark:', e);
            return false;
        }
    }

    async mergeDuplicates(duplicateGroup, keepIndex = 0) {
        if (duplicateGroup.items.length <= 1) return [];

        const removed = [];
        const keep = duplicateGroup.items[keepIndex];

        for (let i = 0; i < duplicateGroup.items.length; i++) {
            if (i !== keepIndex) {
                const success = await this.removeDuplicate(duplicateGroup.items[i].id);
                if (success) {
                    removed.push(duplicateGroup.items[i]);
                }
            }
        }

        return removed;
    }

    smartGroup(bookmarks) {
        const flat = flattenBookmarks(bookmarks);
        const groups = {
            byCategory: {},
            byDomain: {},
            byFirstLetter: {}
        };

        for (const item of flat) {
            if (item.isFolder) continue;

            const category = item.category;
            if (!groups.byCategory[category]) {
                groups.byCategory[category] = {
                    name: getCategoryName(category),
                    items: []
                };
            }
            groups.byCategory[category].items.push(item);

            const domain = item.domain;
            if (domain) {
                if (!groups.byDomain[domain]) {
                    groups.byDomain[domain] = {
                        name: domain,
                        items: []
                    };
                }
                groups.byDomain[domain].items.push(item);
            }

            const firstLetter = (item.title?.[0] || '#').toUpperCase();
            if (!/^[A-Z\u4E00-\u9FA5]/.test(firstLetter)) {
                if (!groups.byFirstLetter['#']) {
                    groups.byFirstLetter['#'] = {
                        name: '#',
                        items: []
                    };
                }
                groups.byFirstLetter['#'].items.push(item);
            } else {
                if (!groups.byFirstLetter[firstLetter]) {
                    groups.byFirstLetter[firstLetter] = {
                        name: firstLetter,
                        items: []
                    };
                }
                groups.byFirstLetter[firstLetter].items.push(item);
            }
        }

        return groups;
    }

    createCustomGroup(name, bookmarkIds = []) {
        const groupId = `group_${Date.now()}`;
        this.groups[groupId] = {
            id: groupId,
            name,
            bookmarkIds,
            createdAt: Date.now(),
            color: this.getRandomColor()
        };
        this.saveToStorage();
        this.notify();
        return this.groups[groupId];
    }

    updateCustomGroup(groupId, updates) {
        if (this.groups[groupId]) {
            this.groups[groupId] = {
                ...this.groups[groupId],
                ...updates,
                updatedAt: Date.now()
            };
            this.saveToStorage();
            this.notify();
            return this.groups[groupId];
        }
        return null;
    }

    deleteCustomGroup(groupId) {
        if (this.groups[groupId]) {
            delete this.groups[groupId];
            this.saveToStorage();
            this.notify();
            return true;
        }
        return false;
    }

    addToGroup(groupId, bookmarkId) {
        if (this.groups[groupId] && !this.groups[groupId].bookmarkIds.includes(bookmarkId)) {
            this.groups[groupId].bookmarkIds.push(bookmarkId);
            this.saveToStorage();
            this.notify();
            return true;
        }
        return false;
    }

    removeFromGroup(groupId, bookmarkId) {
        if (this.groups[groupId]) {
            this.groups[groupId].bookmarkIds = this.groups[groupId].bookmarkIds.filter(
                id => id !== bookmarkId
            );
            this.saveToStorage();
            this.notify();
            return true;
        }
        return false;
    }

    getCustomGroups() {
        return Object.values(this.groups);
    }

    getGroupBookmarks(groupId, allBookmarks) {
        if (!this.groups[groupId]) return [];
        
        const flat = flattenBookmarks(allBookmarks);
        const bookmarkIds = new Set(this.groups[groupId].bookmarkIds);
        
        return flat.filter(b => bookmarkIds.has(b.id));
    }

    async archiveBookmark(bookmarkId, bookmarks) {
        const flat = flattenBookmarks(bookmarks);
        const bookmark = flat.find(b => b.id === bookmarkId);
        
        if (!bookmark) return false;

        const archiveEntry = {
            ...bookmark,
            archivedAt: Date.now(),
            originalFolderPath: this.getFolderPath(bookmarkId, bookmarks)
        };

        this.archived.push(archiveEntry);
        
        try {
            await browser.bookmarks.remove(bookmarkId);
            this.syncState.lastSync = Date.now();
            await this.saveToStorage();
            this.notify();
            return true;
        } catch (e) {
            console.error('Failed to archive bookmark:', e);
            this.archived = this.archived.filter(a => a.id !== bookmarkId);
            return false;
        }
    }

    async restoreBookmark(bookmarkId) {
        const archivedIndex = this.archived.findIndex(b => b.id === bookmarkId);
        if (archivedIndex === -1) return false;

        const archived = this.archived[archivedIndex];
        
        try {
            const parentId = archived.originalFolderPath?.[0]?.id || BOOKMARKS_BAR_ID;
            await browser.bookmarks.create({
                parentId,
                title: archived.title,
                url: archived.url
            });

            this.archived.splice(archivedIndex, 1);
            this.syncState.lastSync = Date.now();
            await this.saveToStorage();
            this.notify();
            return true;
        } catch (e) {
            console.error('Failed to restore bookmark:', e);
            return false;
        }
    }

    deleteArchivedBookmark(bookmarkId) {
        const index = this.archived.findIndex(b => b.id === bookmarkId);
        if (index !== -1) {
            this.archived.splice(index, 1);
            this.saveToStorage();
            this.notify();
            return true;
        }
        return false;
    }

    getArchivedBookmarks() {
        return [...this.archived].sort((a, b) => b.archivedAt - a.archivedAt);
    }

    getFolderPath(bookmarkId, bookmarks, path = []) {
        for (const item of bookmarks) {
            if (item.id === bookmarkId) {
                return path;
            }
            if (item.children) {
                const found = this.getFolderPath(bookmarkId, item.children, [...path, item]);
                if (found) return found;
            }
        }
        return null;
    }

    async createFolder(title, parentId = BOOKMARKS_BAR_ID) {
        try {
            const folder = await browser.bookmarks.create({
                parentId,
                title
            });
            this.syncState.lastSync = Date.now();
            this.notify();
            return folder;
        } catch (e) {
            console.error('Failed to create folder:', e);
            return null;
        }
    }

    async moveBookmark(bookmarkId, newParentId, index) {
        try {
            await browser.bookmarks.move(bookmarkId, {
                parentId: newParentId,
                index
            });
            this.syncState.lastSync = Date.now();
            this.notify();
            return true;
        } catch (e) {
            console.error('Failed to move bookmark:', e);
            return false;
        }
    }

    async renameBookmark(bookmarkId, newTitle) {
        try {
            await browser.bookmarks.update(bookmarkId, {
                title: newTitle
            });
            this.syncState.lastSync = Date.now();
            this.notify();
            return true;
        } catch (e) {
            console.error('Failed to rename bookmark:', e);
            return false;
        }
    }

    async syncWithBrowser() {
        if (this.syncState.isSyncing) return false;

        this.syncState.isSyncing = true;
        try {
            this.syncState.lastSync = Date.now();
            this.syncState.conflicts = [];
            await this.saveToStorage();
            this.notify();
            return true;
        } finally {
            this.syncState.isSyncing = false;
        }
    }

    getSyncState() {
        return { ...this.syncState };
    }

    getRandomColor() {
        const colors = [
            '#ef4444', '#f97316', '#eab308', '#22c55e', 
            '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getStatistics(bookmarks) {
        const flat = flattenBookmarks(bookmarks);
        const folders = flat.filter(b => b.isFolder);
        const items = flat.filter(b => !b.isFolder);

        const stats = {
            totalItems: items.length,
            totalFolders: folders.length,
            byCategory: {},
            byDomain: {},
            maxDepth: 0,
            recentlyAdded: [],
            duplicates: this.detectDuplicates(bookmarks).length
        };

        for (const item of items) {
            const category = item.category;
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            const domain = item.domain;
            if (domain) {
                stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
            }

            if (item.depth > stats.maxDepth) {
                stats.maxDepth = item.depth;
            }
        }

        const sortedByDate = [...items].sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
        stats.recentlyAdded = sortedByDate.slice(0, 10);

        stats.topDomains = Object.entries(stats.byDomain)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([domain, count]) => ({ domain, count }));

        return stats;
    }
}

const bookmarkService = new BookmarkService();

export {
    BookmarkService,
    bookmarkService,
    normalizeUrl,
    extractDomain,
    getUrlCategory,
    getCategoryName,
    parseBookmarkNodes,
    flattenBookmarks,
    getFaviconUrl,
    BOOKMARK_BAR_ID
};
