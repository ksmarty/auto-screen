# auto-screen

Automate YorkU health screening.

## Setup

1. Manually run the screening once to ensure profile information is correct.
2. Rename `.env_example` to `.env`. NEVER COMMIT THIS FILE.
3. A gmail account is required to recieve a screenshot. If 2FA is enabled, setup an [application password](https://www.lifewire.com/get-a-password-to-access-gmail-by-pop-imap-2-1171882).

## Configure

If only email is supplied, you will receive an email with the screenshot. If phone is also supplied, you will recieve a text. Leave both blank to not receive a screenshot.

| Variable   | Value                               |
| ---------- | ----------------------------------- |
| USER       | Passport York username              |
| PASS       | Passport York password              |
| EMAIL_USER | Gmail email address                 |
| EMAIL_PASS | Gmail password/application password |
| PHONE      | Phone number for screenshots        |
| CARRIER    | Options: Telus                      |