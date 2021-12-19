"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var playwright_1 = require("playwright");
var dotenv_1 = require("dotenv");
var nodemailer_1 = require("nodemailer");
(0, dotenv_1.config)();
var _a = process.env, USER = _a.USER, PASS = _a.PASS, EMAIL_USER = _a.EMAIL_USER, EMAIL_PASS = _a.EMAIL_PASS, PHONE = _a.PHONE, CARRIER = _a.CARRIER;
var tp = (0, nodemailer_1.createTransport)({
    service: "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var userDataDir, browser, page, curPage, frame, cnlBtn, _a, redirBtn, i;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!USER || !PASS) {
                    console.log("".concat(!USER
                        ? "Username" + (!PASS ? " and password" : "")
                        : !PASS
                            ? "Password"
                            : "", " not found. Please update '.env'!"));
                    return [2 /*return*/];
                }
                else if (PHONE !== null && PHONE !== void 0 ? PHONE : !CARRIER) {
                    console.log("Phone number supplied but carrier is not selected! Please update '.env'!");
                    return [2 /*return*/];
                }
                console.log("Starting!");
                userDataDir = String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", "ChromiumUser DataCrashpad"], ["", "\\Chromium\\User Data\\Crashpad"])), process.env.LOCALAPPDATA);
                return [4 /*yield*/, playwright_1.chromium.launchPersistentContext(userDataDir, {
                        headless: false,
                        viewport: {
                            width: 412,
                            height: 869
                        },
                        deviceScaleFactor: 3.5,
                        isMobile: true
                    })];
            case 1:
                browser = _b.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _b.sent();
                return [4 /*yield*/, page.goto("https://yorku.ubixhealth.com/main")];
            case 3:
                _b.sent();
                return [4 /*yield*/, page.evaluate(function () { return document.location.href; })];
            case 4:
                curPage = _b.sent();
                if (!(curPage === "https://yorku.ubixhealth.com/login")) return [3 /*break*/, 23];
                return [4 /*yield*/, page.click('a[href="/doSaml"] > button')];
            case 5:
                _b.sent();
                // Wait until redirects stop
                return [4 /*yield*/, page.waitForLoadState("networkidle")];
            case 6:
                // Wait until redirects stop
                _b.sent();
                return [4 /*yield*/, page.locator("#mli").count()];
            case 7:
                if (!_b.sent()) return [3 /*break*/, 11];
                return [4 /*yield*/, page.fill("#mli", USER)];
            case 8:
                _b.sent();
                return [4 /*yield*/, page.fill("#password", PASS)];
            case 9:
                _b.sent();
                return [4 /*yield*/, page.click("input[value='Login']")];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11: 
            // Wait until redirects stop
            return [4 /*yield*/, page.waitForLoadState("networkidle")];
            case 12:
                // Wait until redirects stop
                _b.sent();
                _b.label = 13;
            case 13:
                _b.trys.push([13, 19, , 20]);
                frame = page.frameLocator("iframe");
                cnlBtn = frame.locator(".btn-cancel");
                return [4 /*yield*/, cnlBtn.count()];
            case 14:
                if (!_b.sent()) return [3 /*break*/, 16];
                return [4 /*yield*/, cnlBtn.click()];
            case 15:
                _b.sent();
                _b.label = 16;
            case 16: 
            // Check "Remember for 30 days"
            return [4 /*yield*/, frame
                    .locator(".remember_me_label_field > input:nth-child(1)")
                    .check()];
            case 17:
                // Check "Remember for 30 days"
                _b.sent();
                // Reuqest 2FA
                return [4 /*yield*/, frame
                        .locator("div.row-label:nth-child(2) > button:nth-child(3)")
                        .click()];
            case 18:
                // Reuqest 2FA
                _b.sent();
                return [3 /*break*/, 20];
            case 19:
                _a = _b.sent();
                return [3 /*break*/, 20];
            case 20:
                redirBtn = page.locator("body > div.container.page-content > div > p:nth-child(5) > a");
                return [4 /*yield*/, redirBtn.count()];
            case 21:
                if (!_b.sent()) return [3 /*break*/, 23];
                return [4 /*yield*/, redirBtn.click()];
            case 22:
                _b.sent();
                _b.label = 23;
            case 23: 
            // Start new assessment
            return [4 /*yield*/, page.click("a.new-self-assessment")];
            case 24:
                // Start new assessment
                _b.sent();
                return [4 /*yield*/, page.waitForLoadState("networkidle")];
            case 25:
                _b.sent();
                // Confirm profile
                return [4 /*yield*/, page.click(".btn-continue")];
            case 26:
                // Confirm profile
                _b.sent();
                return [4 /*yield*/, page.waitForLoadState("networkidle")];
            case 27:
                _b.sent();
                return [4 /*yield*/, page.isChecked("#choice-14")];
            case 28:
                if (!!(_b.sent())) return [3 /*break*/, 30];
                return [4 /*yield*/, page.click("div[data-for='choice-14']")];
            case 29:
                _b.sent();
                _b.label = 30;
            case 30: return [4 /*yield*/, page.click(".btn-continue")];
            case 31:
                _b.sent();
                i = 30;
                _b.label = 32;
            case 32:
                if (!(i <= 46)) return [3 /*break*/, 36];
                return [4 /*yield*/, page.click("button[value='".concat(i, "']"))];
            case 33:
                _b.sent();
                return [4 /*yield*/, page.waitForLoadState("networkidle")];
            case 34:
                _b.sent();
                _b.label = 35;
            case 35:
                i += 4;
                return [3 /*break*/, 32];
            case 36: 
            // Confirm no sick housemates
            return [4 /*yield*/, page.click("button[value='1007']")];
            case 37:
                // Confirm no sick housemates
                _b.sent();
                return [4 /*yield*/, page.textContent(".o-result-status")];
            case 38:
                if (!((_b.sent()) === "Cleared")) return [3 /*break*/, 41];
                console.log("Cleared!");
                if (!EMAIL_USER) return [3 /*break*/, 41];
                return [4 /*yield*/, page.waitForLoadState("networkidle")];
            case 39:
                _b.sent();
                return [4 /*yield*/, page.screenshot({ path: "screenshot.png", fullPage: true })];
            case 40:
                _b.sent();
                tp.sendMail({
                    from: "Auto Screen <".concat(EMAIL_USER, ">"),
                    to: PHONE
                        ? "".concat(PHONE, "@").concat({
                            Telus: "mms.mb.telus.com"
                        }[CARRIER])
                        : EMAIL_USER,
                    attachments: [
                        {
                            path: "screenshot.png"
                        },
                    ]
                });
                _b.label = 41;
            case 41: return [4 /*yield*/, browser.close()];
            case 42:
                _b.sent();
                console.log("Done!");
                return [2 /*return*/];
        }
    });
}); };
main();
var templateObject_1;
