import { useState, useEffect, useCallback } from "react";
import { 
    visualCustomizer, 
    DEFAULT_VISUAL_SETTINGS,
    PRESET_GRADIENTS,
    PRESET_COLORS
} from "../services/visualCustomizer";

export function useVisualCustomizer() {
    const [settings, setSettings] = useState(() => visualCustomizer.getSettings());
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const unsubscribe = visualCustomizer.subscribe((newSettings) => {
            setSettings(newSettings);
        });

        visualCustomizer.applySettings();
        setIsInitialized(true);

        return unsubscribe;
    }, []);

    const updateSettings = useCallback((updates) => {
        visualCustomizer.updateSettings(updates);
    }, []);

    const resetToDefault = useCallback(() => {
        visualCustomizer.resetToDefault();
    }, []);

    const applySettings = useCallback(() => {
        visualCustomizer.applySettings();
    }, []);

    const setBackgroundType = useCallback((type) => {
        visualCustomizer.setBackgroundType(type);
    }, []);

    const setBackgroundColor = useCallback((color) => {
        visualCustomizer.setBackgroundColor(color);
    }, []);

    const setBackgroundGradient = useCallback((gradient) => {
        visualCustomizer.setBackgroundGradient(gradient);
    }, []);

    const setBackgroundImage = useCallback((imageSettings) => {
        visualCustomizer.setBackgroundImage(imageSettings);
    }, []);

    const toggleEffects = useCallback((enabled) => {
        visualCustomizer.toggleEffects(enabled);
    }, []);

    const toggleParticles = useCallback((enabled) => {
        visualCustomizer.toggleParticles(enabled);
    }, []);

    const updateParticles = useCallback((settings) => {
        visualCustomizer.updateParticles(settings);
    }, []);

    const toggleGlow = useCallback((enabled) => {
        visualCustomizer.toggleGlow(enabled);
    }, []);

    const updateGlow = useCallback((settings) => {
        visualCustomizer.updateGlow(settings);
    }, []);

    const toggleParallax = useCallback((enabled) => {
        visualCustomizer.toggleParallax(enabled);
    }, []);

    const toggleFloating = useCallback((enabled) => {
        visualCustomizer.toggleFloating(enabled);
    }, []);

    const updateTypography = useCallback((type, settings) => {
        visualCustomizer.updateTypography(type, settings);
    }, []);

    const updateLayout = useCallback((section, settings) => {
        visualCustomizer.updateLayout(section, settings);
    }, []);

    const updateAnimations = useCallback((section, settings) => {
        visualCustomizer.updateAnimations(section, settings);
    }, []);

    const toggleShadows = useCallback((enabled) => {
        visualCustomizer.toggleShadows(enabled);
    }, []);

    const toggleGlass = useCallback((enabled) => {
        visualCustomizer.toggleGlass(enabled);
    }, []);

    const updateGlass = useCallback((settings) => {
        visualCustomizer.updateGlass(settings);
    }, []);

    const addCustomBackgroundImage = useCallback((imageData) => {
        return visualCustomizer.addCustomBackgroundImage(imageData);
    }, []);

    const removeCustomBackgroundImage = useCallback((imageId) => {
        visualCustomizer.removeCustomBackgroundImage(imageId);
    }, []);

    const getPresetGradients = useCallback(() => {
        return visualCustomizer.getPresetGradients();
    }, []);

    const getPresetColors = useCallback(() => {
        return visualCustomizer.getPresetColors();
    }, []);

    const getCustomBackgroundImages = useCallback(() => {
        return visualCustomizer.getCustomBackgroundImages();
    }, []);

    return {
        settings,
        isInitialized,
        DEFAULT_VISUAL_SETTINGS,
        PRESET_GRADIENTS,
        PRESET_COLORS,
        
        updateSettings,
        resetToDefault,
        applySettings,
        
        setBackgroundType,
        setBackgroundColor,
        setBackgroundGradient,
        setBackgroundImage,
        
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
        updateGlass,
        
        addCustomBackgroundImage,
        removeCustomBackgroundImage,
        getCustomBackgroundImages,
        
        getPresetGradients,
        getPresetColors
    };
}
