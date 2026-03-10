import 'dotenv/config';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { sendEmail } from './services/email.js'; // Déplacez votre code Resend ici
import { sendTelegram } from './services/telegram.js';

async function getDailyRecalls(daysBack = 1) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const dateString = startDate.toISOString().split('T')[0];

    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/rappelconso-v2-gtin-espaces/records`;

    let allResults = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    try {
        while (hasMore) {
            const response = await axios.get(url, {
                params: {
                    where: `date_publication >= "${dateString}" AND categorie_produit = "alimentation"`,
                    limit: limit,
                    offset: offset,
                    order_by: "date_publication DESC"
                }
            });

            const results = response.data.results || [];
            allResults = allResults.concat(results);

            if (results.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
            }
        }
        return allResults;
    } catch (e) {
        console.error("Erreur API:", e.message);
        return [];
    }
}

async function main() {
    // Vérification des variables d'environnement
    const requiredEnvVars = ['RESEND_API_KEY', 'EMAIL_TO', 'TELEGRAM_TOKEN', 'TELEGRAM_CHAT_ID'];
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingVars.length > 0) {
        console.error(`❌ Erreur critique : Il manque les variables d'environnement suivantes\n   -> ${missingVars.join(', ')}`);
        console.error(`Assurez-vous qu'elles sont définies dans votre fichier .env ou dans les secrets GitHub Actions.`);
        process.exit(1);
    }

    const today = new Date();
    const isSunday = today.getDay() === 0; // 0 = Dimanche

    const daysToFetch = isSunday ? 7 : 1;
    console.log(`📡 Récupération des rappels pour les ${daysToFetch} dernier(s) jour(s)...`);

    const recalls = await getDailyRecalls(daysToFetch);

    if (recalls.length > 0) {
        console.log(`🔔 ${recalls.length} rappel(s) trouvé(s). Envoi des notifications...`);

        // Sauvegarde pour GitHub Pages
        try {
            const docsDir = path.join(process.cwd(), 'docs');
            await fs.mkdir(docsDir, { recursive: true });
            const dataPath = path.join(docsDir, 'data.json');

            const dashboardData = {
                lastUpdate: new Date().toISOString(),
                recalls: recalls
            };

            await fs.writeFile(dataPath, JSON.stringify(dashboardData, null, 2));
            console.log(`📂 Données sauvegardées dans ${dataPath} pour GitHub Pages.`);
        } catch (err) {
            console.error("❌ Erreur lors de la sauvegarde des données:", err.message);
        }

        await Promise.all([
            sendEmail(recalls, isSunday),
            sendTelegram(recalls, isSunday)
        ]);
        console.log(`✅ Traitement terminé avec succès.`);
    } else {
        console.log("ℹ️ Aucun rappel trouvé pour cette période.");
    }
}

main();