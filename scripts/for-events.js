import { findInstanceById } from "./utils.js";

async function getLeaderboard(runtime) {
    const contentLayer = runtime.layout.getLayer("Content");
    const loadingLayer = runtime.layout.getLayer("Loading");
    const errorLayer = runtime.layout.getLayer("Error");

    loadingLayer.isVisible = true;
    contentLayer.isVisible = false;
    errorLayer.isVisible = false;

    try {
        const response = await fetch(new URL("/leaderboard", globalThis.leaderboardUrl));

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