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

// API route to generate initial content for placards
app.post('/api/generate-placards', async (req, res) => {
  try {
    const { semester, subject, classNumber, topic, difficultyLevel } = req.body;
    
    // Validate input
    if (!semester || !subject || !classNumber || !topic || !difficultyLevel) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // For the deployed version, we'll use a placeholder response
    // that mimics the structure expected by the frontend
    const placeholderResponse = {
      "topics": [
        {
          "title": `Introduction to ${topic}`,
          "subtopics": [
            {
              "title": "Definition and Scope",
              "description": `This section covers the basic definition of ${topic} and its scope in ${subject}.`
            },
            {
              "title": "Historical Context",
              "description": `A brief history of the development of ${topic} and its significance in ${subject}.`
            }
          ],
          "description": `This introductory section provides an overview of ${topic}, including its definition, scope, and historical context. Students will gain a foundational understanding of the key concepts.`
        },
        {
          "title": `Key Principles of ${topic}`,
          "subtopics": [
            {
              "title": "Core Concepts",
              "description": `The fundamental principles and concepts that form the basis of ${topic}.`
            },
            {
              "title": "Theoretical Frameworks",
              "description": `Major theoretical frameworks that explain and analyze ${topic} in ${subject}.`
            }
          ],
          "description": `This section explores the key principles of ${topic}, including core concepts and theoretical frameworks that are essential for understanding the subject matter.`
        },
        {
          "title": `Applications of ${topic}`,
          "subtopics": [
            {
              "title": "Practical Uses",
              "description": `Real-world applications and practical uses of ${topic} in various contexts.`
            },
            {
              "title": "Case Studies",
              "description": `Examination of specific case studies that demonstrate the application of ${topic}.`
            }
          ],
          "description": `This section focuses on the practical applications of ${topic}, including real-world examples and case studies that illustrate how the concepts are applied in practice.`
        }
      ],
      "videoReferences": [
        {
          "title": `Introduction to ${topic} - Educational Overview`,
          "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "relevantTopicIndex": 0,
          "description": `A comprehensive introduction to ${topic} for ${classNumber} students.`
        },
        {
          "title": `Understanding ${topic} Fundamentals`,
          "url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
          "relevantTopicIndex": 1,
          "description": `This video explains the core principles and fundamentals of ${topic}.`
        },
        {
          "title": `Practical Applications of ${topic}`,
          "url": "https://www.youtube.com/watch?v=QH2-TGUlwu4",
          "relevantTopicIndex": 2,
          "description": `Learn about how ${topic} is applied in real-world scenarios.`
        }
      ],
      "researchReferences": [
        {
          "title": `Advances in ${topic}: A Comprehensive Review`,
          "authors": "Smith, J. & Johnson, A.",
          "url": "https://doi.org/10.1000/example.123",
          "relevantTopicIndex": 0,
          "description": `This paper provides a comprehensive review of recent advances in ${topic}, with a focus on implications for ${subject}.`
        },
        {
          "title": `Theoretical Frameworks for Understanding ${topic}`,
          "authors": "Williams, R. et al.",
          "url": "https://doi.org/10.1000/example.456",
          "relevantTopicIndex": 1,
          "description": `An analysis of the theoretical frameworks used to understand and explain ${topic} in ${subject}.`
        },
        {
          "title": `Practical Applications of ${topic} in Educational Settings`,
          "authors": "Brown, L. & Davis, M.",
          "url": "https://doi.org/10.1000/example.789",
          "relevantTopicIndex": 2,
          "description": `This research examines how ${topic} is applied in educational settings, with case studies from various institutions.`
        }
      ]
    };
    
    res.json(placeholderResponse);
  } catch (error) {
    console.error('Error generating placards:', error);
    res.status(500).json({ 
      error: 'Failed to generate placards', 
      details: error.message 
    });
  }
});

// API route for YouTube search
app.get('/api/youtube-search', async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // For the deployed version, return placeholder YouTube results
    const placeholderVideos = [
      {
        id: 'dQw4w9WgXcQ',
        title: `${query} - Educational Overview`,
        description: `A comprehensive educational video about ${query}`,
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
        channelTitle: 'Educational Channel',
        url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      },
      {
        id: 'jNQXAC9IVRw',
        title: `Understanding ${query}`,
        description: `This video explains the core principles of ${query}`,
        thumbnail: 'https://i.ytimg.com/vi/jNQXAC9IVRw/mqdefault.jpg',
        channelTitle: 'Learning Channel',
        url: `https://www.youtube.com/watch?v=jNQXAC9IVRw`
      },
      {
        id: 'QH2-TGUlwu4',
        title: `${query} for Beginners`,
        description: `An introduction to ${query} for beginners`,
        thumbnail: 'https://i.ytimg.com/vi/QH2-TGUlwu4/mqdefault.jpg',
        channelTitle: 'Tutorial Channel',
        url: `https://www.youtube.com/watch?v=QH2-TGUlwu4`
      }
    ];

    res.json({ videos: placeholderVideos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube videos', 
      details: error.message 
    });
  }
});

// API route for generating quiz and poll questions for Mentimeter
app.post('/api/generate-quiz-poll', async (req, res) => {
  try {
    const { topic, format, questionCount } = req.body;
    
    // For the deployed version, return placeholder quiz/poll content
    const placeholderQuizContent = {
      "mentimeterSession": {
        "baseUrl": "https://www.mentimeter.com/s/",
        "qrCodeBaseUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="
      },
      "quizzes": [
        {
          "title": `Quiz on ${topic}`,
          "description": `Test your knowledge of ${topic}`,
          "questions": [
            {
              "question": `What is the primary purpose of ${topic}?`,
              "options": [
                "To provide a theoretical framework",
                "To solve practical problems",
                "To establish historical context",
                "To critique existing methodologies"
              ],
              "correctAnswer": 1
            },
            {
              "question": `Who is considered the founder of modern ${topic}?`,
              "options": [
                "Albert Einstein",
                "Marie Curie",
                "Isaac Newton",
                "Charles Darwin"
              ],
              "correctAnswer": 2
            }
          ],
          "sessionCode": "12345678",
          "quizUrl": "https://www.mentimeter.com/s/12345678",
          "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.mentimeter.com/s/12345678"
        }
      ],
      "polls": [
        {
          "title": `Poll on ${topic}`,
          "description": `Share your thoughts on ${topic}`,
          "questions": [
            {
              "question": `How important do you think ${topic} is in today's world?`,
              "options": [
                "Extremely important",
                "Very important",
                "Moderately important",
                "Slightly important",
                "Not important at all"
              ]
            },
            {
              "question": `How often do you encounter ${topic} in your daily life?`,
              "options": [
                "Multiple times a day",
                "Once a day",
                "A few times a week",
                "Rarely",
                "Never"
              ]
            }
          ],
          "sessionCode": "87654321",
          "pollUrl": "https://www.mentimeter.com/s/87654321",
          "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.mentimeter.com/s/87654321"
        }
      ],
      "wordClouds": [
        {
          "title": `Word Cloud on ${topic}`,
          "description": `What words come to mind when you think of ${topic}?`,
          "prompt": `Enter up to 3 words that you associate with ${topic}`,
          "sessionCode": "24681357",
          "wordCloudUrl": "https://www.mentimeter.com/s/24681357",
          "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.mentimeter.com/s/24681357"
        }
      ]
    };
    
    res.json(placeholderQuizContent);
  } catch (error) {
    console.error('Error generating quiz and poll content:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz and poll content', 
      details: error.message 
    });
  }
});

// API route for web search
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // For the deployed version, return placeholder search results
    const placeholderSearchResults = {
      "results": [
        {
          "title": `Introduction to ${query}`,
          "description": `A comprehensive introduction to ${query} covering all the basic concepts and principles.`,
          "url": "https://example.com/introduction",
          "type": "Article"
        },
        {
          "title": `${query} in Education`,
          "description": `How ${query} is applied in educational settings and its impact on teaching and learning.`,
          "url": "https://example.com/education",
          "type": "Research Paper"
        },
        {
          "title": `The Future of ${query}`,
          "description": `Exploring future trends and developments in ${query} and their potential implications.`,
          "url": "https://example.com/future",
          "type": "Blog Post"
        }
      ]
    };

    res.json(placeholderSearchResults);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({ 
      error: 'Failed to perform search', 
      details: error.message 
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
