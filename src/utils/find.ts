export function byId<T extends Element>(element: HTMLElement, id: string): T {
    const elem = element.querySelector<T>("#"+id);
    if (elem === null) {
        throw new Error(`Failed to find element by id: ${id}`);
    }

    return elem;
}

export function templateById(element: HTMLElement, id: string): HTMLTemplateElement {
    const elem = element.querySelector<HTMLTemplateElement>("#"+id);

    if (elem === null) {
        throw new Error(`Failed to find template by id: ${id}`);
    }

    return elem;
}