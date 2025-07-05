const express = require('express');
const router = express.Router();

// Importer les contrôleurs
const emailController = require('../controllers/emailController');
const subscriptionController = require('../controllers/subscriptionController');
const invoiceController = require('../controllers/invoiceController');
const authController = require('../controllers/authController');

// Routes de base pour les emails
router.post('/send-email', emailController.sendEmail);
router.post('/test-email', emailController.sendTestEmail);

// Routes pour les notifications d'abonnement
router.post('/subscription/start', subscriptionController.handleSubscriptionStart);
router.post('/subscription/cancelled', subscriptionController.handleSubscriptionCancelled);
router.post('/subscription/payment-failed', subscriptionController.handlePaymentFailed);
router.post('/subscription/expiring-soon', subscriptionController.handleSubscriptionExpiring);
router.post('/subscription/reactivated', subscriptionController.handleSubscriptionReactivated);
router.post('/subscription/updated', subscriptionController.handleSubscriptionUpdated);

// Route générique pour les notifications d'abonnement (compatibilité)
router.post('/subscription-notification', subscriptionController.handleGenericSubscriptionNotification);

// Routes pour les factures
router.post('/invoice', invoiceController.sendInvoiceEmail);

// Routes pour l'authentification
router.post('/email-verification', authController.sendVerificationEmail);
router.post('/welcome', authController.sendWelcomeEmail);
router.post('/password-reset-email', emailController.sendPasswordResetEmail);
router.post('/password-changed', authController.sendPasswordChangedEmail);

// Route de santé pour vérifier que le service fonctionne
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'notification-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 