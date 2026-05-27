/* ==========================================================================
   24 HOUR LOGOS - INTERACTIVE APPLICATION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Generate an initial order serial number
    generateNewSerial();

    // 1. Polaroid Tilt & Sway Mouse Interactions
    const polaroidWrappers = document.querySelectorAll('.polaroid-wrapper');
    
    polaroidWrappers.forEach(wrapper => {
        const card = wrapper.querySelector('.polaroid-card');
        
        wrapper.addEventListener('mousemove', (e) => {
            // Pause the background swaying animation when interacting
            wrapper.style.animationPlayState = 'paused';
            
            // Calculate relative mouse coordinates inside the card
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert to tilt rotation ranges (-8deg to 8deg)
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const rotateX = (yc - y) / 10;
            const rotateY = (x - xc) / 10;
            
            // Apply 3D perspective rotation
            card.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            // Resume the background swaying animation
            wrapper.style.animationPlayState = 'running';
            
            // Smoothly reset card rotation
            card.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)';
        });

        // Click on a polaroid to show a fun "Developing Zoom-in" flash effect
        card.addEventListener('click', () => {
            triggerPolaroidFlash(card);
        });
    });

    // 2. Order Form Submission & Receipt Compilation
    const orderForm = document.getElementById('logo-order-form');
    const checkoutModal = document.getElementById('checkout-modal');
    
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop default reload

        // Extract values from form
        const brandName = document.getElementById('brand-name').value.trim();
        const contactInfo = document.getElementById('contact-info').value.trim();
        
        // Populate thermal receipt data
        document.getElementById('receipt-brand').textContent = brandName;
        document.getElementById('receipt-contact').textContent = contactInfo;

        // Play standard retro till register bell audio or visual notification
        playRegisterBell();

        // Slide the checkout modal overlay open
        checkoutModal.classList.add('active');
    });
});

/* --- Helper functions & Event Handlers --- */

// Generate random vintage-style alphanumeric serial numbers for slips
function generateNewSerial() {
    const prefixNum = Math.floor(10000 + Math.random() * 90000);
    const suffixChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    const serialStr = `${prefixNum}-${suffixChar}`;
    
    const serialElem = document.getElementById('serial-number');
    if (serialElem) {
        serialElem.textContent = serialStr;
    }
}

// Polaroid Camera Flash effect on click
function triggerPolaroidFlash(card) {
    // Create a temporary flash element overlay on the card
    const flash = document.createElement('div');
    flash.className = 'polaroid-flash-active';
    
    // Style flash dynamically to prevent CSS bloat
    flash.style.position = 'absolute';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.right = '0';
    flash.style.bottom = '0';
    flash.style.background = '#fff';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '99';
    
    card.appendChild(flash);
    
    // Fade out immediately
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            flash.remove();
        }, 800);
    }, 50);
}

// Simulated cash register bell and sound trigger
function playRegisterBell() {
    // We create a mock synth sound to ensure offline/sandboxed capability without external assets
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Bell ding high tone
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // High A
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); // E harmonic

        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc1.start();
        osc2.start();
        
        osc1.stop(audioCtx.currentTime + 1.2);
        osc2.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
        console.log("Web Audio not supported or blocked by browser policy.");
    }
}

// Close checkout modal
function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.classList.remove('active');
}

// Simulated payment channel triggers retro developing tray loading
function triggerPayment(methodName) {
    const receiptPaper = document.querySelector('.receipt-paper');
    
    // Play register cash drawer closing clunk sound
    playDrawerClunk();

    // Replace payment grid with retro "DEVELOPING CHEMICAL BATH" loading animation
    const paymentArea = document.querySelector('.payment-selection-area');
    const originalContent = paymentArea.innerHTML;
    
    paymentArea.innerHTML = `
        <div class="developer-tray-loader">
            <p class="loader-status-text">DEVELOPING FILM BATH...</p>
            <div class="chem-fluid-container">
                <div class="chem-fluid-level"></div>
                <div class="percentage-digits">0%</div>
            </div>
            <p class="loader-tip-text">Agitating developer tray in darkroom...</p>
        </div>
    `;

    // Dynamic style insertion for loading states inside checkout
    injectLoaderStyles();

    // Animate percentage digits
    let progress = 0;
    const digitSpan = paymentArea.querySelector('.percentage-digits');
    const fluidLevel = paymentArea.querySelector('.chem-fluid-level');
    
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Proceed to success shutters screen
            setTimeout(() => {
                paymentArea.innerHTML = originalContent; // restore for next reset
                displaySuccessScreen();
            }, 600);
        }
        digitSpan.textContent = `${progress}%`;
        fluidLevel.style.width = `${progress}%`;
    }, 150);
}

// Synthetic cash drawer clunk sound
function playDrawerClunk() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime); // low thud
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.log("Web Audio failed.");
    }
}

// Load styles dynamically for the Chemical tray loader to keep style.css neat
function injectLoaderStyles() {
    if (document.getElementById('loader-dynamic-styles')) return;
    
    const styleSheet = document.createElement("style");
    styleSheet.id = 'loader-dynamic-styles';
    styleSheet.innerText = `
        .developer-tray-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px 0;
        }
        .loader-status-text {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 1px;
            color: #d63031;
            margin-bottom: 8px;
            animation: blink 0.8s infinite alternate;
        }
        .chem-fluid-container {
            width: 100%;
            height: 24px;
            background: #dfe6e9;
            border: 2px solid #2d3436;
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            margin-bottom: 8px;
        }
        .chem-fluid-level {
            height: 100%;
            width: 0%;
            background: #d63031;
            transition: width 0.15s ease-out;
        }
        .percentage-digits {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 900;
            color: #111;
            mix-blend-mode: difference;
        }
        .loader-tip-text {
            font-size: 10px;
            color: #666;
            font-style: italic;
        }
        @keyframes blink {
            0% { opacity: 0.3; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Display completion shutters screen
function displaySuccessScreen() {
    // Generate dynamic values for success ticket
    const delivery = new Date();
    delivery.setHours(delivery.getHours() + 24); // exactly 24 hours later
    
    // Format delivery time elegantly (e.g. 01:25 AM)
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const deliveryStr = delivery.toLocaleTimeString([], options);
    
    // Generate transaction ID
    const transIdStr = `TXN-${Math.floor(10000 + Math.random() * 90000)}-OK`;

    // Populate success details
    document.getElementById('delivery-time').textContent = deliveryStr;
    document.getElementById('trans-id').textContent = transIdStr;

    // Close Register Modal
    closeCheckout();

    // Play Shutter closing sound
    playShutterSound();

    // Slide closed roller doors
    const successOverlay = document.getElementById('success-screen');
    successOverlay.classList.add('active');
}

// Metallic shutter sound synth
function playShutterSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Noise buffer for scraping metal
        const bufferSize = audioCtx.sampleRate * 0.8; // 0.8 seconds
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter to make it metallic/screechy
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 180;
        filter.Q.value = 0.5;

        // Shutter slam thud at the end
        const osc = audioCtx.createOscillator();
        const gainOsc = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, audioCtx.currentTime + 0.6); // low bass landing

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.75);

        noise.connect(filter);
        filter.connect(gainNode);
        
        osc.connect(gainOsc);
        gainOsc.gain.setValueAtTime(0, audioCtx.currentTime);
        gainOsc.gain.setValueAtTime(0.4, audioCtx.currentTime + 0.65);
        gainOsc.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        
        gainNode.connect(audioCtx.destination);
        gainOsc.connect(audioCtx.destination);

        noise.start();
        osc.start(audioCtx.currentTime + 0.6);
        
        noise.stop(audioCtx.currentTime + 0.8);
        osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
        console.log("Audio failed.");
    }
}

// Reset entire application state to order another logo
function resetApplication() {
    // Slide open roller doors
    const successOverlay = document.getElementById('success-screen');
    successOverlay.classList.remove('active');

    // Play doors opening sound
    playShutterSound();

    // Reset form fields
    const orderForm = document.getElementById('logo-order-form');
    orderForm.reset();

    // Generate brand new receipt serial number
    generateNewSerial();

    // Smooth scroll back to top of portfolio
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 300);
}
