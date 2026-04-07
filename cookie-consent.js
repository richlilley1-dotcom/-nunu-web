(function() {
    // Skip if already consented
    var saved = localStorage.getItem('nunu-cookies');
    if (saved) return;

    // Inject styles
    var style = document.createElement('style');
    style.textContent = [
        /* Bar */
        '.cookie-bar{position:fixed;bottom:0;left:0;right:0;z-index:9999;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);pointer-events:none;}',
        '.cookie-bar.visible{transform:translateY(0);pointer-events:auto;}',
        '.cookie-bar-inner{max-width:1200px;margin:0 auto;padding:1rem 1.5rem;font-family:Inter,-apple-system,sans-serif;font-size:0.85rem;line-height:1.5;}',
        '.cookie-bar-row{display:flex;align-items:center;gap:1rem;flex-wrap:wrap;justify-content:space-between;}',

        /* Dark mode (default) */
        '.cookie-bar{background:rgba(18,18,18,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(0,255,0,0.15);box-shadow:0 -4px 24px rgba(0,0,0,0.3);}',
        '.cookie-bar p{color:#B0B0B0;margin:0;flex:1;min-width:200px;}',
        '.cookie-bar a{color:#00FF00;text-decoration:none;}',
        '.cookie-bar a:hover{text-decoration:underline;}',

        /* Buttons */
        '.cookie-bar-actions{display:flex;gap:0.5rem;flex-shrink:0;}',
        '.cookie-bar-btn{border:none;border-radius:8px;padding:0.5rem 1.25rem;font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;font-family:inherit;}',
        '.cookie-bar-accept{background:#00FF00;color:#000000;}',
        '.cookie-bar-accept:hover{background:#00CC00;box-shadow:0 0 16px rgba(0,255,0,0.3);}',
        '.cookie-bar-reject{background:transparent;color:#B0B0B0;border:1px solid rgba(255,255,255,0.15);}',
        '.cookie-bar-reject:hover{border-color:rgba(255,255,255,0.3);color:#FFFFFF;}',
        '.cookie-bar-manage{background:transparent;color:#B0B0B0;border:1px solid rgba(255,255,255,0.15);}',
        '.cookie-bar-manage:hover{border-color:rgba(255,255,255,0.3);color:#FFFFFF;}',

        /* Preferences panel */
        '.cookie-prefs{max-height:0;overflow:hidden;transition:max-height 0.35s cubic-bezier(0.16,1,0.3,1),opacity 0.3s ease;opacity:0;}',
        '.cookie-prefs.open{max-height:400px;opacity:1;margin-top:1rem;}',
        '.cookie-prefs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.75rem;margin-bottom:1rem;}',
        '.cookie-pref-item{display:flex;align-items:flex-start;gap:0.6rem;padding:0.75rem;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);}',
        '.cookie-pref-item label{cursor:pointer;font-size:0.8rem;}',
        '.cookie-pref-item .pref-name{font-weight:600;color:#FFFFFF;display:block;margin-bottom:0.15rem;}',
        '.cookie-pref-item .pref-desc{color:#888888;font-size:0.75rem;line-height:1.4;}',
        '.cookie-pref-item input[type="checkbox"]{accent-color:#00FF00;margin-top:0.15rem;flex-shrink:0;width:16px;height:16px;}',
        '.cookie-pref-item.locked{opacity:0.6;}',
        '.cookie-pref-item.locked input{pointer-events:none;}',
        '.cookie-pref-save{background:#00FF00;color:#000000;}',
        '.cookie-pref-save:hover{background:#00CC00;box-shadow:0 0 16px rgba(0,255,0,0.3);}',

        /* Light mode overrides */
        'html[data-theme="light"] .cookie-bar{background:rgba(255,255,255,0.97);border-top:1px solid rgba(0,170,0,0.12);box-shadow:0 -2px 12px rgba(0,0,0,0.06);}',
        'html[data-theme="light"] .cookie-bar p{color:#555555;}',
        'html[data-theme="light"] .cookie-bar a{color:#009900;}',
        'html[data-theme="light"] .cookie-bar-accept,html[data-theme="light"] .cookie-pref-save{background:linear-gradient(135deg,#00BB00,#009900);color:#FFFFFF;}',
        'html[data-theme="light"] .cookie-bar-accept:hover,html[data-theme="light"] .cookie-pref-save:hover{box-shadow:0 2px 12px rgba(0,153,0,0.25);}',
        'html[data-theme="light"] .cookie-bar-reject,html[data-theme="light"] .cookie-bar-manage{color:#666666;border-color:rgba(0,0,0,0.12);}',
        'html[data-theme="light"] .cookie-bar-reject:hover,html[data-theme="light"] .cookie-bar-manage:hover{border-color:rgba(0,0,0,0.25);color:#333333;}',
        'html[data-theme="light"] .cookie-pref-item{border-color:rgba(0,0,0,0.08);background:rgba(0,0,0,0.02);}',
        'html[data-theme="light"] .cookie-pref-item .pref-name{color:#111111;}',
        'html[data-theme="light"] .cookie-pref-item .pref-desc{color:#777777;}',
        'html[data-theme="light"] .cookie-pref-item input[type="checkbox"]{accent-color:#009900;}',

        /* Mobile */
        '@media(max-width:600px){.cookie-bar-inner{padding:1rem;}.cookie-bar-row{flex-direction:column;text-align:center;gap:0.75rem;}.cookie-bar-actions{width:100%;justify-content:center;}.cookie-prefs-grid{grid-template-columns:1fr;}}'
    ].join('\n');
    document.head.appendChild(style);

    // Cookie categories
    var categories = [
        { id: 'essential', name: 'Essential', desc: 'Required for the site to function. Cannot be disabled.', locked: true, checked: true },
        { id: 'analytics', name: 'Analytics', desc: 'Help us understand how visitors use the site.', locked: false, checked: false },
        { id: 'marketing', name: 'Marketing', desc: 'Used to deliver relevant advertising.', locked: false, checked: false },
        { id: 'preferences', name: 'Preferences', desc: 'Remember your settings and personalisation.', locked: false, checked: false }
    ];

    // Build preference items
    var prefsHTML = categories.map(function(cat) {
        return '<div class="cookie-pref-item' + (cat.locked ? ' locked' : '') + '">' +
            '<input type="checkbox" id="cookie-cat-' + cat.id + '"' +
            (cat.checked ? ' checked' : '') +
            (cat.locked ? ' disabled' : '') + '>' +
            '<label for="cookie-cat-' + cat.id + '">' +
            '<span class="pref-name">' + cat.name + (cat.locked ? ' (required)' : '') + '</span>' +
            '<span class="pref-desc">' + cat.desc + '</span>' +
            '</label></div>';
    }).join('');

    // Inject HTML
    var bar = document.createElement('div');
    bar.className = 'cookie-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
        '<div class="cookie-bar-inner">' +
            '<div class="cookie-bar-row">' +
                '<p>We use essential cookies to keep the site working. Optional cookies help us improve. <a href="privacy.html">Privacy Policy</a></p>' +
                '<div class="cookie-bar-actions">' +
                    '<button class="cookie-bar-btn cookie-bar-manage" id="cookie-manage">Manage</button>' +
                    '<button class="cookie-bar-btn cookie-bar-reject" id="cookie-reject">Reject All</button>' +
                    '<button class="cookie-bar-btn cookie-bar-accept" id="cookie-accept">Accept All</button>' +
                '</div>' +
            '</div>' +
            '<div class="cookie-prefs" id="cookie-prefs">' +
                '<div class="cookie-prefs-grid">' + prefsHTML + '</div>' +
                '<div class="cookie-bar-actions">' +
                    '<button class="cookie-bar-btn cookie-pref-save" id="cookie-save">Save Preferences</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    document.body.appendChild(bar);

    // Slide in after short delay
    setTimeout(function() { bar.classList.add('visible'); }, 800);

    // Toggle preferences panel
    var prefsPanel = document.getElementById('cookie-prefs');
    document.getElementById('cookie-manage').addEventListener('click', function() {
        prefsPanel.classList.toggle('open');
        this.textContent = prefsPanel.classList.contains('open') ? 'Close' : 'Manage';
    });

    // Dismiss helper
    function dismiss(consent) {
        localStorage.setItem('nunu-cookies', JSON.stringify(consent));
        bar.classList.remove('visible');
        setTimeout(function() { bar.remove(); }, 400);
    }

    // Accept all
    document.getElementById('cookie-accept').addEventListener('click', function() {
        dismiss({ essential: true, analytics: true, marketing: true, preferences: true });
    });

    // Reject all (essential only)
    document.getElementById('cookie-reject').addEventListener('click', function() {
        dismiss({ essential: true, analytics: false, marketing: false, preferences: false });
    });

    // Save custom preferences
    document.getElementById('cookie-save').addEventListener('click', function() {
        var consent = {};
        categories.forEach(function(cat) {
            var cb = document.getElementById('cookie-cat-' + cat.id);
            consent[cat.id] = cb ? cb.checked : cat.locked;
        });
        dismiss(consent);
    });
})();
