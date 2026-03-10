import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function cleanText(text) {
    if (!text) return "Non précisé";
    return text.replace(/¤/g, '<br>• ').replace(/\|/g, ', ');
}

function generateHtmlEmail(recalls, isWeekly = false, dashboardUrl = null) {
    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const headerTitle = isWeekly ? "📊 Récapitulatif Hebdomadaire" : "🍎 Alertes RappelConso";
    const headerColor = isWeekly ? "#3b82f6" : "#ef4444"; // Bleue pour hebdo, rouge pour daily

    const itemsHtml = recalls.map(item => {
        const imgUrl = item.liens_vers_les_images ? item.liens_vers_les_images.split('|')[0] : 'https://placehold.co/150x150/f1f5f9/94a3b8?text=Image\\nIndisponible';
        const isCritical = item.risques_encourus?.toLowerCase().match(/listeria|salmonelle|norovirus|botulisme/);
        const badgeColor = isCritical ? '#dc2626' : '#f59e0b';
        const badgeText = isCritical ? 'CRITIQUE' : 'AVERTISSEMENT';
        const badgeBg = isCritical ? '#fef2f2' : '#fffbeb';

        return `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; margin-bottom: 24px; overflow: hidden; font-family: 'Helvetica Neue', Arial, sans-serif; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: ${badgeColor}; height: 6px;"></div>
            <div style="padding: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                    <tr>
                        <td width="120" valign="top">
                            <img src="${imgUrl}" width="120" height="120" style="border-radius: 12px; object-fit: cover; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" alt="Image du produit">
                        </td>
                        <td style="padding-left: 20px;" valign="top">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${badgeColor}33;">
                                            ${badgeText}
                                        </span>
                                        <span style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-left: 8px;">
                                            ${item.sous_categorie_produit}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            <h3 style="margin: 10px 0 6px 0; color: #0f172a; font-size: 20px; letter-spacing: -0.5px;">${item.marque_produit?.toUpperCase() || "MARQUE INCONNUE"}</h3>
                            <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.5;">${item.libelle}</p>
                        </td>
                    </tr>
                </table>
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; font-size: 14px; border: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 10px 0; line-height: 1.5;"><strong style="color: #334155;">⚠️ Motif :</strong> <span style="color: #475569;">${cleanText(item.motif_rappel)}</span></p>
                    <p style="margin: 0; color: #64748b; line-height: 1.5;"><strong style="color: #334155;">☣️ Risques :</strong> ${cleanText(item.risques_encourus)}</p>
                </div>
                <div style="margin-top: 20px; text-align: right;">
                    <a href="${item.lien_vers_la_fiche_rappel}" style="display: inline-block; background-color: ${headerColor}; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px ${headerColor}40;">Consulter la fiche officielle &rarr;</a>
                </div>
            </div>
        </div>`;
    }).join('');

    return `<!DOCTYPE html><html>
    <body style="background-color: #f1f5f9; padding: 30px 10px; margin: 0;">
        <div style="max-width: 640px; margin: auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f172a; font-size: 28px; margin-bottom: 8px; letter-spacing: -1px;">${headerTitle}</h1>
                <p style="text-align: center; color: #64748b; font-size: 15px; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0;">Condensé du ${today} • <strong>${recalls.length}</strong> alertes identifiées</p>
                ${dashboardUrl ? `
                <div style="margin-top: 20px;">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-size: 14px; font-weight: 700; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">🌐 Visualiser sur le site web &rarr;</a>
                </div>` : ''}
            </div>
            ${itemsHtml}
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; font-family: 'Helvetica Neue', Arial, sans-serif;">
                <p style="color: #94a3b8; font-size: 13px;">Données fournies par l'API officielle RappelConso (data.gouv.fr)</p>
                <p style="color: #94a3b8; font-size: 13px;">Restez vigilant face aux risques sanitaires.</p>
            </div>
        </div>
    </body></html>`;
}

async function sendEmail(recalls, isWeekly = false, dashboardUrl = null) {
    try {
        const title = isWeekly
            ? `📊 RÉCAPITULATIF HEBDOMADAIRE : ${recalls.length} alertes`
            : `⚠️ RappelConso : ${recalls.length} alertes aujourd'hui`;

        const html = generateHtmlEmail(recalls, isWeekly, dashboardUrl); // Tu peux aussi modifier le HTML pour dire "Récap de la semaine"

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

export { sendEmail };