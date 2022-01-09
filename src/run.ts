import { Chrome } from "./chrome";
import { configGet, userConfig } from "./config";
import { sendEmail } from "./email";
import { runScreening } from "./screening";
import { Run, UserData } from "./types";

import { parseExpression } from "cron-parser";
import { formatDistanceToNow } from "date-fns";
import { schedule } from "node-cron";
import ora, { Ora } from "ora";

class CountDown {
	#spinner: Ora;
	#nextRun: NodeJS.Timer;

	constructor() {
		// console.clear();

		this.#spinner = ora(this.#spinnerText()).start();
		this.#nextRun = setInterval(
			() => (this.#spinner.text = this.#spinnerText()),
			30000
		);
	}

	#spinnerText() {
		return `Next run in ${formatDistanceToNow(
			parseExpression(configGet("cron")).next().toDate()
		)}`;
	}

	start() {
		// console.clear();

		this.#spinner = ora(this.#spinnerText()).start();
		this.#nextRun = setInterval(
			() => (this.#spinner.text = this.#spinnerText()),
			30000
		);
	}

	stop() {
		clearInterval(this.#nextRun);
		this.#spinner.stop();
	}
}

const run = async (userData: UserData, countDown?: CountDown) => {
	if (countDown) countDown.stop();

	const browser = new Chrome();
	const page = await browser.newPage();

	await runScreening(page, userData);

	if (userData.EMAIL_USER) await sendEmail(page, userData);

	await browser.close();

	ora("Mission accomplished").succeed();

	if (countDown) setTimeout(() => countDown.start(), 5000);
};

const start = async (userData: UserData) => {
	const userConf = await userConfig(userData);

	if (userConf === Run.Once) return run(userData);

	const countDown = new CountDown();

	schedule(configGet("cron"), () => run(userData, countDown), {
		timezone: "America/New_York",
	}).start();
};

export { start };
