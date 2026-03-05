import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoAddOutline as AddIcon, IoCloseOutline as RemoveIcon, IoCreateOutline as EditIcon } from "react-icons/io5";
import { IoChevronDownOutline as ExpandIcon, IoChevronUpOutline as CollapseIcon } from "react-icons/io5";
import BookmarkItem from "./BookmarkItem";
import QuickSiteEditor from "./QuickSiteEditor";

/**
 * 常用网站展示栏
 * 复用 BookmarkItem 组件，末尾添加「+」按钮，支持自动折叠
 */
export default function QuickSitesBar({ sites, addSite, editSite, removeSite, iconType, visibleRows, isExpanded, toggleExpand, layoutType = "grid" }) {
    const [editorState, setEditorState] = useState(null); // null | { mode: "add" } | { mode: "edit", site }
    const [contextMenu, setContextMenu] = useState(null); // null | { siteId, x, y }
    const gridRef = useRef(null);
    const [needsExpand, setNeedsExpand] = useState(false);
    const [maxHeight, setMaxHeight] = useState("none");

    // 监听容器变化，计算可见行高度
    useEffect(() => {
        if (!gridRef.current) return;

        const computeHeight = () => {
            const grid = gridRef.current;
            if (!grid || !grid.firstElementChild) return;

            // 获取第一个子元素的实际高度（含 margin/gap）
            const firstItem = grid.firstElementChild;
            const itemRect = firstItem.getBoundingClientRect();
            const gridStyle = window.getComputedStyle(grid);
            const rowGap = parseFloat(gridStyle.rowGap) || 0;

            const rowHeight = itemRect.height + rowGap;
            // +1 是为了包含添加按钮的计算
            const totalRows = Math.ceil(grid.scrollHeight / rowHeight);

            setNeedsExpand(totalRows > visibleRows);

            if (!isExpanded && totalRows > visibleRows) {
                setMaxHeight(`${rowHeight * visibleRows}px`);
            } else {
                setMaxHeight("none");
            }
        };

        const observer = new ResizeObserver(() => computeHeight());
        observer.observe(gridRef.current);

        return () => observer.disconnect();
    }, [sites.length, visibleRows, isExpanded]);

    const handleAdd = useCallback(() => {
        setEditorState({ mode: "add" });
    }, []);

    const handleEdit = useCallback((site) => {
        setContextMenu(null);
        setEditorState({ mode: "edit", site });
    }, []);

    const handleRemove = useCallback((id) => {
        setContextMenu(null);
        removeSite(id);
    }, [removeSite]);

    const handleSave = useCallback((title, url) => {
        if (editorState.mode === "add") {
            addSite(title, url);
        } else {
            editSite(editorState.site.id, title, url);
        }
        setEditorState(null);
    }, [editorState, addSite, editSite]);

    const handleContextMenu = useCallback((e, site) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ siteId: site.id, site, x: e.clientX, y: e.clientY });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    // 点击其他地方关闭右键菜单
    const contextMenuOverlay = contextMenu ? createPortal(
        <>
            <div
                style={{ position: "fixed", inset: 0, zIndex: 998 }}
                onClick={closeContextMenu}
                onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }}
            />
            <div
                className="quicksite-context-menu animate__animated animate__fadeIn animate__faster"
                style={{
                    position: "fixed",
                    top: `${contextMenu.y}px`,
                    left: `${contextMenu.x}px`,
                    zIndex: 999,
                }}
            >
                <button
                    className="quicksite-context-item"
                    onClick={() => handleEdit(contextMenu.site)}
                    type="button"
                >
                    <EditIcon className="w-4 h-4" />
                    <span>编辑</span>
                </button>
                <button
                    className="quicksite-context-item quicksite-context-danger"
                    onClick={() => handleRemove(contextMenu.siteId)}
                    type="button"
                >
                    <RemoveIcon className="w-4 h-4" />
                    <span>删除</span>
                </button>
            </div>
        </>,
        document.body
    ) : null;

    const editor = editorState ? createPortal(
        <QuickSiteEditor
            site={editorState.mode === "edit" ? editorState.site : null}
            onSave={handleSave}
            onCancel={() => setEditorState(null)}
        />,
        document.body
    ) : null;

    return (
        <div className="quicksites-bar-wrapper">
            <div
                ref={gridRef}
                className={`quicksites-bar-grid layout-${layoutType}`}
                style={{
                    maxHeight: maxHeight,
                    overflow: maxHeight !== "none" ? "hidden" : "visible",
                }}
            >
                {sites.map((site) => (
                    <div key={site.id} onContextMenu={(e) => handleContextMenu(e, site)}>
                        <BookmarkItem bookmark={site} iconType={iconType} />
                    </div>
                ))}
                {/* 添加按钮 */}
                <button
                    className="bookmark-item group quicksite-add-btn"
                    onClick={handleAdd}
                    type="button"
                >
                    <div className="bookmark-icon-wrapper quicksite-add-icon">
                        <AddIcon className="w-6 h-6" />
                    </div>
                    <span className="bookmark-label">添加</span>
                </button>
            </div>

            {/* 展开/收起按钮 */}
            {needsExpand && (
                <button
                    className="bookmark-expand-btn"
                    onClick={toggleExpand}
                    type="button"
                >
                    {isExpanded ? (
                        <CollapseIcon className="w-5 h-5" />
                    ) : (
                        <ExpandIcon className="w-5 h-5" />
                    )}
                </button>
            )}

            {contextMenuOverlay}
            {editor}
        </div>
    );
}
