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

// Envoyer un email de réinitialisation de mot de passe
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email, name, resetCode } = req.body;
    
    if (!email || !name || !resetCode) {
      return res.status(400).json({ 
        message: 'Email, nom et code de réinitialisation requis',
        missingFields: {
          email: !email,
          name: !name,
          resetCode: !resetCode
        }
      });
    }
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?email=${encodeURIComponent(email)}`;
    
    const subject = 'Réinitialisation de votre mot de passe';
    const text = `Bonjour ${name},\n\nVous avez demandé à réinitialiser votre mot de passe. Voici votre code de réinitialisation : ${resetCode}\n\nUtilisez ce code sur la page de réinitialisation de mot de passe : ${resetUrl}\n\nSi vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\nCordialement,\nL'équipe`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de réinitialisation :</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 24px; letter-spacing: 5px; font-weight: bold; background-color: #f5f5f5; padding: 15px; border-radius: 4px;">${resetCode}</div>
        </div>
        <p>Utilisez ce code sur la page de réinitialisation de mot de passe :</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4285F4; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Réinitialiser mon mot de passe</a>
        </p>
        <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
        <p>${resetUrl}</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe</p>
      </div>
    `;
    
    await notificationService.sendEmail(email, subject, text, html);
    
    res.status(200).json({ message: 'Email de réinitialisation envoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email', error: error.message });
  }
};

module.exports = {
  sendEmail,
  sendTestEmail,
  sendPasswordResetEmail
}; 