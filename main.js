document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom-cursor');

    // ==========================================================================
    // 1. HARDWARE CURSOR COORDINATE TRACKING & CANVAS INTERACTIONS
    // ==========================================================================
    const canvas = document.getElementById('engine-bg-canvas');
    let mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('mousemove', (e) => {
        if (!cursor) return;
        
        window.requestAnimationFrame(() => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;

            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // ==========================================================================
    // 2. RUNTIME VECTOR ENGINE BACKGROUND SYSTEM
    // ==========================================================================
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class VectorNode {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                if (mouse.x != null && mouse.y != null) {
                    let dx = this.x - mouse.x;
                    let dy = this.y - mouse.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        this.x -= dx * 0.01;
                        this.y -= dy * 0.01;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 0, 60, 0.3)';
                ctx.fill();
            }
        }

        const initEngine = () => {
            particles = [];
            const count = Math.min(100, Math.floor((canvas.width * canvas.height) / 12000));
            for (let i = 0; i < count; i++) {
                particles.push(new VectorNode());
            }
        };
        initEngine();
        window.addEventListener('resize', initEngine);

        const renderLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        let alpha = (1 - dist / 120) * 0.06;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(255, 0, 60, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                if (mouse.x != null && mouse.y != null) {
                    let dx = particles[i].x - mouse.x;
                    let dy = particles[i].y - mouse.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        let alpha = (1 - dist / mouse.radius) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(255, 0, 60, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(renderLoop);
        };
        renderLoop();
    }

    // ==========================================================================
    // 3. INTERACTIVE TARGET HOVER EFFECT
    // ==========================================================================
    const refreshTargetLinks = () => {
        const interactiveElements = document.querySelectorAll(
            'a, button, input, textarea, select, .viewport-window, .blueprint-node-card, .portfolio-row, .apply-portal-btn, .premium-submit-btn, .footer-link, .portal-close-btn'
        );

        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => cursor?.classList.add('active'));
            element.addEventListener('mouseleave', () => cursor?.classList.remove('active'));
        });
    };
    refreshTargetLinks();

    // ==========================================================================
    // 4. PROJECT ACCORDION & DIRECT BUTTON ACTIONS
    // ==========================================================================
    const portfolioRows = document.querySelectorAll('.portfolio-row');
    
    portfolioRows.forEach(row => {
        const targetVideo = row.querySelector('.spec-media-frame video');
        const volBtn = row.querySelector('.video-audio-toggle-btn');
        
        if (targetVideo) targetVideo.muted = true;

        row.addEventListener('click', (e) => {
            // Prevent accordion collapse if clicking links, external buttons, or audio toggles
            if (e.target.closest('a') || e.target.closest('.video-audio-toggle-btn')) {
                return;
            }

            const isExpanded = row.classList.contains('expanded');
            
            // Close other rows and mute videos
            portfolioRows.forEach(r => {
                r.classList.remove('expanded');
                const v = r.querySelector('.spec-media-frame video');
                const b = r.querySelector('.video-audio-toggle-btn');
                if (v) {
                    v.muted = true;
                    v.pause();
                }
                if (b) b.textContent = '🔇';
            });

            // Expand clicked row and play video
            if (!isExpanded) {
                row.classList.add('expanded');
                if (targetVideo) {
                    targetVideo.muted = true; // Kept muted initially to prevent browser block
                    if (volBtn) volBtn.textContent = '🔇';
                    targetVideo.play().catch(err => {
                        console.log("Autoplay prevented:", err);
                    });
                }
            }
        });

        // Dedicated volume toggle
        if (volBtn && targetVideo) {
            volBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (targetVideo.muted) {
                    targetVideo.muted = false;
                    volBtn.textContent = '🔊';
                } else {
                    targetVideo.muted = true;
                    volBtn.textContent = '🔇';
                }
            });
        }
    });

    // ==========================================================================
    // 5. HERO TERMINAL STREAM GENERATOR
    // ==========================================================================
    const matrixContainer = document.querySelector('.viewport-matrix-code');
    if (matrixContainer) {
        const buildMatrixFrame = () => {
            let dataStream = '';
            const dataChars = '01X_SYSTEM_ACTIVE_PIPELINE_STABLE_DEPLOY_RUN_';
            for (let i = 0; i < 240; i++) {
                dataStream += dataChars.charAt(Math.floor(Math.random() * dataChars.length));
            }
            matrixContainer.textContent = dataStream;
        };
        setInterval(buildMatrixFrame, 120);
    }

    // ==========================================================================
    // 6. FPS COUNTER MODULE
    // ==========================================================================
    const fpsCounter = document.getElementById('live-fps');
    if (fpsCounter) {
        setInterval(() => {
            const variance = (60.00 - (Math.random() * 1.35)).toFixed(2);
            fpsCounter.textContent = variance;
        }, 400);
    }

    // ==========================================================================
    // 7. GLITCH TEXT REVEAL MECHANIC
    // ==========================================================================
    const glitchHeaders = document.querySelectorAll('[data-glitch]');
    glitchHeaders.forEach(header => {
        const originalText = header.getAttribute('data-glitch');
        const glitchSymbols = '!@#$%^&*()_+<>?/[]{}';
        
        header.addEventListener('mouseenter', () => {
            let iterations = 0;
            const interval = setInterval(() => {
                header.textContent = originalText.split('').map((char, index) => {
                    if (index < iterations) return originalText[index];
                    return glitchSymbols[Math.floor(Math.random() * glitchSymbols.length)];
                }).join('');
                
                if (iterations >= originalText.length) clearInterval(interval);
                iterations += 1 / 2;
            }, 30);
        });
    });

    // ==========================================================================
    // 8. GLOBAL MODAL CONTROLLER (PRIVACY, TERMS & FOOTER INTERNSHIP)
    // ==========================================================================
    window.toggleModalPortal = function(modalId, isOpen) {
        const targetModal = document.getElementById(modalId);
        if (!targetModal) return;

        if (isOpen) {
            targetModal.classList.add('portal-active');
            document.body.style.overflow = 'hidden';
        } else {
            targetModal.classList.remove('portal-active');
            document.body.style.overflow = '';
        }
    };

    // Backdrop click-to-close handlers
    const modals = document.querySelectorAll('.policy-modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('portal-active');
                document.body.style.overflow = '';
            }
        });
    });

    // Backward compatibility helpers
    window.togglePrivacyPortal = (open) => toggleModalPortal('privacy-portal', open);
    window.toggleTermsPortal = (open) => toggleModalPortal('terms-portal', open);
    window.toggleInternshipPortal = (open) => toggleModalPortal('internship-portal', open);
});