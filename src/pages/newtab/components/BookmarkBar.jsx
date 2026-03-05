import { useRef, useState, useEffect } from "react";
import { IoChevronDownOutline as ExpandIcon, IoChevronUpOutline as CollapseIcon } from "react-icons/io5";
import BookmarkItem from "./BookmarkItem";
import BookmarkFolder from "./BookmarkFolder";

/**
 * 书签栏整体容器组件
 * 使用 CSS auto-fill Grid 自动适应窗口宽度
 * 展开/收起基于实际渲染行数
 */
export default function BookmarkBar({ bookmarks, loading, visibleRows, isExpanded, toggleExpand, iconType, layoutType = "grid" }) {
    const gridRef = useRef(null);
    const [needsExpand, setNeedsExpand] = useState(false);
    const [maxHeight, setMaxHeight] = useState("none");

    // 监听容器变化，计算可见行高度
    useEffect(() => {
        if (!gridRef.current || bookmarks.length === 0) return;

        const computeHeight = () => {
            const grid = gridRef.current;
            if (!grid || !grid.firstElementChild) return;

            // 获取第一个子元素的实际高度（含 margin/gap）
            const firstItem = grid.firstElementChild;
            const itemRect = firstItem.getBoundingClientRect();
            const gridStyle = window.getComputedStyle(grid);
            const rowGap = parseFloat(gridStyle.rowGap) || 0;

            const rowHeight = itemRect.height + rowGap;
            const totalRows = Math.ceil(grid.scrollHeight / rowHeight);

            setNeedsExpand(totalRows > visibleRows);

            if (!isExpanded && totalRows > visibleRows) {
                setMaxHeight(`${rowHeight * visibleRows}px`);
            } else {
                setMaxHeight("none");
            }
        };

        // 用 ResizeObserver 监听尺寸变化
        const observer = new ResizeObserver(() => computeHeight());
        observer.observe(gridRef.current);

        return () => observer.disconnect();
    }, [bookmarks, visibleRows, isExpanded]);

    if (loading) return null;
    if (bookmarks.length === 0) return null;

    return (
        <div className="bookmark-bar-wrapper">
            <div
                ref={gridRef}
                className={`bookmark-bar-grid layout-${layoutType}`}
                style={{
                    maxHeight: maxHeight,
                    overflow: maxHeight !== "none" ? "hidden" : "visible",
                }}
            >
                {bookmarks.map((item) =>
                    item.children ? (
                        <BookmarkFolder key={item.id} folder={item} iconType={iconType} layoutType={layoutType} />
                    ) : (
                        <BookmarkItem key={item.id} bookmark={item} iconType={iconType} />
                    )
                )}
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
        </div>
    );
}
