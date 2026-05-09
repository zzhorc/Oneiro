import { useEffect } from "react";
import { 
  IoBookmarkOutline as BookmarkOutlineIcon,
  IoBookmark as BookmarkIcon
} from "react-icons/io5";
import { buildSearchUrl } from "../hooks/usePoemPreferences";

export default function PoemDisplay({ poem, isAnimating, onBookmark, isBookmarked, searchEngine }) {
  useEffect(() => {
    document.title = navigator.languages.includes("zh") ? "新标签页" : "New Tab";
  }, []);

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark();
    }
  };

  const titleQuery = [poem.title, poem.from, poem.who].filter(Boolean).join(" ");
  const sourceQuery = [poem.from, poem.who].filter(Boolean).join(" ");

  return (
    <div className={`justify-center text-center ${isAnimating ? "animate__animated animate__fadeIn animate__faster" : ""}`}>
      <div className="justify-center item-center flex flex-col">
        <a
          id="poem-title-container"
          href={buildSearchUrl(searchEngine, titleQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl mb-10 whitespace-pre-wrap transition-all duration-300 hover:opacity-80"
        >
          {poem.title}
        </a>
      </div>

      <div id="poem-author-container" className="flex justify-center items-center gap-4">
        {poem.from && (
          <p className="text-3xl transition-all duration-300 hover:text-opacity-80">
            <a 
              href={buildSearchUrl(searchEngine, sourceQuery)}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              「{poem.from}」
            </a>
          </p>
        )}
        {poem.who && (
          <p className="flex align-items-center justify-center text-center text-2xl rounded-md px-2 py-0 custom-author-style transition-all duration-300 hover:opacity-80">
            <a 
              href={buildSearchUrl(searchEngine, poem.who)}
              target="_blank" 
              rel="noopener noreferrer"
              className="leading-normal hover:opacity-80 transition-opacity"
            >
              {poem.who}
            </a>
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleBookmark}
          className={`p-2 rounded-full transition-all duration-300 ${
            isBookmarked 
              ? "text-yellow-500 bg-yellow-500/10 scale-110" 
              : "text-base-content/30 hover:text-base-content/60 hover:bg-base-200/50"
          }`}
          title={isBookmarked ? "已收藏" : "收藏"}
          type="button"
        >
          {isBookmarked ? (
            <BookmarkIcon className="w-5 h-5" />
          ) : (
            <BookmarkOutlineIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
