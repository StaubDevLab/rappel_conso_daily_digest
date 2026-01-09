const axios = require('axios');
const { sendEmail } = require('./services/email'); // Déplacez votre code Resend ici
const { sendTelegram } = require('./services/telegram');

async function getDailyRecalls() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];

    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records`;

    try {
        const response = await axios.get(url, {
            params: {
                where: `date_publication >= "${dateString}" AND categorie_produit = "alimentation"`,
                limit: 20
            }
        });
        return response.data.results || [];
    } catch (e) { return []; }
}

async function main() {
    const recalls = await getDailyRecalls();

    if (recalls.length > 0) {
        // Exécute les deux envois en même temps
        await Promise.all([
            sendEmail(recalls),
            sendTelegram(recalls)
        ]);
    }
}

main();