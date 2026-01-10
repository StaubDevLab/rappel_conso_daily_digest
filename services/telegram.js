const axios = require('axios');

async function sendTelegram(recalls, isWeekly = false) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!recalls || recalls.length === 0) return;

    let message = isWeekly
        ? `📊 <b>RÉCAPITULATIF DE LA SEMAINE</b>\n`
        : `<b>🍎 RappelConso Quotidien</b>\n`;

    message += `<i>Total : ${recalls.length} produit(s)</i>\n\n`;

    const limit = isWeekly ? 10 : 5;

    for (const item of recalls.slice(0, limit)) {
        message += `• <b>${item.marque_produit?.toUpperCase()}</b> - ${item.libelle}\n`;
        if (!isWeekly) {
            message += `❌ <i>${item.motif_rappel}</i>\n`;
        }
        message += `🔗 <a href="${item.lien_vers_la_fiche_rappel}">Fiche</a>\n\n`;
    }

    if (isWeekly && recalls.length > limit) {
        message += `<i>... et ${recalls.length - limit} autres produits à retrouver sur le site.</i>`;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log("Message Telegram envoyé !");
    } catch (error) {
        console.error("Erreur Telegram:", error.response?.data || error.message);
    }
}

module.exports = { sendTelegram };