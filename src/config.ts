import Haf from "@batuhanw/haf";
import { validate } from "node-cron";
import prompts, { Choice } from "prompts";
import { Run, UserData } from "./types";

interface Conf {
	encData?: string;
	cron: string;
}

type Optional<T extends object> = Exclude<
	{
		[K in keyof T]: T extends Record<K, T[K]> ? never : K;
	}[keyof T],
	undefined
>;

const config = new Haf<Conf>({
	name: "auto-screen",
	extension: "json",
});

const configGet = <K extends keyof Conf>(el: K) => {
	return config.get(el);
};

const configSet = <K extends keyof Conf>(el: K, val: Conf[K]) => {
	config.set(el, val as any);
};

const configDel = (el: Optional<Conf>) => {
	config.delete(el);
};

const userConfig = async ({ DOCKER, CRON }: UserData) => {
	console.clear();

	if (DOCKER) {
		if (CRON) configSet("cron", CRON);
		return CRON ? Run.Existing : Run.Once;
	}

	const storedCron = configGet("cron");

	const runOpts: Choice[] = [
		...(storedCron
			? [
					{
						title: "Use existing schedule",
						value: Run.Existing,
						description: storedCron,
					},
			  ]
			: []),
		{ title: "Run once", value: Run.Once },
		{ title: "Setup schedule", value: Run.Setup },
	].concat();

	const { runChoice, cron }: { runChoice: Run; cron: string } = await prompts(
		[
			{
				type: "select",
				name: "runChoice",
				message: "Select run mode",
				choices: runOpts,
			},
			{
				type: (e) => e && (e === Run.Setup ? "text" : false),
				name: "cron",
				message: `Enter a cron expression for the schedule.
  Need help? Check out https://crontab-generator.com/.
`,
				initial: "0 7 * * MON-FRI",
				validate: (e) =>
					validate(e) ||
					"Not a valid cron expression!\nCheck https://crontab-generator.com/ for help.",
			},
		]
	);

	if (runChoice === Run.Setup) configSet("cron", cron);

	return runChoice;
};

export { configGet, configSet, configDel, userConfig };
