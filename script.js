/* ============================================
   EDHANA AI — Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initParticles();
    initWaveform();
    initGlobe();
    initNavbar();
    initRevealAnimations();
    initCounterAnimations();
    initEvalBarAnimations();
    initSmoothScroll();
    initContactForm();
    initCursorGlow();
    initActiveNav();
});

/* ============================================
   Preloader
   ============================================ */

function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 800);
    });

    // Fallback: hide after 3s no matter what
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 3000);
}

/* ============================================
   Cursor Glow Effect
   ============================================ */

function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || window.innerWidth < 768) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.classList.add('visible');
    });

    document.addEventListener('mouseleave', () => {
        glow.classList.remove('visible');
    });

    function animateGlow() {
        // Smooth lerp follow
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

/* ============================================
   Active Nav Link Highlighting
   ============================================ */

function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-link-cta)');

    function updateActive() {
        const scrollY = window.scrollY + 120;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
}

/* ============================================
   Particle Background
   ============================================ */

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.color = Math.random() > 0.5 ? '124, 58, 237' : '6, 182, 212';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.08;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        animationId = requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================
   Interactive Audio Demo Player
   ============================================ */

function initWaveform() {
    const canvas = document.getElementById('waveform-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const audio = document.getElementById('demo-audio');
    const playBtn = document.getElementById('play-btn');
    const playIcon = playBtn?.querySelector('.play-icon');
    const pauseIcon = playBtn?.querySelector('.pause-icon');
    const progressFill = document.getElementById('progress-fill');
    const progressHandle = document.getElementById('progress-handle');
    const progressWrap = document.getElementById('progress-wrap');
    const durationEl = document.getElementById('player-duration');
    const volumeBtn = document.getElementById('volume-btn');
    const transcriptLines = document.querySelectorAll('.transcript-line');

    const overlay = document.getElementById('waveform-overlay');
    const waveformWrapper = document.getElementById('waveform-wrapper');
    const playerEl = document.getElementById('demo-player');

    let isPlaying = false;
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let source = null;
    let audioReady = false;
    let time = 0;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = 200;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '100px';
    }

    resize();
    window.addEventListener('resize', resize);

    // Setup Web Audio API for real-time visualization
    function setupAudioContext() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioReady = true;
    }

    // Format seconds to M:SS
    function formatTime(s) {
        if (isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    }

    // Play / Pause toggle
    if (playBtn && audio) {
        function startPlayback() {
            try { setupAudioContext(); } catch(e) {}
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }

            if (isPlaying) {
                audio.pause();
            } else {
                audio.play().catch(() => {
                    // Audio file not found — still show animated waveform
                });
            }
        }

        playBtn.addEventListener('click', startPlayback);

        // Overlay click starts playback
        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
        if (waveformWrapper) {
            waveformWrapper.addEventListener('click', (e) => {
                if (e.target === canvas || e.target.closest('.waveform-overlay')) {
                    startPlayback();
                }
            });
        }

        // ─── Animated Favicon ──────────────────────────────────
        const faviconLink = document.querySelector('link[rel="icon"]');
        const originalFavicon = faviconLink ? faviconLink.href : '';
        let faviconAnimFrame = null;

        function animateFavicon() {
            const size = 32;
            const fc = document.createElement('canvas');
            fc.width = size;
            fc.height = size;
            const fctx = fc.getContext('2d');
            const t = Date.now() / 600;

            // Gradient background circle
            const grad = fctx.createLinearGradient(0, 0, size, size);
            grad.addColorStop(0, '#7c3aed');
            grad.addColorStop(1, '#06b6d4');
            fctx.beginPath();
            fctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
            fctx.fillStyle = grad;
            fctx.fill();

            // Animated voice bars
            const barWidth = 3;
            const barGap = 5;
            const bars = 3;
            const startX = (size - (bars * barWidth + (bars - 1) * barGap)) / 2;
            fctx.fillStyle = 'white';
            for (let i = 0; i < bars; i++) {
                const h = 6 + Math.sin(t + i * 1.2) * 5;
                const x = startX + i * (barWidth + barGap);
                const y = (size - h) / 2;
                fctx.beginPath();
                fctx.roundRect(x, y, barWidth, h, 1.5);
                fctx.fill();
            }

            if (faviconLink) {
                faviconLink.href = fc.toDataURL('image/png');
            }
            faviconAnimFrame = requestAnimationFrame(animateFavicon);
        }

        function stopFaviconAnim() {
            if (faviconAnimFrame) {
                cancelAnimationFrame(faviconAnimFrame);
                faviconAnimFrame = null;
            }
            if (faviconLink) {
                faviconLink.href = originalFavicon;
            }
        }

        audio.addEventListener('play', () => {
            isPlaying = true;
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            if (overlay) overlay.classList.add('hidden');
            if (playerEl) playerEl.classList.add('playing');
            animateFavicon();
        });

        audio.addEventListener('pause', () => {
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            if (playerEl) playerEl.classList.remove('playing');
            stopFaviconAnim();
        });

        audio.addEventListener('ended', () => {
            isPlaying = false;
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            if (overlay) overlay.classList.remove('hidden');
            if (playerEl) playerEl.classList.remove('playing');
            stopFaviconAnim();
        });

        // Progress bar update
        audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            const pct = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = pct + '%';
            progressHandle.style.left = pct + '%';
            durationEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
            updateTranscript(audio.currentTime);
        });

        audio.addEventListener('loadedmetadata', () => {
            durationEl.textContent = `0:00 / ${formatTime(audio.duration)}`;
        });

        // Click to seek
        if (progressWrap) {
            progressWrap.addEventListener('click', (e) => {
                const rect = progressWrap.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                if (audio.duration) {
                    audio.currentTime = pct * audio.duration;
                }
            });
        }

        // Volume toggle
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                audio.muted = !audio.muted;
                volumeBtn.classList.toggle('muted', audio.muted);
            });
        }
    }

    // Highlight transcript lines based on time
    function updateTranscript(currentTime) {
        transcriptLines.forEach(line => {
            const start = parseFloat(line.dataset.start);
            const end = parseFloat(line.dataset.end);
            if (currentTime >= start && currentTime < end) {
                line.classList.add('active');
                // Auto-scroll to active line
                line.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                line.classList.remove('active');
            }
        });
    }

    // Waveform visualization
    function drawWaveform() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;
        const barWidth = 3;
        const gap = 4;
        const totalBars = Math.floor(canvas.width / (barWidth + gap));

        // Get frequency data if audio is playing
        let freqData = null;
        if (audioReady && isPlaying && analyser) {
            analyser.getByteFrequencyData(dataArray);
            freqData = dataArray;
        }

        for (let i = 0; i < totalBars; i++) {
            const x = i * (barWidth + gap);
            let height;

            if (freqData && isPlaying) {
                // Map bar index to frequency data
                const freqIndex = Math.floor((i / totalBars) * freqData.length);
                const freqValue = freqData[freqIndex] / 255;
                // Mix frequency data with ambient animation
                const ambient = Math.sin(i * 0.08 + time * 2) * 0.15;
                height = (freqValue * 0.85 + ambient + 0.05) * canvas.height * 0.45;
                height = Math.max(height, 3);
            } else {
                // Idle animation — gentle breathing waveform
                const wave1 = Math.sin(i * 0.08 + time * 1.2) * 0.35;
                const wave2 = Math.sin(i * 0.12 + time * 0.8 + 1) * 0.2;
                const wave3 = Math.sin(i * 0.04 + time * 1.8 + 2) * 0.15;
                const combined = wave1 + wave2 + wave3;
                height = Math.abs(combined) * 60 + 3;
            }

            // Gradient color based on position
            const progress = i / totalBars;
            const r = Math.round(124 + (6 - 124) * progress);
            const g = Math.round(58 + (182 - 58) * progress);
            const b = Math.round(237 + (212 - 237) * progress);
            const alpha = isPlaying ? 0.7 + (height / canvas.height) * 0.3 : 0.4 + Math.abs(Math.sin(i * 0.1 + time)) * 0.25;

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.roundRect(x, centerY - height / 2, barWidth, height, 2);
            ctx.fill();
        }

        time += isPlaying ? 0.03 : 0.012;
        requestAnimationFrame(drawWaveform);
    }

    // Activate first transcript line by default
    if (transcriptLines.length > 0) {
        transcriptLines[0].classList.add('active');
    }

    drawWaveform();
}

/* ============================================
   Interactive Globe
   ============================================ */

function initGlobe() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const container = canvas.parentElement;
        const size = container.getBoundingClientRect().width;
        canvas.width = size * 2;
        canvas.height = size * 2;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
    }

    resize();
    window.addEventListener('resize', resize);

    let rotation = 0;

    // City positions (lat, lng)
    const cities = [
        { lat: 40.7, lng: -74, name: 'New York' },
        { lat: 51.5, lng: -0.1, name: 'London' },
        { lat: 35.7, lng: 139.7, name: 'Tokyo' },
        { lat: -33.9, lng: 151.2, name: 'Sydney' },
        { lat: 19.1, lng: 72.9, name: 'Mumbai' },
        { lat: 55.8, lng: 37.6, name: 'Moscow' },
        { lat: -23.5, lng: -46.6, name: 'São Paulo' },
        { lat: 1.3, lng: 103.8, name: 'Singapore' },
        { lat: 37.6, lng: 127, name: 'Seoul' },
        { lat: 31.2, lng: 121.5, name: 'Shanghai' },
        { lat: 48.9, lng: 2.35, name: 'Paris' },
        { lat: 25.2, lng: 55.3, name: 'Dubai' },
    ];

    function latLngToXYZ(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + rotation) * (Math.PI / 180);
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta),
        };
    }

    function drawGlobe() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = canvas.width * 0.35;

        // Globe outline glow
        const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.3);
        glowGrad.addColorStop(0, 'rgba(124, 58, 237, 0.05)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Globe circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 58, 237, 0.03)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Latitude lines
        for (let lat = -60; lat <= 60; lat += 30) {
            ctx.beginPath();
            const points = [];
            for (let lng = 0; lng <= 360; lng += 3) {
                const pos = latLngToXYZ(lat, lng, radius);
                if (pos.z > 0) {
                    points.push({ x: cx + pos.x, y: cy - pos.y });
                } else {
                    if (points.length > 1) {
                        ctx.moveTo(points[0].x, points[0].y);
                        for (let p = 1; p < points.length; p++) {
                            ctx.lineTo(points[p].x, points[p].y);
                        }
                    }
                    points.length = 0;
                }
            }
            if (points.length > 1) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let p = 1; p < points.length; p++) {
                    ctx.lineTo(points[p].x, points[p].y);
                }
            }
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Longitude lines
        for (let lng = 0; lng < 360; lng += 30) {
            ctx.beginPath();
            const points = [];
            for (let lat = -90; lat <= 90; lat += 3) {
                const pos = latLngToXYZ(lat, lng, radius);
                if (pos.z > 0) {
                    points.push({ x: cx + pos.x, y: cy - pos.y });
                } else {
                    if (points.length > 1) {
                        ctx.moveTo(points[0].x, points[0].y);
                        for (let p = 1; p < points.length; p++) {
                            ctx.lineTo(points[p].x, points[p].y);
                        }
                    }
                    points.length = 0;
                }
            }
            if (points.length > 1) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let p = 1; p < points.length; p++) {
                    ctx.lineTo(points[p].x, points[p].y);
                }
            }
            ctx.strokeStyle = 'rgba(124, 58, 237, 0.06)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw cities
        cities.forEach((city, index) => {
            const pos = latLngToXYZ(city.lat, city.lng, radius);
            if (pos.z > 0) {
                const screenX = cx + pos.x;
                const screenY = cy - pos.y;
                const depthAlpha = 0.4 + (pos.z / radius) * 0.6;

                // Pulse effect
                const pulseSize = 4 + Math.sin(Date.now() * 0.003 + index) * 2;
                
                // Glow
                ctx.beginPath();
                ctx.arc(screenX, screenY, pulseSize * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 182, 212, ${depthAlpha * 0.1})`;
                ctx.fill();

                // Dot
                ctx.beginPath();
                ctx.arc(screenX, screenY, pulseSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 182, 212, ${depthAlpha})`;
                ctx.fill();

                // Inner dot
                ctx.beginPath();
                ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha})`;
                ctx.fill();
            }
        });

        // Draw connections between visible cities
        const visibleCities = cities
            .map(city => ({
                ...city,
                pos: latLngToXYZ(city.lat, city.lng, radius),
            }))
            .filter(c => c.pos.z > 0);

        for (let i = 0; i < visibleCities.length; i++) {
            for (let j = i + 1; j < visibleCities.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(visibleCities[i].pos.x - visibleCities[j].pos.x, 2) +
                    Math.pow(visibleCities[i].pos.y - visibleCities[j].pos.y, 2)
                );
                if (dist < radius * 1.2) {
                    const alpha = (1 - dist / (radius * 1.2)) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(cx + visibleCities[i].pos.x, cy - visibleCities[i].pos.y);
                    ctx.lineTo(cx + visibleCities[j].pos.x, cy - visibleCities[j].pos.y);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        rotation += 0.15;
        requestAnimationFrame(drawGlobe);
    }

    drawGlobe();
}

/* ============================================
   Navbar Scroll Effect
   ============================================ */

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }
}

/* ============================================
   Scroll Reveal Animations
   ============================================ */

function initRevealAnimations() {
    const elements = document.querySelectorAll('.reveal-up');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.getAttribute('data-delay') || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        }
    );

    elements.forEach(el => observer.observe(el));
}

/* ============================================
   Counter Animations
   ============================================ */

function initCounterAnimations() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const suffix = element.getAttribute('data-suffix') || '';
    const isDecimal = element.getAttribute('data-decimal') === 'true';
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        if (isDecimal) {
            element.textContent = current.toFixed(1) + suffix;
        } else {
            element.textContent = Math.round(current) + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ============================================
   Eval Bar Animations
   ============================================ */

function initEvalBarAnimations() {
    const fills = document.querySelectorAll('.eval-metric-fill');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 }
    );

    fills.forEach(el => observer.observe(el));
}

/* ============================================
   Smooth Scroll
   ============================================ */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });
    });
}

/* ============================================
   Contact Form
   ============================================ */

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // ─── Google Sheets Integration ─────────────────────────────
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJMCDAakjgXq31VBB40BCRekcF30bOUn4DPzvyM84nxXZuVoxTwv-eeajrwmIXJwOxtw/exec';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = `
            <span>Sending...</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
        `;
        btn.disabled = true;
        btn.style.opacity = '0.7';

        try {
            const formData = new FormData(form);
            const payload = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                industry: formData.get('industry'),
                message: formData.get('message')
            };

            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            btn.innerHTML = `
                <span>Thank you! We'll be in touch.</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
            btn.style.opacity = '1';
            btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.style.background = '';
                form.reset();
            }, 3000);

        } catch (err) {
            btn.innerHTML = `
                <span>Something went wrong. Try again.</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            `;
            btn.style.opacity = '1';
            btn.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';

            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.style.background = '';
            }, 3000);
        }
    });
}

/* ============================================
   Spin animation via CSS injection
   ============================================ */

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(styleSheet);
