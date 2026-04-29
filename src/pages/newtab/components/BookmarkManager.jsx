import { useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  IoCloseOutline as CloseIcon,
  IoAlertCircleOutline as AlertIcon,
  IoArchiveOutline as ArchiveIcon,
  IoFolderOpenOutline as FolderIcon,
  IoTrashOutline as TrashIcon,
  IoRefreshOutline as RefreshIcon,
  IoCheckmarkOutline as CheckIcon,
  IoChevronForwardOutline as ChevronIcon,
  IoBookmarksOutline as BookmarksIcon,
  IoLayersOutline as LayersIcon
} from "react-icons/io5";
import { useBookmarkService } from "../hooks/useBookmarkService";
import BookmarkItem from "./BookmarkItem";

export default function BookmarkManager({ isOpen, onClose, bookmarks, iconType }) {
  const [activeTab, setActiveTab] = useState('duplicates');
  const [selectedDuplicates, setSelectedDuplicates] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    duplicates,
    statistics,
    smartGroups,
    groups,
    archived,
    
    removeDuplicate,
    mergeDuplicates,
    archiveBookmark,
    restoreBookmark,
    deleteArchivedBookmark,
    createCustomGroup,
    deleteCustomGroup,
    addToGroup,
    removeFromGroup,
    getGroupBookmarks
  } = useBookmarkService(bookmarks);

  const handleSelectDuplicate = useCallback((groupId, bookmarkId, isAll = false) => {
    setSelectedDuplicates(prev => {
      const next = new Set(prev);
      if (isAll) {
        const group = duplicates.find(g => g.url === groupId);
        if (group) {
          group.items.forEach((item, index) => {
            if (index > 0) {
              const key = `${groupId}-${item.id}`;
              if (next.has(key)) {
                next.delete(key);
              } else {
                next.add(key);
              }
            }
          });
        }
      } else {
        const key = `${groupId}-${bookmarkId}`;
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
      }
      return next;
    });
  }, [duplicates]);

  const handleRemoveSelected = useCallback(async () => {
    setIsProcessing(true);
    try {
      for (const key of selectedDuplicates) {
        const [, bookmarkId] = key.split('-');
        await removeDuplicate(bookmarkId);
      }
      setSelectedDuplicates(new Set());
    } finally {
      setIsProcessing(false);
    }
  }, [selectedDuplicates, removeDuplicate]);

  const handleArchive = useCallback(async (bookmarkId) => {
    setIsProcessing(true);
    try {
      await archiveBookmark(bookmarkId);
    } finally {
      setIsProcessing(false);
    }
  }, [archiveBookmark]);

  const handleRestore = useCallback(async (bookmarkId) => {
    setIsProcessing(true);
    try {
      await restoreBookmark(bookmarkId);
    } finally {
      setIsProcessing(false);
    }
  }, [restoreBookmark]);

  const handleDeleteArchived = useCallback((bookmarkId) => {
    deleteArchivedBookmark(bookmarkId);
  }, [deleteArchivedBookmark]);

  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);

  const handleCreateGroup = useCallback(() => {
    if (newGroupName.trim()) {
      createCustomGroup(newGroupName.trim());
      setNewGroupName('');
      setShowNewGroupInput(false);
    }
  }, [newGroupName, createCustomGroup]);

  const totalSelected = selectedDuplicates.size;
  const totalDuplicates = duplicates.reduce((acc, g) => acc + Math.max(0, g.items.length - 1), 0);

  const tabs = [
    { 
      id: 'duplicates', 
      label: '重复检测', 
      icon: AlertIcon,
      badge: totalDuplicates > 0 ? totalDuplicates : null
    },
    { 
      id: 'smart-groups', 
      label: '智能分组', 
      icon: LayersIcon,
      badge: null
    },
    { 
      id: 'custom-groups', 
      label: '自定义分组', 
      icon: FolderIcon,
      badge: groups.length > 0 ? groups.length : null
    },
    { 
      id: 'archive', 
      label: '归档收藏', 
      icon: ArchiveIcon,
      badge: archived.length > 0 ? archived.length : null
    }
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-base-100/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-base-200/50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookmarksIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">书签管理</h2>
              {statistics && (
                <p className="text-xs text-base-content/50">
                  共 {statistics.totalItems} 个书签 · {statistics.totalFolders} 个文件夹
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-base-200/50 transition-colors"
            type="button"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-base-200/50 px-4 pt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'text-primary bg-primary/5 border-b-2 border-primary'
                  : 'text-base-content/60 hover:text-base-content hover:bg-base-200/30'
              }`}
              type="button"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== null && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary'
                    : 'bg-base-200 text-base-content/60'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'duplicates' && (
            <div className="space-y-4">
              {duplicates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                    <CheckIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">没有发现重复书签</h3>
                  <p className="text-sm text-base-content/50">您的书签库非常整洁！</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3 bg-base-200/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertIcon className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium">
                        发现 {duplicates.length} 组重复书签，共 {totalDuplicates} 个重复项
                      </span>
                    </div>
                    {totalSelected > 0 && (
                      <button
                        onClick={handleRemoveSelected}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        type="button"
                      >
                        <TrashIcon className="w-4 h-4" />
                        删除选中 ({totalSelected})
                      </button>
                    )}
                  </div>

                  {duplicates.map((group, groupIndex) => (
                    <div key={group.url} className="bg-base-200/30 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-base-200/50">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={group.items.slice(1).every((item) => 
                              selectedDuplicates.has(`${group.url}-${item.id}`)
                            )}
                            onChange={() => handleSelectDuplicate(group.url, null, true)}
                          />
                          <div>
                            <p className="text-sm font-medium">{group.title}</p>
                            <p className="text-xs text-base-content/50">{group.originalUrl}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-md">
                          {group.items.length} 个重复
                        </span>
                      </div>
                      
                      <div className="divide-y divide-base-200/50">
                        {group.items.map((item, itemIndex) => (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-base-200/30 transition-colors">
                            {itemIndex > 0 && (
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={selectedDuplicates.has(`${group.url}-${item.id}`)}
                                onChange={() => handleSelectDuplicate(group.url, item.id)}
                              />
                            )}
                            {itemIndex === 0 && (
                              <div className="w-4 flex items-center justify-center">
                                <CheckIcon className="w-4 h-4 text-green-500" />
                              </div>
                            )}
                            
                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0">
                              {item.favicon ? (
                                <img 
                                  src={item.favicon} 
                                  alt="" 
                                  className="w-5 h-5"
                                />
                              ) : (
                                <span className="text-sm font-medium">{item.title?.[0] || '?'}</span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <p className="text-xs text-base-content/50 truncate">{item.url}</p>
                            </div>
                            
                            {itemIndex === 0 && (
                              <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
                                保留
                              </span>
                            )}
                            
                            {itemIndex > 0 && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleArchive(item.id)}
                                  disabled={isProcessing}
                                  className="p-1.5 rounded-md hover:bg-base-200/50 transition-colors text-base-content/50 hover:text-base-content"
                                  title="归档"
                                  type="button"
                                >
                                  <ArchiveIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSelectDuplicate(group.url, item.id)}
                                  className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-base-content/50 hover:text-red-500"
                                  title="标记删除"
                                  type="button"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'smart-groups' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(smartGroups.byCategory).map(([category, group]) => (
                  <div key={category} className="bg-base-200/30 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-base-200/50">
                      <div className="flex items-center gap-3">
                        <FolderIcon className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">{group.name}</span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                        {group.items.length} 项
                      </span>
                    </div>
                    
                    <div className="p-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {group.items.slice(0, 8).map(item => (
                          <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-base-100/50 rounded-lg">
                            {item.favicon ? (
                              <img src={item.favicon} alt="" className="w-4 h-4" />
                            ) : (
                              <span className="text-xs">{item.title?.[0] || '?'}</span>
                            )}
                            <span className="text-xs truncate">{item.title}</span>
                          </div>
                        ))}
                        {group.items.length > 8 && (
                          <div className="flex items-center justify-center px-3 py-2 bg-base-100/30 rounded-lg">
                            <span className="text-xs text-base-content/50">
                              +{group.items.length - 8} 更多
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {statistics && (
                <div className="mt-6 p-4 bg-base-200/30 rounded-xl">
                  <h3 className="text-sm font-medium mb-3">书签统计</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{statistics.totalItems}</p>
                      <p className="text-xs text-base-content/50">总书签数</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{statistics.totalFolders}</p>
                      <p className="text-xs text-base-content/50">文件夹数</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{statistics.maxDepth}</p>
                      <p className="text-xs text-base-content/50">最大深度</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{duplicates.length}</p>
                      <p className="text-xs text-base-content/50">重复组数</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom-groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">自定义分组</h3>
                {!showNewGroupInput && (
                  <button
                    onClick={() => setShowNewGroupInput(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    type="button"
                  >
                    <FolderIcon className="w-4 h-4" />
                    新建分组
                  </button>
                )}
              </div>

              {showNewGroupInput && (
                <div className="flex items-center gap-2 p-3 bg-base-200/30 rounded-xl">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="输入分组名称..."
                    className="flex-1 px-3 py-1.5 bg-base-100 rounded-lg text-sm border border-base-200 focus:border-primary focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateGroup();
                      if (e.key === 'Escape') {
                        setShowNewGroupInput(false);
                        setNewGroupName('');
                      }
                    }}
                  />
                  <button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    创建
                  </button>
                  <button
                    onClick={() => {
                      setShowNewGroupInput(false);
                      setNewGroupName('');
                    }}
                    className="px-3 py-1.5 text-sm bg-base-200 text-base-content/60 rounded-lg hover:bg-base-300 transition-colors"
                    type="button"
                  >
                    取消
                  </button>
                </div>
              )}

              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-base-200/50 flex items-center justify-center mb-4">
                    <FolderIcon className="w-8 h-8 text-base-content/30" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">还没有自定义分组</h3>
                  <p className="text-sm text-base-content/50">点击"新建分组"创建您的第一个自定义分组</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {groups.map(group => {
                    const groupBookmarks = getGroupBookmarks(group.id);
                    return (
                      <div key={group.id} className="bg-base-200/30 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${group.color}20`, color: group.color }}
                            >
                              <FolderIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{group.name}</p>
                              <p className="text-xs text-base-content/50">{groupBookmarks.length} 个书签</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteCustomGroup(group.id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-base-content/50 hover:text-red-500"
                            title="删除分组"
                            type="button"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {groupBookmarks.length > 0 && (
                          <div className="px-4 pb-3">
                            <div className="flex flex-wrap gap-2">
                              {groupBookmarks.map(item => (
                                <div 
                                  key={item.id} 
                                  className="flex items-center gap-2 px-2 py-1 bg-base-100/50 rounded-md text-xs"
                                >
                                  {item.favicon && (
                                    <img src={item.favicon} alt="" className="w-3 h-3" />
                                  )}
                                  <span className="truncate max-w-[100px]">{item.title}</span>
                                  <button
                                    onClick={() => removeFromGroup(group.id, item.id)}
                                    className="p-0.5 rounded hover:bg-red-500/10 text-base-content/40 hover:text-red-500"
                                    type="button"
                                  >
                                    <CloseIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="space-y-4">
              {archived.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-base-200/50 flex items-center justify-center mb-4">
                    <ArchiveIcon className="w-8 h-8 text-base-content/30" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">归档文件夹为空</h3>
                  <p className="text-sm text-base-content/50">您可以在重复检测中选择归档不需要的书签</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {archived.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-base-200/30 rounded-xl hover:bg-base-200/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0">
                        {item.favicon ? (
                          <img src={item.favicon} alt="" className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-medium">{item.title?.[0] || '?'}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-base-content/50 truncate">{item.url}</p>
                        {item.archivedAt && (
                          <p className="text-xs text-base-content/30">
                            归档于 {new Date(item.archivedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRestore(item.id)}
                          disabled={isProcessing}
                          className="p-1.5 rounded-md hover:bg-green-500/10 transition-colors text-base-content/50 hover:text-green-500"
                          title="恢复"
                          type="button"
                        >
                          <RefreshIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArchived(item.id)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 transition-colors text-base-content/50 hover:text-red-500"
                          title="永久删除"
                          type="button"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
