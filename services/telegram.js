import axios from 'axios';

function escapeHTML(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

async function sendTelegram(recalls, isWeekly = false, dashboardUrl = null) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!recalls || recalls.length === 0) return;

    let message = isWeekly
        ? `📅 <b>RÉCAPITULATIF HEBDOMADAIRE</b>\n`
        : `🚨 <b>ALERTES RAPPELCONSO</b>\n`;

    message += `<i>📌 ${recalls.length} produit(s) identifié(s)</i>\n`;
    message += `➖➖➖➖➖➖➖➖➖➖\n\n`;

    const limit = isWeekly ? 10 : 5;

    for (const item of recalls.slice(0, limit)) {
        const brand = escapeHTML(item.marque_produit?.toUpperCase() || "INCONNUE");
        const name = escapeHTML(item.libelle || "");
        const isCritical = item.risques_encourus?.toLowerCase().match(/listeria|salmonelle|norovirus|botulisme/);
        const hazardIcon = isCritical ? '🔴' : '⚠️';

        let risque = escapeHTML(item.risques_encourus || "Non précisé");
        // On tronque le texte du risque s'il est trop long pour Telegram
        risque = risque.length > 80 ? risque.substring(0, 80) + '...' : risque;

        message += `${hazardIcon} <b>${brand}</b>\n`;
        message += `📦 ${name}\n`;
        message += `🦠 <i>Risque : ${risque}</i>\n`;
        message += `🔗 <a href="${item.lien_vers_la_fiche_rappel}">Voir la fiche officielle</a>\n\n`;
    }

    if (recalls.length > limit) {
        message += `➖➖➖➖➖➖➖➖➖➖\n`;
        message += `<i>...et ${recalls.length - limit} autres alertes à consulter.</i>\n`;
    }

    if (dashboardUrl) {
        message += `\n🌐 <a href="${dashboardUrl}">Voir toutes les alertes sur le site</a>`;
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

export { sendTelegram };