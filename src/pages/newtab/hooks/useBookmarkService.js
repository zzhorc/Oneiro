import { useState, useEffect, useCallback, useMemo } from "react";
import { 
    bookmarkService, 
    normalizeUrl, 
    extractDomain, 
    getUrlCategory, 
    getCategoryName 
} from "../services/bookmarkService";

export function useBookmarkService(initialBookmarks = []) {
    const [bookmarks, setBookmarks] = useState(initialBookmarks);
    const [groups, setGroups] = useState([]);
    const [archived, setArchived] = useState([]);
    const [syncState, setSyncState] = useState(bookmarkService.getSyncState());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = bookmarkService.subscribe(() => {
            setGroups(bookmarkService.getCustomGroups());
            setArchived(bookmarkService.getArchivedBookmarks());
            setSyncState(bookmarkService.getSyncState());
        });

        setGroups(bookmarkService.getCustomGroups());
        setArchived(bookmarkService.getArchivedBookmarks());
        setSyncState(bookmarkService.getSyncState());

        return unsubscribe;
    }, []);

    useEffect(() => {
        setBookmarks(initialBookmarks);
    }, [initialBookmarks]);

    const duplicates = useMemo(() => {
        return bookmarkService.detectDuplicates(bookmarks);
    }, [bookmarks]);

    const statistics = useMemo(() => {
        return bookmarkService.getStatistics(bookmarks);
    }, [bookmarks]);

    const smartGroups = useMemo(() => {
        return bookmarkService.smartGroup(bookmarks);
    }, [bookmarks]);

    const loadBookmarks = useCallback(async () => {
        setIsLoading(true);
        try {
            const loaded = await bookmarkService.getBookmarksTree();
            setBookmarks(loaded);
            return loaded;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeDuplicate = useCallback(async (bookmarkId) => {
        const success = await bookmarkService.removeDuplicate(bookmarkId);
        if (success) {
            await loadBookmarks();
        }
        return success;
    }, [loadBookmarks]);

    const mergeDuplicates = useCallback(async (duplicateGroup, keepIndex = 0) => {
        const removed = await bookmarkService.mergeDuplicates(duplicateGroup, keepIndex);
        if (removed.length > 0) {
            await loadBookmarks();
        }
        return removed;
    }, [loadBookmarks]);

    const createCustomGroup = useCallback((name, bookmarkIds = []) => {
        return bookmarkService.createCustomGroup(name, bookmarkIds);
    }, []);

    const updateCustomGroup = useCallback((groupId, updates) => {
        return bookmarkService.updateCustomGroup(groupId, updates);
    }, []);

    const deleteCustomGroup = useCallback((groupId) => {
        return bookmarkService.deleteCustomGroup(groupId);
    }, []);

    const addToGroup = useCallback((groupId, bookmarkId) => {
        return bookmarkService.addToGroup(groupId, bookmarkId);
    }, []);

    const removeFromGroup = useCallback((groupId, bookmarkId) => {
        return bookmarkService.removeFromGroup(groupId, bookmarkId);
    }, []);

    const getGroupBookmarks = useCallback((groupId) => {
        return bookmarkService.getGroupBookmarks(groupId, bookmarks);
    }, [bookmarks]);

    const archiveBookmark = useCallback(async (bookmarkId) => {
        const success = await bookmarkService.archiveBookmark(bookmarkId, bookmarks);
        if (success) {
            await loadBookmarks();
        }
        return success;
    }, [bookmarks, loadBookmarks]);

    const restoreBookmark = useCallback(async (bookmarkId) => {
        const success = await bookmarkService.restoreBookmark(bookmarkId);
        if (success) {
            await loadBookmarks();
        }
        return success;
    }, [loadBookmarks]);

    const deleteArchivedBookmark = useCallback((bookmarkId) => {
        return bookmarkService.deleteArchivedBookmark(bookmarkId);
    }, []);

    const createFolder = useCallback(async (title, parentId) => {
        const folder = await bookmarkService.createFolder(title, parentId);
        if (folder) {
            await loadBookmarks();
        }
        return folder;
    }, [loadBookmarks]);

    const moveBookmark = useCallback(async (bookmarkId, newParentId, index) => {
        const success = await bookmarkService.moveBookmark(bookmarkId, newParentId, index);
        if (success) {
            await loadBookmarks();
        }
        return success;
    }, [loadBookmarks]);

    const renameBookmark = useCallback(async (bookmarkId, newTitle) => {
        const success = await bookmarkService.renameBookmark(bookmarkId, newTitle);
        if (success) {
            await loadBookmarks();
        }
        return success;
    }, [loadBookmarks]);

    const syncWithBrowser = useCallback(async () => {
        const success = await bookmarkService.syncWithBrowser();
        if (success) {
            await loadBookmarks();
        }
        return success;
    }, [loadBookmarks]);

    const getFolderPath = useCallback((bookmarkId) => {
        return bookmarkService.getFolderPath(bookmarkId, bookmarks);
    }, [bookmarks]);

    return {
        bookmarks,
        groups,
        archived,
        syncState,
        isLoading,
        
        duplicates,
        statistics,
        smartGroups,
        
        loadBookmarks,
        removeDuplicate,
        mergeDuplicates,
        
        createCustomGroup,
        updateCustomGroup,
        deleteCustomGroup,
        addToGroup,
        removeFromGroup,
        getGroupBookmarks,
        
        archiveBookmark,
        restoreBookmark,
        deleteArchivedBookmark,
        
        createFolder,
        moveBookmark,
        renameBookmark,
        
        syncWithBrowser,
        getFolderPath,
        
        normalizeUrl,
        extractDomain,
        getUrlCategory,
        getCategoryName
    };
}
