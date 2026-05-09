import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
    IoFolderOpenOutline as FolderOpenIcon,
    IoChevronBackOutline as BackIcon
} from "react-icons/io5";
import BookmarkItem from "./BookmarkItem";

const MAX_NESTING_DEPTH = 5;

export default function BookmarkFolder({ 
    folder, 
    depth = 0, 
    iconType, 
    layoutType = "grid",
    onOpen,
    onClose,
    parentFolders = []
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const effectiveDepth = Math.min(depth, MAX_NESTING_DEPTH);
    const zBase = 200 + effectiveDepth * 10;
    const panelWidth = Math.max(80, 94 - effectiveDepth * 3);
    const currentPath = [...parentFolders, folder];

    const toggleOpen = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isOpen) {
            closeFolder();
        } else {
            openFolder();
        }
    }, [isOpen]);

    const openFolder = useCallback(() => {
        setIsOpen(true);
        setIsClosing(false);
        if (onOpen) onOpen(folder);
    }, [folder, onOpen]);

    const closeFolder = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
            if (onClose) onClose(folder);
        }, 200);
    }, [folder, onClose]);

    const handleOverlayClick = useCallback((e) => {
        e.stopPropagation();
        closeFolder();
    }, [closeFolder]);

    const handleBackClick = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        closeFolder();
    }, [closeFolder]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeFolder();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeFolder]);

    const childCount = folder.children?.length || 0;
    const subFolderCount = folder.children?.filter(c => c.children).length || 0;

    const folderPanel = isOpen ? createPortal(
        <>
            <div
                className={`bookmark-folder-overlay ${isClosing ? 'animate__animated animate__fadeOut' : ''}`}
                style={{ 
                    zIndex: zBase - 1,
                    animation: isClosing ? 'none' : undefined
                }}
                onClick={handleOverlayClick}
            />
            
            <div
                className={`bookmark-folder-panel popup-mode ${
                    isClosing 
                        ? 'animate__animated animate__fadeOut animate__faster' 
                        : 'animate__animated animate__fadeIn animate__faster'
                }`}
                style={{
                    zIndex: zBase,
                    width: `min(${panelWidth}vw, 900px)`,
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div className="bookmark-folder-panel-header" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <div className="flex items-center gap-2">
                        {depth > 0 && (
                            <button
                                onClick={handleBackClick}
                                className="bookmark-folder-back-btn p-1 rounded-md hover:bg-base-200/50 transition-colors"
                                title="返回上一级"
                                type="button"
                            >
                                <BackIcon className="w-5 h-5" />
                            </button>
                        )}
                        <div className="flex flex-col">
                            <span className="text-base font-semibold">{folder.title}</span>
                            {currentPath.length > 1 && (
                                <div className="flex items-center gap-1 text-xs opacity-50 mt-0.5">
                                    {currentPath.slice(0, -1).map((f, i) => (
                                        <span key={i} className="flex items-center gap-1">
                                            <span>{f.title}</span>
                                            <span className="text-[10px]">›</span>
                                        </span>
                                    ))}
                                    <span className="font-medium">{folder.title}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {childCount > 0 && (
                            <span className="text-xs opacity-50">
                                {childCount} 项
                                {subFolderCount > 0 && ` · ${subFolderCount} 个文件夹`}
                            </span>
                        )}
                        <button
                            className="bookmark-folder-close"
                            onClick={handleOverlayClick}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {depth >= MAX_NESTING_DEPTH && subFolderCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs border-b border-yellow-500/20">
                        <span>⚠️ 已达最大嵌套深度 ({MAX_NESTING_DEPTH})，子文件夹将不再展开</span>
                    </div>
                )}

                <div 
                    className={`bookmark-folder-grid layout-${layoutType}`}
                    style={{ 
                        flex: 1, 
                        overflowY: 'auto',
                        padding: '0.5rem 0.75rem'
                    }}
                >
                    {folder.children.map((child) =>
                        child.children ? (
                            depth < MAX_NESTING_DEPTH ? (
                                <BookmarkFolder 
                                    key={child.id} 
                                    folder={child} 
                                    depth={depth + 1} 
                                    iconType={iconType} 
                                    layoutType={layoutType}
                                    onOpen={onOpen}
                                    onClose={onClose}
                                    parentFolders={currentPath}
                                />
                            ) : (
                                <div 
                                    key={child.id}
                                    className="bookmark-folder-container opacity-50"
                                    title="嵌套过深，无法展开"
                                >
                                    <button
                                        className="bookmark-item group cursor-not-allowed"
                                        onClick={(e) => e.preventDefault()}
                                        type="button"
                                        disabled
                                    >
                                        <div className="bookmark-icon-wrapper bookmark-folder-icon grayscale">
                                            <FolderOpenIcon className="w-7 h-7" />
                                        </div>
                                        <span className="bookmark-label">{child.title}</span>
                                    </button>
                                </div>
                            )
                        ) : (
                            <BookmarkItem key={child.id} bookmark={child} iconType={iconType} />
                        )
                    )}
                    {folder.children.length === 0 && (
                        <div className="bookmark-folder-empty col-span-full text-center py-8 opacity-40">
                            <FolderOpenIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>空文件夹</p>
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body
    ) : null;

    return (
        <div className="bookmark-folder-container">
            <button
                className="bookmark-item group"
                onClick={toggleOpen}
                type="button"
            >
                <div className="bookmark-icon-wrapper bookmark-folder-icon relative overflow-hidden">
                    <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            background: `linear-gradient(135deg, 
                                hsl(${depth * 45}, 70%, 60%) 0%, 
                                hsl(${depth * 45 + 30}, 70%, 60%) 100%)`
                        }}
                    />
                    <FolderOpenIcon className="w-7 h-7 relative z-10" />
                </div>
                <span className="bookmark-label">{folder.title}</span>
            </button>
            {folderPanel}
        </div>
    );
}
