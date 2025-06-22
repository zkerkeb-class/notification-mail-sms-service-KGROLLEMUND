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

/**
 * Envoie un SMS avec un code de réinitialisation de mot de passe
 */
const sendPasswordResetSms = async (req, res) => {
  try {
    const { to, name, resetCode } = req.body;
    
    if (!to || !resetCode) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone et code de réinitialisation requis' });
    }
    
    console.log(`📱 SMS de réinitialisation de mot de passe à ${to}`);
    
    // Formater le numéro de téléphone si nécessaire (ajouter +33 pour la France par exemple)
    let formattedPhone = to;
    if (!to.startsWith('+')) {
      // Si le numéro commence par un 0, le remplacer par +33 (pour la France)
      if (to.startsWith('0')) {
        formattedPhone = '+33' + to.substring(1);
      } else {
        formattedPhone = '+' + to;
      }
    }
    
    const body = `Votre code de réinitialisation de mot de passe pour QuoteGen est: ${resetCode}. Ce code est valable pendant 15 minutes.`;
    
    const result = await notificationService.sendSms({
      to: formattedPhone,
      body
    });
    
    res.json({ success: true, message: 'SMS de réinitialisation envoyé avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du SMS de réinitialisation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Envoie un email de confirmation de changement de mot de passe
 */
const sendPasswordChangedEmail = async (req, res) => {
  try {
    const { to, name } = req.body;
    
    if (!to) {
      return res.status(400).json({ success: false, message: 'Destinataire requis' });
    }
    
    console.log(`📧 Email de confirmation de changement de mot de passe à ${to}`);
    
    const subject = 'Votre mot de passe a été modifié';
    const text = `Bonjour ${name || 'cher utilisateur'},

Votre mot de passe a été modifié avec succès.

Si vous n'avez pas effectué cette modification, veuillez nous contacter immédiatement.`;

    const html = `
      <h2>Votre mot de passe a été modifié</h2>
      <p>Bonjour ${name || 'cher utilisateur'},</p>
      <p>Votre mot de passe a été modifié avec succès.</p>
      <p>Si vous n'avez pas effectué cette modification, veuillez nous contacter immédiatement.</p>
    `;
    
    const result = await notificationService.sendEmail({
      to,
      subject,
      text,
      html
    });
    
    res.json({ success: true, message: 'Email de confirmation envoyé avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetSms,
  sendPasswordChangedEmail
}; 