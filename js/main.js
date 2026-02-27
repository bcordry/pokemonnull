// MAIN JAVASCRIPT FILE FOR TERRA EMERALD WEBSITE
// This file contains global functionality used across all pages

// Wait for DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all main functionality
    initMobileNavigation();
    initSmoothScrolling();
    initScrollEffects();
    initAccessibility();
});

// MOBILE NAVIGATION FUNCTIONALITY
function initMobileNavigation() {
    // Get navigation toggle button and menu elements
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Check if elements exist before adding event listeners
    if (navToggle && navMenu) {
        // Add click event listener to toggle button
        navToggle.addEventListener('click', function() {
            // Toggle the 'active' class on the navigation menu
            navMenu.classList.toggle('active');
            
            // Toggle aria-expanded attribute for accessibility
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            
            // Animate hamburger menu lines
            animateHamburgerMenu(navToggle, isExpanded);
        });
        
        // Close mobile menu when clicking on navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Close mobile menu when link is clicked
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                animateHamburgerMenu(navToggle, false);
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            // Check if click is outside navigation area
            const isClickInsideNav = navToggle.contains(event.target) || navMenu.contains(event.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                // Close mobile menu
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                animateHamburgerMenu(navToggle, false);
            }
        });
    }
}

// Animate hamburger menu lines when toggling
function animateHamburgerMenu(toggleButton, isOpen) {
    // Get all hamburger lines
    const lines = toggleButton.querySelectorAll('span');
    
    if (lines.length >= 3) {
        if (isOpen) {
            // Transform hamburger into X
            lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
            lines[1].style.opacity = '0'; // Hide middle line
            lines[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            // Transform X back to hamburger
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1'; // Show middle line
            lines[2].style.transform = 'none';
        }
    }
}

// SMOOTH SCROLLING FOR ANCHOR LINKS
function initSmoothScrolling() {
    // Get all anchor links that start with #
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Get the target element ID
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            // If target element exists, smooth scroll to it
            if (targetElement) {
                event.preventDefault(); // Prevent default jump behavior
                
                // Calculate offset for sticky header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // Smooth scroll to target position
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// SCROLL EFFECTS AND ANIMATIONS
function initScrollEffects() {
    // Throttle scroll events for better performance
    let ticking = false;
    
    function updateScrollEffects() {
        const scrollY = window.scrollY;
        const header = document.querySelector('.header');
        
        // Add/remove scrolled class to header for styling changes
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Reset ticking flag
        ticking = false;
    }
    
    // Add scroll event listener with throttling
    window.addEventListener('scroll', function() {
        if (!ticking) {
            // Use requestAnimationFrame for smooth performance
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });
    
    // Initialize intersection observer for fade-in animations
    initIntersectionObserver();
}

// INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
function initIntersectionObserver() {
    // Check if browser supports Intersection Observer
    if ('IntersectionObserver' in window) {
        // Create intersection observer
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add fade-in class when element comes into view
                    entry.target.classList.add('fade-in');
                    
                    // Stop observing this element
                    observer.unobserve(entry.target);
                }
            });
        }, {
            // Trigger when 10% of element is visible
            threshold: 0.1,
            // Start animation 50px before element enters viewport
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements that should fade in
        const fadeElements = document.querySelectorAll('.feature-card, .news-card, .section-title');
        fadeElements.forEach(element => {
            // Add initial fade-out class
            element.classList.add('fade-out');
            observer.observe(element);
        });
    }
}

// ACCESSIBILITY ENHANCEMENTS
function initAccessibility() {
    // Add keyboard navigation support
    initKeyboardNavigation();
    
    // Add focus management
    initFocusManagement();
    
    // Add screen reader announcements
    initScreenReaderSupport();
}

// KEYBOARD NAVIGATION SUPPORT
function initKeyboardNavigation() {
    // Handle escape key to close mobile menu
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const navToggle = document.querySelector('.nav-toggle');
            
            if (navMenu && navMenu.classList.contains('active')) {
                // Close mobile menu
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                animateHamburgerMenu(navToggle, false);
                
                // Return focus to toggle button
                navToggle.focus();
            }
        }
    });
    
    // Handle enter and space keys on toggle button
    const navToggle = document.querySelector('.nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.click(); // Trigger click event
            }
        });
    }
}

// FOCUS MANAGEMENT
function initFocusManagement() {
    // Trap focus within mobile menu when open
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (navMenu && navToggle) {
        // Get all focusable elements in navigation
        const focusableElements = navMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
        
        if (focusableElements.length > 0) {
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            // Handle tab key navigation within mobile menu
            navMenu.addEventListener('keydown', function(event) {
                if (event.key === 'Tab' && navMenu.classList.contains('active')) {
                    if (event.shiftKey) {
                        // Shift + Tab (backward)
                        if (document.activeElement === firstFocusable) {
                            event.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        // Tab (forward)
                        if (document.activeElement === lastFocusable) {
                            event.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            });
        }
    }
}

// SCREEN READER SUPPORT
function initScreenReaderSupport() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Screen reader only class
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
    
    // Function to announce messages to screen readers
    window.announceToScreenReader = function(message) {
        liveRegion.textContent = message;
        
        // Clear message after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    };
}

// UTILITY FUNCTIONS
// Debounce function to limit function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function to limit function calls
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add CSS classes for fade animations
const fadeCSS = `
.fade-out {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in {
    opacity: 1;
    transform: translateY(0);
}

.header.scrolled {
    background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(64, 64, 64, 0.95) 100%);
    backdrop-filter: blur(10px);
}
`;

// Inject fade CSS into document
const styleSheet = document.createElement('style');
styleSheet.textContent = fadeCSS;
document.head.appendChild(styleSheet);

