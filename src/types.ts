import { carriers } from "./index";

interface UserData {
	USER?: string;
	PASS?: string;
	EMAIL_USER?: string;
	EMAIL_PASS?: string;
	PHONE?: string;
	CARRIER?: keyof typeof carriers;
	DOCKER?: boolean;
	CRON?: string;
}

enum Run {
	Existing = "0",
	Once = "1",
	Setup = "2",
}

export { UserData, Run };
