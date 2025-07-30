const notificationService = require('../notificationService');

/**
 * Templates pour les notifications d'abonnement
 */
const subscriptionTemplates = {
  // Notification de nouvel abonnement
  start: {
    getSubject: () => 'Votre abonnement a été activé',
    getText: (data) => 
      `Félicitations !
      
Votre abonnement a été activé avec succès.

ID d'abonnement: ${data.subscriptionId || 'N/A'}
Plan: ${data.planType || 'Premium'}
Date de fin: ${new Date(data.endDate || Date.now() + 30*24*60*60*1000).toLocaleDateString()}

Merci de votre confiance !`,
    getHTML: (data) => `
      <h2>Votre abonnement a été activé</h2>
      <p>Félicitations ! Votre abonnement a été activé avec succès.</p>
      <p>ID d'abonnement: <strong>${data.subscriptionId || 'N/A'}</strong></p>
      <p>Plan: <strong>${data.planType || 'Premium'}</strong></p>
      <p>Date de fin: <strong>${new Date(data.endDate || Date.now() + 30*24*60*60*1000).toLocaleDateString()}</strong></p>
      <p>Merci de votre confiance !</p>
    `
  },
  
  // Notification d'annulation d'abonnement
  cancelled: {
    getSubject: () => 'Votre abonnement a été annulé',
    getText: (data) => 
      `Votre abonnement a été annulé.
      
Il restera actif jusqu'à la fin de la période en cours: ${new Date(data.endDate || Date.now() + 30*24*60*60*1000).toLocaleDateString()}

Nous espérons vous revoir bientôt !`,
    getHTML: (data) => `
      <h2>Votre abonnement a été annulé</h2>
      <p>Votre abonnement a été annulé avec succès.</p>
      <p>Il restera actif jusqu'à la fin de la période en cours : <strong>${new Date(data.endDate || Date.now() + 30*24*60*60*1000).toLocaleDateString()}</strong></p>
      <p>Nous espérons vous revoir bientôt !</p>
    `
  },
  
  // Notification d'échec de paiement
  paymentFailed: {
    getSubject: () => '⚠️ Problème avec votre paiement',
    getText: (data) => 
      `Bonjour,

Nous n'avons pas pu traiter votre paiement de ${data.amountDue || '?'} ${(data.currency || 'EUR').toUpperCase()}.

Pour continuer à bénéficier de votre abonnement premium, veuillez mettre à jour vos informations de paiement en vous connectant à votre compte.

Si vous avez des questions, n'hésitez pas à contacter notre service client.

Cordialement,
L'équipe de support`,
    getHTML: (data) => `
      <h2>Problème de paiement</h2>
      <p>Nous avons rencontré un problème lors du traitement de votre paiement.</p>
      <p>Montant: <strong>${data.amountDue || '?'} ${(data.currency || 'EUR').toUpperCase()}</strong></p>
      <p>Pour continuer à bénéficier de votre abonnement premium, veuillez mettre à jour vos informations de paiement en vous connectant à votre compte.</p>
      <p>Si vous avez des questions, n'hésitez pas à contacter notre service client.</p>
    `
  },
  
  // Notification d'expiration programmée
  expiringSoon: {
    getSubject: () => '📅 Votre abonnement va bientôt expirer',
    getText: (data) => 
      `Bonjour,

Votre abonnement est programmé pour se terminer le ${new Date(data.endDate).toLocaleDateString()}.

Vous pouvez le renouveler à tout moment en vous connectant à votre compte.

Nous espérons vous compter à nouveau parmi nos abonnés très bientôt.

Cordialement,
L'équipe de support`,
    getHTML: (data) => `
      <h2>Votre abonnement va bientôt expirer</h2>
      <p>Votre abonnement est programmé pour se terminer le <strong>${new Date(data.endDate).toLocaleDateString()}</strong>.</p>
      <p>Vous pouvez le renouveler à tout moment en vous connectant à votre compte.</p>
      <p>Nous espérons vous compter à nouveau parmi nos abonnés très bientôt.</p>
    `
  },
  
  // Notification de réactivation
  reactivated: {
    getSubject: () => '✅ Votre abonnement a été réactivé',
    getText: () => 
      `Bonjour,

Votre abonnement a été réactivé avec succès. Merci de votre confiance!

Vous bénéficiez à nouveau de tous les avantages premium.

Cordialement,
L'équipe de support`,
    getHTML: () => `
      <h2>Votre abonnement a été réactivé</h2>
      <p>Votre abonnement a été réactivé avec succès. Merci de votre confiance!</p>
      <p>Vous bénéficiez à nouveau de tous les avantages premium.</p>
    `
  },

  // Notification de mise à jour d'abonnement
  updated: {
    getSubject: () => 'Votre abonnement a été mis à jour',
    getText: (data) => 
      `Bonjour,
      
Votre abonnement a été mis à jour.
Nouveau statut: ${data.newStatus || 'N/A'}

Si vous n'êtes pas à l'origine de cette modification, veuillez contacter notre support.

Cordialement,
L'équipe`,
    getHTML: (data) => `
      <h2>Votre abonnement a été mis à jour</h2>
      <p>Bonjour,</p>
      <p>Votre abonnement a été mis à jour avec succès.</p>
      <p>Nouveau statut: <strong>${data.newStatus || 'N/A'}</strong></p>
      <p>Si vous n'êtes pas à l'origine de cette modification, veuillez contacter notre support.</p>
    `
  }
};

/**
 * Gère le démarrage d'un abonnement
 */
const handleSubscriptionStart = async (req, res) => {
  try {
    const { email, subscriptionData } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email destinataire requis' });
    }
    
    console.log(`📧 Notification de début d'abonnement à ${email}`);
    console.log(`📦 Données d'abonnement:`, JSON.stringify(subscriptionData || {}, null, 2));
    
    const template = subscriptionTemplates.start;
    
    const result = await notificationService.sendEmail({
      to: email,
      subject: template.getSubject(),
      text: template.getText(subscriptionData || {}),
      html: template.getHTML(subscriptionData || {})
    });
    
    res.json({ success: true, message: "Notification de début d'abonnement envoyée avec succès", ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification de début d\'abonnement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gère l'annulation d'un abonnement
 */
const handleSubscriptionCancelled = async (req, res) => {
  try {
    const { email, subscriptionData } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email destinataire requis' });
    }
    
    console.log(`📧 Notification d'annulation d'abonnement à ${email}`);
    console.log(`📦 Données d'abonnement:`, JSON.stringify(subscriptionData || {}, null, 2));
    
    const template = subscriptionTemplates.cancelled;
    
    const result = await notificationService.sendEmail({
      to: email,
      subject: template.getSubject(),
      text: template.getText(subscriptionData || {}),
      html: template.getHTML(subscriptionData || {})
    });
    
    res.json({ success: true, message: "Notification d'annulation envoyée avec succès", ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification d\'annulation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gère la notification d'échec de paiement
 */
const handlePaymentFailed = async (req, res) => {
  try {
    const { email, subscriptionData } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email destinataire requis' });
    }
    
    console.log(`📧 Notification d'échec de paiement à ${email}`);
    console.log(`📦 Données d'abonnement:`, JSON.stringify(subscriptionData || {}, null, 2));
    
    const template = subscriptionTemplates.paymentFailed;
    
    const result = await notificationService.sendEmail({
      to: email,
      subject: template.getSubject(),
      text: template.getText(subscriptionData || {}),
      html: template.getHTML(subscriptionData || {})
    });
    
    res.json({ success: true, message: "Notification d'échec de paiement envoyée avec succès", ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification d\'échec de paiement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Gère la notification de mise à jour d'abonnement
 */
const handleSubscriptionUpdated = async (req, res) => {
  try {
    const { to, subscriptionId, newStatus } = req.body;
    
    if (!to) {
      return res.status(400).json({ success: false, message: 'Email destinataire requis' });
    }
    
    console.log(`📧 Notification de mise à jour d'abonnement à ${to}`);
    
    const template = subscriptionTemplates.updated;
    const emailData = { newStatus };
    
    const result = await notificationService.sendEmail({
      to: to,
      subject: template.getSubject(),
      text: template.getText(emailData),
      html: template.getHTML(emailData)
    });
    
    res.json({ success: true, message: "Notification de mise à jour envoyée avec succès", ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification de mise à jour:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fonction polyvalente pour gérer toutes les notifications d'abonnement
 */
const handleGenericSubscriptionNotification = async (req, res) => {
  try {
    const { to, type, data } = req.body;
    
    if (!to || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Les champs "to" et "type" sont requis' 
      });
    }
    
    // Vérifier que le type est valide
    const validTypes = ['new', 'cancelled', 'payment_failed', 'expiring_soon', 'reactivated'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: `Type de notification invalide. Types valides: ${validTypes.join(', ')}` 
      });
    }
    
    // Mapper le type vers le handler approprié
    let template;
    
    switch(type) {
      case 'new':
        template = subscriptionTemplates.start;
        break;
      case 'cancelled':
        template = subscriptionTemplates.cancelled;
        break;
      case 'payment_failed':
        template = subscriptionTemplates.paymentFailed;
        break;
      case 'expiring_soon':
        template = subscriptionTemplates.expiringSoon;
        break;
      case 'reactivated':
        template = subscriptionTemplates.reactivated;
        break;
    }
    
    console.log(`📧 Notification d'abonnement générique: ${type} à ${to}`);
    
    const result = await notificationService.sendEmail({
      to,
      subject: template.getSubject(),
      text: template.getText(data || {}),
      html: template.getHTML(data || {})
    });
    
    res.json({ success: true, message: 'Notification d\'abonnement envoyée avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  handleSubscriptionStart,
  handleSubscriptionCancelled,
  handlePaymentFailed,
  handleSubscriptionUpdated,
  handleGenericSubscriptionNotification
}; 