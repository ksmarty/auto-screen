# auto-screen

Automate YorkU health screening.

## Setup

1. Manually run the screening once to ensure profile information is correct.
2. A gmail account is required to recieve a screenshot. If 2FA is enabled, setup an [application password](https://www.lifewire.com/get-a-password-to-access-gmail-by-pop-imap-2-1171882).

## Standalone Install

Coming Soon

## Docker

**docker-compose**

<!-- prettier-ignore -->
```yaml
---
version: '3.4'
services:
  autoscreen:
    image: autoscreen
    container_name: auto-screen
    environment:
      USER: Passport_York_User
      PASS: AVeryCoolPassword1
      EMAIL_USER: steve@example.com
      EMAIL_PASS: CoolestPassword987
      PHONE: 4161236789
      CARRIER: Telus
    restart: unless-stopped
```

**docker cli**

<!-- prettier-ignore -->
```sh
docker run -d \
  --name=auto-screen \
  -e USER=Passport_York_User \
  -e PASS=AVeryCoolPassword1 \
  -e EMAIL_USER=steve@example.com \
  -e EMAIL_PASS=CoolestPassword987 \
  -e PHONE=4161236789 \
  -e CARRIER=Telus \
  --restart unless-stopped \
  autoscreen
```

If only email variables are supplied, you will receive an email with the screenshot. If phone and carrier are also supplied, you will recieve a text. Leave the aforementioned variables blank to not receive a screenshot.

### Environment Variables

| Env        | Function                               |
| ---------- | -------------------------------------- |
| USER       | Passport York username                 |
| PASS       | Passport York password                 |
| EMAIL_USER | Gmail address                          |
| EMAIL_PASS | Gmail password or application password |
| PHONE      | Phone number for screenshots           |
| CARRIER    | Options: Telus                         |

## Disclaimer

This project was built as a proof of concept. Please familiarize yourself with [the license](COPYING), but here is an abbreviated version:

> Copyright (C) 2021 Kyle Schwartz
>
> This program is free software: you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation, either version 3 of the License, or
> (at your option) any later version.
>
> This program is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
> GNU General Public License for more details.
>
> You should have received a copy of the GNU General Public License
> along with this program. If not, see https://www.gnu.org/licenses/.
