const STORAGE_KEY_VISUAL_SETTINGS = "visualSettings";
const STORAGE_KEY_CUSTOM_BACKGROUNDS = "customBackgrounds";

const DEFAULT_VISUAL_SETTINGS = {
    background: {
        type: 'theme',
        color: '#ffffff',
        gradient: {
            angle: 135,
            colors: ['#667eea', '#764ba2'],
            stops: [0, 100]
        },
        image: {
            url: '',
            position: 'center',
            size: 'cover',
            repeat: 'no-repeat',
            blur: 0,
            opacity: 1
        },
        customImages: []
    },
    effects: {
        enabled: false,
        particles: {
            enabled: false,
            count: 50,
            color: '#ffffff',
            speed: 2,
            size: 3,
            opacity: 0.5
        },
        glow: {
            enabled: false,
            color: '#667eea',
            intensity: 0.3,
            radius: 100
        },
        parallax: {
            enabled: false,
            intensity: 0.5
        },
        floating: {
            enabled: false,
            speed: 1,
            amplitude: 10
        }
    },
    layout: {
        spacing: {
            poemSection: '2rem',
            bookmarkSection: '1.5rem',
            itemGap: '0.5rem'
        },
        alignment: {
            vertical: 'center',
            horizontal: 'center'
        },
        padding: {
            horizontal: '1rem',
            vertical: '0'
        }
    },
    typography: {
        poem: {
            fontSize: '3rem',
            lineHeight: '1.5',
            letterSpacing: '0.02em',
            fontWeight: 'normal',
            opacity: 0.9
        },
        source: {
            fontSize: '1.875rem',
            lineHeight: '1.4',
            letterSpacing: '0.01em',
            fontWeight: 'normal',
            opacity: 0.8
        },
        author: {
            fontSize: '1.5rem',
            lineHeight: '1.4',
            letterSpacing: '0.01em',
            fontWeight: '500',
            opacity: 0.9
        },
        bookmark: {
            fontSize: '0.875rem',
            lineHeight: '1.2',
            letterSpacing: '0',
            fontWeight: 'normal',
            opacity: 0.7
        }
    },
    animations: {
        transitions: {
            enabled: true,
            duration: '0.3s',
            easing: 'ease'
        },
        hover: {
            scale: 1.04,
            duration: '0.2s',
            shadow: true
        },
        entrance: {
            type: 'fadeIn',
            duration: '0.5s',
            delay: '0s'
        }
    },
    shadows: {
        enabled: true,
        intensity: 0.5,
        color: 'rgba(0, 0, 0, 0.1)'
    },
    glass: {
        enabled: true,
        opacity: 0.88,
        blur: 24,
        saturation: 1.6
    }
};

const PRESET_GRADIENTS = [
    { id: 'sunset', name: '日落', colors: ['#fa709a', '#fee140'], angle: 135 },
    { id: 'purple', name: '紫色', colors: ['#667eea', '#764ba2'], angle: 135 },
    { id: 'ocean', name: '海洋', colors: ['#4facfe', '#00f2fe'], angle: 135 },
    { id: 'forest', name: '森林', colors: ['#43e97b', '#38f9d7'], angle: 135 },
    { id: 'peach', name: '蜜桃', colors: ['#ffecd2', '#fcb69f'], angle: 135 },
    { id: 'midnight', name: '午夜', colors: ['#2c3e50', '#4ca1af'], angle: 135 },
    { id: 'rainbow', name: '彩虹', colors: ['#f093fb', '#f5576c'], angle: 135 },
    { id: 'cool', name: '清凉', colors: ['#4facfe', '#00f2fe'], angle: 90 }
];

const PRESET_COLORS = [
    { id: 'white', name: '白色', value: '#ffffff' },
    { id: 'cream', name: '奶油', value: '#fdfbf7' },
    { id: 'lightGray', name: '浅灰', value: '#f5f5f5' },
    { id: 'beige', name: '米色', value: '#f5f5dc' },
    { id: 'lavender', name: '薰衣草', value: '#e6e6fa' },
    { id: 'pink', name: '粉色', value: '#fff0f5' },
    { id: 'sky', name: '天空', value: '#f0f8ff' },
    { id: 'mint', name: '薄荷', value: '#f0fff0' }
];

function cloneDefaultSettings() {
    return JSON.parse(JSON.stringify(DEFAULT_VISUAL_SETTINGS));
}

class VisualCustomizer {
    constructor() {
        this.settings = this.loadSettings();
        this.listeners = new Set();
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_VISUAL_SETTINGS);
            if (stored) {
                return this.mergeDefaults(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load visual settings:', e);
        }
        return cloneDefaultSettings();
    }

    mergeDefaults(stored) {
        const merged = cloneDefaultSettings();
        
        function deepMerge(target, source) {
            for (const key in source) {
                if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        
        deepMerge(merged, stored);
        return merged;
    }

    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY_VISUAL_SETTINGS, JSON.stringify(this.settings));
            this.notifyListeners();
        } catch (e) {
            console.error('Failed to save visual settings:', e);
        }
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.settings));
    }

    updateSettings(updates) {
        function deepUpdate(target, source) {
            for (const key in source) {
                if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    deepUpdate(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        
        deepUpdate(this.settings, updates);
        this.saveSettings();
        this.applySettings();
    }

    resetToDefault() {
        this.settings = cloneDefaultSettings();
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        this.applyBackground();
        this.applyTypography();
        this.applyLayout();
        this.applyAnimations();
        this.applyEffects();
    }

    applyBackground() {
        const { background } = this.settings;
        const root = document.documentElement;
        const body = document.body;

        root.style.setProperty('--bg-type', background.type);

        switch (background.type) {
            case 'color':
                body.style.background = background.color;
                body.style.backgroundImage = 'none';
                break;
                
            case 'gradient':
                const { gradient } = background;
                const gradientStops = gradient.colors.map((color, i) => 
                    `${color} ${gradient.stops[i] || (i * 100 / (gradient.colors.length - 1))}%`
                ).join(', ');
                body.style.background = `linear-gradient(${gradient.angle}deg, ${gradientStops})`;
                body.style.backgroundAttachment = 'fixed';
                break;
                
            case 'image':
                const { image } = background;
                if (image.url) {
                    body.style.backgroundImage = `url(${image.url})`;
                    body.style.backgroundPosition = image.position;
                    body.style.backgroundSize = image.size;
                    body.style.backgroundRepeat = image.repeat;
                    body.style.backgroundAttachment = 'fixed';
                    
                    if (image.blur > 0 || image.opacity < 1) {
                        root.style.setProperty('--bg-blur', `${image.blur}px`);
                        root.style.setProperty('--bg-opacity', image.opacity);
                    }
                }
                break;
                
            case 'theme':
            default:
                body.style.background = '';
                body.style.backgroundImage = '';
                break;
        }
    }

    applyTypography() {
        const { typography } = this.settings;
        const root = document.documentElement;

        root.style.setProperty('--poem-font-size', typography.poem.fontSize);
        root.style.setProperty('--poem-line-height', typography.poem.lineHeight);
        root.style.setProperty('--poem-letter-spacing', typography.poem.letterSpacing);
        root.style.setProperty('--poem-font-weight', typography.poem.fontWeight);
        root.style.setProperty('--poem-opacity', typography.poem.opacity);

        root.style.setProperty('--source-font-size', typography.source.fontSize);
        root.style.setProperty('--source-line-height', typography.source.lineHeight);
        root.style.setProperty('--source-letter-spacing', typography.source.letterSpacing);
        root.style.setProperty('--source-opacity', typography.source.opacity);

        root.style.setProperty('--author-font-size', typography.author.fontSize);
        root.style.setProperty('--author-line-height', typography.author.lineHeight);
        root.style.setProperty('--author-opacity', typography.author.opacity);

        root.style.setProperty('--bookmark-font-size', typography.bookmark.fontSize);
        root.style.setProperty('--bookmark-line-height', typography.bookmark.lineHeight);
        root.style.setProperty('--bookmark-opacity', typography.bookmark.opacity);
    }

    applyLayout() {
        const { layout } = this.settings;
        const root = document.documentElement;

        root.style.setProperty('--poem-section-spacing', layout.spacing.poemSection);
        root.style.setProperty('--bookmark-section-spacing', layout.spacing.bookmarkSection);
        root.style.setProperty('--item-gap', layout.spacing.itemGap);

        root.style.setProperty('--vertical-alignment', layout.alignment.vertical);
        root.style.setProperty('--horizontal-alignment', layout.alignment.horizontal);

        root.style.setProperty('--horizontal-padding', layout.padding.horizontal);
        root.style.setProperty('--vertical-padding', layout.padding.vertical);
    }

    applyAnimations() {
        const { animations } = this.settings;
        const root = document.documentElement;

        root.style.setProperty('--transition-enabled', animations.transitions.enabled ? '1' : '0');
        root.style.setProperty('--transition-duration', animations.transitions.duration);
        root.style.setProperty('--transition-easing', animations.transitions.easing);

        root.style.setProperty('--hover-scale', animations.hover.scale);
        root.style.setProperty('--hover-duration', animations.hover.duration);
        root.style.setProperty('--hover-shadow', animations.hover.shadow ? '1' : '0');

        root.style.setProperty('--entrance-type', animations.entrance.type);
        root.style.setProperty('--entrance-duration', animations.entrance.duration);
        root.style.setProperty('--entrance-delay', animations.entrance.delay);
    }

    applyEffects() {
        const { effects } = this.settings;
        const root = document.documentElement;

        root.style.setProperty('--effects-enabled', effects.enabled ? '1' : '0');

        if (effects.glow.enabled) {
            root.style.setProperty('--glow-color', effects.glow.color);
            root.style.setProperty('--glow-intensity', effects.glow.intensity);
            root.style.setProperty('--glow-radius', `${effects.glow.radius}px`);
        }

        if (effects.parallax.enabled) {
            root.style.setProperty('--parallax-intensity', effects.parallax.intensity);
        }

        if (effects.floating.enabled) {
            root.style.setProperty('--floating-speed', effects.floating.speed);
            root.style.setProperty('--floating-amplitude', `${effects.floating.amplitude}px`);
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    getPresetGradients() {
        return PRESET_GRADIENTS;
    }

    getPresetColors() {
        return PRESET_COLORS;
    }

    setBackgroundType(type) {
        this.updateSettings({ background: { type } });
    }

    setBackgroundColor(color) {
        this.updateSettings({ background: { type: 'color', color } });
    }

    setBackgroundGradient(gradient) {
        this.updateSettings({ background: { type: 'gradient', gradient } });
    }

    setBackgroundImage(imageSettings) {
        this.updateSettings({ background: { type: 'image', image: imageSettings } });
    }

    toggleEffects(enabled) {
        this.updateSettings({ effects: { enabled } });
    }

    toggleParticles(enabled) {
        this.updateSettings({ effects: { particles: { enabled } } });
    }

    updateParticles(settings) {
        this.updateSettings({ effects: { particles: settings } });
    }

    toggleGlow(enabled) {
        this.updateSettings({ effects: { glow: { enabled } } });
    }

    updateGlow(settings) {
        this.updateSettings({ effects: { glow: settings } });
    }

    toggleParallax(enabled) {
        this.updateSettings({ effects: { parallax: { enabled } } });
    }

    toggleFloating(enabled) {
        this.updateSettings({ effects: { floating: { enabled } } });
    }

    updateTypography(type, settings) {
        this.updateSettings({ typography: { [type]: settings } });
    }

    updateLayout(section, settings) {
        this.updateSettings({ layout: { [section]: settings } });
    }

    updateAnimations(section, settings) {
        this.updateSettings({ animations: { [section]: settings } });
    }

    toggleShadows(enabled) {
        this.updateSettings({ shadows: { enabled } });
    }

    toggleGlass(enabled) {
        this.updateSettings({ glass: { enabled } });
    }

    updateGlass(settings) {
        this.updateSettings({ glass: settings });
    }

    addCustomBackgroundImage(imageData) {
        const newImage = {
            id: `bg_${Date.now()}`,
            ...imageData,
            createdAt: Date.now()
        };
        
        const customImages = [...(this.settings.background.customImages || []), newImage];
        this.updateSettings({ background: { customImages } });
        
        return newImage;
    }

    removeCustomBackgroundImage(imageId) {
        const customImages = (this.settings.background.customImages || []).filter(
            img => img.id !== imageId
        );
        this.updateSettings({ background: { customImages } });
    }

    getCustomBackgroundImages() {
        return this.settings.background.customImages || [];
    }
}

const visualCustomizer = new VisualCustomizer();

export {
    VisualCustomizer,
    visualCustomizer,
    DEFAULT_VISUAL_SETTINGS,
    PRESET_GRADIENTS,
    PRESET_COLORS
};
