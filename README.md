
# 🍎 RappelConso Daily Digest

[![Daily RappelConso Mail](https://github.com/StaubDevLab/rappel_conso_daily_digest/actions/workflows/daily-recall.yml/badge.svg)](https://github.com/StaubDevLab/rappel_conso_daily_digest/actions/workflows/daily-recall.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An automated Node.js service that monitors the French government's **RappelConso** API. It sends a beautifully formatted daily email digest of food recalls to keep you and your family safe.

## ✨ Features

- **Real-time Data**: Fetches the latest records directly from the [Official French Open Data Portal](https://data.economie.gouv.fr/).
- **Smart Filtering**: Specifically tracks the "Food" category for the last 24 hours.
- **Modern Email Design**: Sends responsive, clean HTML emails via **Resend**.
- **Risk Awareness**: Automatically highlights critical health risks (Listeria, Salmonella, Norovirus) with high-visibility red coding.
- **Zero Maintenance**: Runs entirely for free on **GitHub Actions**.

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/StaubDevLab/rappel_conso_daily_digest.git
cd rappel_conso_daily_digest
npm install

```

### 2. Configure Environment Secrets

To run this via GitHub Actions, go to your repository **Settings > Secrets and variables > Actions** and add the following:

| Secret Name | Description |
| --- | --- |
| `RESEND_API_KEY` | Your API Key from [Resend.com](https://resend.com) |
| `EMAIL_TO` | The email address where you want to receive the alerts |
| `TELEGRAM_TOKEN` | Your Telegram Bot Token |
| `TELEGRAM_CHAT_ID` | The Telegram Chat ID where you want to receive the alerts |

### 3. (Optional) Local Testing

To test the script locally, create a `.env` file at the root:

```env
RESEND_API_KEY=re_your_api_key
EMAIL_TO=your_email@example.com
TELEGRAM_TOKEN=your_telegram_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

Then run:

```bash
node index.js

```

## 🤖 Automation (GitHub Actions)

The script is configured to run automatically every day at **08:00 UTC**.

You can modify the schedule in `.github/workflows/daily-recall.yml` by changing the `cron` value:

* `0 8 * * *` = Every day at 8:00 AM UTC.
* `0 18 * * *` = Every day at 6:00 PM UTC.

## 📁 Project Structure

```text
├── .github/workflows/
│    └── daily-recall.yml   # Automation schedule
├── index.js                # Core logic (API fetch + Email formatting)
├── package.json            # Project dependencies
├── .gitignore              # Files excluded from Git
└── README.md               # You are here!

```

## ⚖️ Disclaimer

This project is an independent tool and is not affiliated with, endorsed by, or sponsored by the French government. It relies on the Public API provided by Etalab.

## 📝 License

This project is licensed under the MIT License.

```

---

### How to use this:
1. Create a new file in your GitHub project root called `README.md`.
2. Paste the content above.
3. **Make sure to update** the `YOUR_USERNAME` and `YOUR_REPO_NAME` in the first two lines to get your live "Status Badge" working!



**Would you like me to add a small section in the README about how to customize the "Food" filter for other categories like "Childcare products" or "Electrical appliances"?**

```