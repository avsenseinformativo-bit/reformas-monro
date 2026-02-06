document.addEventListener('DOMContentLoaded', () => {
    const logoElement = document.getElementById('main-logo');
    const contentWrapper = document.getElementById('content-wrapper');

    // --- AUDIO SETUP ---
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create click sound (film projector shutter)
    function playClick() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 150; // Low frequency click
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    }

    // Create background static/hum
    let staticSource = null;
    function startStatic() {
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        staticSource = audioContext.createBufferSource();
        staticSource.buffer = buffer;
        staticSource.loop = true;

        const staticGain = audioContext.createGain();
        staticGain.gain.value = 0.05; // Very subtle background

        staticSource.connect(staticGain);
        staticGain.connect(audioContext.destination);
        staticSource.start();
    }

    function stopStatic() {
        if (staticSource) {
            staticSource.stop();
            staticSource = null;
        }
    }

    // Array of textured logo paths
    const logos = [
        'web_assets/logo_tex_1.jpg',
        'web_assets/logo_tex_2.jpg',
        'web_assets/logo_tex_3.jpg',
        'web_assets/logo_tex_4.jpg'
    ];

    // Preload images to avoid flickering
    logos.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // --- TIMELINE ---

    // 1. Initial Fade In (White Logo)
    setTimeout(() => {
        logoElement.style.transition = 'opacity 1.5s ease';
        logoElement.style.opacity = '1';
    }, 500);

    // 2. Start Strobe Effect
    setTimeout(() => {
        startStatic(); // Start background noise
        startStrobeEffect();
    }, 2500);

    function startStrobeEffect() {
        let count = 0;
        const maxFlashes = 20; // How many fast switches
        const speed = 80; // Speed in ms (lower is faster)

        // Remove smooth transition for the strobe effect to make it sharp
        logoElement.style.transition = 'none';

        const interval = setInterval(() => {
            // Pick a random color from the list, excluding white for maximum flashiness
            const randomColor = logos[Math.floor(Math.random() * (logos.length - 1)) + 1];
            logoElement.src = randomColor;

            // Random slight scale for extra chaos
            const scale = 1 + (Math.random() * 0.1);
            logoElement.style.transform = `scale(${scale})`;

            // Play click sound on each frame
            playClick();

            count++;
            if (count >= maxFlashes) {
                clearInterval(interval);
                stopStatic(); // Stop background noise
                finishIntro();
            }
        }, speed);
    }

    function finishIntro() {
        // Reset to clean state
        logoElement.src = 'web_assets/logo_tex_1.jpg';
        logoElement.style.transform = 'scale(1)';
        logoElement.style.transition = 'transform 0.5s ease'; // Restore smooth movement if we add mouseover later

        // Trigger CSS transition to shrink logo and move it
        document.querySelector('.logo-container').classList.add('finished');

        // 3. Reveal Form
        setTimeout(() => {
            contentWrapper.classList.add('visible');
        }, 500);
    }

    // --- FORM SUBMISSION ---
    const form = document.getElementById('waitlist-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button');
        const email = emailInput.value;

        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'JOINING...';

        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbype19WC1ljNdKUlUMklvACFvDqiwrGLw3rtP79-3DKzvbWAdy83IJ_VzWJF_qVVgP3dA/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email })
            });

            // Success feedback
            form.style.display = 'none'; // Hide form

            const confirmationMsg = document.getElementById('confirmation-msg');
            if (confirmationMsg) {
                confirmationMsg.textContent = "YOU'RE IN. EARLY ACCESS SECURED.";
                confirmationMsg.style.display = 'block';
            }

        } catch (error) {
            submitBtn.textContent = 'ERROR - TRY AGAIN';
            submitBtn.disabled = false;
            console.error('Error:', error);
        }
    });
});
