import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { browser } from "wxt/browser";

/**
 * 单个书签图标组件
 * Apple 风格圆角方形 favicon + 名称
 * Tooltip 通过 createPortal 渲染到 body 层，避免被父容器裁切
 */
export default function BookmarkItem({ bookmark, iconType = "favicon" }) {
    const [imgError, setImgError] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const tooltipTimeout = useRef(null);
    const itemRef = useRef(null);

    const handleMouseEnter = useCallback(() => {
        tooltipTimeout.current = setTimeout(() => {
            if (itemRef.current) {
                const rect = itemRef.current.getBoundingClientRect();
                setTooltipPos({
                    top: rect.top - 8,
                    left: rect.left + rect.width / 2,
                });
            }
            setShowTooltip(true);
        }, 400);
    }, []);

    const handleMouseLeave = useCallback(() => {
        clearTimeout(tooltipTimeout.current);
        setShowTooltip(false);
    }, []);

    const firstChar = bookmark.title ? bookmark.title.charAt(0).toUpperCase() : "?";

    const tooltip = showTooltip ? createPortal(
        <div
            className="bookmark-tooltip"
            style={{
                position: "fixed",
                top: `${tooltipPos.top}px`,
                left: `${tooltipPos.left}px`,
                transform: "translate(-50%, -100%)",
                zIndex: 9999,
            }}
        >
            <div className="bookmark-tooltip-title">{bookmark.title}</div>
            <div className="bookmark-tooltip-url">{bookmark.url}</div>
        </div>,
        document.body
    ) : null;

    const handleClick = useCallback((e) => {
        // 让按住 Cmd/Ctrl 点击的新标签页原生行为正常工作
        if (e.ctrlKey || e.metaKey || e.button === 1) return;

        e.preventDefault();
        browser.tabs.create({ url: bookmark.url, active: true });
    }, [bookmark.url]);

    return (
        <a
            ref={itemRef}
            href={bookmark.url}
            className="bookmark-item group"
            title=""
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="bookmark-icon-wrapper">
                {iconType !== "letter" && !imgError && bookmark.favicon ? (
                    <img
                        src={bookmark.favicon}
                        alt=""
                        className={`bookmark-favicon${iconType === "bw-favicon" ? " bookmark-favicon-bw" : ""}`}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div className="bookmark-fallback-icon">
                        {firstChar}
                    </div>
                )}
            </div>
            <span className="bookmark-label">{bookmark.title}</span>
            {tooltip}
        </a>
    );
}
