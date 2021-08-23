
const init = document.querySelector('#init');
const game = document.querySelector('#game');

const baby = document.querySelector('#baby');
const scoreTarget = document.querySelector('#scoreTarget');
const scoreT = document.querySelector('#scoreTarget span');


const controller_area = document.querySelector('#controller_area');
const W = document.querySelector('#W');
const A = document.querySelector('#A');
const D = document.querySelector('#D');
const S = document.querySelector('#S');


init.style.display = "block";
game.style.display = "none";
baby.style.display = "none";
scoreTarget.style.display = "none";
controller_area.style.display = "none";


//CONSTANTES GLOBALES
const state_running = 1; //Estado de inicio
const state_losing = 2; //Estado de perdida

const square_size = 10; //Tamaño de cada cuadrado dibujado en px
const board_width = 35; //Ancho virtual del espacio de juego (cuantos cuadrados entran)
const board_height = 35; //Alto virtual del espacio de juego (cuantos cuadrados entran)
const grow_scale = 3; //Cuantos cuadros crece la serpiente al comer una presa

const directions_maps = { //Mapeado de teclas con dirección de la serpiente
    'A': [-1, 0],
    'D': [1, 0],
    'S': [0, -1],
    'W': [0, 1],
    'a': [-1, 0],
    'd': [1, 0],
    's': [0, 1],
    'w': [0, -1],
}

//VARIABLES
var TICK = 100; //Intervalo de tiempo para movimiento de la serpiente
var score = 0;
scoreT.textContent = score;



//LÓGICA
let state = { //Variable que contiene la lógica del juego
    canvas: null, //Contiene la referencia al elemento html
    context: null, //Contiene un derivado de la variable canvas
    snake: [{ x: 0, y: 0 }], //Contiene las cordenadas donde se encuentra la serpiente
    direction: { x: 1, y: 0 }, //La dirección que lleva la serpiente
    growing: 0, //Presas en el juego
    prey: { x: 0, y: 0 }, //Posición de la presa
    runState: state_running, //Estados de juego
};



//FUNCIONES
function randomXY() { //Función para crear posiciones aleatorias
    return { //Devuelve un objeto con X Y aleatorios
        x: parseInt(Math.random() * board_width),
        y: parseInt(Math.random() * board_height),
    };
}

function tick() { //Función de intervalos de juego
    const head = state.snake[0];
    const dx = state.direction.x;
    const dy = state.direction.y;

    const highestIndex = state.snake.length - 1; //Indice más alto de la serpiente
    let interval = TICK;

    let tail = {};
    Object.assign(tail, //Copiamos todas las propiedades del último elemento de la serpiente a "tail"
        state.snake[state.snake.length - 1]);


    let didScore = ( //PRESA CAZADA
        head.x === state.prey.x
        && head.y === state.prey.y
    );


    if (state.runState === state_running) { //DESPLAZAMIENTO DE LA SERPIENTE
        for (let idx = highestIndex; idx > -1; idx--) { //Recorrido del indice más alto al más bajo
            const sq = state.snake[idx]; //El indice 0 es la cabeza de la serpiente

            if (idx === 0) { //Condicional para la cabeza de la serpiente
                sq.x += dx;
                sq.y += dy;
            } else { //Condicional para el resto del cuerpo de la serpiente
                sq.x = state.snake[idx - 1].x;
                sq.y = state.snake[idx - 1].y;
            }
        }
    } else if (state.runState === state_losing) { //DESAPARICIÓN AL PERDER
        interval = 10;
        score = 0;
        TICK = 100;
        scoreT.textContent = score;
        baby.style.display = "block";
        scoreTarget.style.display = "none";

        if (state.snake.length > 0) { //Si hay por lo menos un cuadrado de serpiente
            state.snake.splice(0, 1); //Borrado de cuerpo
        }
        //REINICIO
        if (state.snake.length === 0) { //Cuando el tamaño de la serpiente sea 0
            state.runState = state_running; //Reinicio del juego
            state.snake.push(randomXY()); //Creación de serpiente
            state.prey = randomXY(); //Creación de presa
        }
    }

    if (detectCollision()) { //PIERDES LA PARTIDA
        state.runState = state_losing;
        state.growing = 0;
        alert("HAS PERDIDO")
    }

    if (didScore) { //Reasignación X Y de una presa nueva
        state.growing += grow_scale;
        state.prey = randomXY();
        TICK -= 2; //Cada vez que atrapamos una presa aumenta la velocidad de la serpiente
    }

    if (state.snake.length > 1) {
        baby.style.display = "none";
        scoreTarget.style.display = "block";
    }

    if (didScore && state.snake.length >= 4) { //Reasignación X Y de una presa nueva
        score += 1;
        scoreT.textContent = score;
    }

    if (state.growing > 0) {
        state.snake.push(tail); //Añadimos la información de la cola
        state.growing -= 1;
    }

    requestAnimationFrame(draw); //Función de dibujado
    setTimeout(tick, interval);
}


function detectCollision() { //COLISIONES
    const head = state.snake[0];

    if (head.x < 0
        || head.x >= board_width
        || head.y >= board_height
        || head.y < 0) { //Colisión con los bordes
        return true;
    }

    for (var idx = 1; idx < state.snake.length; idx++) { //Recorremos cada punto de la serpiente
        const sq = state.snake[idx];
        if (sq.x === head.x && sq.y == head.y) { //Condición de colisionamiento con el cuerpo
            return true;
        }
    }
    return false;
}


//DIBUJO
function drawPixel(color, x, y) { //Dibujar cada uno de los cuadrados de la serpiente o presa
    state.context.fillStyle = color; //Cambio el estilo de dibujo
    state.context.fillRect( //Crecimiento de la serpiente
        x * square_size,
        y * square_size,
        square_size,
        square_size
    );
}

function draw() {
    state.context.clearRect(0, 0, 500, 500); //Borrado del contexto de dibujo

    for (var idx = 0; idx < state.snake.length; idx++) { //Recorremos cada punto de la serpiente
        const { x, y } = state.snake[idx] //Tomamos los valores X Y
        drawPixel('#000', x, y) //Le damos un color a cada elemento del bucle
    }

    const { x, y } = state.prey; //Dibujamos a la presa
    drawPixel('brown', x, y);
}




//MOTOR DEL JUEGO

function start() { //Iniciamos el juego

    init.style.display = "none";
    game.style.display = "block";
    scoreTarget.style.display = "block";
    controller_area.style.display = "flex";

    state.canvas = document.querySelector('#game'); //Referencias html
    state.context = state.canvas.getContext('2d'); //Referencias contexto de dibujo

    window.onkeydown = function (e) { //Mecanismos de presión para teclas
        const direction = directions_maps[e.key]; //Constante global (W, A, S, D)

        if (direction) { //Si tenemos dirección, asignamos el rumbo

            const [x, y] = direction; //Primero comprobamos si el rumbo no es el contrario
            if (-x !== state.direction.x
                && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }

    W.onclick = function () {
        const direction = [0, -1];

        if (direction) { //Si tenemos dirección, asignamos el rumbo

            const [x, y] = direction; //Primero comprobamos si el rumbo no es el contrario
            if (-x !== state.direction.x
                && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }
    A.onclick = function () {
        const direction = [-1, 0];

        if (direction) { //Si tenemos dirección, asignamos el rumbo

            const [x, y] = direction; //Primero comprobamos si el rumbo no es el contrario
            if (-x !== state.direction.x
                && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }
    D.onclick = function () {
        const direction = [1, 0];

        if (direction) { //Si tenemos dirección, asignamos el rumbo

            const [x, y] = direction; //Primero comprobamos si el rumbo no es el contrario
            if (-x !== state.direction.x
                && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }
    S.onclick = function () {
        const direction = [0, 1];

        if (direction) { //Si tenemos dirección, asignamos el rumbo

            const [x, y] = direction; //Primero comprobamos si el rumbo no es el contrario
            if (-x !== state.direction.x
                && -y !== state.direction.y) {
                state.direction.x = x;
                state.direction.y = y;
            }
        }
    }

    tick(); //Pasamos el intervalo al siguente punto
};

