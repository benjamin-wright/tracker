export async function saveFile(doc: Document, filename: string, content: string) {
    const anchor = doc.createElement('a');
    const file = new Blob([content], {type: "text/plain"});

    anchor.href = URL.createObjectURL(file);
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.target = '_blank';

    setTimeout(() => URL.revokeObjectURL(anchor.href), 4e4);
    setTimeout(() => anchor.click());
}

export async function loadFile(doc: Document): Promise<string> {
    const input = doc.createElement('input');
    input.type = "file";
    input.accept = ".json";
    input.click();

    const files: File[] = await new Promise((resolve, reject) => {
        input.onchange = (event) => {
            if (!event.target) {
                reject(new Error(`failed to open file, input event missing target`));
                return
            }

            const target: any = event.target;
            resolve(target.files as File[]);
        }
        input.onabort = reject;
    });

    const reader = new FileReader();

    const result = await new Promise((resolve, reject) => {
        reader.addEventListener('load', (event) => {
            resolve(event.target?.result);
        });

        reader.readAsDataURL(files[0]);
    })

    if (typeof result !== "string") {
        throw new Error(`failed to open file, wrong type: ${typeof result}`);
    }

    console.info(result);

    if (!result.startsWith("data:application/json;base64")) {
        throw new Error(`failed to open file, wrong format`);
    }

    const decoded = atob(result.replace("data:application/json;base64,", ""));

    return decoded;
}
