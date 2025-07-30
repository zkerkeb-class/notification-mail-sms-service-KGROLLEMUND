const notificationService = require('../notificationService');

/**
 * Envoie un email générique
 */
const sendGenericEmail = async (req, res) => {
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

module.exports = {
  sendGenericEmail,
}; 