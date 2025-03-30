let audioContext;
let oscillators = [];
let isPlaying = false;
let filteredAccel = { x: 0, y: 0, z: 0 };
const alpha = 0.2;
let startTime;
let lastUpdate = 0;
const updateInterval = 50;

const toggleButton = document.getElementById('toggleButton');
const gValueDisplay = document.getElementById('gValue');
const frequencies = [293.7, 440, 659];

const chartConfig = {
    type: 'line',
    data: {
        datasets: [{
            label: 'Aceleración (g)',
            data: [],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                title: { display: true, text: 'Tiempo (s)' },
                min: 0,
                max: 5
            },
            y: {
                title: { display: true, text: 'Aceleración (g)' },
                min: 0,
                max: 3
            }
        },
        animation: false,
        responsive: true,
        maintainAspectRatio: false
    }
};

const gChart = new Chart(document.getElementById('gChart'), chartConfig);

function calculateGValue() {
    return Math.hypot(
        filteredAccel.x,
        filteredAccel.y,
        filteredAccel.z
    ) / 9.81;
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
        Math.min(Math.pow(Math.abs(filteredAccel.x / 9.81), 1.5), 2),
        Math.min(Math.pow(Math.abs(filteredAccel.y / 9.81), 1.5), 2),
        Math.min(Math.pow(Math.abs(filteredAccel.z / 9.81), 1.5), 2)
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

function updateChart(gValue, currentTime) {
    const dataset = gChart.data.datasets[0].data;
    dataset.push({ x: currentTime, y: gValue });
    
    const cutoff = currentTime - 5;
    while (dataset.length > 0 && dataset[0].x < cutoff) {
        dataset.shift();
    }
    
    if (dataset.length > 0) {
        gChart.options.scales.x.min = Math.max(dataset[0].x, 0);
        gChart.options.scales.x.max = dataset[0].x + 5;
    }
    
    gChart.update();
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
            
            filteredAccel = { x: 0, y: 0, z: 0 };
            
            window.addEventListener('devicemotion', (e) => {
                filteredAccel.x = alpha * e.acceleration.x + (1 - alpha) * filteredAccel.x;
                filteredAccel.y = alpha * e.acceleration.y + (1 - alpha) * filteredAccel.y;
                filteredAccel.z = alpha * e.acceleration.z + (1 - alpha) * filteredAccel.z;
                
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
