import { getWsUrl } from './runtimeConfig.ts';

interface NameAcceptedMessage {
    entity?: string;
    accepted?: boolean;
}

interface NewGameMessage {
    newId?: number;
}

interface GameListMessage {
    list?: number[];
}

type LandingMessage = NameAcceptedMessage & NewGameMessage & GameListMessage;

const gameContainer = document.getElementById('gameContainer');
const newGame = document.getElementById('newGame');

if (!gameContainer || !newGame) {
    throw new Error('Landing page expected elements are missing.');
}

const ws = new WebSocket(getWsUrl());

async function signIn() {
    while (ws.readyState === WebSocket.CONNECTING) {
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    if (localStorage.id) {
        ws.send(
            JSON.stringify({
                userId: localStorage.id,
                event: {
                    entity: 'NAME',
                    pass: localStorage.pass,
                    name: localStorage.name,
                    id: localStorage.id,
                },
                gameId: -1,
                handler: 'META',
            }),
        );
    }
}

function requestGames() {
    ws.send(
        JSON.stringify({
            userId: localStorage.id,
            event: {
                entity: 'META',
                action: 'ENUMERATE',
            },
            gameId: -3,
            handler: 'META',
        }),
    );
}

ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data) as LandingMessage;
    if (message.entity === 'NAME' && message.accepted) {
        requestGames();
    }
    if (message.newId) {
        window.location.pathname = `/game/${message.newId}`;
        return;
    }
    if (message.list) {
        gameContainer.innerHTML = '';
        for (const val of message.list) {
            const newBox = document.createElement('div');
            const newText = document.createElement('a');
            newText.href = `/game/${val.toString()}`;
            newText.innerText = `Game #${val.toString()}`;
            newBox.append(newText);
            newBox.style.position = 'relative';
            newBox.style.left = '20px';
            gameContainer.append(newBox);
        }
    }
});

newGame.addEventListener('click', () => {
    if (ws.readyState === WebSocket.CONNECTING) {
        alert('Please wait a moment for websocket connection.');
        return;
    }
    if (localStorage.id) {
        ws.send(
            JSON.stringify({
                userId: localStorage.id,
                event: {
                    entity: 'META',
                    action: 'CREATE',
                },
                gameId: -2,
                handler: 'META',
            }),
        );
    }
});

signIn();
