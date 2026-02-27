// ============================================================
// ABOUT PAGE — JAVASCRIPT
// Handles: scroll-reveal animations, hero particles, and
// the image fallback for missing screenshots.
// Depends on: js/main.js (nav toggle, launch event countdown)
// ============================================================


// Wait until the entire HTML document has been parsed before running any code.
// This ensures all elements exist in the DOM before we try to select them.
document.addEventListener('DOMContentLoaded', function () {

    // Call each initialisation function in order.
    initScrollReveal();       // Animate rows and cards as the user scrolls
    initHeroParticles();      // Draw floating particles in the hero background
    initImageFallbacks();     // Replace broken screenshot images with a placeholder
    initHighlightHover();     // Add a subtle parallax tilt to screenshot frames on hover

});


// ── SCROLL REVEAL ─────────────────────────────────────────────────────────────
// Uses the IntersectionObserver API to detect when elements enter the viewport,
// then adds the class "is-visible" which triggers the CSS fade-in/slide-up transition.

function initScrollReveal() {

    // Select every element that should animate in on scroll.
    // .highlight-row — the alternating image+text rows
    // .fgrid-card    — the feature grid cards
    const targets = document.querySelectorAll('.highlight-row, .fgrid-card');

    // If the browser doesn't support IntersectionObserver (very old browsers),
    // just make everything visible immediately so the page still works.
    if (!('IntersectionObserver' in window)) {
        targets.forEach(function (el) {
            el.style.opacity = '1';       // Make visible
            el.style.transform = 'none';  // Remove the starting offset
        });
        return; // Exit the function early — nothing more to do
    }

    // Create the observer.
    // The callback fires whenever a watched element enters or leaves the viewport.
    const observer = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

            // entry.isIntersecting is true when the element is visible in the viewport
            if (entry.isIntersecting) {

                // For .fgrid-card elements, stagger the animation so cards
                // don't all appear at exactly the same time.
                if (entry.target.classList.contains('fgrid-card')) {

                    // Find the index of this card among all fgrid-cards
                    const allCards = Array.from(document.querySelectorAll('.fgrid-card'));
                    const index = allCards.indexOf(entry.target); // 0-based index

                    // Delay each card by 80ms × its index (0ms, 80ms, 160ms, …)
                    setTimeout(function () {
                        entry.target.classList.add('is-visible'); // Trigger CSS transition
                    }, index * 80);

                } else {
                    // For highlight rows, no stagger — just reveal immediately
                    entry.target.classList.add('is-visible');
                }

                // Stop watching this element once it has been revealed.
                // This prevents the animation from re-triggering if the user scrolls back up.
                observer.unobserve(entry.target);
            }
        });

    }, {
        threshold: 0.12,              // Trigger when 12% of the element is visible
        rootMargin: '0px 0px -40px 0px' // Shrink the bottom of the viewport by 40px
                                        // so elements animate in slightly before they
                                        // reach the very bottom edge of the screen
    });

    // Tell the observer to watch each target element
    targets.forEach(function (el) {
        observer.observe(el);
    });
}


// ── HERO PARTICLES ────────────────────────────────────────────────────────────
// Draws small floating dots on a <canvas> element inside .about-hero-particles.
// The dots drift slowly upward and wrap around when they leave the top of the canvas.

function initHeroParticles() {

    // Find the container div that was placed in the HTML
    const container = document.getElementById('heroParticles');
    if (!container) return; // If the element doesn't exist, do nothing

    // Create a <canvas> element and insert it into the container
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute'; // Fill the container
    canvas.style.inset = '0';           // Cover all four sides
    canvas.style.width = '100%';        // Match container width
    canvas.style.height = '100%';       // Match container height
    container.appendChild(canvas);      // Add the canvas to the DOM

    // Get the 2D drawing context — this is what we use to draw on the canvas
    const ctx = canvas.getContext('2d');

    // ── Resize handler ──
    // The canvas pixel dimensions must match its CSS display size.
    // We also multiply by devicePixelRatio so particles look sharp on retina screens.
    function resize() {
        const rect = container.getBoundingClientRect(); // Get the container's size in CSS pixels
        canvas.width  = rect.width  * window.devicePixelRatio; // Set canvas pixel width
        canvas.height = rect.height * window.devicePixelRatio; // Set canvas pixel height
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // Scale drawing context to match
    }

    resize(); // Run once immediately
    window.addEventListener('resize', resize); // Re-run whenever the window is resized

    // ── Particle setup ──
    const PARTICLE_COUNT = 55; // How many particles to draw
    const particles = [];      // Array to hold all particle objects

    // Create each particle with random starting properties
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x:       Math.random() * container.offsetWidth,  // Random horizontal position
            y:       Math.random() * container.offsetHeight, // Random vertical position
            radius:  Math.random() * 2 + 0.5,               // Random size between 0.5 and 2.5px
            speedY:  -(Math.random() * 0.4 + 0.1),          // Upward drift speed (negative = up)
            speedX:  (Math.random() - 0.5) * 0.2,           // Slight horizontal drift
            opacity: Math.random() * 0.4 + 0.1              // Random opacity between 0.1 and 0.5
        });
    }

    // ── Animation loop ──
    // requestAnimationFrame calls this function ~60 times per second
    function animate() {

        // Clear the entire canvas before redrawing
        ctx.clearRect(0, 0, container.offsetWidth, container.offsetHeight);

        // Update and draw each particle
        particles.forEach(function (p) {

            // Move the particle by its speed values
            p.x += p.speedX; // Horizontal drift
            p.y += p.speedY; // Vertical drift (upward)

            // Wrap horizontally: if the particle goes off the right edge, bring it back from the left
            if (p.x < 0) p.x = container.offsetWidth;
            if (p.x > container.offsetWidth) p.x = 0;

            // Wrap vertically: if the particle drifts above the top, reset it to the bottom
            if (p.y < 0) {
                p.y = container.offsetHeight; // Reset to bottom
                p.x = Math.random() * container.offsetWidth; // Random horizontal position
            }

            // Draw the particle as a small filled circle
            ctx.beginPath();                                    // Start a new drawing path
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);      // Draw a full circle
            ctx.fillStyle = `rgba(192, 192, 192, ${p.opacity})`; // Silver color with variable opacity
            ctx.fill();                                         // Fill the circle
        });

        // Schedule the next frame
        requestAnimationFrame(animate);
    }

    // Start the animation loop
    animate();
}


// ── IMAGE FALLBACKS ───────────────────────────────────────────────────────────
// If a screenshot image fails to load (e.g. the file doesn't exist yet),
// replace it with a styled placeholder so the layout doesn't break.

function initImageFallbacks() {

    // Select all screenshot images in the highlight rows
    const imgs = document.querySelectorAll('.highlight-img');

    imgs.forEach(function (img) {

        // The 'error' event fires when the browser can't load the image
        img.addEventListener('error', function () {

            // Replace the broken src with a placeholder from placehold.co
            // The placeholder is 800×500 pixels, dark gray background, silver text
            this.src = 'https://placehold.co/800x500/2a2a2a/c0c0c0?text=Screenshot+Coming+Soon';

            // Add a CSS class so we can style placeholder images differently if needed
            this.classList.add('img-placeholder');

            // Remove the zoom-on-hover effect since there's nothing interesting to zoom into
            this.style.transition = 'none';
        });
    });
}


// ── HIGHLIGHT HOVER PARALLAX ──────────────────────────────────────────────────
// When the user hovers over a highlight row, the screenshot frame tilts very
// slightly in 3D toward the cursor. This is a subtle "depth" effect.

function initHighlightHover() {

    // Select all image frames
    const frames = document.querySelectorAll('.highlight-img-frame');

    frames.forEach(function (frame) {

        // Track mouse movement over the frame
        frame.addEventListener('mousemove', function (e) {

            // Get the frame's position and size on screen
            const rect = frame.getBoundingClientRect();

            // Calculate the cursor's position relative to the center of the frame
            // Result is a value between -0.5 and +0.5
            const relX = (e.clientX - rect.left) / rect.width  - 0.5;
            const relY = (e.clientY - rect.top)  / rect.height - 0.5;

            // Convert to rotation angles (max ±4 degrees)
            const rotateY =  relX * 8;  // Tilt left/right
            const rotateX = -relY * 8;  // Tilt up/down (inverted so it feels natural)

            // Apply the 3D rotation transform
            frame.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        // Reset the transform when the cursor leaves the frame
        frame.addEventListener('mouseleave', function () {
            frame.style.transform = ''; // Remove the inline transform, reverting to CSS default
        });
    });
}

