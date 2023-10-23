runOnStartup(async runtime =>
{
	runtime.addEventListener("beforeprojectstart", () => void OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime: IRuntime)
{
	const textFileUrl = await runtime.assets.getProjectFileUrl("leaderboard-url.txt");

	const response = await fetch(textFileUrl);
	globalThis.leaderboardUrl = await response.text();
}
