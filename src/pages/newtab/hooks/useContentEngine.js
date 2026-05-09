import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  contentEngine, 
  CONTENT_TYPES, 
  getContentTypeName,
  getCategoryInfo 
} from "../services/contentEngine";
import { POEM_MAXLINELENGTH } from "../services/constants";

const STORAGE_KEY_ORDER = "poemShuffledOrder";
const STORAGE_KEY_INDEX = "poemCurrentIndex";
const STORAGE_KEY_LAST_CATEGORIES = "poemLastCategories";

function formatContentForDisplay(content) {
  let newTitle = content.displayTitle || "";
  
  if (!/^[A-Za-z]/.test(newTitle[0])) {
    newTitle = newTitle
      .replace(/[^\u4E00-\u9FA5\t\n\r]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    if (newTitle.length >= POEM_MAXLINELENGTH) {
      const lines = newTitle.split(/\s+/);
      const result =
        lines.length % 2 === 0
          ? lines.reduce(
              (acc, line, i) => {
                if (i % 2 === 0) {
                  acc.push(line);
                } else {
                  acc[acc.length - 1] = `${acc[acc.length - 1]} ${line}`;
                }
                return acc;
              },
              []
            )
          : lines;
      newTitle = result.join("\n");
    }
  }

  return {
    ...content,
    title: newTitle,
    from: content.displaySource,
    who: content.displayAuthor
  };
}

export function useContentEngine(selectedCategories = ['i']) {
  const [contents, setContents] = useState([]);
  const [currentContent, setCurrentContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    minComplexity: 0,
    maxComplexity: 3,
    minLength: 0,
    maxLength: Infinity,
    keyword: ''
  });
  const [recommendationStrategy, setRecommendationStrategy] = useState('balanced');

  const loadContents = useCallback(() => {
    setIsLoading(true);
    try {
      let loaded = contentEngine.getContentByCategories(selectedCategories);
      loaded = contentEngine.reduceNoise(loaded);
      setContents(loaded);
    } catch (error) {
      console.error('Failed to load contents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategories]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  const filteredContents = useMemo(() => {
    let filtered = [...contents];
    
    if (filters.types.length > 0) {
      filtered = contentEngine.filterByType(filtered, filters.types);
    }
    
    filtered = contentEngine.filterByComplexity(
      filtered, 
      filters.minComplexity, 
      filters.maxComplexity
    );
    
    filtered = contentEngine.filterByLength(
      filtered, 
      filters.minLength, 
      filters.maxLength
    );
    
    if (filters.keyword) {
      filtered = contentEngine.filterByKeyword(filtered, filters.keyword);
    }
    
    return filtered;
  }, [contents, filters]);

  const groupedByType = useMemo(() => {
    return contentEngine.groupByType(filteredContents);
  }, [filteredContents]);

  const groupedByCategory = useMemo(() => {
    return contentEngine.groupByCategory(filteredContents);
  }, [filteredContents]);

  const statistics = useMemo(() => {
    return contentEngine.getStatistics(filteredContents);
  }, [filteredContents]);

  const getRandomContent = useCallback(() => {
    try {
      const isUpdated = ensureDataFreshness(selectedCategories);
      
      let order;
      let index;

      try {
        const storedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
        index = Number.parseInt(localStorage.getItem(STORAGE_KEY_INDEX) || "0", 10);

        if (!storedOrder || isUpdated) {
          order = reshuffleAndSave(filteredContents);
          index = 0;
        } else {
          order = JSON.parse(storedOrder);

          if (order.length !== filteredContents.length) {
            order = reshuffleAndSave(filteredContents);
            index = 0;
          }
        }

        if (index >= order.length) {
          order = reshuffleAndSave(filteredContents);
          index = 0;
        }
      } catch {
        return getRandomContentFallback();
      }

      let targetUuid = order[index];
      let content = filteredContents.find((p) => p.uuid === targetUuid);

      if (!content) {
        order = reshuffleAndSave(filteredContents);
        index = 0;
        targetUuid = order[index];
        content = filteredContents.find((p) => p.uuid === targetUuid) || filteredContents[0] || {};
      }

      localStorage.setItem(STORAGE_KEY_INDEX, String(index + 1));
      
      const formatted = formatContentForDisplay(content);
      setCurrentContent(formatted);
      
      contentEngine.recordView(content.uuid, content.categoryKey, content.contentType);
      
      return formatted;
    } catch (error) {
      console.error('Failed to get random content:', error);
      return getRandomContentFallback();
    }
  }, [selectedCategories, filteredContents]);

  const getRandomContentFallback = useCallback(() => {
    if (filteredContents.length === 0) {
      const defaultContent = {
        uuid: 'default',
        displayTitle: '欢迎使用 Oneiro',
        displaySource: '',
        displayAuthor: '',
        categoryKey: 'i',
        categoryName: '诗词',
        contentType: CONTENT_TYPES.POETRY,
        contentTypeName: '诗词',
        analysis: {
          length: 6,
          hasAuthor: false,
          hasSource: false,
          wordCount: 2,
          complexity: 1,
          emotion: 'neutral',
          keywords: []
        }
      };
      const formatted = formatContentForDisplay(defaultContent);
      setCurrentContent(formatted);
      return formatted;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredContents.length);
    const content = filteredContents[randomIndex];
    const formatted = formatContentForDisplay(content);
    setCurrentContent(formatted);
    
    contentEngine.recordView(content.uuid, content.categoryKey, content.contentType);
    
    return formatted;
  }, [filteredContents]);

  const getRecommendedContent = useCallback((count = 1, strategy = null) => {
    const actualStrategy = strategy || recommendationStrategy;
    const recommended = contentEngine.recommendContents(
      filteredContents, 
      count, 
      actualStrategy
    );
    
    if (recommended.length > 0) {
      const formatted = formatContentForDisplay(recommended[0]);
      setCurrentContent(formatted);
      
      contentEngine.recordView(
        recommended[0].uuid, 
        recommended[0].categoryKey, 
        recommended[0].contentType
      );
      
      return formatted;
    }
    
    return getRandomContentFallback();
  }, [filteredContents, recommendationStrategy, getRandomContentFallback]);

  const rateCurrentContent = useCallback((rating) => {
    if (currentContent && currentContent.uuid) {
      contentEngine.rateContent(currentContent.uuid, rating);
    }
  }, [currentContent]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      types: [],
      minComplexity: 0,
      maxComplexity: 3,
      minLength: 0,
      maxLength: Infinity,
      keyword: ''
    });
  }, []);

  const updateRecommendationStrategy = useCallback((strategy) => {
    setRecommendationStrategy(strategy);
  }, []);

  const getPreferences = useCallback(() => {
    return contentEngine.preferences;
  }, []);

  const getViewHistory = useCallback(() => {
    return contentEngine.viewHistory;
  }, []);

  const getRatings = useCallback(() => {
    return contentEngine.ratings;
  }, []);

  return {
    contents,
    filteredContents,
    currentContent,
    isLoading,
    filters,
    recommendationStrategy,
    
    groupedByType,
    groupedByCategory,
    statistics,
    
    loadContents,
    getRandomContent,
    getRecommendedContent,
    rateCurrentContent,
    updateFilters,
    clearFilters,
    updateRecommendationStrategy,
    
    getPreferences,
    getViewHistory,
    getRatings,
    
    CONTENT_TYPES,
    getContentTypeName,
    getCategoryInfo
  };
}

function ensureDataFreshness(selectedCategories) {
  const storedCatsJson = localStorage.getItem(STORAGE_KEY_LAST_CATEGORIES);
  const currentCatsJson = JSON.stringify(selectedCategories);

  if (storedCatsJson !== currentCatsJson) {
    localStorage.setItem(STORAGE_KEY_LAST_CATEGORIES, currentCatsJson);
    return true;
  }
  return false;
}

function reshuffleAndSave(contents) {
  const uuids = contents.map((p) => p.uuid);
  const shuffled = shuffle(uuids);
  localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(shuffled));
  localStorage.setItem(STORAGE_KEY_INDEX, "0");
  return shuffled;
}

function shuffle(arr) {
  const a = [...arr];
  for (let idx = a.length - 1; idx > 0; idx--) {
    const j = Math.floor(Math.random() * (idx + 1));
    [a[idx], a[j]] = [a[j], a[idx]];
  }
  return a;
}
