const express = require('express');
const router = express.Router();

// Importer les contrôleurs
const emailController = require('../controllers/emailController');
const subscriptionController = require('../controllers/subscriptionController');
const authController = require('../controllers/authController');

// Route de santé
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Route générique pour envoyer un email
router.post('/send-email', emailController.sendGenericEmail);

// --- Notifications d'Abonnement ---
router.post('/subscription/start', subscriptionController.handleSubscriptionStart);
router.post('/subscription/cancelled', subscriptionController.handleSubscriptionCancelled);
router.post('/subscription/payment-failed', subscriptionController.handlePaymentFailed);
router.post('/subscription/updated', subscriptionController.handleSubscriptionUpdated);
router.post('/subscription-notification', subscriptionController.handleGenericSubscriptionNotification);

// --- Notifications d'Authentification ---
router.post('/email-verification', authController.sendVerificationEmail);
router.post('/welcome', authController.sendWelcomeEmail);

module.exports = router; 