# ForecastBot 🏄

A Telegram bot ([@IsraelSurfBot](https://t.me/Israelsurfbot)) that sends wave forecasts for the Israeli coast, in Hebrew or English.

Forecast data comes from the free [Open-Meteo marine API](https://open-meteo.com/en/docs/marine-weather-api) (wave height, period, direction, wind, temperature). Each message links to the detailed Surfline report for the spot.

## Commands

| Command | What it does |
| --- | --- |
| `/getforecast [spot]` | Current conditions, today's peak and the next 3 days (default spot: Tel-Aviv) |
| `/spots` | List spots; each one has its own `/spot_<Name>` shortcut |
| `/subscribe [spot]` | Toggle the daily morning forecast for this chat (group admins only in groups) |
| `/liveVideo` | Short clip from the live cam (needs `ffmpeg`) |
| `/lang_en`, `/lang_he` | Switch language (remembered per chat) |
| `/help` | Command list |

Admin commands (only for `telegramBot.managerUsername`): `/subscriberList`, `/postToSubscribers <text>`, `/sendForecastNow`, `/getDbFile`, `/getOsInfo`, `/getUptime`, `/getWanIp`, `/getIp`, `/ophelp`.

## Running

Requires Node.js 18+.

```bash
npm install
cp config/local.example.json config/local.json   # add your bot token
npm run start:dev
```

Configuration is read with [`config`](https://github.com/node-config/node-config). Secrets go in `config/local.json` (git-ignored) or environment variables:

| Env var | Config key | Default |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | `telegramBot.token` | required |
| `TELEGRAM_MANAGER_USERNAME` | `telegramBot.managerUsername` | empty (admin commands disabled) |
| `TELEGRAM_LOGGER_CHAT_ID` | `telegramBot.loggerChatId` | empty (no Telegram log mirroring) |
| `TELEGRAM_USE_TUNNEL` | `telegramBot.tunnel` | `false` (long polling) |
| `PORT` | `telegramBot.httpserver.port` | `3000` |
| `FORECAST_DAILY_CRON` | `forecast.dailyBroadcastCron` | `30 6 * * *` (Asia/Jerusalem) |

Subscriptions and language preferences are stored in `lib/db/` (nedb files).

### Docker

```bash
docker build -t ofryl/forecastbot .
docker run -d --name forecastbot --restart unless-stopped \
  -e TELEGRAM_BOT_TOKEN=... -e TELEGRAM_MANAGER_USERNAME=... \
  -v "$PWD/lib:/usr/src/app/lib" ofryl/forecastbot
```

## Development

```bash
npm run lint
npm test
```
