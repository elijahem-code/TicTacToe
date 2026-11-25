// Elijah Emmanuel

const boardCanvas = document.getElementById("board");
const ctx = boardCanvas.getContext("2d");

const statusElement = document.getElementById("status");
const roleElement = document.getElementById("role");

const spectatorsElement = document.getElementById("spectators");

const resetBtn = document.getElementById("resetBtn");
const joinBtn = document.getElementById("joinBtn");

const nameInput = document.getElementById("nameInput");
const passwordInput = document.getElementById("passwordInput");

const CELL_SIZE = 200;

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}//${window.location.host}`); // WEBSOCKET CONNECTION

let gameState = null;
let role = "spectator";

function drawGrid(){

    ctx.beginPath();

    ctx.moveTo(200,0);
    ctx.lineTo(200,600);

    ctx.moveTo(400,0);
    ctx.lineTo(400,600);

    ctx.moveTo(0,200);
    ctx.lineTo(600,200);

    ctx.moveTo(0,400);
    ctx.lineTo(600,400);

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;

    ctx.stroke();
}

// DRAW X
function drawX(x,y){

    ctx.beginPath();

    ctx.moveTo(x+20,y+20);
    ctx.lineTo(x+180,y+180);

    ctx.moveTo(x+180,y+20);
    ctx.lineTo(x+20,y+180);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 6;

    ctx.stroke();
}

// DRAW O
function drawO(x,y){

    ctx.beginPath();

    ctx.arc(
        x + 100,
        y + 100,
        80,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 6;

    ctx.stroke();
}

// DRAW BOARD
function drawBoard(){

    ctx.clearRect(0,0,600,600);

    drawGrid();

    gameState.board.forEach((value,index) => {

        const row = Math.floor(index/3);
        const col = index % 3;

        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        if(value === "X"){
            drawX(x,y);
        }
        else if(value === "O"){
            drawO(x,y);
        }
    });

    const boardFull = !gameState.board.includes("");

    if (gameState.winner) {

        statusElement.textContent =
            `Winner: ${gameState.winner}`;

    }
    else if (boardFull) {

        statusElement.textContent =
            "Tie Game! Press Reset.";

    }
    else {

        statusElement.textContent =
            `Turn: ${gameState.currentPlayer}`;
    }

boardCanvas.addEventListener("click", event => {

    if(role !== "X" && role !== "O"){
        return;
    }

    const rect =
    boardCanvas.getBoundingClientRect();

    const x =
    event.clientX - rect.left;

    const y =
    event.clientY - rect.top;

    const col = Math.floor(x / 200);
    const row = Math.floor(y / 200);

    const index = row * 3 + col;

    ws.send(JSON.stringify({
        type:"place",
        index
    }));
});

// MESSAGES
ws.onmessage = event => {

    const data =
    JSON.parse(event.data);

    if(data.type === "state"){

        gameState =
        data.gameState;

        drawBoard();
    }

    if(data.type === "role"){

        role = data.role;

        roleElement.textContent =
        `Logged in as ${data.name} (${role})`;
    }

    if (data.type === "spectators") {

        spectatorsElement.textContent = "Spectators: " + data.spectators.join(", ");
    }

    if(data.type === "error"){

        alert(data.message);
    }


};

// JOIN GAME
joinBtn.addEventListener("click", () => {

    ws.send(JSON.stringify({
        type: "login",
        name: nameInput.value.trim(),
        password: passwordInput.value
    }));
});

// RESET GAME
resetBtn.addEventListener("click", () => {

    ws.send(JSON.stringify({
        type: "reset"
    }));
});
