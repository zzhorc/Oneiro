import { FONT_DISPLAY_NAMES } from "./services/constants";
import { useState, useEffect, useCallback } from "react";
import "animate.css";
import "./App.css";
import PoemDisplay from "./components/PoemDisplay";
import SettingsPanel from "./components/SettingsPanel";
import BookmarkBar from "./components/BookmarkBar";
import QuickSitesBar from "./components/QuickSitesBar";
import VisualEffects from "./components/VisualEffects";
import { useTheme } from "./hooks/useTheme";
import { useFont } from "./hooks/useFont";
// import { useVoice } from "./hooks/useVoice";
import { useGuide } from "./hooks/useGuide";
import { useBookmarks } from "./hooks/useBookmarks";
import { useBookmarkSettings } from "./hooks/useBookmarkSettings";
import { useQuickSites } from "./hooks/useQuickSites";
import { useResponsiveRows } from "./hooks/useResponsiveRows";
import { useCategories } from "./hooks/useCategories";
import { useContentEngine } from "./hooks/useContentEngine";
import { usePoemPreferences } from "./hooks/usePoemPreferences";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { currentFont, toggleFont } = useFont();
  const { bookmarks, loading } = useBookmarks();
  const {
    visibleRows, isExpanded, toggleExpand, cycleVisibleRows,
    iconType, toggleIconType,
    showBookmarks, toggleShowBookmarks,
    showQuickSites, toggleShowQuickSites,
    maxIconsPerRow, setMaxIconsPerRow,
  } = useBookmarkSettings();
  const { sites, addSite, editSite, removeSite } = useQuickSites();
  const [isQuickSitesExpanded, setIsQuickSitesExpanded] = useState(false);
  const { safeBookmarkRows, safeQuickSiteRows } = useResponsiveRows(
    visibleRows, showBookmarks, showQuickSites, sites.length
  );
  
  const { selectedCategories, toggleCategory } = useCategories();
  
  const { 
    currentContent, 
    getRandomContent, 
    getRandomContentFromUuids,
    filteredContents
  } = useContentEngine(selectedCategories);
  const {
    favoriteContentUuids,
    favoriteContentSet,
    showFavoriteContentsOnly,
    poemSearchEngine,
    poemSearchEngineLabel,
    toggleFavoriteContent,
    toggleFavoriteContentsOnly,
    cyclePoemSearchEngine,
  } = usePoemPreferences();
  
  const [poem, setPoem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const toggleBookmark = useCallback(() => {
    if (!currentContent || !currentContent.uuid) return;
    toggleFavoriteContent(currentContent.uuid);
  }, [currentContent, toggleFavoriteContent]);

  const isCurrentContentBookmarked = currentContent && currentContent.uuid
    ? favoriteContentSet.has(currentContent.uuid)
    : false;

  const favoriteRefreshKey = showFavoriteContentsOnly ? favoriteContentUuids.join("|") : "";

  useEffect(() => {
    if (filteredContents.length === 0) return;
    if (showFavoriteContentsOnly && favoriteContentUuids.length > 0) {
      setPoem(getRandomContentFromUuids(favoriteContentUuids));
      return;
    }
    setPoem(getRandomContent());
  }, [
    filteredContents,
    showFavoriteContentsOnly,
    favoriteRefreshKey,
    getRandomContentFromUuids,
    getRandomContent,
  ]);

  useEffect(() => {
    if (currentContent) {
      setPoem(currentContent);
    }
  }, [currentContent]);

  useGuide();

  useEffect(() => {
    if (!poem) return;
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [poem?.title]);

  const bothVisible = showBookmarks && showQuickSites && sites.length > 0;

  const displayPoem = poem || {
    title: '欢迎使用 Oneiro',
    from: '',
    who: '',
    contentType: 'other',
    contentTypeName: '其他',
    categoryName: '欢迎',
    analysis: {
      emotion: 'neutral',
      length: 6,
      wordCount: 2,
      complexity: 1
    }
  };

  return (
    <VisualEffects>
      <div id="app" className="custom-font" style={{ "--custom-font-name": currentFont }}>
        <div className="min-h-screen flex flex-col items-center">
          <div className={`w-full ${bothVisible ? "flex-grow-[4]" : "flex-grow-[3]"}`} />

          <PoemDisplay 
            poem={displayPoem} 
            isAnimating={isAnimating}
            onBookmark={toggleBookmark}
            isBookmarked={isCurrentContentBookmarked}
            searchEngine={poemSearchEngine}
          />

          <div className="sections-wrapper">
            {showBookmarks && (
              <>
                {bothVisible && <div className="section-label">书签</div>}
                <BookmarkBar
                  bookmarks={bookmarks}
                  loading={loading}
                  visibleRows={safeBookmarkRows}
                  isExpanded={isExpanded}
                  toggleExpand={toggleExpand}
                  iconType={iconType}
                  maxIconsPerRow={maxIconsPerRow}
                />
              </>
            )}

            {showQuickSites && (
              <>
                {bothVisible && <div className="section-label">常用网站</div>}
                <QuickSitesBar
                  sites={sites}
                  addSite={addSite}
                  editSite={editSite}
                  removeSite={removeSite}
                  iconType={iconType}
                  visibleRows={safeQuickSiteRows}
                  isExpanded={isQuickSitesExpanded}
                  toggleExpand={() => setIsQuickSitesExpanded(prev => !prev)}
                  maxIconsPerRow={maxIconsPerRow}
                />
              </>
            )}
          </div>

          <div className={`w-full ${bothVisible ? "flex-grow-[2]" : "flex-grow-[3]"}`} />
        </div>

        <SettingsPanel
          theme={theme}
          onThemeToggle={toggleTheme}
          onFontToggle={toggleFont}
          visibleRows={visibleRows}
          onRowsCycle={cycleVisibleRows}
          iconType={iconType}
          onIconTypeToggle={toggleIconType}
          showBookmarks={showBookmarks}
          onToggleBookmarks={toggleShowBookmarks}
          showQuickSites={showQuickSites}
          onToggleQuickSites={toggleShowQuickSites}
          maxIconsPerRow={maxIconsPerRow}
          onMaxIconsPerRowChange={setMaxIconsPerRow}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          bookmarks={bookmarks}
          favoriteContentCount={favoriteContentUuids.length}
          showFavoriteContentsOnly={showFavoriteContentsOnly && favoriteContentUuids.length > 0}
          onToggleFavoriteContentsOnly={toggleFavoriteContentsOnly}
          poemSearchEngineLabel={poemSearchEngineLabel}
          onSearchEngineCycle={cyclePoemSearchEngine}
        />

        <div className="fixed bottom-6 right-6 text-sm opacity-15 select-none pointer-events-none">
          {FONT_DISPLAY_NAMES[currentFont] || currentFont}
        </div>
      </div>
    </VisualEffects>
  );
}
