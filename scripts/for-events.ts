import { findInstanceById } from "./utils.js";

async function getLeaderboard(runtime: IRuntime) {
    const { type } = runtime.globalVars;

    const contentLayer = runtime.layout.getLayer("Content");
    const loadingLayer = runtime.layout.getLayer("Loading");
    const errorLayer = runtime.layout.getLayer("Error");

    if (!contentLayer || !loadingLayer || !errorLayer) {
        throw new Error("Missing layers");
    }

    try {
        const url = new URL("/leaderboard", globalThis.leaderboardUrl);
        url.searchParams.set("type", type);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch leaderboard");
        }

        const json = await response.json();

        const items = json.data.items;

        for (let i = 1; i <= 10; i++) {
            const item = items[i - 1];

            const textName = findInstanceById<InstanceType.Text>(runtime.objects.Text, `leaderboard-name-${i}`);
            const textScore = findInstanceById<InstanceType.Text>(runtime.objects.Text, `leaderboard-score-${i}`);

            if (!textName || !textScore) {
                throw new Error("Missing text instances");
            }

            if (!item) {
                textName.text = `${i}. -`;
                textScore.text = "";
                continue;
            }

            const name = `${i}. ${item.username}`
            textName.text = name;
            textScore.text = `${item.score}`;

            while (textName.textWidth > textName.width - 18) {
                textName.text = textName.text.slice(0, -1);
            }

            if (textName.text !== name) {
                textName.text = `${textName.text}...`;
            }
        }

        loadingLayer.isVisible = false;
        contentLayer.isVisible = true;
    } catch (error) {
        loadingLayer.isVisible = false;
        errorLayer.isVisible = true;
    }
}

async function addToLeaderboard(runtime: IRuntime) {
    const nameInput = findInstanceById<InstanceType.Text>(runtime.objects.TextInput, "name");

    if (!nameInput) {
        throw new Error("Missing text input instance");
    }

    const name = nameInput.text;

    if (!name || name.trim() === "") {
        return;
    }

    const { type, score, startTime } = runtime.globalVars;

    const timeMs = Date.now() - startTime;

    const contentLayer = runtime.layout.getLayer("Content");
    const loadingLayer = runtime.layout.getLayer("Loading");
    const errorLayer = runtime.layout.getLayer("Error");
    const successLayer = runtime.layout.getLayer("Success");

    if (!contentLayer || !loadingLayer || !errorLayer || !successLayer) {
        throw new Error("Missing layers");
    }

    contentLayer.isVisible = false;
    loadingLayer.isVisible = true;

    try {
        const url = new URL("/leaderboard", globalThis.leaderboardUrl);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type,
                username: name,
                score,
                timeMs,
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add to leaderboard");
        }

        runtime.storage.setItem("name", name);

        loadingLayer.isVisible = false;
        successLayer.isVisible = true;
    } catch (error) {
        loadingLayer.isVisible = false;
        errorLayer.isVisible = true;

        setTimeout(() => {
            errorLayer.isVisible = false;
            contentLayer.isVisible = true;
        }, 3000);
    }
}

function resizeFont(id: string, multiplier: number) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    const fontSize = element.offsetHeight * multiplier;
    const paddingHorizontal = (element.offsetHeight - fontSize) / 4;
    const fontSizeString = `${fontSize}px`;
    const paddingHorizontalString = `${paddingHorizontal}px`;

    if (element.style.fontSize === fontSizeString) {
        return;
    }

    element.style.fontSize = `${fontSize}px`;
    element.style.paddingLeft = paddingHorizontalString;
    element.style.paddingRight = paddingHorizontalString;
}

function setupTextInput(id: string, onEnter: () => void) {
    document.getElementById(id)?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            onEnter();
        }
    });
}

function colorHexToRGB(hex: string): [number, number, number] {
    if (!(/^#[0-9A-F]{6}$/i.test(hex))) {
        throw new Error(`${hex} is invalid color`)
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
}

function setBackgroundColor(hex: string) {
    const root: HTMLElement = document.querySelector(':root')!;
    root.style.setProperty('--background-color', hex);
}
