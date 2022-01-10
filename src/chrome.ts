import ora from "ora";
import { Browser, BrowserContext, chromium } from "playwright";

export class Chrome {
	#browser!: Browser | BrowserContext;

	async newPage() {
		console.clear();

		const browserSpinner = ora("Loading browser").start();

		// Link to chromium user data to persist auth
		const userDataDir = String.raw`${process.env.LOCALAPPDATA}\Chromium\User Data\Crashpad`;

		const options = {
			headless: true,
			viewport: {
				width: 412,
				height: 869,
			},
			deviceScaleFactor: 3.5,
			isMobile: true,
		};

		// Load browser with data (if available)
		try {
			this.#browser = await chromium.launchPersistentContext(
				userDataDir,
				options
			);
		} catch {
			this.#browser = await chromium.launch(options);
		}

		browserSpinner.succeed("Browser loaded");

		return this.#browser.newPage();
	}

	async close() {
		return this.#browser.close();
	}
}
