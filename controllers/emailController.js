const notificationService = require('../notificationService');

/**
 * Envoie un email simple
 */
const sendEmail = async (req, res) => {
  try {
    const { to, subject, text, html, attachments } = req.body;
    
    if (!to) {
      return res.status(400).json({ success: false, message: 'Destinataire requis' });
    }
    
    console.log(`📧 Envoi d'email à ${to}`);
    
    const result = await notificationService.sendEmail({
      to,
      subject,
      text,
      html,
      attachments
    });
    
    res.json({ success: true, message: 'Email envoyé avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Envoie un email de test pour vérifier la configuration
 */
const sendTestEmail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    
    if (!to) {
      return res.status(400).json({ success: false, message: 'Destinataire requis' });
    }
    
    console.log(`📧 Email de test à ${to}`);
    
    const result = await notificationService.sendEmail({
      to,
      subject: subject || 'Test de notification',
      text: text || 'Ceci est un email de test pour vérifier le bon fonctionnement du service de notification.'
    });
    
    res.json({ success: true, message: 'Email de test envoyé avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de test:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendEmail,
  sendTestEmail
}; 