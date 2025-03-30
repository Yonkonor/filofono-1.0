// ... (código anterior permanece igual)

async function toggleSound() {
    if (!isPlaying) {
        try {
            // Bloquear orientación al iniciar
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('portrait');
            }

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
                const dt = (now - lastTimestamp) / 1000;
                
                velocity.x = alpha * (velocity.x + e.acceleration.x * dt) + (1 - alpha) * velocity.x;
                velocity.y = alpha * (velocity.y + e.acceleration.y * dt) + (1 - alpha) * velocity.y;
                velocity.z = alpha * (velocity.z + e.acceleration.z * dt) + (1 - alpha) * velocity.z;
                
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
        // Desbloquear orientación al detener
        if (screen.orientation && screen.orientation.unlock) {
            await screen.orientation.unlock();
        }

        oscillators.forEach(obj => obj.osc.stop());
        audioContext.close();
        toggleButton.textContent = '▶';
        toggleButton.style.backgroundColor = '#2196F3';
        isPlaying = false;
        gValueDisplay.textContent = '0.00 g';
    }
}

// ... (resto del código permanece igual)
