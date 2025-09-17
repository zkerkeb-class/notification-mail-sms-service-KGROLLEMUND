const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
// À ajouter dans le fichier principal (index.js) de chaque microservice
const promBundle = require("express-prom-bundle");

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Express
const app = express();
const PORT = process.env.PORT || 3006;

// Créer le répertoire de logs s'il n'existe pas
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuration des logs
const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev")); // Affichage des logs dans la console

// Middleware Prometheus pour collecter les métriques HTTP
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: "notif-service" }, // Remplacer par le nom du service
  promClient: { collectDefaultMetrics: {} },
});
app.use(metricsMiddleware);

// Ajouter un middleware pour log les requêtes entrantes
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === "POST" && req.body) {
    console.log(`📦 Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

// Utiliser les routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/notifications", notificationRoutes);

// Route de santé directe à la racine (pour la compatibilité avec les autres services)
app.get("/health", (req, res) => {
  console.log("🏥 Health check demandé sur /health");
  res.json({
    status: "OK",
    service: "notification-service",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Route racine pour la vérification du service
app.get("/", (req, res) => {
  res.json({
    service: "Notification Service",
    status: "running",
    version: "1.0.0",
    endpoints: [
      {
        path: "/notifications/health",
        description: "Vérifier l'état du service",
        method: "GET",
      },
      {
        path: "/notifications/send-email",
        description: "Envoyer un email",
        method: "POST",
      },
      {
        path: "/notifications/test-email",
        description: "Envoyer un email de test",
        method: "POST",
      },
      {
        path: "/notifications/subscription/start",
        description: "Notification de début d'abonnement",
        method: "POST",
      },
      {
        path: "/notifications/subscription/cancelled",
        description: "Notification d'annulation d'abonnement",
        method: "POST",
      },
    ],
    timestamp: new Date().toISOString(),
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Route pour exposer les métriques Prometheus
app.get("/metrics", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.end(promBundle.promClient.register.metrics());
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(
    "║SERVICE DE NOTIFICATION DÉMARRÉ║"
  );
});

// Gérer la sortie propre
process.on("SIGINT", () => {
  console.log("🛑 Arrêt du service de notification...");
  process.exit(0);
});
