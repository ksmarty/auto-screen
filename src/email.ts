import { carriers } from "./index";
import { UserData } from "./types";

import { createTransport } from "nodemailer";
import ora from "ora";
import { Page } from "playwright";

export const sendEmail = async (
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
		to: PHONE && CARRIER ? `${PHONE}@${carriers[CARRIER]}` : user,
		attachments: [
			{
				path: "screenshot.png",
			},
		],
	});

	emailSpinner.succeed(`${PHONE ? "Text" : "Email"} sent`);
};
