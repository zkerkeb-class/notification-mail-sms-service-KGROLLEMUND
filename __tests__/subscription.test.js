const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../routes/notificationRoutes');
const notificationService = require('../notificationService');

// Mock du service de notification
jest.mock('../notificationService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

const app = express();
app.use(express.json());
app.use('/', notificationRoutes);

describe('Subscription Notification Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Sujets exacts tirés du code du contrôleur
  const testCases = [
    { route: '/subscription/start', subject: 'Votre abonnement a été activé' },
    { route: '/subscription/cancelled', subject: 'Votre abonnement a été annulé' },
    { route: '/subscription/payment-failed', subject: '⚠️ Problème avec votre paiement' },
  ];

  for (const { route, subject } of testCases) {
    describe(`POST ${route}`, () => {
      it('should send an email with the correct subject', async () => {
        const payload = {
          email: 'subscriber@example.com',
          subscriptionData: { id: 'sub_123' }
        };

        const response = await request(app)
          .post(route)
          .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(notificationService.sendEmail).toHaveBeenCalledTimes(1);
        expect(notificationService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
          to: payload.email,
          subject: subject,
        }));
      });

      it('should return 400 if email is missing', async () => {
        const response = await request(app)
          .post(route)
          .send({ subscriptionData: { id: 'sub_123' } });

        expect(response.status).toBe(400);
        expect(notificationService.sendEmail).not.toHaveBeenCalled();
      });
    });
  }

  // Test spécifique pour /subscription/updated qui nécessite plus de données
  describe('POST /subscription/updated', () => {
    it('should send an update email', async () => {
      const payload = {
        to: 'subscriber@example.com', // Le champ 'to' est requis ici
        subscriptionId: 'sub_123',
        newStatus: 'active'
      };

      const response = await request(app)
        .post('/subscription/updated')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(notificationService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        subject: 'Votre abonnement a été mis à jour'
      }));
    });
  });

  // Test pour la route générique
  describe('POST /subscription-notification', () => {
    it('should handle generic notifications correctly', async () => {
        const payload = {
            to: 'generic@example.com',
            type: 'new', // un des types valides
            data: { info: 'test' }
        };

        const response = await request(app)
            .post('/subscription-notification')
            .send(payload);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(notificationService.sendEmail).toHaveBeenCalledTimes(1);
        expect(notificationService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
            to: payload.to,
            subject: 'Votre abonnement a été activé' // Sujet correct
        }));
    });

    it('should return 400 for invalid notification type', async () => {
        const payload = { to: 'generic@example.com', type: 'invalid_type' };
        
        const response = await request(app)
            .post('/subscription-notification')
            .send(payload);

        expect(response.status).toBe(400);
        expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

}); 