# AI Text Analysis API

A robust Node.js/TypeScript API that analyzes text using OpenAI's GPT models to provide summaries, sentiment analysis, and keyword extraction.

## 🚀 Features

- **Text Summarization**: Generate concise summaries of input text
- **Sentiment Analysis**: Classify text as positive, negative, or neutral
- **Keyword Extraction**: Extract exactly 3 relevant keywords from text
- **Input Validation**: Comprehensive validation using Zod schemas
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Error Handling**: Proper error handling with detailed logging
- **Security**: Helmet.js for security headers and CORS support
- **TypeScript**: Full TypeScript support with strict typing

## 📋 Requirements

- Node.js 18+ and npm
- OpenAI API key 

 ### Note: ```If reviewer needs an apikey to test kindly inform me.```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sage-technicals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with hot reloading using nodemon.

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check
**GET** `/health`

Checks if the API is running.

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-27T07:58:25.380Z"
}
```

### Analyze Text
**POST** `/api/analyze`

Analyze text to generate a summary, sentiment, and keywords.

**Request Body:**
```json
{
  "text": "Your text to analyze here. Must be between 10 and 10,000 characters."
}
```

**Response (200 OK):**
```json
{
  "summary": "This is a concise summary of the provided text in 1-2 sentences.",
  "sentiment": "positive",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

**Error Responses:**

- **400 Bad Request** (Validation Error):
  ```json
  {
    "error": "Validation error: text: Text must be at least 10 characters long",
    "timestamp": "2025-11-27T07:58:25.380Z"
  }
  ```

- **429 Too Many Requests** (Rate Limited):
  ```json
  {
    "error": "Too many requests from this IP, please try again later."
  }
  ```

- **500 Internal Server Error** (API Error):
  ```json
  {
    "error": "Failed to analyze text with AI service",
    "timestamp": "2025-11-27T07:58:25.380Z"
  }
  ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | - | Yes |
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | http://localhost:3000 | No |

### Rate Limiting

- **Window**: 15 minutes
- **Max requests**: 100 per IP address
- Applied to all `/api/*` routes

## 🧪 Testing

The API includes comprehensive tests covering:

- ✅ Successful text analysis
- ✅ Input validation (length, empty, whitespace)
- ✅ Error handling (LLM service failures)
- ✅ Rate limiting
- ✅ Health check endpoint
- ✅ 404 handling

Run tests with:
```bash
npm test
```

## 🏗️ Project Structure

```
src/
├── index.ts               # Main application entry point
├── middleware/
│   └── errorHandler.ts    # Global error handling middleware
├── routes/
│   └── analyze.ts         # Text analysis endpoint
├── services/
│   └── llmService.ts      # OpenAI integration service
└── types/
│   └── api.ts             # TypeScript type definitions
└── utils/
    └── inputValidation.ts # validations  

tests/
└── analyze.test.ts      # API endpoint tests

jest.config.js           # Jest testing configuration
tsconfig.json           # TypeScript configuration
```

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: No sensitive data leakage in production

## 🤖 AI Integration

### LLM Provider
- **Provider**: OpenAI
- **Model**: GPT-3.5-turbo
- **Features**:
  - Text summarization
  - Sentiment classification (positive/negative/neutral)
  - Keyword extraction (exactly 3 keywords)

### Prompt Engineering

The system uses a carefully crafted prompt to ensure consistent, structured responses from the AI model, including JSON parsing and validation.

## 📊 Sample Usage

### Using curl
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I absolutely love this new smartphone! The camera quality is amazing, battery life is excellent, and the user interface is incredibly intuitive. Highly recommended!"
  }'
```

### Expected Response
```json
{
  "summary": "The user expresses strong positive feelings about a new smartphone, highlighting its excellent camera, battery life, and intuitive interface.",
  "sentiment": "positive",
  "keywords": ["smartphone", "camera", "battery"]
}
```

### Using JavaScript/fetch
```javascript
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Your text to analyze here...'
  })
});

const result = await response.json();
console.log(result);
```

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure `OPENAI_API_KEY` is set in your `.env` file
   - Verify the API key is valid and has sufficient credits

2. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Kill the process using the port: `lsof -ti:3000 | xargs kill`

3. **Rate Limiting**
   - Wait 15 minutes or use a different IP
   - Consider upgrading rate limits for production use

4. **Build Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript compilation: `npm run build`
