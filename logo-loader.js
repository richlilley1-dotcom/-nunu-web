/**
 * nunu Logo Loader
 * Processes black-on-white logo PNGs to remove white background at runtime.
 * Dark mode: white text + green dot on transparent.
 * Light mode: black text + green dot on transparent.
 */
(function() {
    function processLogo(el, mode) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            var w = Math.min(img.width, 1024);
            var h = Math.round(w * (img.height / img.width));
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            var imageData = ctx.getImageData(0, 0, w, h);
            var d = imageData.data;
            var out = ctx.createImageData(w, h);
            var od = out.data;

            for (var i = 0; i < d.length; i += 4) {
                var r = d[i], g = d[i+1], b = d[i+2];
                var brightness = (r + g + b) / 3;
                var isGreen = g > 150 && r < 100 && b < 100;

                if (brightness > 230 && !isGreen) {
                    // White pixels → transparent
                    od[i] = od[i+1] = od[i+2] = od[i+3] = 0;
                } else if (isGreen) {
                    // Green dot — keep as-is
                    od[i] = r; od[i+1] = g; od[i+2] = b; od[i+3] = 255;
                } else {
                    // Dark pixels (text)
                    var alpha = Math.min(255, Math.round((255 - brightness) * 1.5));
                    if (mode === 'light') {
                        // Keep black text for light backgrounds
                        od[i] = 0; od[i+1] = 0; od[i+2] = 0; od[i+3] = alpha;
                    } else {
                        // Invert to white text for dark backgrounds
                        od[i] = 255; od[i+1] = 255; od[i+2] = 255; od[i+3] = alpha;
                    }
                }
            }

            ctx.putImageData(out, 0, 0);
            el.src = canvas.toDataURL('image/png');
            el.style.filter = 'none';
        };
        img.src = el.dataset.originalSrc || el.src;
    }

    function processLogoForDark(el) { processLogo(el, 'dark'); }
    function processLogoForLight(el) { processLogo(el, 'light'); }

    // Expose for theme-toggle.js
    window.processLogoForDark = processLogoForDark;
    window.processLogoForLight = processLogoForLight;

    // Store original sources before processing
    var allLogos = document.querySelectorAll('.nav-logo img, .footer-logo img, .login-logo img');
    allLogos.forEach(function(el) {
        var src = el.getAttribute('src');
        if (src && src.indexOf('data:') !== 0) {
            el.dataset.originalSrc = src;
        }
    });

    // Process logos for current theme
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
        allLogos.forEach(processLogoForLight);
    } else {
        allLogos.forEach(processLogoForDark);
    }
})();
