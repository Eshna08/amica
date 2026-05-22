# GitHub Models API Setup Guide

This guide will he### 5. Available Models

The following models are available through GitHub Models API:

- **GPT Models**:
  - `gpt-4o` - Latest GPT-4 Omni model
  - `gpt-4o-mini` - Smaller, faster GPT-4 variant (recommended for development)
  
- **OpenAI o1 Models**:
  - `o1-preview` - Preview of reasoning model
  - `o1-mini` - Smaller reasoning model

- **Claude Models**:
  - `claude-3-5-sonnet` - Anthropic's Claude 3.5 Sonnet
  - `claude-3-haiku` - Faster Claude variant

**Note**: Model names should be used without the provider prefix (e.g., use `gpt-4o-mini` not `openai/gpt-4o-mini`)

### 6. Test the Integration GitHub Models API integration for Amica using the Azure REST client.

## Prerequisites

1. A GitHub account
2. Access to GitHub Models (currently in preview)
3. Node.js and npm installed

## Setup Steps

### 1. Get GitHub Models Access

1. Visit [GitHub Models](https://github.com/marketplace/models) 
2. Sign up for the preview program if you haven't already
3. Wait for approval (this may take some time as it's currently in preview)

### 2. Generate a Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "Amica Chat API")
4. Set an appropriate expiration date
5. Select the following scopes:
   - `repo` (if your repo is private)
   - `model` (for GitHub Models access)
6. Click "Generate token"
7. **Important**: Copy the token immediately as you won't be able to see it again

### 3. Install Dependencies

The project uses the Azure REST client for GitHub Models API:

```bash
npm install @azure-rest/ai-inference @azure/core-auth
```

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and replace the placeholder values:
   ```env
   VITE_GITHUB_API_TOKEN=your_actual_github_token_here
   VITE_GITHUB_MODEL=gpt-4o-mini
   ```

### 4. Available Models

The following models are available through GitHub Models API:

- **GPT Models**:
  - `gpt-4o` - Latest GPT-4 Omni model
  - `gpt-4o-mini` - Smaller, faster GPT-4 variant (recommended for development)
  
- **OpenAI o1 Models**:
  - `o1-preview` - Preview of reasoning model
  - `o1-mini` - Smaller reasoning model

- **Claude Models**:
  - `claude-3-5-sonnet` - Anthropic's Claude 3.5 Sonnet
  - `claude-3-haiku` - Faster Claude variant

### 5. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Chat page
3. Send a test message
4. Verify that you receive responses from the AI model

## Troubleshooting

### Common Issues

1. **"GitHub API token is missing" error**:
   - Ensure your `.env` file exists and contains the correct token
   - Verify the token has the `model` scope enabled
   - Restart the development server after changing environment variables

2. **Rate limiting**:
   - GitHub Models has rate limits that vary by model
   - Consider using `gpt-4o-mini` for development to conserve rate limits

3. **Model not available**:
   - Ensure you have access to GitHub Models preview
   - Some models may have restricted access

### Getting Help

If you encounter issues:

1. Check the browser console for detailed error messages
2. Verify your GitHub Models access status
3. Ensure your personal access token has the correct permissions
4. Try switching to a different model (e.g., `gpt-4o-mini`)

## Security Notes

- Never commit your actual API token to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your personal access tokens
- Consider using GitHub Apps for production deployments
