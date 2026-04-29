import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    IoCloseOutline as CloseIcon,
    IoColorPaletteOutline as ColorIcon,
    IoImageOutline as ImageIcon,
    IoSparklesOutline as EffectsIcon,
    IoTextOutline as TextIcon,
    IoResizeOutline as LayoutIcon,
    IoPlayOutline as AnimationIcon,
    IoEyeOutline as PreviewIcon,
    IoRefreshOutline as ResetIcon,
    IoCheckmarkOutline as CheckIcon,
    IoChevronDownOutline as ChevronDownIcon,
    IoChevronUpOutline as ChevronUpIcon
} from "react-icons/io5";
import { useVisualCustomizer } from "../hooks/useVisualCustomizer";

const SECTIONS = [
    { id: 'background', label: '背景设置', icon: ImageIcon },
    { id: 'effects', label: '动态特效', icon: EffectsIcon },
    { id: 'typography', label: '排版设置', icon: TextIcon },
    { id: 'layout', label: '布局设置', icon: LayoutIcon },
    { id: 'animations', label: '动画设置', icon: AnimationIcon }
];

const BACKGROUND_TYPES = [
    { id: 'theme', label: '跟随主题', icon: ColorIcon },
    { id: 'color', label: '纯色', icon: ColorIcon },
    { id: 'gradient', label: '渐变', icon: ColorIcon },
    { id: 'image', label: '图片', icon: ImageIcon }
];

export default function VisualSettingsPanel({ isOpen, onClose }) {
    const {
        settings,
        DEFAULT_VISUAL_SETTINGS,
        PRESET_GRADIENTS,
        PRESET_COLORS,
        
        updateSettings,
        resetToDefault,
        applySettings,
        
        setBackgroundType,
        setBackgroundColor,
        setBackgroundGradient,
        
        toggleEffects,
        toggleParticles,
        updateParticles,
        toggleGlow,
        updateGlow,
        toggleParallax,
        toggleFloating,
        
        updateTypography,
        updateLayout,
        updateAnimations,
        
        toggleShadows,
        toggleGlass,
        updateGlass
    } = useVisualCustomizer();

    const [activeSection, setActiveSection] = useState('background');
    const [expandedSubsections, setExpandedSubsections] = useState({
        backgroundType: true,
        particles: false,
        glow: false,
        poemTypo: true,
        transitions: true,
        glass: true
    });

    const toggleSubsection = useCallback((key) => {
        setExpandedSubsections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    }, []);

    const handlePresetGradientClick = useCallback((gradient) => {
        setBackgroundGradient({
            angle: gradient.angle,
            colors: gradient.colors,
            stops: [0, 100]
        });
    }, [setBackgroundGradient]);

    const handlePresetColorClick = useCallback((color) => {
        setBackgroundColor(color.value);
    }, [setBackgroundColor]);

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageUrl = event.target?.result;
            if (imageUrl) {
                updateSettings({
                    background: {
                        type: 'image',
                        image: {
                            url: imageUrl,
                            position: 'center',
                            size: 'cover',
                            repeat: 'no-repeat',
                            blur: 0,
                            opacity: 1
                        }
                    }
                });
            }
        };
        reader.readAsDataURL(file);
    }, [updateSettings]);

    const renderBackgroundSection = () => (
        <div className="space-y-4">
            <div>
                <button
                    onClick={() => toggleSubsection('backgroundType')}
                    className="w-full flex items-center justify-between p-3 hover:bg-base-200/30 rounded-lg transition-colors"
                    type="button"
                >
                    <span className="text-sm font-medium">背景类型</span>
                    {expandedSubsections.backgroundType ? (
                        <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                    )}
                </button>
                
                {expandedSubsections.backgroundType && (
                    <div className="px-3 py-2 space-y-4">
                        <div className="grid grid-cols-4 gap-2">
                            {BACKGROUND_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setBackgroundType(type.id)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                                        settings.background.type === type.id
                                            ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                                            : 'bg-base-200/30 hover:bg-base-200/50'
                                    }`}
                                    type="button"
                                >
                                    <type.icon className="w-5 h-5" />
                                    <span className="text-xs">{type.label}</span>
                                </button>
                            ))}
                        </div>

                        {settings.background.type === 'color' && (
                            <div className="space-y-3">
                                <p className="text-xs text-base-content/60">预设颜色</p>
                                <div className="grid grid-cols-8 gap-2">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color.id}
                                            onClick={() => handlePresetColorClick(color)}
                                            className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                                                settings.background.color === color.value
                                                    ? 'ring-2 ring-primary ring-offset-2'
                                                    : ''
                                            }`}
                                            style={{ backgroundColor: color.value, border: '1px solid rgba(0,0,0,0.1)' }}
                                            title={color.name}
                                            type="button"
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-base-content/60">自定义:</label>
                                    <input
                                        type="color"
                                        value={settings.background.color}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-mono">{settings.background.color}</span>
                                </div>
                            </div>
                        )}

                        {settings.background.type === 'gradient' && (
                            <div className="space-y-3">
                                <p className="text-xs text-base-content/60">预设渐变</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {PRESET_GRADIENTS.map(gradient => (
                                        <button
                                            key={gradient.id}
                                            onClick={() => handlePresetGradientClick(gradient)}
                                            className="h-12 rounded-lg transition-transform hover:scale-105"
                                            style={{ 
                                                background: `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})` 
                                            }}
                                            title={gradient.name}
                                            type="button"
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-base-content/60">角度:</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="360"
                                        value={settings.background.gradient.angle}
                                        onChange={(e) => updateSettings({
                                            background: { gradient: { angle: Number(e.target.value) } }
                                        })}
                                        className="w-24"
                                    />
                                    <span className="text-xs font-mono">{settings.background.gradient.angle}°</span>
                                </div>
                            </div>
                        )}

                        {settings.background.type === 'image' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                                        <ImageIcon className="w-4 h-4" />
                                        <span className="text-sm">上传图片</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                
                                {settings.background.image.url && (
                                    <div className="space-y-2">
                                        <div className="h-24 rounded-lg overflow-hidden" style={{
                                            backgroundImage: `url(${settings.background.image.url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }} />
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-base-content/60">模糊</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="20"
                                                    value={settings.background.image.blur}
                                                    onChange={(e) => updateSettings({
                                                        background: { image: { blur: Number(e.target.value) } }
                                                    })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-base-content/60">不透明度</label>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="1"
                                                    step="0.1"
                                                    value={settings.background.image.opacity}
                                                    onChange={(e) => updateSettings({
                                                        background: { image: { opacity: Number(e.target.value) } }
                                                    })}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div>
                <button
                    onClick={() => toggleSubsection('glass')}
                    className="w-full flex items-center justify-between p-3 hover:bg-base-200/30 rounded-lg transition-colors"
                    type="button"
                >
                    <span className="text-sm font-medium">毛玻璃效果</span>
                    {expandedSubsections.glass ? (
                        <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                    )}
                </button>
                
                {expandedSubsections.glass && (
                    <div className="px-3 py-2 space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.glass.enabled}
                                onChange={(e) => toggleGlass(e.target.checked)}
                                className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">启用毛玻璃效果</span>
                        </label>
                        
                        {settings.glass.enabled && (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-base-content/60">不透明度</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="1"
                                        step="0.05"
                                        value={settings.glass.opacity}
                                        onChange={(e) => updateGlass({ opacity: Number(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-base-content/60">模糊强度</label>
                                    <input
                                        type="range"
                                        min="8"
                                        max="40"
                                        value={settings.glass.blur}
                                        onChange={(e) => updateGlass({ blur: Number(e.target.value) })}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderEffectsSection = () => (
        <div className="space-y-4">
            <label className="flex items-center gap-2 p-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={settings.effects.enabled}
                    onChange={(e) => toggleEffects(e.target.checked)}
                    className="checkbox checkbox-sm"
                />
                <span className="text-sm font-medium">启用动态特效</span>
            </label>

            {settings.effects.enabled && (
                <>
                    <div>
                        <button
                            onClick={() => toggleSubsection('particles')}
                            className="w-full flex items-center justify-between p-3 hover:bg-base-200/30 rounded-lg transition-colors"
                            type="button"
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.effects.particles.enabled}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        toggleParticles(e.target.checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="checkbox checkbox-sm"
                                />
                                <span className="text-sm font-medium">粒子效果</span>
                            </div>
                            {expandedSubsections.particles ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                        </button>
                        
                        {expandedSubsections.particles && settings.effects.particles.enabled && (
                            <div className="px-3 py-2 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-base-content/60">粒子数量</label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="200"
                                            value={settings.effects.particles.count}
                                            onChange={(e) => updateParticles({ count: Number(e.target.value) })}
                                            className="w-full"
                                        />
                                        <span className="text-xs">{settings.effects.particles.count}</span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-base-content/60">移动速度</label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="5"
                                            step="0.5"
                                            value={settings.effects.particles.speed}
                                            onChange={(e) => updateParticles({ speed: Number(e.target.value) })}
                                            className="w-full"
                                        />
                                        <span className="text-xs">{settings.effects.particles.speed}</span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-base-content/60">粒子大小</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={settings.effects.particles.size}
                                            onChange={(e) => updateParticles({ size: Number(e.target.value) })}
                                            className="w-full"
                                        />
                                        <span className="text-xs">{settings.effects.particles.size}</span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-base-content/60">不透明度</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={settings.effects.particles.opacity}
                                            onChange={(e) => updateParticles({ opacity: Number(e.target.value) })}
                                            className="w-full"
                                        />
                                        <span className="text-xs">{settings.effects.particles.opacity}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            onClick={() => toggleSubsection('glow')}
                            className="w-full flex items-center justify-between p-3 hover:bg-base-200/30 rounded-lg transition-colors"
                            type="button"
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={settings.effects.glow.enabled}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        toggleGlow(e.target.checked);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="checkbox checkbox-sm"
                                />
                                <span className="text-sm font-medium">光晕效果</span>
                            </div>
                            {expandedSubsections.glow ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                        </button>
                        
                        {expandedSubsections.glow && settings.effects.glow.enabled && (
                            <div className="px-3 py-2 space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-base-content/60">颜色:</label>
                                    <input
                                        type="color"
                                        value={settings.effects.glow.color}
                                        onChange={(e) => updateGlow({ color: e.target.value })}
                                        className="w-8 h-8 rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-mono">{settings.effects.glow.color}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-base-content/60">强度</label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1"
                                            step="0.1"
                                            value={settings.effects.glow.intensity}
                                            onChange={(e) => updateGlow({ intensity: Number(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-base-content/60">半径</label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="200"
                                            value={settings.effects.glow.radius}
                                            onChange={(e) => updateGlow({ radius: Number(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 px-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.effects.parallax.enabled}
                                onChange={(e) => toggleParallax(e.target.checked)}
                                className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">视差滚动效果</span>
                        </label>
                        
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.effects.floating.enabled}
                                onChange={(e) => toggleFloating(e.target.checked)}
                                className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">浮动动画效果</span>
                        </label>
                    </div>
                </>
            )}
        </div>
    );

    const renderTypographySection = () => (
        <div className="space-y-4">
            <div>
                <button
                    onClick={() => toggleSubsection('poemTypo')}
                    className="w-full flex items-center justify-between p-3 hover:bg-base-200/30 rounded-lg transition-colors"
                    type="button"
                >
                    <span className="text-sm font-medium">诗词排版</span>
                    {expandedSubsections.poemTypo ? (
                        <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                    )}
                </button>
                
                {expandedSubsections.poemTypo && (
                    <div className="px-3 py-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-base-content/60">字体大小</label>
                                <select
                                    value={settings.typography.poem.fontSize}
                                    onChange={(e) => updateTypography('poem', { fontSize: e.target.value })}
                                    className="w-full select select-sm"
                                >
                                    <option value="2rem">小</option>
                                    <option value="2.5rem">中</option>
                                    <option value="3rem">大</option>
                                    <option value="3.5rem">特大</option>
                                    <option value="4rem">超大</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-base-content/60">行高</label>
                                <select
                                    value={settings.typography.poem.lineHeight}
                                    onChange={(e) => updateTypography('poem', { lineHeight: e.target.value })}
                                    className="w-full select select-sm"
                                >
                                    <option value="1.2">紧凑</option>
                                    <option value="1.4">正常</option>
                                    <option value="1.5">宽松</option>
                                    <option value="1.8">很宽松</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-base-content/60">字间距</label>
                                <select
                                    value={settings.typography.poem.letterSpacing}
                                    onChange={(e) => updateTypography('poem', { letterSpacing: e.target.value })}
                                    className="w-full select select-sm"
                                >
                                    <option value="0">紧凑</option>
                                    <option value="0.02em">正常</option>
                                    <option value="0.05em">宽松</option>
                                    <option value="0.1em">很宽松</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-base-content/60">不透明度</label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="1"
                                    step="0.1"
                                    value={settings.typography.poem.opacity}
                                    onChange={(e) => updateTypography('poem', { opacity: Number(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-3 py-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings.shadows.enabled}
                        onChange={(e) => toggleShadows(e.target.checked)}
                        className="checkbox checkbox-sm"
                    />
                    <span className="text-sm">启用阴影效果</span>
                </label>
            </div>
        </div>
    );

    const renderLayoutSection = () => (
        <div className="space-y-4 px-3">
            <div className="space-y-2">
                <p className="text-xs text-base-content/60 font-medium">间距设置</p>
                <div className="grid grid-cols-1 gap-2">
                    <div>
                        <label className="text-xs text-base-content/60">诗词区域间距</label>
                        <select
                            value={settings.layout.spacing.poemSection}
                            onChange={(e) => updateLayout('spacing', { poemSection: e.target.value })}
                            className="w-full select select-sm"
                        >
                            <option value="1rem">紧凑</option>
                            <option value="2rem">正常</option>
                            <option value="3rem">宽松</option>
                            <option value="4rem">很宽松</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-base-content/60">书签区域间距</label>
                        <select
                            value={settings.layout.spacing.bookmarkSection}
                            onChange={(e) => updateLayout('spacing', { bookmarkSection: e.target.value })}
                            className="w-full select select-sm"
                        >
                            <option value="1rem">紧凑</option>
                            <option value="1.5rem">正常</option>
                            <option value="2rem">宽松</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-xs text-base-content/60 font-medium">对齐设置</p>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-base-content/60">垂直对齐</label>
                        <select
                            value={settings.layout.alignment.vertical}
                            onChange={(e) => updateLayout('alignment', { vertical: e.target.value })}
                            className="w-full select select-sm"
                        >
                            <option value="start">顶部</option>
                            <option value="center">居中</option>
                            <option value="end">底部</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-base-content/60">水平对齐</label>
                        <select
                            value={settings.layout.alignment.horizontal}
                            onChange={(e) => updateLayout('alignment', { horizontal: e.target.value })}
                            className="w-full select select-sm"
                        >
                            <option value="start">左侧</option>
                            <option value="center">居中</option>
                            <option value="end">右侧</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAnimationsSection = () => (
        <div className="space-y-4">
            <div>
                <button
                    onClick={() => toggleSubsection('transitions')}
                    className="w-full flex items-center justify-between p-3 hover:bg-base-200/30 rounded-lg transition-colors"
                    type="button"
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={settings.animations.transitions.enabled}
                            onChange={(e) => {
                                e.stopPropagation();
                                updateAnimations('transitions', { enabled: e.target.checked });
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="checkbox checkbox-sm"
                        />
                        <span className="text-sm font-medium">过渡动画</span>
                    </div>
                    {expandedSubsections.transitions ? (
                        <ChevronUpIcon className="w-4 h-4" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                    )}
                </button>
                
                {expandedSubsections.transitions && settings.animations.transitions.enabled && (
                    <div className="px-3 py-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-base-content/60">动画时长</label>
                                <select
                                    value={settings.animations.transitions.duration}
                                    onChange={(e) => updateAnimations('transitions', { duration: e.target.value })}
                                    className="w-full select select-sm"
                                >
                                    <option value="0.1s">快</option>
                                    <option value="0.2s">较快</option>
                                    <option value="0.3s">正常</option>
                                    <option value="0.5s">较慢</option>
                                    <option value="0.8s">慢</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-base-content/60">缓动函数</label>
                                <select
                                    value={settings.animations.transitions.easing}
                                    onChange={(e) => updateAnimations('transitions', { easing: e.target.value })}
                                    className="w-full select select-sm"
                                >
                                    <option value="linear">线性</option>
                                    <option value="ease">缓动</option>
                                    <option value="ease-in">渐入</option>
                                    <option value="ease-out">渐出</option>
                                    <option value="ease-in-out">渐入渐出</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-3 py-2 space-y-2">
                <p className="text-xs text-base-content/60 font-medium">悬停效果</p>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-base-content/60">缩放比例</label>
                        <select
                            value={settings.animations.hover.scale}
                            onChange={(e) => updateAnimations('hover', { scale: Number(e.target.value) })}
                            className="w-full select select-sm"
                        >
                            <option value="1">无</option>
                            <option value="1.02">轻微</option>
                            <option value="1.04">正常</option>
                            <option value="1.08">明显</option>
                            <option value="1.1">强烈</option>
                        </select>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mt-5">
                            <input
                                type="checkbox"
                                checked={settings.animations.hover.shadow}
                                onChange={(e) => updateAnimations('hover', { shadow: e.target.checked })}
                                className="checkbox checkbox-sm"
                            />
                            <span className="text-sm">阴影效果</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'background':
                return renderBackgroundSection();
            case 'effects':
                return renderEffectsSection();
            case 'typography':
                return renderTypographySection();
            case 'layout':
                return renderLayoutSection();
            case 'animations':
                return renderAnimationsSection();
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-base-100/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-base-200/50">
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-200/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ColorIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">视觉定制</h2>
                            <p className="text-xs text-base-content/50">自定义背景、特效、排版等</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={applySettings}
                            className="p-2 rounded-lg hover:bg-base-200/50 transition-colors"
                            title="应用设置"
                            type="button"
                        >
                            <PreviewIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={resetToDefault}
                            className="p-2 rounded-lg hover:bg-base-200/50 transition-colors"
                            title="恢复默认"
                            type="button"
                        >
                            <ResetIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-base-200/50 transition-colors"
                            type="button"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-40 border-r border-base-200/50 p-2 space-y-1">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                    activeSection === section.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'hover:bg-base-200/30'
                                }`}
                                type="button"
                            >
                                <section.icon className="w-4 h-4" />
                                <span className="text-sm">{section.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {renderActiveSection()}
                    </div>
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-base-200/50 bg-base-200/30">
                    <button
                        onClick={resetToDefault}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-base-content/60 hover:text-base-content transition-colors"
                        type="button"
                    >
                        <ResetIcon className="w-4 h-4" />
                        恢复默认
                    </button>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-content rounded-lg hover:bg-primary/90 transition-colors"
                        type="button"
                    >
                        <CheckIcon className="w-4 h-4" />
                        完成
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
