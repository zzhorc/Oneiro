class Particle {
    constructor(canvas, options) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * options.speed;
        this.vy = (Math.random() - 0.5) * options.speed;
        this.radius = options.size * (0.5 + Math.random() * 0.5);
        this.opacity = options.opacity * (0.5 + Math.random() * 0.5);
        this.color = options.color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

export class ParticleSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.options = {
            count: 50,
            color: '#ffffff',
            speed: 2,
            size: 3,
            opacity: 0.5,
            connectDistance: 100,
            ...options
        };
        this.animationId = null;
        this.isRunning = false;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.options.count; i++) {
            this.particles.push(new Particle(this.canvas, this.options));
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.init();
    }

    updateOptions(options) {
        this.options = { ...this.options, ...options };
        this.init();
    }

    drawConnections() {
        const { connectDistance, color } = this.options;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectDistance) {
                    const opacity = (1 - distance / connectDistance) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = color;
                    this.ctx.globalAlpha = opacity;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            }
        }
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update();
            particle.draw(this.ctx);
        });

        this.drawConnections();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.init();
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

export class ParallaxEffect {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            intensity: 0.5,
            layers: [],
            ...options
        };
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.isActive = false;
    }

    handleMouseMove(e) {
        if (!this.isActive) return;

        const rect = this.container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const offsetX = (mouseX - centerX) / centerX;
        const offsetY = (mouseY - centerY) / centerY;

        this.container.style.transform = `perspective(1000px) 
            rotateX(${offsetY * -5 * this.options.intensity}deg) 
            rotateY(${offsetX * 5 * this.options.intensity}deg)
            translateZ(20px)`;
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.container.style.transition = 'transform 0.1s ease-out';
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    stop() {
        this.isActive = false;
        document.removeEventListener('mousemove', this.handleMouseMove);
        if (this.container) {
            this.container.style.transform = '';
            this.container.style.transition = '';
        }
    }
}

export class FloatingAnimation {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            speed: 1,
            amplitude: 10,
            delay: 0,
            ...options
        };
        this.animationId = null;
        this.isRunning = false;
        this.startTime = 0;
    }

    animate(timestamp) {
        if (!this.isRunning) return;

        if (!this.startTime) this.startTime = timestamp;
        const elapsed = (timestamp - this.startTime) / 1000;
        
        const y = Math.sin(elapsed * this.options.speed + this.options.delay) * this.options.amplitude;
        this.element.style.transform = `translateY(${y}px)`;

        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = 0;
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.element) {
            this.element.style.transform = '';
        }
    }
}

export class GlowEffect {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            color: '#667eea',
            intensity: 0.3,
            radius: 100,
            ...options
        };
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.glowElement = null;
        this.isActive = false;
    }

    createGlowElement() {
        if (this.glowElement) return;
        
        this.glowElement = document.createElement('div');
        this.glowElement.style.cssText = `
            position: fixed;
            pointer-events: none;
            width: ${this.options.radius * 2}px;
            height: ${this.options.radius * 2}px;
            border-radius: 50%;
            background: radial-gradient(circle, ${this.options.color}${Math.round(this.options.intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%);
            transform: translate(-50%, -50%);
            z-index: 0;
            transition: opacity 0.3s ease;
            opacity: 0;
        `;
        document.body.insertBefore(this.glowElement, document.body.firstChild);
    }

    handleMouseMove(e) {
        if (!this.isActive || !this.glowElement) return;
        this.glowElement.style.left = `${e.clientX}px`;
        this.glowElement.style.top = `${e.clientY}px`;
    }

    updateOptions(options) {
        this.options = { ...this.options, ...options };
        if (this.glowElement) {
            this.glowElement.style.width = `${this.options.radius * 2}px`;
            this.glowElement.style.height = `${this.options.radius * 2}px`;
            this.glowElement.style.background = `radial-gradient(circle, ${this.options.color}${Math.round(this.options.intensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`;
        }
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        this.createGlowElement();
        if (this.glowElement) {
            this.glowElement.style.opacity = '1';
        }
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    stop() {
        this.isActive = false;
        document.removeEventListener('mousemove', this.handleMouseMove);
        if (this.glowElement) {
            this.glowElement.style.opacity = '0';
            setTimeout(() => {
                if (this.glowElement && this.glowElement.parentNode) {
                    this.glowElement.parentNode.removeChild(this.glowElement);
                }
                this.glowElement = null;
            }, 300);
        }
    }
}

export class GradientAnimation {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
            duration: 15,
            angle: 45,
            ...options
        };
        this.animationId = null;
        this.isRunning = false;
        this.startTime = 0;
    }

    animate(timestamp) {
        if (!this.isRunning) return;

        if (!this.startTime) this.startTime = timestamp;
        const elapsed = (timestamp - this.startTime) / 1000;
        const progress = (elapsed % this.options.duration) / this.options.duration;

        const numColors = this.options.colors.length;
        const colorIndex = Math.floor(progress * numColors) % numColors;
        const nextColorIndex = (colorIndex + 1) % numColors;
        const localProgress = (progress * numColors) % 1;

        const currentColor = this.lerpColor(
            this.options.colors[colorIndex],
            this.options.colors[nextColorIndex],
            localProgress
        );

        const angle = this.options.angle + progress * 360;
        
        this.element.style.background = `linear-gradient(${angle}deg, ${currentColor}, ${this.options.colors[nextColorIndex]})`;
        this.element.style.backgroundSize = '400% 400%';

        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    lerpColor(color1, color2, t) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = 0;
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.element) {
            this.element.style.background = '';
            this.element.style.backgroundSize = '';
        }
    }
}

export const visualEffects = {
    ParticleSystem,
    ParallaxEffect,
    FloatingAnimation,
    GlowEffect,
    GradientAnimation
};
