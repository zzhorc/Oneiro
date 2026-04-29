import { FONT_DISPLAY_NAMES } from "./services/constants";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { useVisualCustomizer } from "./hooks/useVisualCustomizer";

const STORAGE_KEY_BOOKMARKED_CONTENTS = "bookmarkedContents";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { currentFont, toggleFont } = useFont();
  const { isInitialized: isVisualInitialized } = useVisualCustomizer();
  const { bookmarks, loading } = useBookmarks();
  const {
    visibleRows, isExpanded, toggleExpand, cycleVisibleRows,
    iconType, toggleIconType,
    showBookmarks, toggleShowBookmarks,
    showQuickSites, toggleShowQuickSites,
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
    getRecommendedContent,
    rateCurrentContent,
    recommendationStrategy,
    updateRecommendationStrategy,
    filters,
    updateFilters
  } = useContentEngine(selectedCategories);
  
  const [poem, setPoem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [bookmarkedContents, setBookmarkedContents] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BOOKMARKED_CONTENTS);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [useRecommendation, setUseRecommendation] = useState(false);

  const saveBookmarkedContents = useCallback((contents) => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKED_CONTENTS, JSON.stringify([...contents]));
    } catch (e) {
      console.error('Failed to save bookmarked contents:', e);
    }
  }, []);

  const toggleBookmark = useCallback(() => {
    if (!currentContent || !currentContent.uuid) return;
    
    setBookmarkedContents(prev => {
      const next = new Set(prev);
      if (next.has(currentContent.uuid)) {
        next.delete(currentContent.uuid);
      } else {
        next.add(currentContent.uuid);
      }
      saveBookmarkedContents(next);
      return next;
    });
  }, [currentContent, saveBookmarkedContents]);

  const isCurrentContentBookmarked = currentContent && currentContent.uuid 
    ? bookmarkedContents.has(currentContent.uuid) 
    : false;

  const handleRate = useCallback((rating) => {
    rateCurrentContent(rating);
  }, [rateCurrentContent]);

  const refreshContent = useCallback(() => {
    if (useRecommendation) {
      setPoem(getRecommendedContent(1));
    } else {
      setPoem(getRandomContent());
    }
  }, [useRecommendation, getRecommendedContent, getRandomContent]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (useRecommendation) {
        setPoem(getRecommendedContent(1));
      } else {
        setPoem(getRandomContent());
      }
      return;
    }
    refreshContent();
  }, [selectedCategories, useRecommendation]);

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
            onRate={handleRate}
            onBookmark={toggleBookmark}
            isBookmarked={isCurrentContentBookmarked}
          />

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={refreshContent}
              className="px-4 py-2 rounded-full text-sm bg-base-200/50 hover:bg-base-200/80 transition-colors text-base-content/60 hover:text-base-content"
              type="button"
            >
              换一条
            </button>
            <button
              onClick={() => setUseRecommendation(!useRecommendation)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                useRecommendation 
                  ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30" 
                  : "bg-base-200/50 hover:bg-base-200/80 text-base-content/60 hover:text-base-content"
              }`}
              type="button"
            >
              {useRecommendation ? "智能推荐" : "随机展示"}
            </button>
          </div>

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
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          bookmarks={bookmarks}
        />

        <div className="fixed bottom-6 right-6 text-sm opacity-15 select-none pointer-events-none">
          {FONT_DISPLAY_NAMES[currentFont] || currentFont}
        </div>
      </div>
    </VisualEffects>
  );
}
