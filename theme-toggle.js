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
                // Light mode: black text on transparent background
                if (typeof window.processLogoForLight === 'function') {
                    window.processLogoForLight(img);
                }
            } else {
                // Dark mode: white text on transparent background
                if (typeof window.processLogoForDark === 'function') {
                    window.processLogoForDark(img);
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

    function updateLabel(theme) {
        var label = document.getElementById('toggle-label');
        if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }

    // Set initial label
    updateLabel(getTheme());

    toggle.addEventListener('click', function() {
        var current = getTheme();
        var next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
        updateLabel(next);
    });
})();
