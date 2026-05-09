import a from "sentences-bundle/sentences/a.json";
import b from "sentences-bundle/sentences/b.json";
import c from "sentences-bundle/sentences/c.json";
import d from "sentences-bundle/sentences/d.json";
import e from "sentences-bundle/sentences/e.json";
import f from "sentences-bundle/sentences/f.json";
import g from "sentences-bundle/sentences/g.json";
import h from "sentences-bundle/sentences/h.json";
import i from "sentences-bundle/sentences/i.json";
import j from "sentences-bundle/sentences/j.json";
import k from "sentences-bundle/sentences/k.json";
import l from "sentences-bundle/sentences/l.json";
import CATEGORIES from "sentences-bundle/categories.json";

const allSentencesMap = { a, b, c, d, e, f, g, h, i, j, k, l };

const CONTENT_TYPES = {
  POETRY: 'poetry',
  LITERATURE: 'literature',
  FILM: 'film',
  ANIMATION: 'animation',
  GAME: 'game',
  MUSIC: 'music',
  OTHER: 'other'
};

const CATEGORY_TYPE_MAPPING = {
  a: CONTENT_TYPES.LITERATURE,
  b: CONTENT_TYPES.MUSIC,
  c: CONTENT_TYPES.MUSIC,
  d: CONTENT_TYPES.MUSIC,
  e: CONTENT_TYPES.LITERATURE,
  f: CONTENT_TYPES.ANIMATION,
  g: CONTENT_TYPES.GAME,
  h: CONTENT_TYPES.FILM,
  i: CONTENT_TYPES.POETRY,
  j: CONTENT_TYPES.OTHER,
  k: CONTENT_TYPES.OTHER,
  l: CONTENT_TYPES.OTHER
};

const STORAGE_KEY_CONTENT_HISTORY = "contentViewHistory";
const STORAGE_KEY_CONTENT_PREFERENCES = "contentPreferences";
const STORAGE_KEY_CONTENT_RATINGS = "contentRatings";
const STORAGE_KEY_RECOMMENDATION_HISTORY = "recommendationHistory";

const RECOMMENDATION_STRATEGIES = {
  PREFERENCE: 'preference',
  RANDOM: 'random',
  BALANCED: 'balanced',
  DIVERSE: 'diverse',
  CONTEXT_AWARE: 'context-aware',
  EXPLORE: 'explore'
};

const TIME_DECAY_HALF_LIFE = 7 * 24 * 60 * 60 * 1000;
const MAX_HISTORY_ITEMS = 200;
const DIVERSITY_PENALTY = 0.15;

function shuffle(arr) {
  const a = [...arr];
  for (let idx = a.length - 1; idx > 0; idx--) {
    const j = Math.floor(Math.random() * (idx + 1));
    [a[idx], a[j]] = [a[j], a[idx]];
  }
  return a;
}

function getCategoryInfo(categoryKey) {
  return CATEGORIES.find(cat => cat.key === categoryKey) || { name: categoryKey, key: categoryKey };
}

function getContentType(categoryKey) {
  return CATEGORY_TYPE_MAPPING[categoryKey] || CONTENT_TYPES.OTHER;
}

function getContentTypeName(type) {
  const typeNames = {
    [CONTENT_TYPES.POETRY]: '诗词',
    [CONTENT_TYPES.LITERATURE]: '文学',
    [CONTENT_TYPES.FILM]: '影视',
    [CONTENT_TYPES.ANIMATION]: '动画',
    [CONTENT_TYPES.GAME]: '游戏',
    [CONTENT_TYPES.MUSIC]: '音乐',
    [CONTENT_TYPES.OTHER]: '其他'
  };
  return typeNames[type] || '未知';
}

function analyzeContent(content) {
  const analysis = {
    length: content.hitokoto?.length || 0,
    hasAuthor: !!content.from_who,
    hasSource: !!content.from,
    wordCount: (content.hitokoto || '').split(/[\s，。！？；：""''（）、]+/).filter(w => w).length,
    complexity: 0,
    emotion: 'neutral',
    keywords: []
  };

  if (analysis.length > 0 && analysis.length <= 10) {
    analysis.complexity = 1;
  } else if (analysis.length > 10 && analysis.length <= 30) {
    analysis.complexity = 2;
  } else if (analysis.length > 30) {
    analysis.complexity = 3;
  }

  const positiveWords = ['喜', '乐', '欢', '爱', '美', '好', '甜', '蜜', '晴', '明'];
  const negativeWords = ['悲', '伤', '痛', '苦', '愁', '恨', '离', '别', '阴', '暗'];
  const hitokoto = content.hitokoto || '';
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (hitokoto.includes(word)) positiveCount++;
  }
  for (const word of negativeWords) {
    if (hitokoto.includes(word)) negativeCount++;
  }
  
  if (positiveCount > negativeCount) {
    analysis.emotion = 'positive';
  } else if (negativeCount > positiveCount) {
    analysis.emotion = 'negative';
  }

  return analysis;
}

function normalizeContent(content, categoryKey) {
  const categoryInfo = getCategoryInfo(categoryKey);
  const contentType = getContentType(categoryKey);
  const analysis = analyzeContent(content);

  return {
    ...content,
    categoryKey,
    categoryName: categoryInfo.name,
    contentType,
    contentTypeName: getContentTypeName(contentType),
    analysis,
    displayTitle: content.hitokoto || '',
    displaySource: content.from || '',
    displayAuthor: content.from_who || ''
  };
}

class ContentEngine {
  constructor() {
    this.cache = new Map();
    this.viewHistory = this.loadViewHistory();
    this.preferences = this.loadPreferences();
    this.ratings = this.loadRatings();
    this.recommendationHistory = this.loadRecommendationHistory();
  }

  loadViewHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTENT_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveViewHistory() {
    try {
      const recent = this.viewHistory.slice(-MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY_CONTENT_HISTORY, JSON.stringify(recent));
    } catch (e) {
      console.error('Failed to save view history:', e);
    }
  }

  loadPreferences() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTENT_PREFERENCES);
      return stored ? JSON.parse(stored) : {
        typeWeights: {},
        categoryWeights: {},
        complexityPreference: 0.5,
        lengthPreference: 0.5,
        emotionPreferences: { positive: 0.5, neutral: 0.5, negative: 0.5 },
        lastUpdated: Date.now()
      };
    } catch {
      return {
        typeWeights: {},
        categoryWeights: {},
        complexityPreference: 0.5,
        lengthPreference: 0.5,
        emotionPreferences: { positive: 0.5, neutral: 0.5, negative: 0.5 },
        lastUpdated: Date.now()
      };
    }
  }

  savePreferences() {
    try {
      this.preferences.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY_CONTENT_PREFERENCES, JSON.stringify(this.preferences));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }
  }

  loadRatings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONTENT_RATINGS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  saveRatings() {
    try {
      localStorage.setItem(STORAGE_KEY_CONTENT_RATINGS, JSON.stringify(this.ratings));
    } catch (e) {
      console.error('Failed to save ratings:', e);
    }
  }

  loadRecommendationHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECOMMENDATION_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveRecommendationHistory() {
    try {
      const recent = this.recommendationHistory.slice(-50);
      localStorage.setItem(STORAGE_KEY_RECOMMENDATION_HISTORY, JSON.stringify(recent));
    } catch (e) {
      console.error('Failed to save recommendation history:', e);
    }
  }

  recordRecommendation(contentUuid, strategy, score) {
    const entry = {
      uuid: contentUuid,
      strategy,
      score,
      timestamp: Date.now()
    };
    this.recommendationHistory.push(entry);
    this.saveRecommendationHistory();
  }

  calculateTimeDecay(timestamp) {
    const now = Date.now();
    const age = now - timestamp;
    const decay = Math.exp(-age * Math.log(2) / TIME_DECAY_HALF_LIFE);
    return Math.max(0.1, decay);
  }

  getCurrentContext() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let timeOfDay = 'day';
    if (hour >= 5 && hour < 9) timeOfDay = 'morning';
    else if (hour >= 9 && hour < 12) timeOfDay = 'lateMorning';
    else if (hour >= 12 && hour < 14) timeOfDay = 'noon';
    else if (hour >= 14 && hour < 18) timeOfDay = 'afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      hour,
      dayOfWeek,
      isWeekend,
      timeOfDay
    };
  }

  getContextBasedPreferences(context) {
    const contextPreferences = {
      typeBoost: {},
      emotionBoost: {}
    };

    switch (context.timeOfDay) {
      case 'morning':
        contextPreferences.emotionBoost.positive = 0.1;
        contextPreferences.typeBoost[CONTENT_TYPES.POETRY] = 0.05;
        contextPreferences.typeBoost[CONTENT_TYPES.LITERATURE] = 0.05;
        break;
      case 'evening':
        contextPreferences.emotionBoost.neutral = 0.1;
        contextPreferences.typeBoost[CONTENT_TYPES.FILM] = 0.05;
        contextPreferences.typeBoost[CONTENT_TYPES.MUSIC] = 0.05;
        break;
      case 'night':
        contextPreferences.emotionBoost.negative = 0.05;
        contextPreferences.typeBoost[CONTENT_TYPES.LITERATURE] = 0.05;
        break;
    }

    if (context.isWeekend) {
      contextPreferences.typeBoost[CONTENT_TYPES.ANIMATION] = 0.1;
      contextPreferences.typeBoost[CONTENT_TYPES.GAME] = 0.1;
    }

    return contextPreferences;
  }

  calculateDiversityPenalty(content, selectedContents, contentsByType) {
    let penalty = 0;

    if (selectedContents.length === 0) return 0;

    const sameTypeCount = selectedContents.filter(c => c.contentType === content.contentType).length;
    if (sameTypeCount > 0) {
      const typeRatio = sameTypeCount / selectedContents.length;
      penalty += typeRatio * DIVERSITY_PENALTY;
    }

    const sameCategoryCount = selectedContents.filter(c => c.categoryKey === content.categoryKey).length;
    if (sameCategoryCount > 0) {
      const categoryRatio = sameCategoryCount / selectedContents.length;
      penalty += categoryRatio * DIVERSITY_PENALTY * 0.5;
    }

    return Math.min(0.5, penalty);
  }

  calculateExploreBonus(content, explorationRate = 0.3) {
    const hasBeenViewed = this.viewHistory.some(h => h.uuid === content.uuid);
    const hasBeenRated = this.ratings[content.uuid] !== undefined;
    const hasBeenRecommended = this.recommendationHistory.some(r => r.uuid === content.uuid);

    const isNew = !hasBeenViewed && !hasBeenRated && !hasBeenRecommended;
    const isInfrequent = !hasBeenRated && (!hasBeenViewed || 
      this.viewHistory.filter(h => h.uuid === content.uuid).length < 3);

    if (isNew) {
      return explorationRate * 0.5;
    } else if (isInfrequent) {
      return explorationRate * 0.3;
    }

    return 0;
  }

  getContentByCategories(categories = ['i']) {
    const seen = new Set();
    const contents = [];
    
    for (const cat of categories) {
      const list = allSentencesMap[cat];
      if (list && Array.isArray(list)) {
        for (const item of list) {
          if (!seen.has(item.uuid)) {
            seen.add(item.uuid);
            contents.push(normalizeContent(item, cat));
          }
        }
      }
    }
    
    return contents;
  }

  filterByType(contents, types) {
    if (!types || types.length === 0) return contents;
    return contents.filter(c => types.includes(c.contentType));
  }

  filterByComplexity(contents, minComplexity = 0, maxComplexity = 3) {
    return contents.filter(c => 
      c.analysis.complexity >= minComplexity && 
      c.analysis.complexity <= maxComplexity
    );
  }

  filterByLength(contents, minLength = 0, maxLength = Infinity) {
    return contents.filter(c => 
      c.analysis.length >= minLength && 
      c.analysis.length <= maxLength
    );
  }

  filterByKeyword(contents, keyword) {
    if (!keyword || keyword.trim() === '') return contents;
    const lowerKeyword = keyword.toLowerCase();
    return contents.filter(c => 
      c.displayTitle.toLowerCase().includes(lowerKeyword) ||
      c.displaySource.toLowerCase().includes(lowerKeyword) ||
      c.displayAuthor.toLowerCase().includes(lowerKeyword)
    );
  }

  reduceNoise(contents) {
    const filtered = contents.filter(c => {
      if (!c.displayTitle || c.displayTitle.trim() === '') return false;
      if (c.analysis.length < 2) return false;
      return true;
    });
    
    const deduped = [];
    const seenTitles = new Set();
    
    for (const content of filtered) {
      const normalizedTitle = content.displayTitle.trim().toLowerCase();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        deduped.push(content);
      }
    }
    
    return deduped;
  }

  recordView(contentUuid, categoryKey, contentType) {
    const entry = {
      uuid: contentUuid,
      categoryKey,
      contentType,
      timestamp: Date.now()
    };
    
    this.viewHistory.push(entry);
    this.saveViewHistory();
    
    this.updatePreference(categoryKey, contentType, 'view');
  }

  rateContent(contentUuid, rating) {
    this.ratings[contentUuid] = {
      rating,
      timestamp: Date.now()
    };
    this.saveRatings();
    
    const historyEntry = this.viewHistory.find(h => h.uuid === contentUuid);
    if (historyEntry) {
      this.updatePreference(historyEntry.categoryKey, historyEntry.contentType, rating >= 4 ? 'like' : 'dislike');
    }
  }

  updatePreference(categoryKey, contentType, action) {
    const weights = {
      view: 0.1,
      like: 0.3,
      dislike: -0.2,
      share: 0.2
    };
    
    const weight = weights[action] || 0;
    
    if (!this.preferences.typeWeights[contentType]) {
      this.preferences.typeWeights[contentType] = 0.5;
    }
    this.preferences.typeWeights[contentType] = Math.max(0, Math.min(1, 
      this.preferences.typeWeights[contentType] + weight));
    
    if (!this.preferences.categoryWeights[categoryKey]) {
      this.preferences.categoryWeights[categoryKey] = 0.5;
    }
    this.preferences.categoryWeights[categoryKey] = Math.max(0, Math.min(1, 
      this.preferences.categoryWeights[categoryKey] + weight));
    
    this.savePreferences();
  }

  getRecommendationScore(content, context = null) {
    let score = 0.5;
    const currentContext = context || this.getCurrentContext();
    const contextPreferences = this.getContextBasedPreferences(currentContext);

    const typeWeight = this.preferences.typeWeights[content.contentType] || 0.5;
    score += (typeWeight - 0.5) * 0.25;

    const categoryWeight = this.preferences.categoryWeights[content.categoryKey] || 0.5;
    score += (categoryWeight - 0.5) * 0.2;

    if (contextPreferences.typeBoost[content.contentType]) {
      score += contextPreferences.typeBoost[content.contentType];
    }

    const emotion = content.analysis?.emotion || 'neutral';
    const emotionWeight = this.preferences.emotionPreferences?.[emotion] || 0.5;
    score += (emotionWeight - 0.5) * 0.1;

    if (contextPreferences.emotionBoost[emotion]) {
      score += contextPreferences.emotionBoost[emotion];
    }

    const rating = this.ratings[content.uuid];
    if (rating) {
      const timeDecay = this.calculateTimeDecay(rating.timestamp);
      score += (rating.rating / 5 - 0.5) * 0.25 * timeDecay;
    }

    const viewEntries = this.viewHistory.filter(h => h.uuid === content.uuid);
    if (viewEntries.length > 0) {
      const lastView = viewEntries[viewEntries.length - 1];
      const timeDecay = this.calculateTimeDecay(lastView.timestamp);
      const hoursSinceView = (Date.now() - lastView.timestamp) / (1000 * 60 * 60);
      
      if (hoursSinceView < 24) {
        score -= 0.25;
      } else if (hoursSinceView < 72) {
        score -= 0.15;
      } else if (hoursSinceView < 168) {
        score -= 0.05;
      }

      const viewCountWeight = Math.min(1, viewEntries.length * 0.1);
      if (viewEntries.length > 5) {
        score += viewCountWeight * 0.1;
      }
    }

    const complexityDiff = Math.abs(content.analysis?.complexity || 1.5 - 1.5) / 2;
    const complexityPreference = this.preferences.complexityPreference || 0.5;
    const complexityMatch = 1 - Math.abs(complexityPreference - complexityDiff);
    score += (complexityMatch - 0.5) * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  recommendContents(contents, count = 10, strategy = 'balanced', explorationRate = 0.3) {
    if (contents.length === 0) return [];

    const context = this.getCurrentContext();
    const contentsByType = this.groupByType(contents);

    let scored = contents.map(content => ({
      content,
      baseScore: this.getRecommendationScore(content, context),
      randomFactor: Math.random(),
      isNew: !this.viewHistory.some(h => h.uuid === content.uuid) && 
             !this.ratings[content.uuid]
    }));

    scored = scored.map(item => ({
      ...item,
      exploreBonus: this.calculateExploreBonus(item.content, explorationRate)
    }));

    const selectedContents = [];
    const remaining = [...scored];

    for (let i = 0; i < Math.min(count, contents.length); i++) {
      if (remaining.length === 0) break;

      const remainingWithDiversity = remaining.map(item => {
        const diversityPenalty = this.calculateDiversityPenalty(
          item.content, 
          selectedContents.map(s => s.content),
          contentsByType
        );

        let finalScore;
        switch (strategy) {
          case RECOMMENDATION_STRATEGIES.PREFERENCE:
            finalScore = item.baseScore - diversityPenalty;
            break;
          case RECOMMENDATION_STRATEGIES.RANDOM:
            finalScore = item.randomFactor;
            break;
          case RECOMMENDATION_STRATEGIES.DIVERSE:
            finalScore = (item.baseScore * 0.5 + item.randomFactor * 0.5) - diversityPenalty * 2;
            break;
          case RECOMMENDATION_STRATEGIES.CONTEXT_AWARE:
            finalScore = item.baseScore + (item.exploreBonus * 0.2) - diversityPenalty;
            break;
          case RECOMMENDATION_STRATEGIES.EXPLORE:
            finalScore = item.randomFactor * 0.3 + item.exploreBonus + item.baseScore * 0.2;
            break;
          case RECOMMENDATION_STRATEGIES.BALANCED:
          default:
            finalScore = (item.baseScore * 0.6 + item.randomFactor * 0.2 + item.exploreBonus * 0.2) - diversityPenalty;
            break;
        }

        return {
          ...item,
          finalScore,
          diversityPenalty
        };
      });

      remainingWithDiversity.sort((a, b) => b.finalScore - a.finalScore);

      const selected = remainingWithDiversity[0];
      selectedContents.push(selected);

      const selectedIndex = remaining.findIndex(r => r.content.uuid === selected.content.uuid);
      if (selectedIndex !== -1) {
        remaining.splice(selectedIndex, 1);
      }
    }

    const result = selectedContents.map(item => {
      this.recordRecommendation(item.content.uuid, strategy, item.finalScore);
      return item.content;
    });

    return result;
  }

  getRecommendationInsights(content) {
    const context = this.getCurrentContext();
    const score = this.getRecommendationScore(content, context);
    
    const insights = {
      overallScore: score,
      context,
      factors: []
    };

    const typeWeight = this.preferences.typeWeights[content.contentType] || 0.5;
    if (typeWeight !== 0.5) {
      insights.factors.push({
        type: 'type',
        label: '类型偏好',
        value: typeWeight > 0.5 ? '偏好' : '不偏好',
        impact: (typeWeight - 0.5) * 0.25
      });
    }

    const rating = this.ratings[content.uuid];
    if (rating) {
      insights.factors.push({
        type: 'rating',
        label: '历史评分',
        value: `${rating.rating}/5`,
        impact: (rating.rating / 5 - 0.5) * 0.25
      });
    }

    const viewCount = this.viewHistory.filter(h => h.uuid === content.uuid).length;
    if (viewCount > 0) {
      insights.factors.push({
        type: 'viewHistory',
        label: '浏览次数',
        value: `${viewCount} 次`,
        impact: viewCount > 5 ? 0.1 : 0
      });
    }

    const contextPreferences = this.getContextBasedPreferences(context);
    if (contextPreferences.typeBoost[content.contentType]) {
      insights.factors.push({
        type: 'context',
        label: '上下文推荐',
        value: context.timeOfDay,
        impact: contextPreferences.typeBoost[content.contentType]
      });
    }

    return insights;
  }

  groupByType(contents) {
    const groups = {};
    for (const type of Object.values(CONTENT_TYPES)) {
      groups[type] = {
        name: getContentTypeName(type),
        contents: []
      };
    }
    
    for (const content of contents) {
      if (groups[content.contentType]) {
        groups[content.contentType].contents.push(content);
      }
    }
    
    return groups;
  }

  groupByCategory(contents) {
    const groups = {};
    
    for (const content of contents) {
      if (!groups[content.categoryKey]) {
        groups[content.categoryKey] = {
          name: content.categoryName,
          contents: []
        };
      }
      groups[content.categoryKey].contents.push(content);
    }
    
    return groups;
  }

  getStatistics(contents) {
    const stats = {
      total: contents.length,
      byType: {},
      byCategory: {},
      avgLength: 0,
      avgComplexity: 0,
      emotionDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      }
    };
    
    let totalLength = 0;
    let totalComplexity = 0;
    
    for (const content of contents) {
      const type = content.contentType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      const category = content.categoryKey;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      totalLength += content.analysis.length;
      totalComplexity += content.analysis.complexity;
      
      stats.emotionDistribution[content.analysis.emotion]++;
    }
    
    if (contents.length > 0) {
      stats.avgLength = totalLength / contents.length;
      stats.avgComplexity = totalComplexity / contents.length;
    }
    
    return stats;
  }
}

const contentEngine = new ContentEngine();

export {
  CONTENT_TYPES,
  CATEGORY_TYPE_MAPPING,
  RECOMMENDATION_STRATEGIES,
  ContentEngine,
  contentEngine,
  shuffle,
  getCategoryInfo,
  getContentType,
  getContentTypeName,
  analyzeContent,
  normalizeContent
};
