import { carriers } from "./index";
import { UserData } from "./types";
import { configDel, configGet, configSet } from "./config";

import Cryptr from "cryptr";
// const Cryptr = require("cryptr");
import prompts, { PromptObject } from "prompts";

const getEnv = () => {
	let { USER, PASS, EMAIL_USER, EMAIL_PASS, PHONE, CARRIER, DOCKER, CRON } =
		process.env;
	return {
		USER,
		PASS,
		EMAIL_USER,
		EMAIL_PASS,
		PHONE,
		CARRIER,
		DOCKER,
		CRON,
	} as UserData;
};

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
	// Check for docker env
	const userDataEnv = getEnv();
	if (userDataEnv.DOCKER) return userDataEnv;

	// console.clear();

	// Get encrypted data from config
	const encData = configGet("encData");

	// If data is stored in the config
	while (encData) {
		// Get saved password from user
		const { password } = await prompts({
			type: "password",
			name: "password",
			message: "Please enter your password",
		});

		try {
			// Try to decrypt using given password
			return JSON.parse(
				new Cryptr(password).decrypt(encData)
			) as UserData;
		} catch {
			// Ask if user wants to reset
			const { reset } = await prompts([
				{
					type: "select",
					name: "choice",
					message: "That's the wrong password!",
					choices: [
						{ title: "Try again", value: "0" },
						{ title: "Reset password", value: "1" },
					],
				},
				{
					type: (e) => e && (+e ? "toggle" : false),
					name: "reset",
					message:
						"Resetting the password will clear all saved login data. Are you sure?",
					initial: true,
					active: "No",
					inactive: "Yes",
				},
			]);

			// console.clear();

			if (reset) continue;

			// User wants to reset
			// Clear data
			configDel("encData");
			console.log("Config reset\n");

			break;
		}
	}

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
				{ title: "Yes, by text", value: "2" },
				{ title: "Yes, by email", value: "1" },
				{ title: "No", value: "" },
			],
		},
		{
			type: (e) => e && e == 2 && "text",
			name: "PHONE",
			message: "What is your phone number?",
			validate: (val) =>
				/^(?:(?:(\s*\(?([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\)?\s*(?:[.-]\s*)?)([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})$/.test(
					val
				) || "That's not a valid phone number!",
			format: (val) => (val as string).replace(/[^0-9]/g, ""),
		},
		{
			type: (e) => e && e != 1 && "select",
			name: "CARRIER",
			message: "Select your carrier",
			choices: Object.keys(carriers).map((c) => ({ title: c, value: c })),
			initial: 0,
		},
		{
			type: (e) => e && "text",
			name: "EMAIL_USER",
			message: "What is your gmail address?",
			validate: (val) =>
				/^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/i.test(val) ||
				"That's not a valid Gmail address!",
		},
		{
			type: (e) => e && "password",
			name: "EMAIL_PASS",
			message: "What is your gmail password?",
		},
	];

	// Get password for encrypting config
	const { password } = await prompts({
		type: "password",
		name: "password",
		message: "Please choose a password for auto-screen",
	});

	// Get user data
	const userData = await prompts(basicQs);

	// Write config
	storeCreds(userData, password);

	// Return data to main
	return userData as UserData;
};

// Encrypt and store user config
const storeCreds = (userData: UserData, password: string) =>
	configSet(
		"encData",
		new Cryptr(password).encrypt(JSON.stringify(userData))
	);

export { checkCreds, getCreds, storeCreds };
