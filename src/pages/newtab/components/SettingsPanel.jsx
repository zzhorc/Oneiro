import { useState, useCallback, useRef, useEffect } from "react";
import {
  IoSettingsOutline as SettingsIcon,
  IoMoonOutline as MoonIcon,
  IoSunnyOutline as SunIcon,
  IoImageOutline as ImageIcon,
  IoTextOutline as TextIcon,
  IoContrastOutline as BwIcon,
  IoBookmarksOutline as BookmarkIcon,
  IoGlobeOutline as GlobeIcon,
  IoGridOutline as GridIcon,
  IoChevronDownOutline as ChevronDownIcon,
  IoChevronUpOutline as ChevronUpIcon,
  IoListOutline as ManageIcon,
  IoColorPaletteOutline as VisualIcon,
  IoSearchOutline as SearchIcon
} from "react-icons/io5";
import { MdTimelapse as SyncIcon } from "react-icons/md";
import { BiFontFamily as FontIcon } from "react-icons/bi";
import CATEGORIES from "sentences-bundle/categories.json";
import BookmarkManager from "./BookmarkManager";
import VisualSettingsPanel from "./VisualSettingsPanel";

/**
 * 统一设置面板
 * 左下角齿轮按钮 → 分组式毛玻璃菜单
 */
export default function SettingsPanel({
  theme,
  onThemeToggle,
  onFontToggle,
  visibleRows,
  onRowsCycle,
  iconType,
  onIconTypeToggle,
  showBookmarks,
  onToggleBookmarks,
  showQuickSites,
  onToggleQuickSites,
  maxIconsPerRow,
  onMaxIconsPerRowChange,
  selectedCategories,
  onToggleCategory,
  bookmarks = [],
  favoriteContentCount = 0,
  showFavoriteContentsOnly = false,
  onToggleFavoriteContentsOnly,
  poemSearchEngineLabel = "百度",
  onSearchEngineCycle,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [isBookmarkManagerOpen, setIsBookmarkManagerOpen] = useState(false);
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState(false);
  const panelRef = useRef(null);

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const themeLabel = theme === "sync" ? "跟随系统" : theme === "dark" ? "深色" : "浅色";
  const iconTypeLabel = iconType === "favicon" ? "彩色" : iconType === "bw-favicon" ? "黑白" : "首字";

  return (
    <div ref={panelRef} className="settings-container">
      <button
        className="settings-trigger"
        onClick={togglePanel}
        type="button"
        title="设置"
      >
        <SettingsIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="settings-popover animate__animated animate__fadeIn animate__faster">
          {/* 外观 */}
          <div className="settings-group-title">外观</div>

          <button className="settings-row" onClick={onThemeToggle} type="button">
            <span className="settings-row-icon">
              {theme === "light" && <SunIcon className="w-5 h-5" />}
              {theme === "dark" && <MoonIcon className="w-5 h-5" />}
              {theme === "sync" && <SyncIcon className="w-5 h-5" />}
            </span>
            <span className="settings-row-label">主题</span>
            <span className="settings-row-value">{themeLabel}</span>
          </button>

          <button className="settings-row" onClick={onFontToggle} type="button">
            <span className="settings-row-icon">
              <FontIcon className="w-5 h-5" />
            </span>
            <span className="settings-row-label">字体</span>
            <span className="settings-row-value">切换</span>
          </button>

          <button className="settings-row" onClick={onIconTypeToggle} type="button">
            <span className="settings-row-icon">
              {iconType === "favicon" ? (
                <ImageIcon className="w-5 h-5" />
              ) : iconType === "bw-favicon" ? (
                <BwIcon className="w-5 h-5" />
              ) : (
                <TextIcon className="w-5 h-5" />
              )}
            </span>
            <span className="settings-row-label">图标风格</span>
            <span className="settings-row-value">{iconTypeLabel}</span>
          </button>

          <button className="settings-row" onClick={onSearchEngineCycle} type="button">
            <span className="settings-row-icon">
              <SearchIcon className="w-5 h-5" />
            </span>
            <span className="settings-row-label">搜索引擎</span>
            <span className="settings-row-value">{poemSearchEngineLabel}</span>
          </button>

          <button 
            className="settings-row" 
            onClick={() => {
              setIsOpen(false);
              setIsVisualSettingsOpen(true);
            }} 
            type="button"
          >
            <span className="settings-row-icon">
              <VisualIcon className="w-5 h-5" />
            </span>
            <span className="settings-row-label">视觉定制</span>
            <span className="settings-row-value">高级</span>
          </button>

          {/* 分隔线 */}
          <div className="settings-divider" />

          {/* 显示 */}
          <div className="settings-group-title">显示</div>

          <button className="settings-row" onClick={onToggleBookmarks} type="button">
            <span className="settings-row-icon">
              <BookmarkIcon className="w-5 h-5" />
            </span>
            <span className="settings-row-label">书签</span>
            <span className={`settings-row-toggle ${showBookmarks ? "is-on" : ""}`}>
              {showBookmarks ? "开" : "关"}
            </span>
          </button>

          <button className="settings-row" onClick={onToggleQuickSites} type="button">
            <span className="settings-row-icon">
              <GlobeIcon className="w-5 h-5" />
            </span>
            <span className="settings-row-label">常用网站</span>
            <span className={`settings-row-toggle ${showQuickSites ? "is-on" : ""}`}>
              {showQuickSites ? "开" : "关"}
            </span>
          </button>

          <label className="settings-row" title="书签和常用网站在图标网格视图中，每行最多显示的图标数">
            <span className="settings-row-icon">
              <GridIcon className="w-5 h-5" />
            </span>
            <span className="settings-row-label">每行图标</span>
            <input
              className="settings-number-input"
              type="number"
              min="3"
              max="12"
              value={maxIconsPerRow}
              onChange={(event) => onMaxIconsPerRowChange(event.target.value)}
              aria-label="每行最多显示图标数"
            />
            <span className="settings-row-value">个</span>
          </label>

          <button
            className={`settings-row ${favoriteContentCount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={favoriteContentCount > 0 ? onToggleFavoriteContentsOnly : undefined}
            type="button"
            disabled={favoriteContentCount === 0}
            title={favoriteContentCount === 0 ? "暂无收藏内容" : "只展示收藏内容"}
          >
            <span className="settings-row-icon">
              <BookmarkIcon className="w-5 h-5" />
            </span>
            <span className="settings-row-label">收藏内容</span>
            <span className={`settings-row-toggle ${showFavoriteContentsOnly ? "is-on" : ""}`}>
              {favoriteContentCount} 条 · {showFavoriteContentsOnly ? "开" : "关"}
            </span>
          </button>

          {showBookmarks && (
            <>
              <button className="settings-row" onClick={onRowsCycle} type="button">
                <span className="settings-row-icon">
                  <span className="settings-rows-badge">{visibleRows}</span>
                </span>
                <span className="settings-row-label">书签行数</span>
                <span className="settings-row-value">{visibleRows} 行</span>
              </button>
              
              <button 
                className="settings-row" 
                onClick={() => {
                  setIsOpen(false);
                  setIsBookmarkManagerOpen(true);
                }} 
                type="button"
              >
                <span className="settings-row-icon">
                  <ManageIcon className="w-5 h-5" />
                </span>
                <span className="settings-row-label">书签管理</span>
                <span className="settings-row-value">高级</span>
              </button>
            </>
          )}
          {/* 分类别 */}
          <div className="settings-divider" />
          
          <button 
            className="settings-row" 
            onClick={() => setIsCategoriesExpanded(prev => !prev)} 
            type="button"
          >
            <span className="settings-row-icon">
              {isCategoriesExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </span>
            <span className="settings-row-label">展示类别</span>
            <span className="settings-row-value">{selectedCategories.length} 项</span>
          </button>

          {isCategoriesExpanded && (
            <div className="px-3 pb-3 grid grid-cols-2 gap-x-1 gap-y-2 mt-2 max-h-[160px] overflow-y-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))' }}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.key);
                const isDisabled = isSelected && selectedCategories.length <= 1;

                return (
                  <label 
                    key={cat.key} 
                    className={`flex items-center space-x-2 text-sm select-none p-1.5 rounded-md transition-colors ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-base-200/50"
                    }`}
                    title={isDisabled ? "请至少保留一个类别" : cat.desc}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={isSelected}
                      onChange={() => onToggleCategory(cat.key)}
                      disabled={isDisabled}
                      style={{ borderRadius: '0.25rem' }}
                    />
                    <span className="whitespace-nowrap">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      <BookmarkManager
        isOpen={isBookmarkManagerOpen}
        onClose={() => setIsBookmarkManagerOpen(false)}
        bookmarks={bookmarks}
        iconType={iconType}
      />

      <VisualSettingsPanel
        isOpen={isVisualSettingsOpen}
        onClose={() => setIsVisualSettingsOpen(false)}
      />
    </div>
  );
}
