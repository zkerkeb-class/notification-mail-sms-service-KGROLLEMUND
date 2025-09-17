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

describe('Auth Notification Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test pour l'envoi de l'email de vérification
  describe('POST /email-verification', () => {
    it('should send a verification email with valid data', async () => {
      const payload = {
        to: 'test@example.com',
        name: 'Test User',
        verificationToken: '123456',
        verificationUrl: 'http://localhost:3000/verify?token=123456'
      };

      const response = await request(app)
        .post('/email-verification')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(notificationService.sendEmail).toHaveBeenCalledTimes(1);
      expect(notificationService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: payload.to,
        subject: 'Vérifiez votre adresse email',
      }));
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/email-verification')
        .send({ to: 'test@example.com' }); // Données incomplètes

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

  // Test pour l'envoi de l'email de bienvenue
  describe('POST /welcome', () => {
    it('should send a welcome email with valid data', async () => {
      const payload = {
        to: 'test@example.com',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/welcome')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(notificationService.sendEmail).toHaveBeenCalledTimes(1);
      expect(notificationService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: payload.to,
        subject: 'Bienvenue sur notre plateforme !',
      }));
    });

    it('should return 400 if "to" field is missing', async () => {
      const response = await request(app)
        .post('/welcome')
        .send({ name: 'Test User' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(notificationService.sendEmail).not.toHaveBeenCalled();
    });
  });

}); 