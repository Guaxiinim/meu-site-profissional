'use strict';
require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet()); // well-known security headers
app.use(cors({ origin: process.env.CORS_ORIGIN || 'https://lumelaunch.com' }));
app.use(express.json({ limit: '10kb' }));
app.use(xss()); // prevent XSS
app.use(mongoSanitize()); // prevent NoSQL injection
app.use(hpp()); // prevent param pollution

// Rate limit for APIs
const apiLimiter = rateLimit({ windowMs: 60*1000, max: 20, message: 'Too many requests, please try later.' });
app.use('/api/', apiLimiter);

// Serve frontend static
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API routes
app.use('/api/contact', contactRouter);

// Basic health
app.get('/health', (req,res)=>res.json({ok:true, time:Date.now()}));

// Error handler
app.use((err, req, res, next)=>{
  console.error(err);
  res.status(err.status || 500).json({ error: 'Server error' });
});

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
