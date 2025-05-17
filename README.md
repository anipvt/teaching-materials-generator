# AI Teaching Materials Generator

An application that leverages Azure OpenAI to generate comprehensive teaching materials based on user inputs.

## Features

- Generate teaching materials for any subject and topic
- Automatically breaks down topics into sub-topics
- Creates lecture titles and summaries
- Generates PPT slide outlines
- Provides reference links, quizzes, and case studies
- Download generated content as PDF

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone this repository or unzip the provided file
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the server:

```bash
npm start
```

2. Open your browser and navigate to http://localhost:3000

## Usage

1. Fill in the form with your teaching requirements:
   - Semester
   - Subject
   - Class number
   - Topic
   - Difficulty level

2. Click "Generate Materials"

3. View the generated content and download as PDF if needed

## Environment Variables

The application uses the following environment variables in the .env file:

- OPENAI_API_KEY: Your Azure OpenAI API key
- OPENAI_API_ENDPOINT: Your Azure OpenAI API endpoint URL

## Creating a ZIP File

To create a ZIP file of this application:

1. Navigate to the project directory in your terminal
2. Run the following command:

```bash
zip -r teaching-materials-generator.zip .
```

This will create a ZIP file containing all project files, which you can share or deploy elsewhere.
