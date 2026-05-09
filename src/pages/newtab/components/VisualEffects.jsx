import { useEffect, useRef, useState } from "react";
import {
    ParticleSystem,
    ParallaxEffect,
    FloatingAnimation,
    GlowEffect,
    GradientAnimation
} from "../services/visualEffects";
import { useVisualCustomizer } from "../hooks/useVisualCustomizer";

export default function VisualEffects({ children }) {
    const { settings } = useVisualCustomizer();
    const particleCanvasRef = useRef(null);
    const particleSystemRef = useRef(null);
    const parallaxEffectRef = useRef(null);
    const floatingAnimationsRef = useRef([]);
    const glowEffectRef = useRef(null);
    const gradientAnimationRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (particleSystemRef.current) {
                particleSystemRef.current.stop();
            }
            if (parallaxEffectRef.current) {
                parallaxEffectRef.current.stop();
            }
            floatingAnimationsRef.current.forEach(anim => anim.stop());
            if (glowEffectRef.current) {
                glowEffectRef.current.stop();
            }
            if (gradientAnimationRef.current) {
                gradientAnimationRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (!settings.effects.enabled) {
            if (particleSystemRef.current) particleSystemRef.current.stop();
            if (parallaxEffectRef.current) parallaxEffectRef.current.stop();
            if (glowEffectRef.current) glowEffectRef.current.stop();
            if (gradientAnimationRef.current) gradientAnimationRef.current.stop();
            return;
        }

        if (settings.effects.particles.enabled) {
            if (!particleSystemRef.current && particleCanvasRef.current) {
                particleCanvasRef.current.width = window.innerWidth;
                particleCanvasRef.current.height = window.innerHeight;
                
                particleSystemRef.current = new ParticleSystem(particleCanvasRef.current, {
                    count: settings.effects.particles.count,
                    color: settings.effects.particles.color,
                    speed: settings.effects.particles.speed,
                    size: settings.effects.particles.size,
                    opacity: settings.effects.particles.opacity
                });
                particleSystemRef.current.start();
            } else if (particleSystemRef.current) {
                particleSystemRef.current.updateOptions({
                    count: settings.effects.particles.count,
                    color: settings.effects.particles.color,
                    speed: settings.effects.particles.speed,
                    size: settings.effects.particles.size,
                    opacity: settings.effects.particles.opacity
                });
            }
        } else if (particleSystemRef.current) {
            particleSystemRef.current.stop();
        }

        if (settings.effects.parallax.enabled) {
            if (!parallaxEffectRef.current && containerRef.current) {
                parallaxEffectRef.current = new ParallaxEffect(containerRef.current, {
                    intensity: settings.effects.parallax.intensity
                });
                parallaxEffectRef.current.start();
            }
        } else if (parallaxEffectRef.current) {
            parallaxEffectRef.current.stop();
            parallaxEffectRef.current = null;
        }

        if (settings.effects.glow.enabled) {
            if (!glowEffectRef.current) {
                glowEffectRef.current = new GlowEffect(document.body, {
                    color: settings.effects.glow.color,
                    intensity: settings.effects.glow.intensity,
                    radius: settings.effects.glow.radius
                });
                glowEffectRef.current.start();
            } else {
                glowEffectRef.current.updateOptions({
                    color: settings.effects.glow.color,
                    intensity: settings.effects.glow.intensity,
                    radius: settings.effects.glow.radius
                });
            }
        } else if (glowEffectRef.current) {
            glowEffectRef.current.stop();
            glowEffectRef.current = null;
        }

        if (settings.background.type === 'gradient') {
            if (!gradientAnimationRef.current && containerRef.current) {
                gradientAnimationRef.current = new GradientAnimation(document.body, {
                    colors: settings.background.gradient.colors,
                    duration: 20,
                    angle: settings.background.gradient.angle
                });
                gradientAnimationRef.current.start();
            }
        } else if (gradientAnimationRef.current) {
            gradientAnimationRef.current.stop();
            gradientAnimationRef.current = null;
        }
    }, [
        settings.effects.enabled,
        settings.effects.particles,
        settings.effects.parallax,
        settings.effects.glow,
        settings.effects.floating,
        settings.background.type,
        settings.background.gradient
    ]);

    useEffect(() => {
        const handleResize = () => {
            if (particleCanvasRef.current && particleSystemRef.current) {
                particleCanvasRef.current.width = window.innerWidth;
                particleCanvasRef.current.height = window.innerHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!settings.effects.floating.enabled) {
            floatingAnimationsRef.current.forEach(anim => anim.stop());
            floatingAnimationsRef.current = [];
            return;
        }

        const poemElements = document.querySelectorAll('.poem-content, .source-content, .author-content');
        floatingAnimationsRef.current.forEach(anim => anim.stop());
        floatingAnimationsRef.current = [];

        poemElements.forEach((element, index) => {
            const animation = new FloatingAnimation(element, {
                speed: settings.effects.floating.speed,
                amplitude: settings.effects.floating.amplitude,
                delay: index * 0.5
            });
            animation.start();
            floatingAnimationsRef.current.push(animation);
        });
    }, [settings.effects.floating.enabled, settings.effects.floating.speed, settings.effects.floating.amplitude]);

    return (
        <div ref={containerRef} className="relative w-full h-full">
            {settings.effects.enabled && settings.effects.particles.enabled && (
                <canvas
                    ref={particleCanvasRef}
                    className="fixed inset-0 pointer-events-none"
                    style={{ zIndex: 0 }}
                />
            )}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
