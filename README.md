# auto-screen

Automate YorkU health screening.

## Setup

1. Manually run the screening once to ensure profile information is correct.
2. A gmail account is required to recieve screenshots. If 2FA is enabled, setup an [application password](https://www.lifewire.com/get-a-password-to-access-gmail-by-pop-imap-2-1171882).

## Standalone

Download and run the latest version from the [releases page](https://github.com/ksmarty/auto-screen/releases).

## Docker

### docker-compose

<table>
  <tr>
    <th>Environment Vars</th>
    <th>Env File</th>
  </tr>
<tr>
<td>

<!-- prettier-ignore -->
  ```yaml
  # docker-compose.yml
  ---
  version: '3'
  services:
    autoscreen:
      image: auto-screen
      container_name: auto-screen
      environment:
        USER: Passport_York_User
        PASS: AVeryCoolPassword1
        EMAIL_USER: steve@example.com
        EMAIL_PASS: CoolestPassword987
        PHONE: 4161236789
        CARRIER: Telus
        CRON: 0 7 * * MON-FRI
      restart: "no"
  
  
  
  
  
  
  
  ```

<img width="441" height="1">
</td>
<td>

<!-- prettier-ignore -->
  ```yaml
  # docker-compose.yml
  ---
  version: '3'
  services:
    autoscreen:
      image: auto-screen
      container_name: auto-screen
      env_file:
        - ./as.env
      restart: "no"
  ```

<hr>
  <!-- prettier-ignore -->

```ini
# as.env
USER=Passport_York_User
PASS=AVeryCoolPassword1
EMAIL_USER=steve@example.com
EMAIL_PASS=CoolestPassword987
PHONE=4161236789
CARRIER=Telus
CRON=0 7 * * MON-FRI
```

<img width="441" height="1">
</td>
</tr>
</table>

### docker cli

<table>
  <tr>
    <th>Environment Vars</th>
    <th>Env File</th>
  </tr>
<tr>
<td>

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
  -e CRON="0 7 * * MON-FRI" \
  --restart "no" \
  auto-screen




  
  
```

<img width="441" height="1">
</td>
<td>

<!-- prettier-ignore -->
```sh
docker run -d \
  --name=auto-screen \
  -env-file as.env \
  --restart "no" \
  auto-screen
```

<hr>
  <!-- prettier-ignore -->

```ini
# as.env
USER=Passport_York_User
PASS=AVeryCoolPassword1
EMAIL_USER=steve@example.com
EMAIL_PASS=CoolestPassword987
PHONE=4161236789
CARRIER=Telus
CRON=0 7 * * MON-FRI
```

<img width="441" height="1">
</td>
</tr>
</table>

If only email variables are supplied, you will receive an email with the screenshot. If phone and carrier are also supplied, you will recieve a text. Leave the aforementioned variables blank to not receive a screenshot.

### Environment Variables

| Env        | Function                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------- |
| USER       | Passport York username                                                                            |
| PASS       | Passport York password                                                                            |
| EMAIL_USER | Gmail address                                                                                     |
| EMAIL_PASS | Gmail password or application password                                                            |
| PHONE      | Phone number for screenshots                                                                      |
| CARRIER    | Options: Telus                                                                                    |
| CRON       | Cron expression used to schedule to the program. [Generate here.](https://crontab-generator.com/) |

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
