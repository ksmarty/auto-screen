import { chromium } from "playwright";
import { config } from "dotenv";
import { createTransport } from "nodemailer";

config();
const { USER, PASS, EMAIL_USER, EMAIL_PASS, PHONE, CARRIER = "" } = process.env;

let tp = createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

const main = async () => {
  if (!USER || !PASS) {
    console.log(
      `${
        !USER
          ? "Username" + (!PASS ? " and password" : "")
          : !PASS
          ? "Password"
          : ""
      } not found. Please update '.env'!`
    );
    return;
  } else if (PHONE && !CARRIER) {
    console.log(
      "Phone number supplied but carrier is not selected! Please update '.env'!"
    );
    return;
  }

  console.log("Starting!");
  // Link to chromium user data to persist auth
  const userDataDir = String.raw`${process.env.LOCALAPPDATA}\Chromium\User Data\Crashpad`;
  // Load browser with data
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: {
      width: 412,
      height: 869,
    },
    deviceScaleFactor: 3.5,
    isMobile: true,
  });
  const page = await browser.newPage();

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

  // Start new assessment
  await page.click("a.new-self-assessment");
  await page.waitForLoadState("networkidle");

  // Confirm profile
  await page.click(".btn-continue");
  await page.waitForLoadState("networkidle");

  // Confirm no symptoms
  if (!(await page.isChecked("#choice-14"))) {
    await page.click("div[data-for='choice-14']");
  }
  await page.click(".btn-continue");

  // Answer other questions
  for (let i = 30; i <= 46; i += 4) {
    await page.click(`button[value='${i}']`);
    await page.waitForLoadState("networkidle");
  }

  // Confirm no sick housemates
  await page.click("button[value='1007']");

  if ((await page.textContent(".o-result-status")) === "Cleared") {
    console.log("Cleared!");

    // Send screenshot
    if (EMAIL_USER) {
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: "screenshot.png", fullPage: true });
      tp.sendMail({
        from: `Auto Screen <${EMAIL_USER}>`,
        to: PHONE
          ? `${PHONE}@${
              {
                Telus: "mms.mb.telus.com",
              }[CARRIER]
            }`
          : EMAIL_USER,
        attachments: [
          {
            path: "screenshot.png",
          },
        ],
      });
    }
  }

  await browser.close();
  console.log("Done!");
};

main();
