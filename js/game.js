// Obtener el canvas y su contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables del juego
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let izquierdaPresionada = false;
let derechaPresionada = false;
let disparoPresionado = false;
let balas = [];
let enemigos = [];
let powerUps = [];
let puntos = 0;
let vidas = 3;
let nivel = 1;
let juegoTerminado = false;
let juegoPausado = false;  // Variable para controlar si el juego está en pausa
let velocidadEnemigos = 2;
let probabilidadAparicionEnemigos = 0.02;
let probabilidadAparicionPowerUp = 0.005;

// Cargar los sonidos
const sonidoDisparo = new Audio('sounds/disparo.mp3');
const sonidoExplosion = new Audio('sounds/explosion.mp3');

// Cargar imágenes de sprites
const imagenJugador = new Image();
imagenJugador.src = 'img/jugador.png';

const imagenEnemigo = new Image();
imagenEnemigo.src = 'img/enemigo.png';

// Jugador (avión)
const jugador = {
    x: canvasWidth / 2 - 20,
    y: canvasHeight - 50,
    width: 60,
    height: 60,
    velocidad: 5
};

// Función para pausar o reanudar el juego
function pausarReanudarJuego() {
    juegoPausado = !juegoPausado;
    if (!juegoPausado) {
        actualizar();  // Si se reanuda, continuar el ciclo del juego
    }
}

// Función para mostrar el mensaje de pausa
function mostrarPausa() {
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText('Juego Pausado', canvasWidth / 2 - 150, canvasHeight / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Presiona "P" para reanudar', canvasWidth / 2 - 120, canvasHeight / 2 + 50);
}

// Clase Bala
class Bala {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.velocidad = 7;
    }

    dibujar() {
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    mover() {
        this.y -= this.velocidad;
    }

    fueraDePantalla() {
        return this.y + this.height < 0;
    }
}

// Clase Enemigo
class Enemigo {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 50;
        this.velocidad = velocidadEnemigos;
    }

    dibujar() {
        ctx.drawImage(imagenEnemigo, this.x, this.y, this.width, this.height);
    }

    mover() {
        this.y += this.velocidad;
    }

    fueraDePantalla() {
        return this.y > canvasHeight;
    }
}

// Clase Power-Up (vidas adicionales)
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.velocidad = 2;
    }

    dibujar() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    mover() {
        this.y += this.velocidad;
    }

    fueraDePantalla() {
        return this.y > canvasHeight;
    }
}

// Controlar el movimiento del jugador
function moverJugador() {
    if (izquierdaPresionada && jugador.x > 0) {
        jugador.x -= jugador.velocidad;
    }
    if (derechaPresionada && jugador.x + jugador.width < canvasWidth) {
        jugador.x += jugador.velocidad;
    }
}

// Crear balas
function crearBala() {
    const bala = new Bala(jugador.x + jugador.width / 2 - 2.5, jugador.y);
    balas.push(bala);

    // Reproducir el sonido de disparo
    sonidoDisparo.currentTime = 0;
    sonidoDisparo.play();
}

// Crear enemigos aleatoriamente
function crearEnemigo() {
    const x = Math.random() * (canvasWidth - 40);
    const enemigo = new Enemigo(x, -30);
    enemigos.push(enemigo);
}

// Crear power-ups aleatoriamente
function crearPowerUp() {
    const x = Math.random() * (canvasWidth - 30);
    const powerUp = new PowerUp(x, -30);
    powerUps.push(powerUp);
}

// Detectar colisiones entre balas y enemigos
function detectarColisiones() {
    balas.forEach((bala, balaIndex) => {
        enemigos.forEach((enemigo, enemigoIndex) => {
            if (bala.x < enemigo.x + enemigo.width &&
                bala.x + bala.width > enemigo.x &&
                bala.y < enemigo.y + enemigo.height &&
                bala.y + bala.height > enemigo.y) {
                enemigos.splice(enemigoIndex, 1);
                balas.splice(balaIndex, 1);
                puntos += 10;

                sonidoExplosion.currentTime = 0;
                sonidoExplosion.play();

                if (puntos % 100 === 0) {
                    subirDeNivel();
                }
            }
        });
    });
}

// Detectar colisiones entre el jugador y los power-ups
function detectarColisionPowerUps() {
    powerUps.forEach((powerUp, index) => {
        if (jugador.x < powerUp.x + powerUp.width &&
            jugador.x + jugador.width > powerUp.x &&
            jugador.y < powerUp.y + powerUp.height &&
            jugador.y + jugador.height > powerUp.y) {
            vidas += 1;
            powerUps.splice(index, 1);
        }
    });
}

// Subir de nivel: Incrementar dificultad
function subirDeNivel() {
    nivel += 1;
    velocidadEnemigos += 0.5;
    probabilidadAparicionEnemigos += 0.01;
}

// Dibujar el jugador
function dibujarJugador() {
    ctx.drawImage(imagenJugador, jugador.x, jugador.y, jugador.width, jugador.height);
}

// Dibujar puntos, vidas y nivel
function dibujarPuntosVidasYNivel() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Puntos: ' + puntos, 10, 30);
    ctx.fillText('Vidas: ' + vidas, canvasWidth - 100, 30);
    ctx.fillText('Nivel: ' + nivel, canvasWidth / 2 - 50, 30);
}

// Mostrar Game Over
function mostrarGameOver() {
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText('GAME OVER', canvasWidth / 2 - 150, canvasHeight / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Presiona ENTER para reiniciar', canvasWidth / 2 - 130, canvasHeight / 2 + 50);
}

// Función para reiniciar el juego
function reiniciarJuego() {
    puntos = 0;
    vidas = 3;
    nivel = 1;
    balas = [];
    enemigos = [];
    powerUps = [];
    juegoTerminado = false;
    velocidadEnemigos = 2;
    probabilidadAparicionEnemigos = 0.02;

    jugador.x = canvasWidth / 2 - jugador.width / 2;
    jugador.y = canvasHeight - 50;

    actualizar();
}

// Actualizar el juego
function actualizar() {
    if (juegoTerminado) {
        mostrarGameOver();
        return;
    }

    if (juegoPausado) {
        mostrarPausa();
        return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    moverJugador();
    dibujarJugador();

    balas.forEach((bala, index) => {
        bala.mover();
        bala.dibujar();

        if (bala.fueraDePantalla()) {
            balas.splice(index, 1);
        }
    });

    if (Math.random() < probabilidadAparicionEnemigos) {
        crearEnemigo();
    }

    if (Math.random() < probabilidadAparicionPowerUp) {
        crearPowerUp();
    }

    enemigos.forEach((enemigo, index) => {
        enemigo.mover();
        enemigo.dibujar();

        if (enemigo.fueraDePantalla()) {
            enemigos.splice(index, 1);
            vidas -= 1;
            if (vidas <= 0) {
                juegoTerminado = true;
            }
        }
    });

    powerUps.forEach((powerUp, index) => {
        powerUp.mover();
        powerUp.dibujar();

        if (powerUp.fueraDePantalla()) {
            powerUps.splice(index, 1);
        }
    });

    detectarColisiones();
    detectarColisionPowerUps();
    dibujarPuntosVidasYNivel();

    requestAnimationFrame(actualizar);
}

// Eventos de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') izquierdaPresionada = true;
    if (e.key === 'ArrowRight') derechaPresionada = true;
    if (e.key === ' ') {
        disparoPresionado = true;
        crearBala();
    }
    if (e.key === 'Enter' && juegoTerminado) {
        reiniciarJuego();
    }
    if (e.key === 'p' || e.key === 'P') {
        pausarReanudarJuego();  // Pausar o reanudar el juego al presionar "P"
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') izquierdaPresionada = false;
    if (e.key === 'ArrowRight') derechaPresionada = false;
    if (e.key === ' ') disparoPresionado = false;
});

// Iniciar el juego
actualizar();