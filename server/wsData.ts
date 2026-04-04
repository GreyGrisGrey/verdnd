// Support class, used exclusively to keep track of which players are in which games and remove them as needed.
export class WebSocketData {
    id: string;
    name: string;
    auth: boolean;
    game: number;
    constructor() {
        this.id = '';
        this.name = '';
        this.auth = false;
        this.game = -1;
    }

    updateId(newId: string, newName: string) {
        this.name = newName;
        this.id = newId;
        this.auth = true;
    }

    addGame(newGame: number) {
        this.game = newGame;
    }
}
