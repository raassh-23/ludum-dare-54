import { findInstanceById } from "./utils.js";

async function getLeaderboard(runtime) {
    const { type } = runtime.globalVars;

    const contentLayer = runtime.layout.getLayer("Content");
    const loadingLayer = runtime.layout.getLayer("Loading");
    const errorLayer = runtime.layout.getLayer("Error");

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

            const textName = findInstanceById(runtime.objects.Text, `leaderboard-name-${i}`);
            const textScore = findInstanceById(runtime.objects.Text, `leaderboard-score-${i}`);

            if (item) {
                textName.text = `${i}. ${item.username}`;
                textScore.text = `${item.score}`;
            } else {
                textName.text = `${i}. -`;
                textScore.text = "";
            }
        }

        loadingLayer.isVisible = false;
        contentLayer.isVisible = true;
    } catch (error) {
        loadingLayer.isVisible = false;
        errorLayer.isVisible = true;
    }
}

async function addToLeaderboard(runtime) {
    const nameInput = findInstanceById(runtime.objects.TextInput, "name");
    const name = nameInput.text;

    if (!name || name.trim() === "") {
        return;
    }

    const { type, score, startTime } = runtime.globalVars;

    const timeMs = Date.now() - startTime;

    const contentLayer = runtime.layout.getLayer("Content");
    const loadingLayer = runtime.layout.getLayer("Loading");
    const errorLayer = runtime.layout.getLayer("Error");
    const success = runtime.layout.getLayer("Success");

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
        success.isVisible = true;
    } catch (error) {
        loadingLayer.isVisible = false;
        errorLayer.isVisible = true;

        setTimeout(() => {
            errorLayer.isVisible = false;
            contentLayer.isVisible = true;
        }, 3000);
    }
}

function resizeFont(id, multiplier) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    const fontSize = element.offsetHeight * multiplier;
    const fontSizeString = `${fontSize}px`;

    if (element.style.fontSize === fontSizeString) {
        return;
    }

    element.style.fontSize = `${fontSize}px`;
}
