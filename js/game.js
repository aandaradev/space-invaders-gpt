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
let powerUps = [];  // Array para almacenar los power-ups
let puntos = 0;
let vidas = 3;  // Contador de vidas
let nivel = 1;  // Añadimos un sistema de niveles
let juegoTerminado = false;  // Variable para controlar si el juego ha terminado
let velocidadEnemigos = 2;  // Velocidad base de los enemigos
let probabilidadAparicionEnemigos = 0.02;  // Probabilidad base de aparición de enemigos
let probabilidadAparicionPowerUp = 0.005;  // Probabilidad base de aparición de power-ups

// Jugador (avión)
const jugador = {
    x: canvasWidth / 2 - 20,
    y: canvasHeight - 50,
    width: 40,
    height: 40,
    velocidad: 5
};

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
        this.width = 40;
        this.height = 30;
        this.velocidad = velocidadEnemigos;  // Usamos la velocidad de los enemigos según el nivel
    }

    dibujar() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
        this.velocidad = 2;  // Velocidad de los power-ups
    }

    dibujar() {
        ctx.fillStyle = 'yellow';  // Color amarillo para los power-ups
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
                // Colisión detectada, eliminar enemigo y bala
                enemigos.splice(enemigoIndex, 1);
                balas.splice(balaIndex, 1);
                puntos += 10;

                // Incrementar el nivel cada 100 puntos
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
            // El jugador ha recogido un power-up, gana una vida
            vidas += 1;
            powerUps.splice(index, 1);  // Eliminar el power-up
        }
    });
}

// Subir de nivel: Incrementar dificultad
function subirDeNivel() {
    nivel += 1;
    velocidadEnemigos += 0.5;  // Aumentar la velocidad de los enemigos con cada nivel
    probabilidadAparicionEnemigos += 0.01;  // Aumentar la probabilidad de aparición de enemigos
}

// Dibujar el jugador
function dibujarJugador() {
    ctx.fillStyle = 'white';
    ctx.fillRect(jugador.x, jugador.y, jugador.width, jugador.height);
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
    // Restablecer variables del juego
    puntos = 0;
    vidas = 3;
    nivel = 1;
    balas = [];
    enemigos = [];
    powerUps = [];  // Reiniciar los power-ups
    juegoTerminado = false;
    velocidadEnemigos = 2;  // Restablecer la velocidad inicial
    probabilidadAparicionEnemigos = 0.02;  // Restablecer la probabilidad inicial

    // Restablecer posición del jugador
    jugador.x = canvasWidth / 2 - jugador.width / 2;
    jugador.y = canvasHeight - 50;

    // Reiniciar el ciclo del juego
    actualizar();
}

// Actualizar el juego
function actualizar() {
    if (juegoTerminado) {
        mostrarGameOver();
        return;  // Detener el juego si ha terminado
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    moverJugador();
    dibujarJugador();

    // Mover y dibujar balas
    balas.forEach((bala, index) => {
        bala.mover();
        bala.dibujar();

        if (bala.fueraDePantalla()) {
            balas.splice(index, 1);
        }
    });

    // Crear enemigos periódicamente según la probabilidad
    if (Math.random() < probabilidadAparicionEnemigos) {
        crearEnemigo();
    }

    // Crear power-ups periódicamente según la probabilidad
    if (Math.random() < probabilidadAparicionPowerUp) {
        crearPowerUp();
    }

    // Mover y dibujar enemigos
    enemigos.forEach((enemigo, index) => {
        enemigo.mover();
        enemigo.dibujar();

        if (enemigo.fueraDePantalla()) {
            enemigos.splice(index, 1);
            vidas -= 1;  // El jugador pierde una vida
            if (vidas <= 0) {
                juegoTerminado = true;
            }
        }
    });

    // Mover y dibujar power-ups
    powerUps.forEach((powerUp, index) => {
        powerUp.mover();
        powerUp.dibujar();

        if (powerUp.fueraDePantalla()) {
            powerUps.splice(index, 1);  // Eliminar power-up si sale de la pantalla
        }
    });

    detectarColisiones();
    detectarColisionPowerUps();  // Detectar si el jugador recoge un power-up
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
        // Si el juego ha terminado, reiniciarlo cuando se presiona Enter
        reiniciarJuego();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') izquierdaPresionada = false;
    if (e.key === 'ArrowRight') derechaPresionada = false;
    if (e.key === ' ') disparoPresionado = false;
});

// Iniciar el juego
actualizar();