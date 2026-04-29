import { useEffect, useState } from "react";
import { 
  IoHeartOutline as HeartOutlineIcon,
  IoHeart as HeartIcon,
  IoBookmarkOutline as BookmarkOutlineIcon,
  IoBookmark as BookmarkIcon,
  IoInformationCircleOutline as InfoIcon
} from "react-icons/io5";

const CONTENT_TYPE_STYLES = {
  poetry: { 
    bg: "bg-red-500/10", 
    text: "text-red-500",
    label: "诗词"
  },
  literature: { 
    bg: "bg-blue-500/10", 
    text: "text-blue-500",
    label: "文学"
  },
  film: { 
    bg: "bg-purple-500/10", 
    text: "text-purple-500",
    label: "影视"
  },
  animation: { 
    bg: "bg-pink-500/10", 
    text: "text-pink-500",
    label: "动画"
  },
  game: { 
    bg: "bg-green-500/10", 
    text: "text-green-500",
    label: "游戏"
  },
  music: { 
    bg: "bg-yellow-500/10", 
    text: "text-yellow-500",
    label: "音乐"
  },
  other: { 
    bg: "bg-gray-500/10", 
    text: "text-gray-500",
    label: "其他"
  }
};

const EMOTION_STYLES = {
  positive: { icon: "😊", label: "积极" },
  neutral: { icon: "😐", label: "中性" },
  negative: { icon: "😔", label: "消极" }
};

export default function PoemDisplay({ poem, isAnimating, onRate, onBookmark, isBookmarked }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    document.title = navigator.languages.includes("zh") ? "新标签页" : "New Tab";
  }, []);

  const contentType = poem?.contentType || 'other';
  const typeStyle = CONTENT_TYPE_STYLES[contentType] || CONTENT_TYPE_STYLES.other;
  const emotion = poem?.analysis?.emotion || 'neutral';
  const emotionStyle = EMOTION_STYLES[emotion];

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onRate) {
      onRate(isLiked ? 3 : 5);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark();
    }
  };

  return (
    <div className={`justify-center text-center ${isAnimating ? "animate__animated animate__fadeIn animate__faster" : ""}`}>
      {poem?.contentType && (
        <div className="flex justify-center gap-2 mb-4">
          <span 
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.text} cursor-default`}
            title={typeStyle.label}
          >
            {typeStyle.label}
          </span>
          {poem?.analysis?.emotion && (
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-base-200/50 cursor-pointer hover:bg-base-200/80 transition-colors"
              title={`情感倾向: ${emotionStyle.label}`}
              onClick={() => setShowInfo(!showInfo)}
            >
              {emotionStyle.icon}
            </span>
          )}
        </div>
      )}

      <div className="justify-center item-center flex flex-col">
        <div
          id="poem-title-container"
          className="text-5xl mb-10 whitespace-pre-wrap transition-all duration-300"
        >
          {poem.title}
        </div>
      </div>

      <div id="poem-author-container" className="flex justify-center items-center gap-4">
        {poem.from && (
          <p className="text-3xl transition-all duration-300 hover:text-opacity-80">
            <a 
              href={`https://www.baidu.com/s?wd=${poem.from} ${poem.who || ""}`} 
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
              className="leading-normal" 
              href={`https://www.baidu.com/s?wd=${poem.who}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              {poem.who}
            </a>
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleLike}
          className={`p-2 rounded-full transition-all duration-300 ${
            isLiked 
              ? "text-red-500 bg-red-500/10 scale-110" 
              : "text-base-content/30 hover:text-base-content/60 hover:bg-base-200/50"
          }`}
          title={isLiked ? "已喜欢" : "喜欢"}
          type="button"
        >
          {isLiked ? (
            <HeartIcon className="w-5 h-5" />
          ) : (
            <HeartOutlineIcon className="w-5 h-5" />
          )}
        </button>

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

        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded-full transition-all duration-300 ${
            showInfo 
              ? "text-blue-500 bg-blue-500/10 scale-110" 
              : "text-base-content/30 hover:text-base-content/60 hover:bg-base-200/50"
          }`}
          title="内容信息"
          type="button"
        >
          <InfoIcon className="w-5 h-5" />
        </button>
      </div>

      {showInfo && (
        <div className="mt-4 p-4 bg-base-200/50 backdrop-blur-sm rounded-lg text-left max-w-md mx-auto animate__animated animate__fadeIn animate__faster">
          <h4 className="text-sm font-semibold mb-2 text-base-content/70">内容分析</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-base-content/60">
            {poem?.categoryName && (
              <div className="flex justify-between">
                <span>分类:</span>
                <span className="font-medium">{poem.categoryName}</span>
              </div>
            )}
            {poem?.contentTypeName && (
              <div className="flex justify-between">
                <span>类型:</span>
                <span className="font-medium">{poem.contentTypeName}</span>
              </div>
            )}
            {poem?.analysis?.length > 0 && (
              <div className="flex justify-between">
                <span>字数:</span>
                <span className="font-medium">{poem.analysis.length}</span>
              </div>
            )}
            {poem?.analysis?.wordCount > 0 && (
              <div className="flex justify-between">
                <span>词数:</span>
                <span className="font-medium">{poem.analysis.wordCount}</span>
              </div>
            )}
            {poem?.analysis?.complexity !== undefined && (
              <div className="flex justify-between">
                <span>复杂度:</span>
                <span className="font-medium">
                  {poem.analysis.complexity === 1 ? "简单" : 
                   poem.analysis.complexity === 2 ? "中等" : 
                   poem.analysis.complexity === 3 ? "复杂" : "-"}
                </span>
              </div>
            )}
            {emotion && (
              <div className="flex justify-between">
                <span>情感:</span>
                <span className="font-medium">{emotionStyle.label} {emotionStyle.icon}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 