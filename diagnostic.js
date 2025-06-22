/**
 * Script de diagnostic du service de notification
 * Permet de tester les différentes étapes de la chaîne d'envoi d'emails
 * 
 * Usage: node diagnostic.js <email>
 */

const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Chargement des variables d'environnement
dotenv.config();

// Récupération de l'email de test
const email = process.argv[2] || 'test@example.com';

// Configuration
const PORT = process.env.PORT || 3006;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const NOTIFICATION_URL = `http://localhost:${PORT}/notifications`;
const LOG_DIR = path.join(__dirname, 'logs');

console.log('========== DIAGNOSTIC DU SERVICE DE NOTIFICATION ==========');
console.log(`Date du test: ${new Date().toISOString()}`);
console.log(`Email de test: ${email}`);

// Fonction pour vérifier que le dossier de logs existe
async function checkLogDir() {
    console.log('\n----- TEST 1: Vérification du dossier de logs -----');
    
    try {
        if (!fs.existsSync(LOG_DIR)) {
            console.log(`❌ Le dossier logs n'existe pas. Création du dossier...`);
            fs.mkdirSync(LOG_DIR, { recursive: true });
            console.log(`✅ Dossier logs créé: ${LOG_DIR}`);
        } else {
            console.log(`✅ Le dossier logs existe: ${LOG_DIR}`);
            const files = fs.readdirSync(LOG_DIR);
            console.log(`📂 Fichiers trouvés: ${files.length}`);
            files.forEach(file => console.log(`   - ${file}`));
        }
    } catch (error) {
        console.error(`❌ Erreur lors de la vérification du dossier logs: ${error.message}`);
    }
}

// Fonction pour vérifier que le service est en ligne
async function checkServiceHealth() {
    console.log('\n----- TEST 2: Vérification du service de notification -----');
    
    try {
        const response = await axios.get(`http://localhost:${PORT}/health`);
        console.log(`✅ Le service est en ligne`);
        console.log(`📋 Réponse: ${JSON.stringify(response.data)}`);
        return true;
    } catch (error) {
        console.error(`❌ Le service n'est pas accessible: ${error.message}`);
        console.log(`💡 Assurez-vous que le service est démarré et accessible sur le port ${PORT}`);
        return false;
    }
}

// Fonction pour tester la connexion à Gmail
async function testGmailConnection() {
    console.log('\n----- TEST 3: Connexion à Gmail -----');
    
    if (!EMAIL_USER || !EMAIL_PASS) {
        console.error(`❌ Variables d'environnement EMAIL_USER ou EMAIL_PASS non définies`);
        console.log(`💡 Créez un fichier .env avec ces variables:`);
        console.log(`EMAIL_USER=votre-email@gmail.com`);
        console.log(`EMAIL_PASS=votre-mot-de-passe-application`);
        return false;
    }
    
    console.log(`📧 Tentative de connexion à Gmail avec: ${EMAIL_USER}`);
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Vérifier la connexion
        await new Promise((resolve, reject) => {
            transporter.verify(function(error, success) {
                if (error) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });
        
        console.log(`✅ Connexion à Gmail réussie`);
        return true;
    } catch (error) {
        console.error(`❌ Échec de connexion à Gmail: ${error.message}`);
        if (error.message.includes('Invalid login')) {
            console.log(`💡 Vérifiez que votre mot de passe d'application est correct`);
            console.log(`💡 Pour Gmail, vous devez créer un mot de passe d'application: https://myaccount.google.com/apppasswords`);
        }
        return false;
    }
}

// Fonction pour tester l'envoi d'un email simple
async function testSendEmail() {
    console.log('\n----- TEST 4: Envoi d\'un email simple -----');
    
    try {
        const response = await axios.post(`${NOTIFICATION_URL}/send-email`, {
            to: email,
            subject: 'Test de diagnostic - ' + new Date().toISOString(),
            text: 'Ceci est un email de test envoyé par le script de diagnostic.\n\nHeure: ' + new Date().toISOString()
        });
        
        console.log(`✅ Requête d'envoi d'email acceptée`);
        console.log(`📋 Réponse: ${JSON.stringify(response.data)}`);
        return true;
    } catch (error) {
        console.error(`❌ Échec de la requête d'envoi d'email: ${error.message}`);
        if (error.response) {
            console.error(`📋 Réponse d'erreur: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

// Fonction pour tester une notification d'abonnement
async function testSubscriptionNotification() {
    console.log('\n----- TEST 5: Envoi d\'une notification d\'abonnement -----');
    
    try {
        const response = await axios.post(`${NOTIFICATION_URL}/subscription-notification`, {
            to: email,
            type: 'new',
            data: {
                testId: Date.now(),
                source: 'diagnostic-script'
            }
        });
        
        console.log(`✅ Requête de notification d'abonnement acceptée`);
        console.log(`📋 Réponse: ${JSON.stringify(response.data)}`);
        return true;
    } catch (error) {
        console.error(`❌ Échec de la requête de notification d'abonnement: ${error.message}`);
        if (error.response) {
            console.error(`📋 Réponse d'erreur: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

// Fonction pour simuler une requête du service de paiement
async function simulatePaymentServiceRequest() {
    console.log('\n----- TEST 6: Simulation d\'une requête du service de paiement -----');
    
    try {
        // Utiliser le même format que dans stripeService.js
        const response = await axios.post(`${NOTIFICATION_URL}/subscription-notification`, {
            to: email,
            type: 'new',
            data: { 
                checkoutCompleted: true,
                subscriptionId: 'sub_sim_' + Date.now(),
                _requestTimestamp: new Date().toISOString()
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': 'payment-service-simulation-' + Date.now()
            }
        });
        
        console.log(`✅ Simulation du service de paiement réussie`);
        console.log(`📋 Réponse: ${JSON.stringify(response.data)}`);
        return true;
    } catch (error) {
        console.error(`❌ Échec de la simulation du service de paiement: ${error.message}`);
        if (error.response) {
            console.error(`📋 Réponse d'erreur: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

// Fonction pour afficher le résumé et les recommandations
function showSummary(results) {
    console.log('\n========== RÉSUMÉ DU DIAGNOSTIC ==========');
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    
    console.log(`Tests réussis: ${passedTests}/${totalTests}`);
    
    if (passedTests === totalTests) {
        console.log(`\n✅ Tous les tests ont réussi! Le service de notification semble fonctionner correctement.`);
        console.log(`\n📧 Vérifiez votre boîte de réception et vos spams pour voir si les emails sont bien arrivés.`);
        return;
    }
    
    console.log('\n🔍 Problèmes détectés:');
    
    if (!results.logDir) {
        console.log(`- Le dossier de logs n'existe pas ou n'est pas accessible.`);
    }
    
    if (!results.serviceHealth) {
        console.log(`- Le service de notification n'est pas accessible.`);
        console.log(`  💡 Démarrez le service avec: npm start`);
    }
    
    if (!results.gmailConnection) {
        console.log(`- Impossible de se connecter à Gmail.`);
        console.log(`  💡 Vérifiez vos identifiants dans le fichier .env`);
        console.log(`  💡 Pour Gmail, utilisez un mot de passe d'application: https://myaccount.google.com/apppasswords`);
    }
    
    if (!results.sendEmail) {
        console.log(`- Échec de l'envoi d'email.`);
        console.log(`  💡 Vérifiez les logs pour plus de détails.`);
    }
    
    if (!results.subscriptionNotification) {
        console.log(`- Échec de la notification d'abonnement.`);
    }
    
    if (!results.paymentServiceSimulation) {
        console.log(`- Échec de la simulation du service de paiement.`);
        console.log(`  💡 Vérifiez que les deux services sont correctement configurés.`);
    }
    
    console.log('\n💡 Actions recommandées:');
    console.log('1. Vérifiez que le fichier .env contient les bonnes variables.');
    console.log('2. Assurez-vous que Gmail autorise les applications moins sécurisées ou utilisez un mot de passe d\'application.');
    console.log('3. Vérifiez les journaux dans le dossier logs/ pour plus de détails.');
    console.log('4. Testez l\'envoi d\'email avec: node test-notification.js votre-email@example.com test-email');
    console.log('5. Vérifiez que le service de paiement est correctement configuré pour appeler le service de notification.');
}

// Fonction principale
async function runDiagnostic() {
    const results = {
        logDir: false,
        serviceHealth: false,
        gmailConnection: false,
        sendEmail: false,
        subscriptionNotification: false,
        paymentServiceSimulation: false
    };
    
    try {
        results.logDir = await checkLogDir();
        results.serviceHealth = await checkServiceHealth();
        
        if (results.serviceHealth) {
            results.gmailConnection = await testGmailConnection();
            
            if (results.gmailConnection) {
                results.sendEmail = await testSendEmail();
                
                if (results.sendEmail) {
                    results.subscriptionNotification = await testSubscriptionNotification();
                    results.paymentServiceSimulation = await simulatePaymentServiceRequest();
                }
            }
        }
    } catch (error) {
        console.error(`❌ Erreur lors du diagnostic: ${error.message}`);
    } finally {
        showSummary(results);
    }
}

// Exécuter le diagnostic
runDiagnostic(); 