import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { IoFolderOpenOutline as FolderOpenIcon } from "react-icons/io5";
import BookmarkItem from "./BookmarkItem";

/**
 * 书签文件夹组件
 * 使用 createPortal 将弹出面板渲染到 body 层级
 * 仅通过 ✕ 关闭按钮关闭，避免嵌套层级被一起关闭
 */
export default function BookmarkFolder({ folder, depth = 0, iconType, layoutType = "grid" }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    const handleClose = useCallback((e) => {
        e.stopPropagation();
        setIsOpen(false);
    }, []);

    // 计算嵌套层级的 z-index 和尺寸
    const zBase = 200 + depth * 10;
    // 每层嵌套缩小 4%，基础取 94vw，确保在 Popup (460px) 能撑满绝大部分面积
    const panelWidth = Math.max(80, 94 - depth * 4);

    const folderPanel = isOpen ? createPortal(
        <>
            {/* 遮罩层 - 点击关闭当前层级文件夹 */}
            <div
                className="bookmark-folder-overlay"
                style={{ zIndex: zBase - 1 }}
                onClick={handleClose}
            />
            {/* 面板 - 追加 popup-mode 让内部图标能正确享有同等缩放约束 */}
            <div
                className="bookmark-folder-panel popup-mode animate__animated animate__fadeIn animate__faster"
                style={{
                    zIndex: zBase,
                    width: `min(${panelWidth}vw, 800px)`,
                }}
            >
                <div className="bookmark-folder-panel-header">
                    <span>{folder.title}</span>
                    <button
                        className="bookmark-folder-close"
                        onClick={handleClose}
                        type="button"
                    >
                        ✕
                    </button>
                </div>
                <div className={`bookmark-folder-grid layout-${layoutType}`}>
                    {folder.children.map((child) =>
                        child.children ? (
                            <BookmarkFolder key={child.id} folder={child} depth={depth + 1} iconType={iconType} layoutType={layoutType} />
                        ) : (
                            <BookmarkItem key={child.id} bookmark={child} iconType={iconType} />
                        )
                    )}
                    {folder.children.length === 0 && (
                        <div className="bookmark-folder-empty">空文件夹</div>
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
                <div className="bookmark-icon-wrapper bookmark-folder-icon">
                    <FolderOpenIcon className="w-7 h-7" />
                </div>
                <span className="bookmark-label">{folder.title}</span>
            </button>
            {folderPanel}
        </div>
    );
}
