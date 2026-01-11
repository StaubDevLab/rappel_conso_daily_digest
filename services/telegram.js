const axios = require('axios');

function escapeHTML(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

async function sendTelegram(recalls, isWeekly = false) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!recalls || recalls.length === 0) return;

    let message = isWeekly
        ? `<b>📊 RÉCAPITULATIF DE LA SEMAINE</b>\n`
        : `<b>🍎 RAPPELCONSO QUOTIDIEN</b>\n`;

    message += `<i>Total : ${recalls.length} produit(s)</i>\n\n`;

    const limit = isWeekly ? 10 : 5;

    for (const item of recalls.slice(0, limit)) {
        const brand = escapeHTML(item.marque_produit?.toUpperCase() || "INCONNUE");
        const name = escapeHTML(item.libelle || "");

        message += `⚠️ <b>${brand}</b>\n`;
        message += `📦 ${name}\n`;
        message += `🔗 <a href="${item.lien_vers_la_fiche_rappel}">Voir la fiche</a>\n\n`;
    }

    try {
        await axios({
            method: 'post',
            url: `https://api.telegram.org/bot${token}/sendMessage`,
            data: {
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: isWeekly
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("✅ Telegram envoyé avec mise en forme !");
    } catch (error) {
        console.error("❌ Erreur Telegram :", error.response?.data || error.message);
    }
}

module.exports = { sendTelegram };