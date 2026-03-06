// Gets an HTMLElement, throws an error if it's not there.
export function getRequiredElement<T extends HTMLElement>(
    id: string,
    elementType: { new (): T },
) {
    const element = document.getElementById(id);
    if (!(element instanceof elementType)) {
        throw new Error(
            `Expected #${id} to be a ${elementType.name}, but it was missing or mismatched.`,
        );
    }
    return element;
}
