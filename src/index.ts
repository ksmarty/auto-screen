import { Browser, BrowserContext, chromium, Page } from "playwright";
import { config } from "dotenv";
import { createTransport } from "nodemailer";
import prompts, { PromptObject } from "prompts";
import ora, { Ora } from "ora";

interface UserData {
	USER?: string;
	PASS?: string;
	EMAIL_USER?: string;
	EMAIL_PASS?: string;
	PHONE?: string;
	CARRIER?: string;
	DOCKER?: boolean;
}

const checkCreds = ({ USER, PASS, PHONE, CARRIER, DOCKER }: UserData) => {
	const error = [
		!USER || !PASS
			? `${
					!USER
						? "Username" + (!PASS ? " and password" : "")
						: !PASS
						? "Password"
						: ""
			  } not found. Please ${
					DOCKER ? "update environment variables!" : "answer prompts!"
			  }`
			: "",
		PHONE && !CARRIER
			? `Phone number supplied but carrier is not selected! Please ${
					DOCKER ? "update environment variables!" : "answer prompts!"
			  }`
			: "",
	]
		.join("\n")
		.trim();

	if (error && DOCKER) {
		console.error(error);
		process.exit(9);
	}

	return !error;
};

const getCreds = async () => {
	const basicQs: PromptObject[] = [
		{
			type: "text",
			name: "USER",
			message: "What is your Passport York username?",
		},
		{
			type: "password",
			name: "PASS",
			message: "What is your Passport York password?",
		},
		{
			type: "select",
			name: "notif",
			message: "Do you want to receive screenshots?",
			choices: [
				{ title: "Yes, by email", value: "1" },
				{ title: "Yes, by text", value: "2" },
				{ title: "No", value: "" },
			],
			initial: 0,
		},
		{
			type: (e) => e && e == 2 && "text",
			name: "PHONE",
			message: "What is your phone number?",
			validate: (val) =>
				/^\d{10}$/.test(val) || "That's not a valid phone number",
		},
		{
			type: (e) => e && e != 1 && "select",
			name: "CARRIER",
			message: "Select your carrier",
			choices: [{ title: "Telus", value: "Telus" }],
			initial: 0,
		},
		{
			type: (e) => e && "text",
			name: "EMAIL_USER",
			message: "What is your gmail username?",
		},
		{
			type: (e) => e && "password",
			name: "EMAIL_PASS",
			message: "What is your gmail password?",
		},
	];

	console.clear();

	const { USER, PASS, EMAIL_USER, EMAIL_PASS, PHONE, CARRIER } =
		await prompts(basicQs);

	return {
		USER,
		PASS,
		EMAIL_USER,
		EMAIL_PASS,
		PHONE,
		CARRIER,
	} as UserData;
};

class Chrome {
	#browser!: Browser | BrowserContext;

	async newPage() {
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

const runScreening = async (page: Page, { USER = "", PASS = "" }: UserData) => {
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

const sendEmail = async (
	page: Page,
	{ EMAIL_USER: user, EMAIL_PASS: pass, PHONE, CARRIER }: UserData
) => {
	const emailSpinner = ora(`Sending ${PHONE ? "text" : "email"}`).start();

	await page.waitForLoadState("networkidle");
	await page.screenshot({ path: "screenshot.png", fullPage: true });

	createTransport({
		service: "gmail",
		auth: {
			user,
			pass,
		},
	}).sendMail({
		from: `Auto Screen <${user}>`,
		to:
			PHONE && CARRIER
				? `${PHONE}@${
						{
							// Add additional carrier here
							Telus: "mms.mb.telus.com",
						}[CARRIER]
				  }`
				: user,
		attachments: [
			{
				path: "screenshot.png",
			},
		],
	});

	emailSpinner.succeed(`${PHONE ? "Text" : "Email"} sent`);
};

const getEnv = () => {
	let { USER, PASS, EMAIL_USER, EMAIL_PASS, PHONE, CARRIER, DOCKER } =
		process.env;
	return {
		USER,
		PASS,
		EMAIL_USER,
		EMAIL_PASS,
		PHONE,
		CARRIER,
		DOCKER,
	} as UserData;
};

const main = async () => {
	if (process.env.npm_lifecycle_event == "dev") config(); // Load .env - for dev

	let userData = getEnv();

	while (!checkCreds(userData)) userData = await getCreds();

	console.clear();

	const browser = new Chrome();
	const page = await browser.newPage();

	await runScreening(page, userData);

	if (userData.EMAIL_USER) await sendEmail(page, userData);

	await browser.close();

	ora("Mission accomplished").succeed();
};

main();
