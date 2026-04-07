/**
 * nunu Theme Toggle
 * Handles light/dark mode switching with localStorage persistence.
 * Works alongside logo-loader.js for correct logo rendering per theme.
 */
(function() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    var html = document.documentElement;

    function getTheme() {
        return html.getAttribute('data-theme') || 'dark';
    }

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('nunu-theme', theme);
        updateLogos(theme);
    }

    function updateLogos(theme) {
        var logos = document.querySelectorAll('.nav-logo img, .footer-logo img, .login-logo img');
        logos.forEach(function(img) {
            if (theme === 'light') {
                // Light mode: show original black logo
                // Reset to original source if we have it stored
                if (img.dataset.originalSrc) {
                    img.src = img.dataset.originalSrc;
                }
                img.style.filter = 'none';
            } else {
                // Dark mode: re-process with logo-loader
                if (img.dataset.originalSrc) {
                    img.src = img.dataset.originalSrc;
                    img.style.filter = 'brightness(0) invert(1)';
                    // Re-trigger logo-loader processing
                    if (typeof window.processLogoForDark === 'function') {
                        window.processLogoForDark(img);
                    }
                }
            }
        });
    }

    // Store original sources on first load
    document.querySelectorAll('.nav-logo img, .footer-logo img, .login-logo img').forEach(function(img) {
        if (!img.dataset.originalSrc) {
            // Store the original PNG source before logo-loader modifies it
            var src = img.getAttribute('src');
            if (src && src.indexOf('data:') !== 0) {
                img.dataset.originalSrc = src;
            }
        }
    });

    toggle.addEventListener('click', function() {
        var current = getTheme();
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
})();
