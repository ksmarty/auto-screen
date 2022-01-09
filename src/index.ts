import { checkCreds, getCreds } from "./creds";
import { UserData } from "./types";
import { start } from "./run";

export const carriers = { Telus: "mms.mb.telus.com" } as const;

const main = async () => {
	// Get user data
	let userData: UserData;
	do userData = await getCreds();
	while (!checkCreds(userData));

	start(userData);
};

main();
