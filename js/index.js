// INDEX PAGE SPECIFIC JAVASCRIPT
// This file contains functionality specific to the index/home page

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize index page specific functionality
    initHeroAnimations();
    initFeatureCardAnimations();
    initNewsCardAnimations();
    initTypingEffect();
});

// HERO SECTION ANIMATIONS
function initHeroAnimations() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroButtons = document.querySelector('.hero-buttons');
    
    // Add initial animation classes
    if (heroTitle) {
        heroTitle.style.opacity = '0';
        heroTitle.style.transform = 'translateY(50px)';
        
        // Animate title in
        setTimeout(() => {
            heroTitle.style.transition = 'opacity 1s ease, transform 1s ease';
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }, 300);
    }
    
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '0';
        heroSubtitle.style.transform = 'translateY(30px)';
        
        // Animate subtitle in
        setTimeout(() => {
            heroSubtitle.style.transition = 'opacity 1s ease, transform 1s ease';
            heroSubtitle.style.opacity = '1';
            heroSubtitle.style.transform = 'translateY(0)';
        }, 600);
    }
    
    if (heroButtons) {
        heroButtons.style.opacity = '0';
        heroButtons.style.transform = 'translateY(20px)';
        
        // Animate buttons in
        setTimeout(() => {
            heroButtons.style.transition = 'opacity 1s ease, transform 1s ease';
            heroButtons.style.opacity = '1';
            heroButtons.style.transform = 'translateY(0)';
        }, 900);
    }
    
    // Add parallax effect to hero background
    initHeroParallax();
}

// HERO PARALLAX EFFECT
function initHeroParallax() {
    const heroBg = document.querySelector('.hero-bg');
    
    if (heroBg) {
        // Throttled scroll handler for performance
        const handleScroll = throttle(() => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5; // Parallax speed
            
            // Apply parallax transform
            heroBg.style.transform = `translateY(${rate}px)`;
        }, 16); // ~60fps
        
        window.addEventListener('scroll', handleScroll);
    }
}

// FEATURE CARDS ANIMATIONS
function initFeatureCardAnimations() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    // Add hover sound effect (optional)
    featureCards.forEach((card, index) => {
        // Stagger initial animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        
        // Animate cards in with stagger
        setTimeout(() => {
            card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 1200 + (index * 200));
        
        // Add enhanced hover effects
        card.addEventListener('mouseenter', function() {
            // Scale up icon on hover
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
            
            // Announce to screen reader
            if (window.announceToScreenReader) {
                const title = this.querySelector('h4').textContent;
                window.announceToScreenReader(`Viewing ${title} feature`);
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset icon transform
            const icon = this.querySelector('.feature-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
        
        // Add click animation
        card.addEventListener('click', function() {
            // Pulse effect on click
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// NEWS CARDS ANIMATIONS
function initNewsCardAnimations() {
    const newsCards = document.querySelectorAll('.news-card');
    
    newsCards.forEach((card, index) => {
        // Add enhanced hover effects
        card.addEventListener('mouseenter', function() {
            // Animate news date
            const newsDate = this.querySelector('.news-date');
            if (newsDate) {
                newsDate.style.transform = 'translateX(5px)';
                newsDate.style.transition = 'transform 0.3s ease';
            }
            
            // Animate news link
            const newsLink = this.querySelector('.news-link');
            if (newsLink) {
                newsLink.style.transform = 'translateX(5px)';
                newsLink.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset transforms
            const newsDate = this.querySelector('.news-date');
            const newsLink = this.querySelector('.news-link');
            
            if (newsDate) {
                newsDate.style.transform = 'translateX(0)';
            }
            if (newsLink) {
                newsLink.style.transform = 'translateX(0)';
            }
        });
        
        // Add click tracking (for analytics)
        const newsLink = card.querySelector('.news-link');
        if (newsLink) {
            newsLink.addEventListener('click', function(event) {
                // Track news article clicks
                console.log('News article clicked:', this.closest('.news-card').querySelector('h4').textContent);
                
                // Add visual feedback
                this.style.color = '#c82333';
                setTimeout(() => {
                    this.style.color = '';
                }, 200);
            });
        }
    });
}

// TYPING EFFECT FOR TAGLINE
function initTypingEffect() {
    const tagline = document.querySelector('.tagline');
    
    if (tagline) {
        const originalText = tagline.textContent;
        const typingSpeed = 100; // milliseconds per character
        const pauseTime = 4000; // pause before restarting
        
        function typeText() {
            tagline.textContent = '';
            let i = 0;
            
            function typeChar() {
                if (i < originalText.length) {
                    tagline.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeChar, typingSpeed);
                } else {
                    // Pause and restart
                    setTimeout(() => {
                        // Add blinking cursor effect
                        tagline.style.borderRight = '2px solid var(--accent-red)';
                        tagline.style.animation = 'blink 1s infinite';
                        
                        setTimeout(() => {
                            tagline.style.borderRight = 'none';
                            tagline.style.animation = 'none';
                            typeText(); // Restart typing
                        }, pauseTime);
                    }, 300);
                }
            }
            
            typeChar();
        }
        
        // Start typing effect after initial page load
        setTimeout(typeText, 1000);
    }
}

// SCROLL-TRIGGERED COUNTER ANIMATIONS
function initCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-counter'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        counter.textContent = Math.floor(current).toLocaleString();
                    }, 16);
                    
                    observer.unobserve(counter);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// DYNAMIC BACKGROUND EFFECTS
function initDynamicBackground() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        // Create floating particles
        createFloatingParticles(hero);
        
        // Add mouse movement parallax
        hero.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const heroBg = this.querySelector('.hero-bg');
            if (heroBg) {
                const moveX = (x - 0.5) * 20;
                const moveY = (y - 0.5) * 20;
                heroBg.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
        
        hero.addEventListener('mouseleave', function() {
            const heroBg = this.querySelector('.hero-bg');
            if (heroBg) {
                heroBg.style.transform = 'translate(0, 0)';
            }
        });
    }
}

// CREATE FLOATING PARTICLES
function createFloatingParticles(container) {
    const particleCount = 200;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background-color: var(--accent-red);
            border-radius: 50%;
            opacity: 0.3;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 10}s infinite linear;
        `;
        
        container.appendChild(particle);
    }
    
    // Add CSS animation for particles
    if (!document.querySelector('#particle-styles')) {
        const particleCSS = document.createElement('style');
        particleCSS.id = 'particle-styles';
        particleCSS.textContent = `
            @keyframes float {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% {
                    opacity: 0.3;
                }
                90% {
                    opacity: 0.3;
                }
                100% {
                    transform: translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
        document.head.appendChild(particleCSS);
    }
}

// PERFORMANCE MONITORING
function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Track Core Web Vitals if available
        if ('web-vitals' in window) {
            // This would require the web-vitals library
            // getCLS(console.log);
            // getFID(console.log);
            // getLCP(console.log);
        }
    });
    
    // Monitor scroll performance
    let scrollCount = 0;
    const scrollHandler = throttle(() => {
        scrollCount++;
        if (scrollCount % 100 === 0) {
            console.log(`Scroll events processed: ${scrollCount}`);
        }
    }, 16);
    
    window.addEventListener('scroll', scrollHandler);
}

// Initialize additional effects
setTimeout(() => {
    initDynamicBackground();
    initPerformanceMonitoring();
}, 1000);


// ---------------------------------------------------------------------------
//  ENHANCED BACKGROUND TRAINER + POKÉMON SLIDESHOW
// ---------------------------------------------------------------------------

/**
 * Array of the ten trainer image file names.
 */
const TRAINER_IMAGES = [
    'assets/images/trainers/trainer1.png',
    'assets/images/trainers/trainer2.png',
    'assets/images/trainers/trainer3.png',
    'assets/images/trainers/trainer4.png',
    'assets/images/trainers/trainer5.png',
    'assets/images/trainers/trainer6.png',
    'assets/images/trainers/trainer7.png',
    'assets/images/trainers/trainer8.png',
    'assets/images/trainers/trainer9.png',
    'assets/images/trainers/trainer10.png'
];

/**
 * Shuffles an array using Fisher-Yates algorithm
 * Returns a new shuffled array without modifying the original
 */
function shuffleArray(array) {
    const shuffled = [...array]; // create a copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // swap elements
    }
    return shuffled;
}

/**
 * Creates a shuffled list of pokemon numbers (1-6) for a trainer
 * This ensures no repeats until all 6 have been shown
 */
function createPokemonQueue(trainerNumber) {
    const pokemonNumbers = [1, 2, 3, 4, 5, 6]; // all 6 pokemon for this trainer
    const shuffled = shuffleArray(pokemonNumbers); // randomize the order
    return shuffled.map(num => `assets/images/pokemon/pokemon${trainerNumber}-${num}.png`);
}

/**
 * Enhanced slideshow initialization with no-repeat pokemon system
 */
function initBackgroundSlideshow() {
    // ---------------- DOM LOOK-UPS --------------------------------------
    const trainerImgEl = document.querySelector('.trainer-image');
    const pokemonImgEl = document.querySelector('.pokemon-image');

    // Guard – abort if the markup is missing
    if (!trainerImgEl || !pokemonImgEl) return;

    // Make both images invisible until the first tick sets .visible
    trainerImgEl.classList.remove('visible');
    pokemonImgEl.classList.remove('visible');

    // Track current trainer and pokemon queue
    let currentTrainerIdx = 0;                  // zero-based index
    let pokemonQueue = [];                      // shuffled pokemon for current trainer
    let pokemonQueueIndex = 0;                  // position in current queue
    let trainerTimer, pokemonTimer;             // timer handles

    // ---------------- FUNCTIONS -----------------------------------------
    /**
     * Enhanced cross-fade with faster timing
     */
    function crossFade(el, newSrc) {
        el.classList.remove('visible');         // start fade-out (opacity → 0)
        setTimeout(() => {
            el.src = newSrc;                    // once invisible, replace image
            el.classList.add('visible');        // fade back in (opacity → 1)
        }, 200);                               // faster fade - matches CSS transition
    }

    /**
     * Gets the next pokemon from the current queue
     * If queue is empty or exhausted, creates a new shuffled queue
     */

//UN-COMMENT THIS FUNCTION TO ENABLE THE NO-REPEAT POKEMON SYSTEM
    // function getNextPokemon() {
    //     // If we need a new queue (first run or exhausted current queue)
    //     if (pokemonQueue.length === 0 || pokemonQueueIndex >= pokemonQueue.length) {
    //         const trainerNumber = currentTrainerIdx + 1; // convert to 1-based
    //         pokemonQueue = createPokemonQueue(trainerNumber); // get shuffled pokemon
    //         pokemonQueueIndex = 0; // reset queue position
    //         console.log(`New pokemon queue for trainer ${trainerNumber}:`, pokemonQueue);
    //     }

    //     // Get the next pokemon from the queue
    //     const nextPokemon = pokemonQueue[pokemonQueueIndex];
    //     pokemonQueueIndex++; // advance queue position
    //     return nextPokemon;
    // }

    /**
     * Picks the next trainer (cyclic) and triggers its cross-fade
     * Also resets the pokemon queue for the new trainer
     */
    function showNextTrainer() {
        currentTrainerIdx = (currentTrainerIdx + 1) % TRAINER_IMAGES.length;
        const newTrainerSrc = TRAINER_IMAGES[currentTrainerIdx];
        crossFade(trainerImgEl, newTrainerSrc);

        // Reset pokemon queue for the new trainer
        pokemonQueue = []; // this will force getNextPokemon to create a new queue
        
        // Immediately show a pokemon from the new trainer's team
        showNextPokemon(true); // true = immediate
        
        console.log(`Switched to trainer ${currentTrainerIdx + 1}`);
    }

    /**
     * Shows the next pokemon from the no-repeat queue
     * If immediate is true, skips the usual random delay
     */
    function showNextPokemon(immediate = false) {
        const nextPokemonSrc = getNextPokemon(); // get next from queue
        crossFade(pokemonImgEl, nextPokemonSrc);

        // Schedule the next pokemon change with random 2-3s delay
        clearTimeout(pokemonTimer);
        const nextDelay = immediate ? 0 : (2000 + Math.random() * 1000);
        pokemonTimer = setTimeout(showNextPokemon, nextDelay);
    }

    // ---------------- START BOTH LOOPS ----------------------------------
    // Initialize with first trainer and pokemon
    crossFade(trainerImgEl, TRAINER_IMAGES[currentTrainerIdx]);   // first trainer
    showNextPokemon(true);                                        // first pokemon

    // Trainer changes every 10 seconds 
    trainerTimer = setInterval(showNextTrainer, 10000);
    
    console.log('Background slideshow initialized with no-repeat pokemon system');
}

// ---------------------------------------------------------------------------
//  Register the slideshow once the DOM has finished loading
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initBackgroundSlideshow();
});


document.addEventListener('DOMContentLoaded', () => {
  // Get the news preview container
  const newsPreview = document.getElementById('news-preview');
  if (newsPreview && typeof getLatestNewsArticles === 'function') {
    // Get the latest 2 articles
    const latest = getLatestNewsArticles(2);
    newsPreview.innerHTML = ''; // Clear any existing content

    latest.forEach(article => {
      // Create a preview box
      const preview = document.createElement('div');
      preview.className = 'news-preview-article';

      // Title (as a link to the full article on news.html)
      const link = document.createElement('a');
      link.href = `news.html#${article.id}`;
      link.textContent = article.title;
      link.className = 'news-preview-title';
      preview.appendChild(link);

      // Date
      const date = document.createElement('div');
      date.className = 'news-preview-date';
      date.textContent = article.date;
      preview.appendChild(date);

      // Summary
      const summary = document.createElement('div');
      summary.className = 'news-preview-summary';
      summary.textContent = article.summary;
      preview.appendChild(summary);

      newsPreview.appendChild(preview);
    });
  }
});


// =============================================
// LAUNCH RACE COUNTDOWN TIMER
// =============================================

/**
 * initLaunchEventCountdown()
 * Finds the tooltip span inside the Launch Race nav link and populates it
 * with a live ticking countdown to March 2, 2026 at 2:00 PM EST.
 * Updates every second. Shows a celebration message once the event is live.
 */
function initLaunchEventCountdown() {

    // Target the tooltip span we added inside the Launch Race nav link
    const tooltip = document.getElementById('launch-event-tooltip');

    // If the element doesn't exist on this page, do nothing
    if (!tooltip) return;

    // Define the event date: March 2, 2026 at 14:00 EST
    // EST = UTC-5, so 14:00 EST = 19:00 UTC
    const EVENT_DATE = new Date('2026-03-02T19:00:00Z');

    /**
     * formatCountdown(ms)
     * Takes a number of milliseconds and returns a human-readable string
     * like "5d 3h 22m 14s"
     */
    function formatCountdown(ms) {
        // Convert milliseconds into total seconds
        const totalSeconds = Math.floor(ms / 1000);

        // Break total seconds down into days, hours, minutes, seconds
        const days    = Math.floor(totalSeconds / 86400);        // 86400 seconds in a day
        const hours   = Math.floor((totalSeconds % 86400) / 3600); // remaining hours
        const minutes = Math.floor((totalSeconds % 3600) / 60);    // remaining minutes
        const seconds = totalSeconds % 60;                          // remaining seconds

        // Return a formatted string, e.g. "5d 3h 22m 14s"
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    /**
     * tick()
     * Called once per second. Calculates remaining time and updates the tooltip.
     */
    function tick() {
        // Get the current time
        const now = new Date();

        // Calculate how many milliseconds remain until the event
        const remaining = EVENT_DATE - now;

        if (remaining <= 0) {
            // The event has started — show a celebration message instead of a countdown
            tooltip.textContent = '🎉 Event is LIVE!';
        } else {
            // Event hasn't started yet — show the formatted countdown
            tooltip.textContent = '⏳ ' + formatCountdown(remaining);
        }
    }

    // Run tick() immediately so the tooltip shows a value right away (no blank flash)
    tick();

    // Then run tick() every 1000ms (1 second) to keep it live
    setInterval(tick, 1000);
}

// Call the countdown initializer once the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initLaunchEventCountdown();
});