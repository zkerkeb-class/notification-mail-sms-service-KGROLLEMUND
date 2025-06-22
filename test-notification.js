/**
 * Script de test pour le service de notification
 * Permet de tester l'envoi d'emails de différents types
 * 
 * Usage: 
 * node test-notification.js <email> <type>
 * 
 * Types disponibles:
 * - test-email: Email de test simple
 * - subscription-new: Notification de nouvel abonnement
 * - subscription-payment-failed: Notification d'échec de paiement
 * - subscription-ended: Notification de fin d'abonnement
 * - invoice: Notification de facture
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
console.log('NOTIFICATION_SERVICE_URL:', NOTIFICATION_SERVICE_URL);
// Récupérer les arguments
const args = process.argv.slice(2);
const email = args[0];
const type = args[1] || 'test-email';

if (!email) {
    console.error('❌ Erreur: Adresse email requise');
    console.log('Usage: node test-notification.js <email> <type>');
    process.exit(1);
}

// Fonction pour envoyer une requête au service de notification
async function callNotificationService(endpoint, data) {
    try {
        console.log(`📤 Envoi de la requête à ${NOTIFICATION_SERVICE_URL}/notifications/${endpoint}`);
        console.log(`📦 Données: ${JSON.stringify(data)}`);
        
        const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications/${endpoint}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Réponse:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Erreur lors de l\'appel au service de notification:', error.message);
        
        if (error.response) {
            console.error('Réponse d\'erreur:', error.response.data);
        }
        
        throw error;
    }
}

// Fonction principale
async function runTest() {
    console.log(`🚀 Test du service de notification`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔖 Type: ${type}`);
    
    try {
        switch (type) {
            case 'test-email':
                await callNotificationService('send-email', {
                    to: email,
                    subject: 'Test de notification - Ne pas répondre',
                    text: 'Ceci est un email de test pour vérifier que le service de notification fonctionne correctement.\n\nSi vous recevez cet email, le service fonctionne!'
                });
                break;
                
            case 'subscription-new':
                await callNotificationService('subscription-notification', {
                    to: email,
                    type: 'new',
                    data: {
                        checkoutCompleted: true,
                        subscriptionId: 'sub_test_' + Date.now()
                    }
                });
                break;
                
            case 'subscription-payment-failed':
                await callNotificationService('subscription-notification', {
                    to: email,
                    type: 'payment_failed',
                    data: {
                        invoiceId: 'inv_test_' + Date.now(),
                        amountDue: 9.99,
                        currency: 'eur'
                    }
                });
                break;
                
            case 'subscription-ended':
                await callNotificationService('subscription-notification', {
                    to: email,
                    type: 'ended'
                });
                break;
                
            case 'invoice':
                await callNotificationService('invoice', {
                    to: email,
                    invoiceData: {
                        amount: 999, // En centimes
                        currency: 'eur',
                        date: new Date().toISOString(),
                        invoiceNumber: 'INV-TEST-' + Date.now(),
                        planName: 'Service Premium (Test)'
                    }
                });
                break;
                
            default:
                console.error(`❌ Type de test inconnu: ${type}`);
                console.log('Types disponibles: test-email, subscription-new, subscription-payment-failed, subscription-ended, invoice');
                process.exit(1);
        }
        
        console.log('✅ Test terminé avec succès!');
    } catch (error) {
        console.error('❌ Échec du test:', error.message);
        process.exit(1);
    }
}

// Exécuter le test
runTest(); 