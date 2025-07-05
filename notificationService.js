const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
// Configuration pour l'envoi de SMS via Brevo
const SibApiV3Sdk = require('@sendinblue/client');

dotenv.config();

// Configuration de Nodemailer
let transporter;
console.log('📧 Configuration du service email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? process.env.EMAIL_USER : 'Non défini');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Défini (valeur cachée)' : 'Non défini');

// Configuration SMS avec Brevo
console.log('📱 Configuration du service SMS avec Brevo...');
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Défini (valeur cachée)' : 'Non défini');

// Fonction de log détaillé des emails
const logEmailAttempt = (action, data) => {
    try {
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logFile = path.join(logDir, `email-${new Date().toISOString().split('T')[0]}.log`);
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            action,
            ...data
        };
        
        fs.appendFileSync(logFile, JSON.stringify(logData, null, 2) + '\n---\n');
        console.log(`📝 [${timestamp}] ${action}: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
        console.error('❌ Erreur de journalisation:', error);
    }
};

// Fonction de log détaillé des SMS
const logSmsAttempt = (action, data) => {
    try {
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logFile = path.join(logDir, `sms-${new Date().toISOString().split('T')[0]}.log`);
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            action,
            ...data
        };
        
        fs.appendFileSync(logFile, JSON.stringify(logData, null, 2) + '\n---\n');
        console.log(`📝 [${timestamp}] ${action}: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
        console.error('❌ Erreur de journalisation SMS:', error);
    }
};

// Vérification des variables d'environnement essentielles
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ ATTENTION: Variables d\'environnement EMAIL_USER ou EMAIL_PASS non définies.');
    console.warn('⚠️ Vous devez créer un fichier .env avec ces variables pour envoyer des emails.');
    console.warn('⚠️ Les notifications par email seront désactivées.');
    
    // Créer un transporteur factice qui loggera les emails au lieu de les envoyer
    transporter = {
        verify: (callback) => callback(null, true),
        sendMail: (mailOptions) => {
            console.log('📧 EMAIL SIMULÉ (mode hors ligne) :');
            console.log(`De: ${mailOptions.from}`);
            console.log(`À: ${mailOptions.to}`);
            console.log(`Sujet: ${mailOptions.subject}`);
            console.log(`Corps: ${mailOptions.text.substring(0, 100)}...`);
            
            logEmailAttempt('EMAIL_SIMULÉ', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject,
                textPreview: mailOptions.text ? mailOptions.text.substring(0, 100) + '...' : null,
                htmlPreview: mailOptions.html ? 'HTML présent (non affiché)' : null
            });
            
            return Promise.resolve({ 
                response: 'Mode simulation - Email non envoyé', 
                simulated: true 
            });
        }
    };
} else {
    try {
        // Configuration pour Gmail
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            debug: true, // Active les logs de debug
            logger: true, // Active le logging
            tls: {
                rejectUnauthorized: false // Pour éviter les problèmes SSL/TLS
            },
            // Transport Retry Strategy
            pool: true, // Use connection pool
            maxConnections: 5, // Maximum number of connections
            maxMessages: 100, // Maximum number of messages per connection
            socketTimeout: 30000, // Socket timeout
            connectionTimeout: 10000 // Connection timeout
        });
        
        console.log(`✅ Configuration email avec l'utilisateur: ${process.env.EMAIL_USER}`);
        
        logEmailAttempt('EMAIL_CONFIG', {
            service: 'gmail',
            user: process.env.EMAIL_USER,
            configured: true
        });
    } catch (error) {
        console.error('❌ Erreur lors de la création du transporteur email:', error);
        logEmailAttempt('EMAIL_CONFIG_ERROR', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Vérifier la configuration de Nodemailer
transporter.verify(function(error, success) {
    if (error) {
        console.error('Erreur de configuration du transporteur mail:', error);
        logEmailAttempt('EMAIL_VERIFY_ERROR', {
            error: error.message,
            stack: error.stack
        });
    } else {
        console.log('Serveur prêt à envoyer des emails');
        console.log('Configuration email utilisée:', process.env.EMAIL_USER);
        logEmailAttempt('EMAIL_VERIFY_SUCCESS', {
            user: process.env.EMAIL_USER
        });
    }
});

// Configuration SMS - Brevo uniquement
console.log('📱 Configuration du service SMS avec Brevo...');
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'Défini (valeur cachée)' : 'Non défini');

let brevoClient = null;
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'brevo';
    
// Configuration Brevo
if (process.env.BREVO_API_KEY) {
    try {
        // Brevo est configuré - pas besoin d'initialisation spéciale pour cette version
        brevoClient = true; // Marquer comme configuré
        
        console.log(`✅ Configuration Brevo SMS réussie`);
        logSmsAttempt('BREVO_CONFIG', {
            configured: true,
            provider: 'brevo'
        });
    } catch (error) {
        console.error('❌ Erreur lors de la configuration Brevo:', error);
        logSmsAttempt('BREVO_CONFIG_ERROR', {
            error: error.message,
            stack: error.stack
        });
    }
} else {
    console.error('❌ BREVO_API_KEY manquante dans le fichier .env');
}

/**
 * Envoie un e-mail standard
 * Accepte soit un objet avec les propriétés {to, subject, text, html, attachments}, soit des paramètres séparés
 */
const sendEmail = async (toParam, subjectParam, textParam, attachmentsParam = []) => {
    // Déterminer si le premier paramètre est un objet de configuration
    let to, subject, text, html, attachments;
    
    if (typeof toParam === 'object' && toParam !== null) {
        // Format objet
        const emailConfig = toParam;
        to = emailConfig.to;
        subject = emailConfig.subject;
        text = emailConfig.text;
        html = emailConfig.html;
        attachments = emailConfig.attachments || [];
        console.log(`📧 Format objet détecté pour sendEmail`);
    } else {
        // Format paramètres séparés
        to = toParam;
        subject = subjectParam;
        text = textParam;
        attachments = attachmentsParam;
        console.log(`📧 Format paramètres séparés détecté pour sendEmail`);
    }
    
    if (!to) {
        console.error('❌ Erreur: Destinataire (to) manquant dans sendEmail');
        throw new Error('Le destinataire (to) est requis pour envoyer un email');
    }
    
    logEmailAttempt('SEND_EMAIL_START', {
        to,
        subject,
        textPreview: text ? text.substring(0, 100) + '...' : null,
        hasAttachments: attachments && attachments.length > 0
    });
    
    // Utiliser une adresse email avec format propre
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@example.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Service de notifications';
    const from = `"${fromName}" <${fromEmail}>`;
    
    const mailOptions = {
        from,
        to,
        subject,
        text,
        attachments
    };

    // Ajouter une version HTML si fournie ou si le texte est présent
    if (html) {
        mailOptions.html = html;
    } else if (text) {
        // Convertir le texte en HTML basique
        mailOptions.html = text.replace(/\n/g, '<br>');
    }

    try {
        logEmailAttempt('SEND_EMAIL_ATTEMPT', {
            options: {
                from,
                to,
                subject
            }
        });
        
        const info = await transporter.sendMail(mailOptions);
        logEmailAttempt('SEND_EMAIL_SUCCESS', {
            to,
            messageId: info.messageId,
            response: info.response
        });
        
        console.log(`✅ E-mail envoyé avec succès à ${to}`);
        console.log('Informations sur l\'envoi:', info);
        return { success: true, message: 'E-mail envoyé avec succès', info };
    } catch (error) {
        logEmailAttempt('SEND_EMAIL_ERROR', {
            to,
            error: error.message,
            stack: error.stack,
            code: error.code
        });
        
        console.error('❌ Erreur lors de l\'envoi de l\'e-mail:', error);
        throw error;
    }
};

/**
 * Envoie un SMS via Brevo
 */
const sendSms = async ({ to, body }) => {
    try {
        console.log(`📱 Tentative d'envoi SMS à ${to}: ${body}`);
        
        // Vérifier si Brevo est configuré
        if (!brevoClient || !process.env.BREVO_API_KEY) {
            throw new Error('Brevo non configuré. Vérifiez BREVO_API_KEY dans .env');
        }

        // Formatage du numéro (Brevo attend format international)
        let formattedTo = to;
        if (!to.startsWith('+')) {
            if (to.startsWith('0')) {
                formattedTo = '+33' + to.substring(1);
            } else if (to.startsWith('33')) {
                formattedTo = '+' + to;
            } else {
                formattedTo = '+' + to;
            }
        }
        
        // Utiliser l'API directement avec fetch/axios
        const axios = require('axios');
        
        const smsData = {
            type: 'transactional',
            content: body,
            recipient: formattedTo,
            sender: process.env.BREVO_SMS_SENDER || 'QuoteGen'
        };
        
        console.log(`📱 Envoi SMS via Brevo vers ${formattedTo}: ${body}`);
        
        const response = await axios.post('https://api.brevo.com/v3/transactionalSMS/sms', smsData, {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const result = response.data;
        
        console.log(`✅ SMS Brevo envoyé avec succès. Référence: ${result.reference}`);
        
        logSmsAttempt('SMS_SUCCESS', {
            to: formattedTo,
            reference: result.reference,
            provider: 'brevo'
        });
        
        return {
            sid: result.reference || 'BREVO_' + Date.now(),
            status: 'sent',
            to: formattedTo,
            body,
            provider: 'brevo',
            simulation: false
        };
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi SMS via Brevo:', error);
        
        logSmsAttempt('SMS_ERROR', {
            to,
            error: error.message,
            provider: 'brevo'
        });
        
        throw error;
    }
};

module.exports = {
    sendEmail,
    sendSms
}; 