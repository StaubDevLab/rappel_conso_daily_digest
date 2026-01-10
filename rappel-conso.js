require('dotenv').config()
const axios = require('axios');
const { sendEmail } = require('./services/email'); // Déplacez votre code Resend ici
const { sendTelegram } = require('./services/telegram');

async function getDailyRecalls(daysBack = 1) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const dateString = startDate.toISOString().split('T')[0];

    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records`;

    try {
        const response = await axios.get(url, {
            params: {
                where: `date_publication >= "${dateString}" AND categorie_produit = "alimentation"`,
                limit: 100,
                order_by: "date_publication DESC"
            }
        });
        return response.data.results || [];
    } catch (e) {
        console.error("Erreur API:", e.message);
        return [];
    }
}

async function main() {
    const today = new Date();
    const isSunday = today.getDay() === 0; // 0 = Dimanche

    const daysToFetch = isSunday ? 7 : 1;
    const recalls = await getDailyRecalls(daysToFetch);

    if (recalls.length > 0) {
        await Promise.all([
            sendEmail(recalls, isSunday),
            sendTelegram(recalls, isSunday)
        ]);
    } else {
        console.log("Aucun rappel trouvé.");
    }
}

main();