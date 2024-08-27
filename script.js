document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('slider');
    const button = document.getElementById('button');

    let isPressed = false;
    let audioContext;
    let oscillator;
    let gainNode;
    const Fmin = 200;
    const Fmax = 10000;
    const Vmax = 1;
    const Gmax = 3;
    
    // Posición inicial del botón
    let initialX = (slider.offsetWidth - button.offsetWidth) / 2;
    button.style.left = `${initialX}px`;

    // Iniciar sonido cuando se presiona el botón
    button.addEventListener('mousedown', () => {
        isPressed = true;
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
    });

    // Detener sonido cuando se suelta el botón
    button.addEventListener('mouseup', () => {
        isPressed = false;
        oscillator.stop();
        button.style.left = `${initialX}px`; // Volver a la posición inicial
    });

    // Desplazamiento del botón (slider) y ajuste de la frecuencia
    button.addEventListener('mousemove', (e) => {
        if (isPressed) {
            let rect = slider.getBoundingClientRect();
            let x = e.clientX - rect.left - button.offsetWidth / 2;
            x = Math.max(0, Math.min(x, slider.offsetWidth - button.offsetWidth));
            button.style.left = `${x}px`;

            let relativeX = x / (slider.offsetWidth - button.offsetWidth);
            let frequency = Fmin + relativeX * (Fmax - Fmin);
            oscillator.frequency.value = frequency;
        }
    });

    // Acelerómetro para controlar el volumen
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            let acceleration = event.accelerationIncludingGravity;
            let totalGForce = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2);
            let volume = Math.abs(totalGForce / Gmax) * Vmax;
            gainNode.gain.value = Math.min(volume, Vmax); // Limitar al volumen máximo
        });
    } else {
        console.log("El acelerómetro no es compatible en este dispositivo.");
    }
});
