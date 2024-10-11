// script.js

document.addEventListener('DOMContentLoaded', () => {
    const soundButton = document.getElementById('soundButton');
    const slider = document.getElementById('slider');

    // Parámetros de frecuencia
    const Fmin = 200; // Hz
    const Fmax = 10000; // Hz

    // Parámetros de volumen
    const Gmax = 3;
    const Vmax = 1; // Ganancia máxima

    let isPressed = false;
    let audioContext;
    let gainNode;
    let oscillatorNodes = [];

    // Inicializar AudioContext
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.gain.value = 0;
            gainNode.connect(audioContext.destination);
        }
    }

    // Crear osciladores con armónicos
    function createOscillators(F) {
        // Detener y limpiar osciladores existentes
        oscillatorNodes.forEach(osc => osc.stop());
        oscillatorNodes = [];

        // Función para crear un oscilador
        const createOsc = (frequency, gain) => {
            const osc = audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = frequency;
            const oscGain = audioContext.createGain();
            oscGain.gain.value = gain;
            osc.connect(oscGain).connect(gainNode);
            osc.start();
            return osc;
        };

        // Oscilador fundamental
        oscillatorNodes.push(createOsc(F, 1));

        // Armónicos superiores
        if (F + 1 <= Fmax) oscillatorNodes.push(createOsc(F + 1, 0.5));
        if (F + 2 <= Fmax) oscillatorNodes.push(createOsc(F + 2, 1/3));

        // Armónicos inferiores
        if (F - 1 >= Fmin) oscillatorNodes.push(createOsc(F - 1, 0.5));
        if (F - 2 >= Fmin) oscillatorNodes.push(createOsc(F - 2, 1/3));
    }

    // Calcular frecuencia basada en la posición del botón
    function calculateFrequency(x) {
        const sliderWidth = slider.clientWidth - soundButton.clientWidth;
        const F = Fmin + ((Fmax - Fmin) * (x / sliderWidth));
        return Math.min(Math.max(F, Fmin), Fmax);
    }

    // Calcular volumen basado en aceleración total
    function calculateVolume(TgF) {
        const V = (Math.abs(TgF) / Gmax) * Vmax;
        return Math.min(Math.max(V, 0), Vmax);
    }

    // Manejar eventos del acelerómetro
    function handleDeviceMotion(event) {
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration) {
            const TgF = Math.sqrt(
                acceleration.x ** 2 +
                acceleration.y ** 2 +
                acceleration.z ** 2
            );
            gainNode.gain.value = calculateVolume(TgF);
        }
    }

    // Iniciar escucha del acelerómetro
    function startListeningAccelerometer() {
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', handleDeviceMotion);
        } else {
            alert('Acelerómetro no soportado en este dispositivo.');
        }
    }

    // Detener escucha del acelerómetro
    function stopListeningAccelerometer() {
        window.removeEventListener('devicemotion', handleDeviceMotion);
    }

    // Manejar el inicio de la presión del botón
    function onPressStart(event) {
        event.preventDefault();
        if (!isPressed) {
            isPressed = true;
            initAudio();
            startListeningAccelerometer();

            // Obtener la posición actual del botón en píxeles
            const leftPx = parseFloat(soundButton.style.left);
            const frequency = calculateFrequency(leftPx + (soundButton.clientWidth / 2));
            createOscillators(frequency);
        }
    }

    // Manejar el fin de la presión del botón
    function onPressEnd(event) {
        if (isPressed) {
            isPressed = false;
            oscillatorNodes.forEach(osc => osc.stop());
            oscillatorNodes = [];
            gainNode.gain.value = 0;
            stopListeningAccelerometer();

            // Volver el botón a la posición inicial (centro)
            soundButton.style.left = `calc(50% - ${soundButton.clientWidth / 2}px)`;
        }
    }

    // Manejar el movimiento del botón
    function onMove(event) {
        if (isPressed) {
            let clientX;
            if (event.type.startsWith('touch')) {
                if (event.touches.length === 0) return;
                clientX = event.touches[0].clientX;
            } else {
                clientX = event.clientX;
            }

            const sliderRect = slider.getBoundingClientRect();
            let newX = clientX - sliderRect.left - (soundButton.clientWidth / 2);

            // Limitar el movimiento dentro de la barra deslizante
            newX = Math.max(0, Math.min(newX, slider.clientWidth - soundButton.clientWidth));

            soundButton.style.left = `${newX}px`;

            // Actualizar la frecuencia
            const F = calculateFrequency(newX);
            createOscillators(F);
        }
    }

    // Añadir eventos de interacción
    soundButton.addEventListener('mousedown', onPressStart);
    soundButton.addEventListener('touchstart', onPressStart);

    document.addEventListener('mouseup', onPressEnd);
    document.addEventListener('touchend', onPressEnd);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
});
