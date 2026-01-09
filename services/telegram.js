const axios = require('axios');

async function sendTelegram(recalls) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!recalls.length) return;

    let message = `🔔 *NOUVEAUX RAPPELS (${recalls.length})*\n\n`;

    for (const item of recalls.slice(0, 5)) { // On limite à 5 pour éviter les messages trop longs
        message += `⚠️ *${item.marque_produit.toUpperCase()}*\n`;
        message += `📦 ${item.libelle}\n`;
        message += `🚫 ${item.motif_rappel}\n`;
        message += `🔗 [Fiche complète](${item.lien_vers_la_fiche_rappel})\n\n`;
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