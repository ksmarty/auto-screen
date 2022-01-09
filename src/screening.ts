import ora, { Ora } from "ora";
import { Page } from "playwright";
import { UserData } from "./types";

class Assessment {
	#counter: number;
	#spinner: Ora;

	constructor() {
		this.#counter = 0;
		this.#spinner = ora().start("Loading assessment");
	}

	next() {
		this.#spinner.text = `Filling out assessment - ${this.#counter++}/8`;
	}

	succeed() {
		this.#spinner.succeed("Assessment completed");
	}
}

export const runScreening = async (
	page: Page,
	{ USER = "", PASS = "" }: UserData
) => {
	const authSpinner = ora("Authenticating").start();

	await page.goto("https://yorku.ubixhealth.com/main");

	// Check if the page was redirected for login
	const curPage = await page.evaluate(() => document.location.href);

	// Run Login Steps
	if (curPage === "https://yorku.ubixhealth.com/login") {
		await page.click('a[href="/doSaml"] > button');

		// Wait until redirects stop
		await page.waitForLoadState("networkidle");

		// Check if user/pass is requested
		if (await page.locator("#mli").count()) {
			await page.fill("#mli", USER);
			await page.fill("#password", PASS);
			await page.click("input[value='Login']");
		}

		// Wait until redirects stop
		await page.waitForLoadState("networkidle");

		// Check if 2FA is requested
		try {
			const frame = page.frameLocator("iframe");

			// Cancel if 2FA is auto-called to set "Remember for 30 days"
			const cnlBtn = frame.locator(".btn-cancel");
			if (await cnlBtn.count()) {
				await cnlBtn.click();
			}

			authSpinner.text = "Check for 2FA request";

			// Check "Remember for 30 days"
			await frame
				.locator(".remember_me_label_field > input:nth-child(1)")
				.check();
			// Reuqest 2FA
			await frame
				.locator("div.row-label:nth-child(2) > button:nth-child(3)")
				.click();
		} catch {}

		// Skip waiting for redirect
		const redirBtn = page.locator(
			"body > div.container.page-content > div > p:nth-child(5) > a"
		);
		if (await redirBtn.count()) {
			await redirBtn.click();
		}
	}
	authSpinner.succeed("Authenticated");

	const assess = new Assessment();

	// Start new assessment
	await page.click("a.new-self-assessment");
	await page.waitForLoadState("networkidle");
	assess.next();

	// Confirm profile
	await page.click(".btn-continue");
	await page.waitForLoadState("networkidle");
	assess.next();

	// Confirm no symptoms
	if (!(await page.isChecked("#choice-14"))) {
		await page.click("div[data-for='choice-14']");
	}
	await page.click(".btn-continue");
	await page.waitForLoadState("networkidle");
	assess.next();

	// Answer other questions
	for (let i = 30; i <= 46; i += 4) {
		await page.click(`button[value='${i}']`);
		await page.waitForLoadState("networkidle");
		assess.next();
	}

	// Confirm no sick housemates
	await page.click("button[value='1007']");
	assess.next();

	if ((await page.textContent(".o-result-status, .o-success")) === "Cleared")
		return assess.succeed();
};
