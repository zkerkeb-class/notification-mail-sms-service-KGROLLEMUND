// const express = require('express');
// const { 
//     sendEmail, 
//     sendSubscriptionNotification, 
//     sendInvoiceEmail,
//     sendEmailConfirmation,
//     sendPasswordResetCode,
//     sendPushNotification 
// } = require('../notificationService');
// // const { sendEmail, sendSMS } = require('../notificationService');

// const router = express.Router();

// // Route pour envoyer un e-mail standard
// router.post('/send-email', async (req, res) => {
//     const { to, subject, text, attachments } = req.body;
    
//     if (!to || !subject || !text) {
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Les champs "to", "subject" et "text" sont requis' 
//         });
//     }
    
//     try {
//         await sendEmail(to, subject, text, attachments);
//         res.status(200).json({ success: true, message: 'E-mail envoyé avec succès' });
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Erreur lors de l\'envoi de l\'e-mail', 
//             error: error.message 
//         });
//     }
// });

// // Route pour envoyer une notification d'abonnement
// router.post('/subscription-notification', async (req, res) => {
//     console.log(`\n====== NOUVELLE NOTIFICATION D'ABONNEMENT ======`);
//     console.log(`📥 Réception d'une requête à: ${new Date().toISOString()}`);
//     console.log(`📋 Headers: ${JSON.stringify(req.headers)}`);
    
//     const { to, type, data } = req.body;
    
//     console.log(`📎 Réception de notification d'abonnement - Type: ${type}, Destination: ${to}`);
//     console.log(`📦 Données: ${JSON.stringify(data || {})}`);
    
//     if (!to || !type) {
//         console.warn(`⚠️ Requête de notification d'abonnement invalide: ${JSON.stringify(req.body)}`);
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Les champs "to" et "type" sont requis' 
//         });
//     }
    
//     // Valider le format de l'email
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(to)) {
//         console.warn(`⚠️ Format d'email invalide: ${to}`);
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Format d\'email invalide' 
//         });
//     }
    
//     // Valider le type de notification
//     const validTypes = ['new', 'payment_failed', 'cancellation_scheduled', 'reactivated', 'ended'];
//     if (!validTypes.includes(type)) {
//         console.warn(`⚠️ Type de notification non reconnu: ${type}`);
//         console.warn(`⚠️ Types valides: ${validTypes.join(', ')}`);
//         // Ne pas rejeter, mais informer
//         console.warn(`⚠️ Tentative d'envoi malgré le type non reconnu`);
//     }
    
//     try {
//         console.log(`🚀 Début du traitement de la notification d'abonnement de type "${type}"`);
//         const result = await sendSubscriptionNotification(to, type, data);
//         console.log(`✅ Notification d'abonnement envoyée avec succès - Type: ${type}, Destination: ${to}`);
//         console.log(`📊 Résultat: ${JSON.stringify(result)}`);
//         console.log(`====== FIN DE NOTIFICATION (SUCCÈS) ======\n`);
//         res.status(200).json({ success: true, message: 'Notification d\'abonnement envoyée avec succès' });
//     } catch (error) {
//         console.error(`❌ ERREUR lors de l'envoi de la notification d'abonnement de type "${type}":`, error);
//         console.error(`❌ Message d'erreur: ${error.message}`);
//         console.error(`❌ Stack trace: ${error.stack}`);
        
//         // Essayer à nouveau avec un template de secours
//         if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
//             try {
//                 console.log(`🔄 Tentative de nouvel envoi avec un template de secours...`);
//                 // Créer un texte simple pour la notification
//                 const backupText = `Notification concernant votre abonnement (type: ${type}).\nCeci est un message de secours suite à une erreur technique.`;
//                 await sendEmail(to, `Information sur votre abonnement - ${type}`, backupText);
//                 console.log(`✅ Email de secours envoyé avec succès à ${to}`);
//                 console.log(`====== FIN DE NOTIFICATION (SECOURS) ======\n`);
                
//                 return res.status(200).json({ 
//                     success: true, 
//                     message: 'Notification envoyée via un template de secours',
//                     warning: 'Un problème de connexion a été rencontré, mais un email de secours a été envoyé' 
//                 });
//             } catch (backupError) {
//                 console.error(`❌ ERREUR lors de l'envoi de l'email de secours:`, backupError);
//                 console.log(`====== FIN DE NOTIFICATION (ÉCHEC COMPLET) ======\n`);
//                 return res.status(500).json({ 
//                     success: false, 
//                     message: 'Erreur lors de l\'envoi de la notification d\'abonnement et de la tentative de secours', 
//                     error: error.message,
//                     backupError: backupError.message
//                 });
//             }
//         }
        
//         console.log(`====== FIN DE NOTIFICATION (ÉCHEC) ======\n`);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Erreur lors de l\'envoi de la notification d\'abonnement', 
//             error: error.message 
//         });
//     }
// });

// // Route pour envoyer une facture par e-mail
// router.post('/invoice', async (req, res) => {
//     const { to, invoiceData } = req.body;
    
//     if (!to || !invoiceData) {
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Les champs "to" et "invoiceData" sont requis' 
//         });
//     }
    
//     try {
//         await sendInvoiceEmail(to, invoiceData);
//         res.status(200).json({ success: true, message: 'Facture envoyée avec succès' });
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi de la facture:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Erreur lors de l\'envoi de la facture', 
//             error: error.message 
//         });
//     }
// });

// // Route pour envoyer un SMS
// router.post('/send-sms', async (req, res) => {
//     const { to, message } = req.body;
    
//     if (!to || !message) {
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Les champs "to" et "message" sont requis' 
//         });
//     }
    
//     try {
//         // Commenter cette ligne si Twilio n'est pas configuré
//         // await sendSMS(to, message);
//         res.status(200).json({ success: true, message: 'SMS envoyé avec succès (simulation)' });
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi du SMS:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Erreur lors de l\'envoi du SMS', 
//             error: error.message 
//         });
//     }
// });

// // Route de test pour vérifier l'envoi d'email
// router.get('/test-email', async (req, res) => {
//     const testEmail = req.query.email || 'votre-email@gmail.com';
    
//     try {
//         await sendEmail(
//             testEmail,
//             'Test de notification - Ne pas répondre',
//             'Ceci est un email de test pour vérifier que le service de notification fonctionne correctement.'
//         );
        
//         res.status(200).json({ 
//             success: true, 
//             message: `Email de test envoyé avec succès à ${testEmail}. Vérifiez votre boîte de réception.` 
//         });
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi de l\'email de test:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Erreur lors de l\'envoi de l\'email de test', 
//             error: error.message,
//             stack: error.stack 
//         });
//     }
// });

// // Route pour envoyer un e-mail de confirmation d'adresse e-mail
// router.post('/email-confirmation', async (req, res) => {
//     const { to, confirmationToken } = req.body;
    
//     if (!to || !confirmationToken) {
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Les champs "to" et "confirmationToken" sont requis' 
//         });
//     }
    
//     try {
//         await sendEmailConfirmation(to, confirmationToken);
//         res.status(200).json({ 
//             success: true, 
//             message: 'E-mail de confirmation envoyé avec succès' 
//         });
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi de l\'e-mail de confirmation:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Erreur lors de l\'envoi de l\'e-mail de confirmation', 
//             error: error.message 
//         });
//     }
// });

// // Route pour envoyer une notification push
// router.post('/push-notification', async (req, res) => {
//     const { userId, title, body, data } = req.body;
    
//     if (!userId || !title || !body) {
//         return res.status(400).json({ 
//             success: false, 
//             message: 'Les champs "userId", "title" et "body" sont requis' 
//         });
//     }
    
//     try {
//         const result = await sendPushNotification(userId, title, body, data);
//         res.status(200).json({ 
//             success: true, 
//             message: 'Notification push envoyée avec succès',
//             result 
//         });
//     } catch (error) {
//         console.error('Erreur lors de l\'envoi de la notification push:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Erreur lors de l\'envoi de la notification push', 
//             error: error.message 
//         });
//     }
// });

// module.exports = router; 