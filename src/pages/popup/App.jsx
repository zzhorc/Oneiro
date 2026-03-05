import React, { useState } from "react";
import BookmarkBar from "../newtab/components/BookmarkBar";
import QuickSitesBar from "../newtab/components/QuickSitesBar";
import { useBookmarks } from "../newtab/hooks/useBookmarks";
import { useQuickSites } from "../newtab/hooks/useQuickSites";
import { useBookmarkSettings } from "../newtab/hooks/useBookmarkSettings";
import { IoGridOutline, IoListOutline, IoNewspaperOutline } from "react-icons/io5";

function App() {
    const { bookmarks, loading } = useBookmarks();
    const { sites, addSite, editSite, removeSite } = useQuickSites();
    const { showBookmarks, showQuickSites, iconType, currentFont, bookmarkLayout, toggleBookmarkLayout } = useBookmarkSettings();

    const [isQuickSitesExpanded, setIsQuickSitesExpanded] = useState(false);
    const [isBookmarkExpanded, setIsBookmarkExpanded] = useState(false);

    // 自定义缩放逻辑 - 移除持久化，每次打开使用默认尺寸
    const [popupSize, setPopupSize] = useState({
        width: 500,
        height: 0 // 0 means auto
    });

    const handleResizeStart = React.useCallback((e) => {
        e.preventDefault();
        const startX = e.screenX;
        const startY = e.screenY;
        const startWidth = popupSize.width;

        // If height was 'auto' (0), capture the actual computed height to start dragging from
        const container = e.currentTarget.parentElement;
        const startHeight = popupSize.height > 0 ? popupSize.height : container.getBoundingClientRect().height;

        const onMouseMove = (moveEvent) => {
            // 左下角拉伸：向左拖动（screenX 减小）意味着宽度增加
            const dx = startX - moveEvent.screenX;
            // 向下拖动（screenY 增加）意味着高度增加
            const dy = moveEvent.screenY - startY;
            setPopupSize({
                width: Math.max(380, Math.min(800, startWidth + dx)),
                height: Math.max(240, Math.min(600, startHeight + dy))
            });
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [popupSize]);

    const bothVisible = true;

    const layoutTitle = bookmarkLayout === "grid" ? "网格视图" :
        bookmarkLayout === "magazine" ? "杂志视图" : "列表视图";

    return (
        <div
            className="custom-font popup-shell popup-mode overflow-y-auto overflow-x-hidden bg-base-100 p-3 flex flex-col gap-2 origin-top-left transition-none relative"
            style={{
                "--custom-font-name": currentFont,
                width: `${popupSize.width}px`,
                height: popupSize.height > 0 ? `${popupSize.height}px` : "auto",
                minHeight: "240px",
                maxHeight: "580px"
            }}
        >
            {/* 自定义左下角拖拽手柄 */}
            <div
                className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize z-50 flex items-end justify-start p-1 opacity-20 hover:opacity-100 transition-opacity"
                onMouseDown={handleResizeStart}
            >
                <div className="w-2.5 h-2.5 border-l-2 border-b-2 border-base-content rounded-bl-sm" />
            </div>
            <div className="w-full flex justify-between items-center mb-1 px-2">
                <h1 className="text-2xl font-bold opacity-80 tracking-wide">Oneiro</h1>
                <div className="flex gap-2 items-center">
                    <button onClick={toggleBookmarkLayout} className="btn btn-ghost btn-xs btn-square" title={layoutTitle}>
                        {bookmarkLayout === "grid" && <IoGridOutline className="w-4 h-4 opacity-70" />}
                        {bookmarkLayout === "magazine" && <IoNewspaperOutline className="w-4 h-4 opacity-70" />}
                        {bookmarkLayout === "list" && <IoListOutline className="w-4 h-4 opacity-70" />}
                    </button>
                    <div className="text-xs opacity-50 bg-base-200 px-2 py-1 rounded-full">导航中心</div>
                </div>
            </div>

            <div className="sections-wrapper w-full flex flex-col gap-3">
                <>
                    <div className="section-label px-2 mt-2">书签</div>
                    <BookmarkBar
                        bookmarks={bookmarks}
                        loading={loading}
                        visibleRows={5}
                        isExpanded={isBookmarkExpanded}
                        toggleExpand={() => setIsBookmarkExpanded((prev) => !prev)}
                        iconType={iconType}
                        layoutType={bookmarkLayout}
                    />
                </>

                <>
                    <div className="section-label px-2 mt-4">常用网站</div>
                    <QuickSitesBar
                        sites={sites}
                        addSite={addSite}
                        editSite={editSite}
                        removeSite={removeSite}
                        iconType={iconType}
                        visibleRows={2}
                        isExpanded={isQuickSitesExpanded}
                        toggleExpand={() => setIsQuickSitesExpanded((prev) => !prev)}
                        layoutType={bookmarkLayout}
                    />
                </>
            </div>
        </div>
    );
}

export default App;
