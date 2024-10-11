// script.js

// Variables de configuración
const Fmin = 200; // Frecuencia mínima en Hz
const Fmax = 1000; // Frecuencia máxima en Hz
const Gmax = 3; // Constante para intensidad
const Vmax = 1; // Valor máximo de volumen (puede ajustarse)

// Cálculo de la constante M para que F = M * X esté en [Fmin, Fmax]
const M = (Fmax - Fmin);

// Selección de elementos del DOM
const slider = document.querySelector('.slider');
const sliderButton = document.getElementById('sliderButton');
const requestPermissionButton = document.getElementById('requestPermissionButton');

// Variables para el manejo del arrastre
let isDragging = false;
let sliderRect;
let audioCtx;
let gainNode;
let oscillators = [];

// Función para actualizar el rectángulo de la barra deslizante
function updateSliderRect() {
    sliderRect = slider.getBoundingClientRect();
}

// Inicializar el rectángulo
window.addEventListener('resize', updateSliderRect);
updateSliderRect();

// Función para solicitar permisos de acelerómetro en iOS 13+
function requestDeviceMotionPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        requestPermissionButton.style.display = 'block';
        requestPermissionButton.addEventListener('click', () => {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        iniciarAcelerometro();
                        requestPermissionButton.style.display = 'none';
                    } else {
                        alert('Permiso denegado para acceder al acelerómetro.');
                    }
                })
                .catch(console.error);
        });
    } else {
        // Navegadores que no requieren permisos explícitos
        iniciarAcelerometro();
    }
}

// Función para iniciar el acelerómetro
function iniciarAcelerometro() {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleDeviceMotion, true);
    } else {
        console.warn('DeviceMotionEvent no es soportado en este dispositivo.');
    }
}

// Inicializar la solicitud de permisos si es necesario
requestDeviceMotionPermission();

// Función para manejar los datos del acelerómetro
function handleDeviceMotion(event) {
    let G = event.accelerationIncludingGravity.y; // Puedes cambiar el eje según necesidad
    let TgF = Math.abs(G) < 0.1 ? 0 : Math.abs(G);
    let V = (TgF / Gmax) * Vmax;
    V = Math.min(Math.max(V, 0), Vmax);
    if (gainNode) {
        gainNode.gain.setTargetAtTime(V, audioCtx.currentTime, 0.01);
    }
}

// Función para iniciar el contexto de audio y generar los osciladores
function iniciarAudio(F) {
    if (audioCtx) {
        // Cerrar el contexto anterior si existe
        audioCtx.close();
    }
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime); // Inicialmente silencioso
    gainNode.connect(audioCtx.destination);

    // Definir las frecuencias y sus intensidades
    const frequencies = [
        { freq: F, gain: 1 },
        { freq: F + 1, gain: 0.5 },
        { freq: F + 2, gain: 0.333 },
        { freq: F - 1, gain: 0.5 },
        { freq: F - 2, gain: 0.333 }
    ];

    // Crear y conectar osciladores
    frequencies.forEach(item => {
        let osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(item.freq, audioCtx.currentTime);

        let oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(item.gain, audioCtx.currentTime);

        osc.connect(oscGain).connect(gainNode);
        osc.start();
        oscillators.push(osc);
    });
}

// Función para actualizar las frecuencias de los osciladores
function actualizarFrecuencias(F) {
    oscillators.forEach((osc, index) => {
        let freq = 0;
        switch(index) {
            case 0:
                freq = F;
                break;
            case 1:
                freq = F + 1;
                break;
            case 2:
                freq = F + 2;
                break;
            case 3:
                freq = F - 1;
                break;
            case 4:
                freq = F - 2;
                break;
            default:
                freq = F;
        }
        if (freq > 0) { // Evitar frecuencias negativas
            osc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.01);
        }
    });
}

// Función para detener los osciladores y cerrar el contexto de audio
function detenerAudio() {
    oscillators.forEach(osc => osc.stop());
    oscillators = [];
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
}

// Función para obtener la posición X normalizada (0 a 1)
function getNormalizedX(clientX) {
    let relativeX = clientX - sliderRect.left;
    let normalizedX = relativeX / sliderRect.width;
    normalizedX = Math.min(Math.max(normalizedX, 0), 1);
    return normalizedX;
}

// Manejar el inicio del arrastre
sliderButton.addEventListener('mousedown', startDrag);
sliderButton.addEventListener('touchstart', startDrag);

// Función para iniciar el arrastre
function startDrag(event) {
    event.preventDefault();
    isDragging = true;
    updateSliderRect();
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    // Obtener la posición inicial
    let clientX;
    if (event.type.startsWith('touch')) {
        clientX = event.touches[0].clientX;
    } else {
        clientX = event.clientX;
    }
    let normalizedX = getNormalizedX(clientX);
    let F = Fmin + M * normalizedX;
    iniciarAudio(F);
    actualizarFrecuencias(F);
}

// Manejar el arrastre
function onDrag(event) {
    if (!isDragging) return;
    event.preventDefault();
    let clientX;
    if (event.type.startsWith('touch')) {
        clientX = event.touches[0].clientX;
    } else {
        clientX = event.clientX;
    }
    let normalizedX = getNormalizedX(clientX);
    let percent = normalizedX * 100;
    sliderButton.style.left = `${percent}%`;

    // Calcular F
    let F = Fmin + M * normalizedX;

    // Actualizar frecuencias de los osciladores
    if (audioCtx && audioCtx.state !== 'closed') {
        actualizarFrecuencias(F);
    }
}

// Finalizar el arrastre
function endDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);

    // Animar el botón de vuelta al centro
    sliderButton.style.transition = 'left 0.3s';
    sliderButton.style.left = '50%';
    setTimeout(() => {
        sliderButton.style.transition = '';
        // Detener el sonido
        detenerAudio();
    }, 300);
}

// Evitar que el botón vuelva al centro si aún está siendo arrastrado
sliderButton.addEventListener('dragstart', (e) => e.preventDefault());
