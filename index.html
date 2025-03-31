let audioContext;
let oscillators = [];
let isPlaying = false;
let velocity = { x: 0, y: 0, z: 0 }; // Cambiamos a velocidad
let lastUpdateTime = Date.now();
const alpha = 0.2;
let startTime;
let lastUpdate = 0;
const updateInterval = 50;
const decayFactor = 0.98; // Factor de reducción de velocidad

const toggleButton = document.getElementById('toggleButton');
const gValueDisplay = document.getElementById('gValue');
const frequencies = [293.7, 440, 659];

// ... (configuración del chart igual) ...

function calculateGValue() {
    return Math.hypot(velocity.x, velocity.y, velocity.z) / 9.81; // Mantenemos escala en g
}

function createViolinSound() {
    oscillators = frequencies.map((freq) => {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        gainNode.gain.value = 0;
        
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { osc, gainNode };
    });

    oscillators.forEach(obj => obj.osc.start());
}

function updateSound(timestamp) {
    const totalG = calculateGValue();
    const silenceThreshold = 0.1;
    
    if (totalG < silenceThreshold) {
        oscillators.forEach(obj => {
            obj.gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
        });
        gValueDisplay.textContent = '0.00 g';
        updateChart(0, (timestamp - startTime) / 1000);
        return;
    }

    const now = audioContext.currentTime;
    const intensities = [
        Math.min(Math.pow(Math.abs(velocity.x / 9.81), 1.5), 2), // Escalamos a g
        Math.min(Math.pow(Math.abs(velocity.y / 9.81), 1.5), 2),
        Math.min(Math.pow(Math.abs(velocity.z / 9.81), 1.5), 2)
    ];

    oscillators.forEach((obj, i) => {
        obj.gainNode.gain.setTargetAtTime(intensities[i] * 0.3, now, 0.1);
        
        const vibratoFreq = 8;
        const vibratoDepth = intensities[i] * 5;
        obj.osc.frequency.setValueAtTime(
            frequencies[i] + Math.sin(now * vibratoFreq * Math.PI * 2) * vibratoDepth,
            now
        );
    });

    if (timestamp - lastUpdate >= updateInterval) {
        updateChart(totalG, (timestamp - startTime) / 1000);
        lastUpdate = timestamp;
    }
}

async function toggleSound() {
    if (!isPlaying) {
        try {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const permission = await DeviceMotionEvent.requestPermission();
                if (permission !== 'granted') {
                    alert('Se requieren permisos para usar el sensor.');
                    return;
                }
            }

            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            startTime = Date.now();
            lastUpdate = startTime;
            createViolinSound();
            
            velocity = { x: 0, y: 0, z: 0 };
            let lastTimestamp = Date.now();
            
            window.addEventListener('devicemotion', (e) => {
                const now = Date.now();
                const dt = (now - lastTimestamp) / 1000; // Tiempo en segundos
                
                // Integración de la aceleración para obtener velocidad
                velocity.x = alpha * (velocity.x + e.acceleration.x * dt) + (1 - alpha) * velocity.x;
                velocity.y = alpha * (velocity.y + e.acceleration.y * dt) + (1 - alpha) * velocity.y;
                velocity.z = alpha * (velocity.z + e.acceleration.z * dt) + (1 - alpha) * velocity.z;
                
                // Aplicar reducción gradual de velocidad
                velocity.x *= decayFactor;
                velocity.y *= decayFactor;
                velocity.z *= decayFactor;
                
                lastTimestamp = now;
                updateSound(Date.now());
            });

            gChart.data.datasets[0].data = [];
            gChart.options.scales.x.min = 0;
            gChart.options.scales.x.max = 5;
            gChart.update();

            toggleButton.textContent = '⏹';
            toggleButton.style.backgroundColor = '#f44336';
            isPlaying = true;
        } catch (error) {
            alert('Error: ' + error.message);
        }
    } else {
        oscillators.forEach(obj => obj.osc.stop());
        audioContext.close();
        toggleButton.textContent = '▶';
        toggleButton.style.backgroundColor = '#2196F3';
        isPlaying = false;
        gValueDisplay.textContent = '0.00 g';
    }
}

toggleButton.addEventListener('click', toggleSound);
