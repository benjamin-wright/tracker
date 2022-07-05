export function byId(doc: Document, id: string): HTMLElement {
    const element = doc.getElementById(id);
    if (element === null) {
        throw new Error(`Failed to find element by id: ${id}`);
    }

    return element;
}