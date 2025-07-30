const notificationService = require('../notificationService');

/**
 * Envoie un email de vérification
 */
const sendVerificationEmail = async (req, res) => {
  try {
    const { to, name, verificationToken, verificationUrl } = req.body;
    
    if (!to || !verificationToken || !verificationUrl) {
      return res.status(400).json({ success: false, message: 'Informations de vérification incomplètes' });
    }
    
    console.log(`📧 Email de vérification à ${to}`);
    
    const subject = 'Vérifiez votre adresse email';
    const text = `Bonjour ${name || 'cher utilisateur'},

Merci de vous être inscrit ! Veuillez vérifier votre adresse email en cliquant sur le lien suivant : ${verificationUrl}

Ce lien expirera dans 24 heures.

Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.`;

    const html = `
      <h2>Vérifiez votre adresse email</h2>
      <p>Bonjour ${name || 'cher utilisateur'},</p>
      <p>Merci de vous être inscrit ! Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
      <p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Vérifier mon email
        </a>
      </p>
      <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
      <p>${verificationUrl}</p>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    `;
    
    const result = await notificationService.sendEmail({
      to,
      subject,
      text,
      html
    });
    
    res.json({ success: true, message: 'Email de vérification envoyé avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Envoie un email de bienvenue
 */
const sendWelcomeEmail = async (req, res) => {
  try {
    const { to, name } = req.body;
    
    if (!to) {
      return res.status(400).json({ success: false, message: 'Destinataire requis' });
    }
    
    console.log(`📧 Email de bienvenue à ${to}`);
    
    const subject = 'Bienvenue sur notre plateforme !';
    const text = `Bonjour ${name || 'cher utilisateur'},

Merci d'avoir vérifié votre adresse email ! Votre compte est maintenant actif et vous pouvez profiter de tous nos services.

N'hésitez pas à nous contacter si vous avez des questions.`;

    const html = `
      <h2>Bienvenue sur notre plateforme !</h2>
      <p>Bonjour ${name || 'cher utilisateur'},</p>
      <p>Merci d'avoir vérifié votre adresse email ! Votre compte est maintenant actif et vous pouvez profiter de tous nos services.</p>
      <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
    `;
    
    const result = await notificationService.sendEmail({
      to,
      subject,
      text,
      html
    });
    
    res.json({ success: true, message: 'Email de bienvenue envoyé avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
}; 