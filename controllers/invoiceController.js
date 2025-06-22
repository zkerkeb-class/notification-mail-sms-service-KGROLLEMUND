const notificationService = require('../notificationService');

/**
 * Envoie une facture par email
 */
const sendInvoiceEmail = async (req, res) => {
  try {
    const { to, invoiceData } = req.body;
    
    if (!to || !invoiceData) {
      return res.status(400).json({ success: false, message: 'Destinataire et données de facture requis' });
    }
    
    console.log(`📧 Facture envoyée à ${to}`);
    
    const { amount, currency, date, invoiceNumber, planName } = invoiceData;
    const formattedDate = new Date(date).toLocaleDateString();
    
    const subject = `Facture #${invoiceNumber}`;
    const text = `Bonjour,

Veuillez trouver ci-joint votre facture #${invoiceNumber} du ${formattedDate}.

Abonnement: ${planName}
Montant: ${amount/100} ${currency.toUpperCase()}

Merci pour votre confiance !`;

    const html = `
      <h2>Facture #${invoiceNumber}</h2>
      <p>Bonjour,</p>
      <p>Veuillez trouver ci-dessous les détails de votre facture :</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 20px; margin-bottom: 20px;">
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Numéro</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Abonnement</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Montant</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${formattedDate}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${invoiceNumber}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${planName}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${amount/100} ${currency.toUpperCase()}</td>
        </tr>
      </table>
      <p>Merci pour votre confiance !</p>
    `;
    
    const result = await notificationService.sendEmail({
      to,
      subject,
      text,
      html
    });
    
    res.json({ success: true, message: 'Facture envoyée avec succès', ...result });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la facture:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendInvoiceEmail
}; 