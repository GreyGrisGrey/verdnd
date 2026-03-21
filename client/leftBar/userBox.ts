import { getRequiredElement } from '../dom.ts';
const showUserButton = getRequiredElement('showUser', HTMLButtonElement);
const userContainer = getRequiredElement('userContainer', HTMLElement);

export interface UserData {
    id: string;
    name: string;
    gm: boolean;
}

export class UserBox {
    active: boolean;
    userMap: Map<string, UserData>;
    elements: Map<string, HTMLElement>;

    constructor() {
        this.active = true;
        this.userMap = new Map();
        this.elements = new Map();
        this.setUpButton();
    }

    async setUpButton() {
        showUserButton.addEventListener('click', () => {
            userContainer.style.visibility = this.active ? 'inherit' : 'hidden';
            userContainer.style.pointerEvents = this.active ? 'auto' : 'none';
            this.active = !this.active;
        });
    }

    addUser(id: string, name: string, gm: boolean) {
        if (this.userMap.has(id)) {
            this.removeUser(id);
        }
        const newUser = document.createElement('p');
        this.userMap.set(id, { id: id, name: name, gm: gm });
        if (id === name) {
            newUser.innerText = `${id}  ${gm ? 'GM' : ''}`;
        } else {
            newUser.innerText = `${name} (${id})  ${gm ? 'GM' : ''}`;
        }
        newUser.style.position = 'relative';
        newUser.style.left = '10px';
        this.elements.set(id, newUser);
        userContainer.append(newUser);
    }

    removeUser(id: string) {
        this.userMap.delete(id);
        this.elements.get(id)!.remove();
        this.elements.delete(id);
    }
}
