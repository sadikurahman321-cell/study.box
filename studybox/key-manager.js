/**
 * STUDYBOX - Strict 12-Hour Access Pass & AroLinks Monetization Manager
 * API Key: 1899d440362a65d7aac80a4376068597650880fe
 * API Endpoint: https://arolinks.com/api?api=1899d440362a65d7aac80a4376068597650880fe&url=DESTINATION
 * Tutorial YouTube URL: https://youtu.be/2gEHhySUHcU?si=wonR_SCU7XV08s2r
 */

const AROLINK_API_KEY = "1899d440362a65d7aac80a4376068597650880fe";
const TUTORIAL_URL = "https://youtu.be/2gEHhySUHcU?si=wonR_SCU7XV08s2r";
const KEY_DURATION_MS = 12 * 60 * 60 * 1000; // 12 Hours

/**
 * Returns today's authentic secret key code (e.g., SBX-20260804-PASS)
 */
function getTodaySecretKey() {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `SBX-${dateStr}-PASS`;
}

const StudyBoxKey = {
    /**
     * Check if 12-hour pass is currently active and valid
     */
    isKeyValid() {
        const expiry = localStorage.getItem('studybox_key_expiry');
        if (!expiry) return false;
        return Date.now() < parseInt(expiry, 10);
    },

    /**
     * Return remaining pass time formatted (e.g., "11h 45m left")
     */
    getRemainingTimeText() {
        const expiry = localStorage.getItem('studybox_key_expiry');
        if (!expiry) return "Expired";
        const diff = parseInt(expiry, 10) - Date.now();
        if (diff <= 0) return "Expired";
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${mins}m left`;
    },

    /**
     * Activate the 12-hour pass ONLY if valid key is passed
     */
    activatePass(providedKey = null) {
        const authenticKey = getTodaySecretKey();
        
        if (providedKey && providedKey.trim().toUpperCase() !== authenticKey) {
            return false;
        }

        const expiryTime = Date.now() + KEY_DURATION_MS;
        localStorage.setItem('studybox_key_expiry', expiryTime.toString());
        localStorage.setItem('studybox_key_code', authenticKey);
        return authenticKey;
    },

    /**
     * Redirects user through AroLinks.com API shortener link to generate revenue
     */
    async redirectToAroLink() {
        const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        const authenticKey = getTodaySecretKey();

        // AroLinks requires a public domain URL (not 127.0.0.1 or localhost)
        const baseOrigin = isLocalhost ? 'https://studybox-pro.netlify.app' : window.location.origin;
        const targetDestination = `${baseOrigin}/key.html?action=verify&secret_token=${authenticKey}`;
        
        try {
            const apiUrl = `https://arolinks.com/api?api=${AROLINK_API_KEY}&url=${encodeURIComponent(targetDestination)}`;
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.shortenedUrl) {
                    window.location.href = data.shortenedUrl;
                    return;
                }
            }
        } catch (e) {
            console.warn("AroLinks API fetch error, attempting direct redirect", e);
        }

        // Direct AroLinks URL fallback
        window.location.href = `https://arolinks.com/api?api=${AROLINK_API_KEY}&url=${encodeURIComponent(targetDestination)}`;
    },

    /**
     * Render Header Access Badge
     */
    renderHeaderBadge(containerId = 'key-status-badge') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.isKeyValid()) {
            container.innerHTML = `
                <div class="flex items-center gap-2 bg-black/60 border border-green-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-green-400 shadow-neon cursor-pointer btn-press" onclick="window.location.href='key.html'">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span>🔑 12-HR PASS ACTIVE (${this.getRemainingTimeText()})</span>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/40 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold text-yellow-400 shadow-neon cursor-pointer btn-press hover:bg-yellow-500/20" onclick="StudyBoxKey.openKeyModal()">
                    <span class="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></span>
                    <span>🔒 GET 12-HR ACCESS KEY</span>
                </div>
            `;
        }
    },

    /**
     * Modal Popup for Key Pass Generation
     */
    openKeyModal() {
        const existingModal = document.getElementById('studybox-key-modal');
        if (existingModal) {
            existingModal.classList.remove('hidden');
            return;
        }

        const modalHTML = `
            <div id="studybox-key-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md pop-in">
                <div class="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border-primary/40 shadow-2xl relative flex flex-col text-center">
                    
                    <!-- Close button -->
                    <button onclick="document.getElementById('studybox-key-modal').classList.add('hidden')" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">
                        <i class="ph-bold ph-x"></i>
                    </button>

                    <!-- Icon -->
                    <div class="w-16 h-16 bg-primary/10 border border-primary/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary shadow-neon">
                        <i class="ph-bold ph-key text-3xl"></i>
                    </div>

                    <h2 class="text-2xl font-black text-white font-mono mb-2">12-HOUR ACCESS KEY REQUIRED</h2>
                    <p class="text-gray-300 text-xs sm:text-sm mb-6 leading-relaxed">
                        To watch lectures, download notes & access batch contents, you must generate a free <span class="text-primary font-bold">12-Hour Access Pass Key</span> by completing the AroLinks ad step.
                    </p>

                    <!-- Main Button: Generate Key via AroLinks -->
                    <button onclick="StudyBoxKey.redirectToAroLink()" class="w-full py-4 bg-gradient-to-r from-primary to-orange-500 text-black font-extrabold text-sm rounded-xl shadow-neon hover:shadow-neon-strong transition-all btn-press flex items-center justify-center gap-2 mb-4">
                        <i class="ph-bold ph-lightning text-lg"></i>
                        <span>GENERATE 12-HOUR KEY PASS</span>
                    </button>

                    <!-- YouTube Tutorial Card -->
                    <div class="bg-surface/90 border border-border p-4 rounded-2xl mb-5 flex flex-col items-center gap-2">
                        <p class="text-xs text-gray-400 font-mono">Don't know how to generate the key?</p>
                        <a href="${TUTORIAL_URL}" target="_blank" class="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2 border border-red-500/30 px-3 py-1.5 rounded-lg bg-red-500/10 transition-colors">
                            <i class="ph-fill ph-youtube-logo text-base text-red-500"></i>
                            <span>Watch Key Generation Tutorial Video</span>
                            <i class="ph-bold ph-arrow-square-out"></i>
                        </a>
                    </div>

                    <!-- Error Alert Message -->
                    <div id="key-error-msg" class="hidden bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono p-3 rounded-xl mb-4 text-left"></div>

                    <!-- Strict Manual Input -->
                    <div class="flex flex-col gap-1 border-t border-border pt-4">
                        <p class="text-[11px] text-gray-400 font-mono text-left mb-1">Enter your generated Key Pass Code:</p>
                        <div class="flex items-center gap-2">
                            <input type="text" id="manual-key-input" placeholder="e.g. SBX-20260804-PASS" class="flex-1 bg-surface border border-border text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary/60 font-mono uppercase">
                            <button onclick="StudyBoxKey.submitManualKey()" class="bg-primary hover:bg-primaryHover text-black px-4 py-2.5 rounded-xl text-xs font-bold font-mono btn-press">
                                Verify Key
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    /**
     * Strictly verifies manual key submission
     */
    submitManualKey() {
        const input = document.getElementById('manual-key-input');
        const errorEl = document.getElementById('key-error-msg');
        if (!input) return;
        
        const enteredKey = input.value.trim().toUpperCase();
        const authenticKey = getTodaySecretKey();
        
        if (enteredKey === authenticKey) {
            this.activatePass(authenticKey);
            if (errorEl) errorEl.classList.add('hidden');
            alert("🔑 12-Hour Access Pass Activated Successfully!");
            window.location.reload();
        } else {
            if (errorEl) {
                errorEl.innerHTML = `❌ <strong>Invalid Key Pass Code!</strong><br>Random text like "${enteredKey}" is not allowed. Please click "GENERATE 12-HOUR KEY PASS" to get the real key from AroLinks.`;
                errorEl.classList.remove('hidden');
            } else {
                alert(`❌ Invalid Key Pass Code! Random text like "${enteredKey}" is not allowed. You must generate your key via AroLinks.`);
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    StudyBoxKey.renderHeaderBadge();
});
