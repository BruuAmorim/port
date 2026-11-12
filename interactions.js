document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    initTyping(reduceMotion);
    initAvatarTilt();
    initHeroParticles(reduceMotion);
    initSkillTabs();
    initSkillSpotlight();
    initProjectGalleries();
});

function initProjectGalleries() {
    document.querySelectorAll('[data-gallery]').forEach((gallery) => {
        const main = gallery.querySelector('.project__gallery-main');
        const thumbs = gallery.querySelectorAll('.project__thumb');
        if (!main || !thumbs.length) return;

        thumbs.forEach((thumb) => {
            thumb.addEventListener('click', () => {
                main.src = thumb.dataset.src;
                main.alt = thumb.dataset.alt;
                thumbs.forEach((item) => {
                    item.setAttribute('aria-pressed', item === thumb ? 'true' : 'false');
                });
            });
        });
    });
}

function initTyping(reduceMotion) {
    const el = document.getElementById('typing-text');
    const caret = document.querySelector('.typing__caret');
    if (!el) return;

    const phrases = ['Sistemas com IA', 'Experiências Interativas', 'Soluções Web'];

    if (reduceMotion) {
        el.textContent = phrases.join(' · ');
        if (caret) caret.hidden = true;
        return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const phrase = phrases[phraseIndex];
        el.textContent = phrase.slice(0, charIndex);

        if (!deleting && charIndex === phrase.length) {
            deleting = true;
            window.setTimeout(tick, 1600);
            return;
        }

        if (deleting && charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            window.setTimeout(tick, 280);
            return;
        }

        charIndex += deleting ? -1 : 1;
        window.setTimeout(tick, deleting ? 34 : 68);
    };

    tick();
}

function initAvatarTilt() {
    const avatar = document.getElementById('avatar');
    const stage = avatar && avatar.querySelector('.avatar__stage');
    if (!avatar || !stage) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const max = 12;

    avatar.addEventListener('mousemove', (event) => {
        const rect = avatar.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        stage.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
        stage.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
    });

    avatar.addEventListener('mouseleave', () => {
        stage.style.setProperty('--rx', '0deg');
        stage.style.setProperty('--ry', '0deg');
    });
}

function initHeroParticles(reduceMotion) {
    const canvas = document.getElementById('hero-particles');
    const hero = document.getElementById('home');
    if (!canvas || !hero || reduceMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    let running = false;
    let frameId = 0;

    const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = hero.clientWidth;
        const height = hero.clientHeight;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.max(18, Math.min(42, Math.floor(width / 36)));
        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.32,
            vy: (Math.random() - 0.5) * 0.32
        }));
    };

    const draw = () => {
        if (!running) return;
        const width = hero.clientWidth;
        const height = hero.clientHeight;
        ctx.clearRect(0, 0, width, height);

        for (const particle of particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i];
                const b = particles[j];
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist < 130) {
                    ctx.strokeStyle = `rgba(192, 132, 252, ${((1 - dist / 130) * 0.28).toFixed(3)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = 'rgba(233, 213, 255, 0.9)';
        for (const particle of particles) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        frameId = window.requestAnimationFrame(draw);
    };

    const start = () => {
        if (running) return;
        running = true;
        draw();
    };

    const stop = () => {
        running = false;
        window.cancelAnimationFrame(frameId);
    };

    resize();
    window.addEventListener('resize', resize);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) start();
                else stop();
            });
        }, { threshold: 0.05 });
        observer.observe(hero);
    } else {
        start();
    }
}

function initSkillTabs() {
    const tabs = Array.from(document.querySelectorAll('.skills__tab'));
    const cards = Array.from(document.querySelectorAll('.skill-card'));
    const panel = document.getElementById('skills-grid');
    if (!tabs.length || !panel) return;

    const select = (tab) => {
        tabs.forEach((item) => {
            const active = item === tab;
            item.setAttribute('aria-selected', active ? 'true' : 'false');
            item.tabIndex = active ? 0 : -1;
        });
        panel.setAttribute('aria-labelledby', tab.id);

        let visibleIndex = 0;
        cards.forEach((card) => {
            const match = card.dataset.cat === tab.dataset.cat;
            card.hidden = !match;
            if (match) {
                card.style.animation = 'none';
                card.offsetHeight;
                card.style.animation = '';
                card.style.animationDelay = `${visibleIndex * 45}ms`;
                visibleIndex += 1;
            }
        });
    };

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', (event) => {
            const horizontal = event.key === 'ArrowRight' || event.key === 'ArrowLeft';
            if (!horizontal && event.key !== 'Home' && event.key !== 'End') return;
            event.preventDefault();
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = tabs.length - 1;
            tabs[next].focus();
            select(tabs[next]);
        });
    });
}

function initSkillSpotlight() {
    const grid = document.getElementById('skills-grid');
    if (!grid || !window.matchMedia('(pointer: fine)').matches) return;

    grid.addEventListener('mousemove', (event) => {
        const card = event.target.closest('.skill-card');
        if (!card || card.hidden) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
}
