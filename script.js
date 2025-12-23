/**
 * DevHubX Cloud Blog - Main JavaScript File
 * Handles theme switching, navigation, forms, and interactive features
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    // API endpoints (update these in production)
    api: {
        newsletter: 'https://api.devhubx.org/newsletter',
        contact: 'https://api.devhubx.org/contact',
        analytics: 'https://api.devhubx.org/analytics'
    },
    
    // Local storage keys
    storage: {
        theme: 'devhubx_theme',
        newsletterSubscribed: 'devhubx_newsletter_subscribed',
        visitedBefore: 'devhubx_visited'
    },
    
    // Animation durations (ms)
    animations: {
        fast: 150,
        normal: 300,
        slow: 500
    },
    
    // Toast messages configuration
    toast: {
        duration: 5000,
        position: 'bottom-center'
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit how often a function is called
 */
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

/**
 * Throttle function to limit how often a function is called
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Get CSS variable value
 */
function getCSSVariable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Set CSS variable value
 */
function setCSSVariable(name, value) {
    document.documentElement.style.setProperty(name, value);
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Calculate reading time
 */
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

// ============================================
// THEME MANAGEMENT
// ============================================

/**
 * Initialize theme system
 */
function initTheme() {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem(CONFIG.storage.theme);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    
    // Create theme toggle button if it doesn't exist
    createThemeToggle();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(CONFIG.storage.theme)) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Set theme
 */
function setTheme(theme) {
    // Validate theme
    if (!['light', 'dark'].includes(theme)) {
        console.error('Invalid theme:', theme);
        return;
    }
    
    // Set data attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save preference
    localStorage.setItem(CONFIG.storage.theme, theme);
    
    // Update theme toggle button state
    updateThemeToggle(theme);
    
    // Announce theme change for screen readers
    announceToScreenReader(`Theme changed to ${theme} mode`);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

/**
 * Create theme toggle button
 */
function createThemeToggle() {
    // Check if toggle already exists
    if (document.querySelector('.theme-toggle')) {
        return;
    }
    
    // Create toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle btn btn-ghost btn-icon';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.setAttribute('aria-pressed', 'false');
    themeToggle.innerHTML = `
        <svg class="sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg class="moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
    `;
    
    // Add event listener
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
    
    // Add to navigation
    const navActions = document.querySelector('.nav-actions') || createNavActions();
    navActions.prepend(themeToggle);
    
    // Update initial state
    const currentTheme = document.documentElement.getAttribute('data-theme');
    updateThemeToggle(currentTheme);
}

/**
 * Update theme toggle button state
 */
function updateThemeToggle(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    
    toggle.setAttribute('aria-pressed', theme === 'dark');
    
    // Update icons visibility
    const sunIcon = toggle.querySelector('.sun');
    const moonIcon = toggle.querySelector('.moon');
    
    if (theme === 'dark') {
        sunIcon.style.opacity = '0.5';
        moonIcon.style.opacity = '1';
    } else {
        sunIcon.style.opacity = '1';
        moonIcon.style.opacity = '0.5';
    }
}

/**
 * Create nav actions container if it doesn't exist
 */
function createNavActions() {
    const navContainer = document.querySelector('.nav-container');
    const navActionsDiv = document.createElement('div');
    navActionsDiv.className = 'nav-actions';
    navContainer.appendChild(navActionsDiv);
    return navActionsDiv;
}

// ============================================
// NAVIGATION
// ============================================

/**
 * Initialize navigation
 */
function initNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!menuToggle || !navMenu) return;
    
    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        toggleMobileMenu(!isExpanded);
    });
    
    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMobileMenu(false);
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
            toggleMobileMenu(false);
        }
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMobileMenu(false);
            menuToggle.focus();
        }
        
        // Trap focus in mobile menu
        if (event.key === 'Tab' && navMenu.classList.contains('active')) {
            trapFocus(navMenu, event);
        }
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
    
    // Initial update
    updateActiveNavLink();
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu(show) {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (!menuToggle || !navMenu) return;
    
    if (show) {
        navMenu.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>';
        
        // Focus first interactive element in menu
        setTimeout(() => {
            const firstFocusable = navMenu.querySelector('a, button');
            if (firstFocusable) firstFocusable.focus();
        }, 100);
    } else {
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    }
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollPosition = window.scrollY + 100;
    
    let currentSectionId = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSectionId = section.id;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Trap focus within an element
 */
function trapFocus(element, event) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
        if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        }
    } else {
        if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }
}

// ============================================
// SMOOTH SCROLLING
// ============================================

/**
 * Initialize smooth scrolling
 */
function initSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip empty or invalid hrefs
            if (href === '#' || href === '#!' || href === '') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                smoothScrollTo(target);
                
                // Update URL
                history.pushState(null, null, href);
            }
        });
    });
    
    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                smoothScrollTo(target);
            }
        }
    });
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(target) {
    // Check if user prefers reduced motion
    if (prefersReducedMotion()) {
        target.scrollIntoView();
        return;
    }
    
    const headerHeight = document.querySelector('header').offsetHeight;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = Math.min(1000, Math.abs(distance) * 1.5);
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function (easeOutCubic)
        const ease = 1 - Math.pow(1 - progress, 3);
        
        window.scrollTo(0, startPosition + (distance * ease));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            // Focus the target for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus();
            target.removeAttribute('tabindex');
        }
    }
    
    requestAnimationFrame(animation);
}

// ============================================
// FORM HANDLING
// ============================================

/**
 * Initialize forms
 */
function initForms() {
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        
        // Check if user is already subscribed
        const isSubscribed = localStorage.getItem(CONFIG.storage.newsletterSubscribed);
        if (isSubscribed) {
            updateNewsletterFormState(true);
        }
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
}

/**
 * Handle newsletter form submission
 */
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    
    // Validation
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        emailInput.focus();
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    try {
        // In a real application, you would send this to your API
        // For demo purposes, we'll simulate an API call
        await simulateAPICall(CONFIG.api.newsletter, {
            email: email,
            timestamp: new Date().toISOString()
        });
        
        // Show success message
        showToast('Successfully subscribed to newsletter!', 'success');
        
        // Save subscription state
        localStorage.setItem(CONFIG.storage.newsletterSubscribed, 'true');
        
        // Update form state
        updateNewsletterFormState(true);
        
        // Reset form
        form.reset();
        
        // Track subscription in analytics
        trackEvent('newsletter_subscription', { email: email });
        
    } catch (error) {
        console.error('Newsletter subscription failed:', error);
        showToast('Subscription failed. Please try again.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

/**
 * Handle contact form submission
 */
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: form.querySelector('#contactName').value.trim(),
        email: form.querySelector('#contactEmail').value.trim(),
        subject: form.querySelector('#contactSubject').value.trim(),
        message: form.querySelector('#contactMessage').value.trim()
    };
    
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    try {
        // In a real application, you would send this to your API
        await simulateAPICall(CONFIG.api.contact, formData);
        
        // Show success message
        showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Reset form
        form.reset();
        
        // Track contact form submission
        trackEvent('contact_form_submission', formData);
        
    } catch (error) {
        console.error('Contact form submission failed:', error);
        showToast('Failed to send message. Please try again.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

/**
 * Handle search form submission
 */
function handleSearchSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const searchInput = form.querySelector('input[type="search"]');
    const query = searchInput.value.trim();
    
    if (!query) {
        showToast('Please enter a search term', 'error');
        searchInput.focus();
        return;
    }
    
    // In a real application, you would perform the search
    // For demo purposes, we'll just show a toast
    showToast(`Searching for: ${query}`, 'info');
    
    // Track search
    trackEvent('search', { query: query });
    
    // Clear input
    searchInput.value = '';
}

/**
 * Update newsletter form state
 */
function updateNewsletterFormState(isSubscribed) {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (isSubscribed) {
        emailInput.value = '';
        emailInput.placeholder = 'You are already subscribed!';
        emailInput.disabled = true;
        submitBtn.textContent = 'Subscribed ✓';
        submitBtn.disabled = true;
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-outline', 'success');
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Set button loading state
 */
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('btn-loading');
        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        button.removeAttribute('aria-busy');
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    removeExistingToasts();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close notification">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Add close button event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Auto-hide after duration
    setTimeout(() => {
        if (toast.parentNode) {
            hideToast(toast);
        }
    }, CONFIG.toast.duration);
    
    return toast;
}

/**
 * Hide toast notification
 */
function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, CONFIG.animations.normal);
}

/**
 * Remove existing toasts
 */
function removeExistingToasts() {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

// ============================================
// SCROLL TO TOP
// ============================================

/**
 * Initialize scroll to top button
 */
function initScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    if (!scrollBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', throttle(() => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }, 100));
    
    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        if (prefersReducedMotion()) {
            window.scrollTo({ top: 0 });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Focus on skip to content link for accessibility
        const skipLink = document.querySelector('.skip-to-content');
        if (skipLink) {
            skipLink.focus();
        }
    });
}

// ============================================
// LAZY LOADING
// ============================================

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }
                    
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ============================================
// ANALYTICS & TRACKING
// ============================================

/**
 * Track user events
 */
function trackEvent(eventName, data = {}) {
    const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        ...data
    };
    
    // In production, send this to your analytics service
    console.log('Event tracked:', eventData);
    
    // Example: Send to your API
    // fetch(CONFIG.api.analytics, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(eventData)
    // });
}

/**
 * Track page views
 */
function trackPageView() {
    const visitedBefore = localStorage.getItem(CONFIG.storage.visitedBefore);
    
    trackEvent('page_view', {
        is_first_visit: !visitedBefore,
        page_title: document.title,
        page_path: window.location.pathname
    });
    
    if (!visitedBefore) {
        localStorage.setItem(CONFIG.storage.visitedBefore, 'true');
        trackEvent('first_visit');
    }
}

/**
 * Track time on page
 */
function trackTimeOnPage() {
    let timeStart = Date.now();
    
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - timeStart) / 1000);
        trackEvent('time_on_page', { seconds: timeSpent });
    });
}

// ============================================
// ACCESSIBILITY FEATURES
// ============================================

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    // Skip to content link
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
                setTimeout(() => mainContent.removeAttribute('tabindex'), 1000);
            }
        });
    }
    
    // Announce messages to screen readers
    window.announceToScreenReader = announceToScreenReader;
    
    // Handle reduced motion
    if (prefersReducedMotion()) {
        document.documentElement.classList.add('reduced-motion');
    }
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
}

// ============================================
// PROGRESSIVE WEB APP FEATURES
// ============================================

/**
 * Initialize PWA features
 */
function initPWA() {
    // Check if app is installed
    window.addEventListener('appinstalled', () => {
        trackEvent('pwa_installed');
        showToast('Thank you for installing DevHubX Cloud Blog!', 'success');
    });
    
    // Check if app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        document.documentElement.classList.add('standalone');
        trackEvent('pwa_standalone_mode');
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            }).catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
        });
    }
}

// ============================================
// MOCK API FUNCTIONS (for demo purposes)
// ============================================

/**
 * Simulate API call
 */
async function simulateAPICall(endpoint, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure
            const isSuccess = Math.random() > 0.1; // 90% success rate
            
            if (isSuccess) {
                console.log(`API call to ${endpoint}:`, data);
                resolve({ success: true, data: data });
            } else {
                reject(new Error('API request failed'));
            }
        }, 1500);
    });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

/**
 * Monitor performance metrics
 */
function monitorPerformance() {
    // Log page load performance
    window.addEventListener('load', () => {
        if (window.performance && window.performance.timing) {
            const perf = window.performance.timing;
            const loadTime = perf.loadEventEnd - perf.navigationStart;
            const domReadyTime = perf.domContentLoadedEventEnd - perf.navigationStart;
            
            console.log(`Page load time: ${loadTime}ms`);
            console.log(`DOM ready time: ${domReadyTime}ms`);
            
            trackEvent('performance_metrics', {
                load_time: loadTime,
                dom_ready_time: domReadyTime
            });
        }
    });
    
    // Monitor largest contentful paint
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            console.log('LCP:', lastEntry.startTime);
            trackEvent('largest_contentful_paint', {
                lcp: lastEntry.startTime
            });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all features
 */
function init() {
    // Initialize core features
    initTheme();
    initNavigation();
    initSmoothScroll();
    initScrollToTop();
    initForms();
    initLazyLoading();
    initAccessibility();
    
    // Initialize analytics
    trackPageView();
    trackTimeOnPage();
    monitorPerformance();
    
    // Initialize PWA features
    initPWA();
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Add loading spinner CSS
    addLoadingSpinnerStyles();
    
    // Log initialization
    console.log('DevHubX Cloud Blog initialized successfully');
}

/**
 * Add loading spinner CSS styles
 */
function addLoadingSpinnerStyles() {
    const styles = `
        .loading-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
            margin-right: 8px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            .loading-spinner {
                animation-duration: 2s;
            }
            
            .toast {
                transition: none;
            }
        }
        
        /* Print styles */
        @media print {
            .no-print {
                display: none !important;
            }
            
            a[href]:after {
                content: " (" attr(href) ")";
                font-size: 0.9em;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Global error handler
 */
function initErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        trackEvent('unhandled_promise_rejection', { error: event.reason.toString() });
    });
    
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
        console.error('JavaScript error:', event.error);
        trackEvent('javascript_error', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
        
        // Don't show error toast in production to avoid annoying users
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            showToast(`Error: ${event.message}`, 'error');
        }
    });
}

// ============================================
// EXPORT FUNCTIONS (for testing/debugging)
// ============================================

// Expose useful functions to global scope for testing
window.DevHubXBlog = {
    init,
    setTheme,
    toggleTheme,
    showToast,
    trackEvent,
    simulateAPICall
};

// ============================================
// START APPLICATION
// ============================================

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initErrorHandling();
        init();
    });
} else {
    initErrorHandling();
    init();
}

// Handle offline/online status
window.addEventListener('online', () => {
    showToast('You are back online', 'success');
    trackEvent('connection_restored');
});

window.addEventListener('offline', () => {
    showToast('You are offline. Some features may not work.', 'warning');
    trackEvent('connection_lost');
});

// Export for module usage (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init,
        setTheme,
        toggleTheme,
        showToast,
        trackEvent,
        simulateAPICall
    };
}