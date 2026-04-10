import { getRequiredElement } from '../dom.ts';
const showUserButton = getRequiredElement('showUser', HTMLButtonElement);
const userContainer = getRequiredElement('userContainer', HTMLElement);

export interface UserData {
    id: string;
    name: string;
    gm: boolean;
}

export class UserBox {
    userMap: Map<string, UserData>;
    elements: Map<string, HTMLElement>;

    constructor() {
        this.userMap = new Map();
        this.elements = new Map();
    }

    // Toggle active.
    toggleActive(newActive: boolean) {
        userContainer.style.visibility = newActive ? 'inherit' : 'hidden';
        userContainer.style.pointerEvents = newActive ? 'auto' : 'none';
        showUserButton.disabled = newActive;
    }

    // Adds a user to the menu.
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

    // Removes a user from the menu.
    removeUser(id: string) {
        this.userMap.delete(id);
        this.elements.get(id)!.remove();
        this.elements.delete(id);
    }
}
