// Serverless-compatible version of server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// API Credentials
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyCdCsVQkhHTu2UqgyiUxzjYg3dOeRs5PIg';

// Route handlers (simplified version)
// Main route handlers
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/generator', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'pages', 'generator.html'));
});

app.get('/preview', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'pages', 'preview-ppt.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'pages', 'search.html'));
});

app.get('/mentimeter', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'pages', 'mentimeter.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'pages', 'history.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'pages', 'about.html'));
});

// API route to generate initial content
app.post('/api/generate', async (req, res) => {
  try {
    const { topic, audience, style } = req.body;
    
    // This would normally call Azure OpenAI API
    // For now, return a placeholder response to ensure the api works
    res.json({
      success: true,
      data: {
        topic: topic,
        subtopics: [
          { title: "Introduction to " + topic, content: "This is placeholder content for introduction." },
          { title: "Key Concepts of " + topic, content: "This is placeholder content for key concepts." },
          { title: "Applications of " + topic, content: "This is placeholder content for applications." }
        ]
      }
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate content',
      message: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// For serverless environments, export the Express app
module.exports = app;
