import { getWsUrl } from './runtimeConfig.ts';

const inputs = document.getElementById('inputs');
const userId = document.getElementById('userId') as HTMLInputElement | null;
const userPass = document.getElementById('userPass') as HTMLInputElement | null;
const userName = document.getElementById('userName') as HTMLInputElement | null;
const submit = document.getElementById('submit');

if (!inputs || !userId || !userPass || !userName || !submit) {
    throw new Error('Registration page expected elements are missing.');
}

const ws = new WebSocket(getWsUrl());

inputs.style.left = `${(window.innerWidth - 350) / 2}px`;
inputs.style.bottom = `${(window.innerHeight - 430) / 2}px`;

ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data) as { entity?: string; accepted?: boolean };
    if (message.entity === 'NAME' && message.accepted) {
        localStorage.pass = userPass.value;
        localStorage.id = userId.value;
        localStorage.name = userName.value;
        alert('Successfully signed in/registered with current credentials.');
        window.location.pathname = '/';
    } else if (message.entity === 'NAME' && !message.accepted) {
        alert('Could not sign in/register with those credentials');
    }
});

submit.addEventListener('click', () => {
    if (ws.readyState === WebSocket.CONNECTING) {
        alert('Please wait a moment for websocket connection.');
        return;
    }
    ws.send(
        JSON.stringify({
            userId: userId.value,
            event: {
                entity: 'NAME',
                pass: userPass.value,
                name: userName.value,
                id: userId.value,
            },
            gameId: -1,
            handler: 'META',
        }),
    );
});
