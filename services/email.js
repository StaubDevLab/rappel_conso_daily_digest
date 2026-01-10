const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function cleanText(text) {
    if (!text) return "Non précisé";
    return text.replace(/¤/g, '<br>• ').replace(/\|/g, ', ');
}

function generateHtmlEmail(recalls) {
    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const itemsHtml = recalls.map(item => {
        const imgUrl = item.liens_vers_les_images ? item.liens_vers_les_images.split('|')[0] : 'https://via.placeholder.com/150?text=No+Image';
        const isCritical = item.risques_encourus?.toLowerCase().match(/listeria|salmonelle|norovirus/);
        const badgeColor = isCritical ? '#eb4d4b' : '#686de0';

        return `
        <div style="background-color: #ffffff; border: 1px solid #edf2f7; border-radius: 12px; margin-bottom: 24px; overflow: hidden; font-family: sans-serif;">
            <div style="background-color: ${badgeColor}; height: 4px;"></div>
            <div style="padding: 20px;">
                <table width="100%">
                    <tr>
                        <td width="100" valign="top"><img src="${imgUrl}" width="100" style="border-radius: 8px;"></td>
                        <td style="padding-left: 20px;" valign="top">
                            <span style="font-size: 11px; font-weight: bold; color: ${badgeColor}; text-transform: uppercase;">${item.sous_categorie_produit}</span>
                            <h3 style="margin: 4px 0; color: #1a202c;">${item.marque_produit?.toUpperCase()}</h3>
                            <p style="margin: 0; color: #4a5568;">${item.libelle}</p>
                        </td>
                    </tr>
                </table>
                <div style="margin-top: 15px; background-color: #f8fafc; border-radius: 8px; padding: 12px; font-size: 14px;">
                    <p style="margin-bottom: 8px;"><strong>⚠️ Motif :</strong> ${cleanText(item.motif_rappel)}</p>
                    <p style="color: #718096;"><strong>Risques :</strong> ${cleanText(item.risques_encourus)}</p>
                </div>
                <div style="margin-top: 15px; text-align: right;">
                    <a href="${item.lien_vers_la_fiche_rappel}" style="background-color: #2d3748; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px;">Détails</a>
                </div>
            </div>
        </div>`;
    }).join('');

    return `<!DOCTYPE html><html><body style="background-color: #f7fafc; padding: 20px;">
        <div style="max-width: 600px; margin: auto;">
            <h1 style="text-align: center; font-family: sans-serif;">🍎 Veille RappelConso</h1>
            <p style="text-align: center; color: #718096;">Condensé du ${today}</p>
            ${itemsHtml}
        </div>
    </body></html>`;
}

async function sendEmail(recalls, isWeekly = false) {
    try {
        const title = isWeekly
            ? `📊 RÉCAPITULATIF HEBDOMADAIRE : ${recalls.length} alertes`
            : `⚠️ RappelConso : ${recalls.length} alertes aujourd'hui`;

        const html = generateHtmlEmail(recalls); // Tu peux aussi modifier le HTML pour dire "Récap de la semaine"

        await resend.emails.send({
            from: "RappelConso <onboarding@resend.dev>",
            to: [process.env.EMAIL_TO],
            subject: title,
            html: html,
        });
        console.log("Email envoyé !");
    } catch (error) {
        console.error("Erreur Email:", error.message);
    }
}

module.exports = { sendEmail };