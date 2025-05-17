require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// API Credentials
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_ENDPOINT = process.env.OPENAI_API_ENDPOINT;
const YOUTUBE_API_KEY = 'AIzaSyCdCsVQkhHTu2UqgyiUxzjYg3dOeRs5PIg';

// API route to generate initial content for placards
app.post('/api/generate-placards', async (req, res) => {
  try {
    const { semester, subject, classNumber, topic, difficultyLevel } = req.body;
    
    // Validate input
    if (!semester || !subject || !classNumber || !topic || !difficultyLevel) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create prompt for OpenAI
    const prompt = `
      Generate content for editable placards for a PowerPoint presentation on the following subject:
      
      Academic Term: ${semester}
      Subject Area: ${subject}
      Grade/Class Level: ${classNumber}
      Topic: ${topic}
      Student Proficiency Level: ${difficultyLevel}
      
      Please respond with a JSON object containing the following sections:
      
      1. "topics": An array of 5-7 main topics, each containing:
         - "title": The topic title
         - "subtopics": An array of 2-3 subtopics for each main topic, each containing:
           - "title": The subtopic title
           - "description": A brief description of the subtopic (2-3 sentences)
         - "description": A brief description of the main topic (3-5 sentences)
      
      2. "videoReferences": An array of 5-7 video references aligned with the topics, each containing:
         - "title": The video title
         - "url": A YouTube URL for an educational video on this topic (use standard YouTube watch URL format: https://www.youtube.com/watch?v=VIDEOID). ONLY use videos from popular educational channels like Khan Academy, Crash Course, TED-Ed, or MIT OpenCourseWare that are guaranteed to be available.
         - "relevantTopicIndex": The index of the topic this video is most relevant to
         - "description": A brief description of the video content (1-2 sentences)
      
      3. "researchReferences": An array of 5-7 research paper or article references, each containing:
         - "title": The paper title
         - "authors": The authors of the paper
         - "url": A URL link to the paper or article (use real academic URLs like from IEEE, ACM, Springer, etc.)
         - "relevantTopicIndex": The index of the topic this paper is most relevant to
         - "description": A brief summary of the paper and its relevance to the topic (2-3 sentences)
      
      Format your response as valid JSON without any additional text or explanation.
    `;

    // Call OpenAI API
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        messages: [
          { role: "system", content: "You are an educational content creator specializing in creating structured content for PowerPoint presentations. Create detailed, realistic educational content with proper academic references. Ensure each topic has meaningful content, relevant subtopics, and appropriate video and research references. For videos, ONLY use popular educational channels that are guaranteed to be available such as: Khan Academy (UCK8zT4-iWnLz_D-78tMr9Q), Crash Course (UCX6b17PVsYBQ0ip5gyeme-Q), TED-Ed (UCsooa4yRKGN_zEE8iknghZA), or MIT OpenCourseWare (UCEBb1b_L6zDS3xTUrIALZOw). When providing YouTube URLs, use valid and current videos that are readily available." },
          { role: "user", content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': OPENAI_API_KEY
        }
      }
    );

    // Extract and parse JSON from the response
    const responseContent = response.data.choices[0].message.content;
    let jsonContent;
    
    try {
      // Attempt to parse the response as JSON
      jsonContent = JSON.parse(responseContent);
    } catch (error) {
      // If parsing fails, try to extract JSON from a code block
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                        responseContent.match(/```\n([\s\S]*?)\n```/) ||
                        responseContent.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
          jsonContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (nestedError) {
          console.error('Error parsing extracted JSON:', nestedError);
          return res.status(500).json({ error: 'Failed to parse JSON response from API' });
        }
      } else {
        console.error('No JSON found in response');
        return res.status(500).json({ error: 'Invalid response format from API' });
      }
    }

    // Return the structured placards content
    res.json(jsonContent);
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate content', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// API route for generating PowerPoint content
app.post('/api/generate-ppt', async (req, res) => {
  try {
    const { topicPlacards, videoReferences, researchReferences, metadata } = req.body;
    
    // Validate input
    if (!topicPlacards || !Array.isArray(topicPlacards) || topicPlacards.length === 0) {
      return res.status(400).json({ error: 'At least one topic placard is required' });
    }

    // Add reliable YouTube video links if missing or invalid
    const reliableVideos = [
      { url: 'https://www.youtube.com/watch?v=uVCuz9mHLJ0', title: 'Introduction to Physics' },
      { url: 'https://www.youtube.com/watch?v=eWN2AdnJ4E0', title: 'The Power of Education' },
      { url: 'https://www.youtube.com/watch?v=Q16E4_pKUz0', title: 'The Science of Learning' },
      { url: 'https://www.youtube.com/watch?v=TcZmdOfFzGI', title: 'Mathematics Fundamentals' }
    ];
    
    // Process each topic to ensure video references are valid
    const processedTopics = topicPlacards.map((topic, index) => {
      // Create a deep copy to avoid modifying the original
      const processedTopic = JSON.parse(JSON.stringify(topic));
      
      // Ensure video reference is valid
      if (!processedTopic.videoReference || !isValidYouTubeUrl(processedTopic.videoReference?.url)) {
        // Assign a reliable video if none exists or is invalid
        const videoIndex = index % reliableVideos.length;
        processedTopic.videoReference = {
          title: reliableVideos[videoIndex].title,
          url: reliableVideos[videoIndex].url,
          description: `Educational video on ${processedTopic.title}`
        };
      }
      
      // Ensure subtopics are properly formatted
      if (processedTopic.subtopics && Array.isArray(processedTopic.subtopics)) {
        processedTopic.subtopics = processedTopic.subtopics.map(subtopic => {
          if (typeof subtopic === 'string') {
            return { title: subtopic, description: '' };
          } else if (typeof subtopic === 'object' && subtopic.title) {
            return subtopic;
          } else {
            return { title: 'Key Point', description: String(subtopic) };
          }
        });
      }
      
      return processedTopic;
    });

    // Return the PowerPoint slide content with processed topics
    res.json(processedTopics);
  } catch (error) {
    console.error('Error processing PPT data:', error);
    res.status(500).json({ 
      error: 'Failed to generate PowerPoint content', 
      details: error.message 
    });
  }
});

// API route for web search to get additional reference materials
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Create prompt for OpenAI to generate search results
    const prompt = `
      Generate a list of 5 high-quality educational resources on the topic of "${query}".
      Include a mix of:
      - Academic journal articles or research
      - Video tutorials and lectures
      - Educational websites
      - Textbooks or educational publications
      
      For each resource, provide:
      - Title
      - Author/Creator/Institution
      - Brief description (2-3 sentences)
      - URL (if applicable)
      - Type of resource (video, article, etc.)
    `;

    // Call OpenAI API for search results
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        messages: [
          { role: "system", content: "You are a helpful educational researcher who finds relevant teaching resources. Focus on high-quality, credible materials from reputable sources." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': OPENAI_API_KEY
        }
      }
    );

    // Extract the content from OpenAI response
    const searchResults = response.data.choices[0].message.content;

    // Return the search results
    res.json({ results: searchResults });
  } catch (error) {
    console.error('Error calling search API:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to perform search', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// API route to generate quiz and poll questions for Mentimeter
app.post('/api/generate-quiz-poll', async (req, res) => {
  try {
    const { topic, difficultyLevel, questionCount, topicList } = req.body;
    
    // Validate input
    if (!topic || !difficultyLevel) {
      return res.status(400).json({ error: 'Topic and difficulty level are required' });
    }

    // Set default question count if not provided
    const numQuestions = questionCount || 5;
    
    let prompt;
    
    if (topicList && Array.isArray(topicList) && topicList.length > 0) {
      // Generate topic-specific quizzes
      prompt = `
        Generate interactive content for a Mentimeter presentation on the topic of "${topic}" with a difficulty level of "${difficultyLevel}".
        
        I need specific quizzes for each of these sub-topics:
        ${topicList.map((t, i) => `${i+1}. ${t.title}`).join('\n')}
        
        Please provide:
        
        1. "topicQuizzes": An array of objects, one for each topic above, each containing:
           - "topicIndex": The index of the topic (0-based index matching the list above)
           - "topicTitle": The title of the topic
           - "questions": An array of ${Math.ceil(numQuestions/topicList.length)} multiple-choice quiz questions specific to that topic, each containing:
              * "question": The question text
              * "options": An array of 4 possible answers
              * "correctAnswer": The index (0-3) of the correct answer
              * "explanation": A brief explanation of why the answer is correct
        
        2. "pollQuestions": An array of ${Math.min(numQuestions, 3)} opinion poll questions related to the overall topic, each containing:
           - "question": The poll question text
           - "options": An array of 4-6 possible answer choices
           - "questionType": The type of poll (e.g., "multiple-choice", "scale", "open-ended")
        
        3. "wordCloud": An object containing:
           - "question": A word cloud prompt related to the overall topic
           - "suggestedWords": An array of 10-15 relevant words or short phrases that might appear in responses
        
        Format your response as valid JSON without any additional text or explanation.
      `;
    } else {
      // Original prompt for general quiz without specific topics
      prompt = `
        Generate interactive content for a Mentimeter presentation on the topic of "${topic}" with a difficulty level of "${difficultyLevel}".
        
        Please provide:
        
        1. "quizQuestions": An array of ${numQuestions} multiple-choice quiz questions, each containing:
           - "question": The question text
           - "options": An array of 4 possible answers
           - "correctAnswer": The index (0-3) of the correct answer
           - "explanation": A brief explanation of why the answer is correct
        
        2. "pollQuestions": An array of ${Math.min(numQuestions, 3)} opinion poll questions related to the topic, each containing:
           - "question": The poll question text
           - "options": An array of 4-6 possible answer choices
           - "questionType": The type of poll (e.g., "multiple-choice", "scale", "open-ended")
        
        3. "wordCloud": An object containing:
           - "question": A word cloud prompt related to the topic
           - "suggestedWords": An array of 10-15 relevant words or short phrases that might appear in responses
        
        Format your response as valid JSON without any additional text or explanation.
      `;
    }

    // Call OpenAI API
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        messages: [
          { role: "system", content: "You are an educational content creator specializing in creating interactive learning materials. Create engaging quiz questions, poll questions, and word cloud prompts that will stimulate discussion and learning." },
          { role: "user", content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': OPENAI_API_KEY
        }
      }
    );

    // Extract and parse JSON from the response
    const responseContent = response.data.choices[0].message.content;
    let jsonContent;
    
    try {
      // Attempt to parse the response as JSON
      jsonContent = JSON.parse(responseContent);
    } catch (error) {
      // If parsing fails, try to extract JSON from a code block
      const jsonMatch = responseContent.match(/```json\n([\s\S]*?)\n```/) || 
                        responseContent.match(/```\n([\s\S]*?)\n```/) ||
                        responseContent.match(/({[\s\S]*})/);
      
      if (jsonMatch && jsonMatch[1]) {
        try {
          jsonContent = JSON.parse(jsonMatch[1]);
        } catch (innerError) {
          console.error('Error parsing JSON from code block:', innerError);
          return res.status(500).json({ error: 'Invalid response format from API' });
        }
      } else {
        console.error('No JSON found in response');
        return res.status(500).json({ error: 'Invalid response format from API' });
      }
    }

    // Generate QR codes and add Mentimeter presentation links
    // This simulates Mentimeter integration - in production would connect to Mentimeter API
    if (jsonContent) {
      // Create a unique code for this mentimeter session
      const sessionCode = generateRandomCode(6);
      
      // Add mentimeter session information to the response
      jsonContent.mentimeterSession = {
        sessionCode: sessionCode,
        quizUrl: `https://www.mentimeter.com/s/${sessionCode}/quiz`,
        pollUrl: `https://www.mentimeter.com/s/${sessionCode}/poll`,
        wordCloudUrl: `https://www.mentimeter.com/s/${sessionCode}/wordcloud`,
        qrCodeBaseUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=`
      };
      
      // Add full QR code URLs
      jsonContent.mentimeterSession.quizQrCodeUrl = 
        `${jsonContent.mentimeterSession.qrCodeBaseUrl}${encodeURIComponent(jsonContent.mentimeterSession.quizUrl)}`;
      jsonContent.mentimeterSession.pollQrCodeUrl = 
        `${jsonContent.mentimeterSession.qrCodeBaseUrl}${encodeURIComponent(jsonContent.mentimeterSession.pollUrl)}`;
      jsonContent.mentimeterSession.wordCloudQrCodeUrl = 
        `${jsonContent.mentimeterSession.qrCodeBaseUrl}${encodeURIComponent(jsonContent.mentimeterSession.wordCloudUrl)}`;
      
      // For topic-specific quizzes, generate topic-specific QR codes
      if (jsonContent.topicQuizzes && Array.isArray(jsonContent.topicQuizzes)) {
        jsonContent.topicQuizzes.forEach((topicQuiz, index) => {
          const topicSessionCode = sessionCode + (index + 1);
          const topicQuizUrl = `https://www.mentimeter.com/s/${topicSessionCode}/quiz`;
          
          topicQuiz.sessionCode = topicSessionCode;
          topicQuiz.quizUrl = topicQuizUrl;
          topicQuiz.qrCodeUrl = `${jsonContent.mentimeterSession.qrCodeBaseUrl}${encodeURIComponent(topicQuizUrl)}`;
        });
      }
    }

    // Return the structured quiz and poll content with Mentimeter integration
    res.json(jsonContent);
  } catch (error) {
    console.error('Error generating quiz and poll content:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate quiz and poll content', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// Helper function to generate a random code for Mentimeter sessions
function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing characters
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Routes for multi-page application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/generator', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'generator.html'));
});

app.get('/preview-ppt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'preview-ppt.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'search.html'));
});

app.get('/mentimeter', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'mentimeter.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'history.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'about.html'));
});

// Error handling
// YouTube API route for video search
app.get('/api/youtube-search', async (req, res) => {
  try {
    const { query, maxResults = 5 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: maxResults,
        q: query,
        type: 'video',
        key: YOUTUBE_API_KEY,
        relevanceLanguage: 'en',
        videoEmbeddable: true,
        safeSearch: 'strict' // For educational content safety
      }
    });

    // Format the response to include just what we need
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({ videos });
  } catch (error) {
    console.error('Error fetching YouTube videos:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube videos', 
      details: error.response?.data?.error?.message || error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Helper function to check if a URL is a valid YouTube URL
function isValidYouTubeUrl(url) {
  try {
    if (!url || typeof url !== 'string') return false;
    
    // Simple check for basic URL validity
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      return true;
    }
    
    // Check if it's an embed URL
    if (url.includes('youtube.com/embed/')) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}
