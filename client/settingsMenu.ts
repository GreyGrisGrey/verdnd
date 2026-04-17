import { getRequiredElement } from './dom.ts';
const settingsButton = getRequiredElement('settingsButton', HTMLButtonElement);
const settingsDropdown = getRequiredElement('settingsDropdown', HTMLElement);
const lightModeLabel = getRequiredElement('settingsDropdown', HTMLElement);
const lightMode = getRequiredElement('settingsLightMode', HTMLInputElement);
const gameNameLabel = getRequiredElement('settingsDropdown', HTMLElement);
const gameName = getRequiredElement('settingsGameName', HTMLInputElement);
const playerNameLabel = getRequiredElement('settingsDropdown', HTMLElement);
const playerName = getRequiredElement('settingsPlayerName', HTMLInputElement);

export class SettingsMenu {
    visible: boolean;

    constructor() {
        this.visible = false;
        this.addEventListeners();
        this.applyVisibility();
    }

    toggleVisible() {
        this.visible = !this.visible;
        this.applyVisibility();
    }

    open() {
        this.visible = true;
        this.applyVisibility();
    }

    close() {
        this.visible = false;
        this.applyVisibility();
    }

    private applyVisibility() {
        settingsDropdown.style.visibility = this.visible ? 'visible' : 'hidden';
        settingsDropdown.style.pointerEvents = this.visible ? 'auto' : 'none';
        settingsButton.classList.toggle('active', this.visible);
    }

    private addEventListeners() {
        settingsButton.addEventListener('click', () => {
            this.toggleVisible();
        });

        document.addEventListener('click', (e) => {
            if (
                this.visible &&
                !settingsDropdown.contains(e.target as Node) &&
                e.target !== settingsButton
            ) {
                this.close();
            }
        });
    }
}
