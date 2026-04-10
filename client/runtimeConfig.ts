export function getWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/`;
}

export function getApiBaseUrl(): string {
    return window.location.origin;
}
