const express = require('express');
const router = express.Router();
const { googleLoginController } = require('../controllers/googleController');

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth Login
 *     description: Authenticate with Google access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               access_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication failed
 */
router.post('/', googleLoginController);

module.exports = router;