runOnStartup(async runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	// Get the correct URL to fetch
	const textFileUrl = await runtime.assets.getProjectFileUrl("leaderboard-url.txt");

	// Now fetch that URL normally
	const response = await fetch(textFileUrl);
	globalThis.leaderboardUrl = await response.text();
}
