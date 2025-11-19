# AI Text Rephraser & Synonym Finder

AI-powered tool to rephrase text in different tones (fluent, professional, casual, STAR method) and find synonyms for words or phrases.

Try it [here](rephrase-me.com)!

## Tech Stack

- **Next.js 16** - React framework
- **Vercel AI SDK** - AI streaming & gateway
- **Mistral AI** - Language model (ministral-3b)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vitest** - Unit testing

## Setup

```bash
# Install dependencies
pnpm install

# Add environment variables
cp .env.local.example .env.local
# Add your AI_SDK_GATEWAY_TOKEN here

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter text in the input field
2. Select an action:
   - **Fluent/Professional/Casual** - Rephrase with different tones
   - **STAR Method** - Rewrite using Situation-Task-Action-Result format
   - **Synonym** - Get 10 alternatives (works for words or phrases)
3. Click anywhere on result cards to copy

**Auto-detection**: Single words automatically use synonym mode

## Testing

```bash
pnpm test         # Run all tests
pnpm test:watch   # Watch mode
```

## Deploy

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Environment variables required:
- `AI_SDK_GATEWAY_TOKEN` - Vercel AI SDK gateway token

---

## Note

This project was built as a learning exercise exploring the new [Gemini 3.0 model](https://blog.google/products/gemini/gemini-3/) and [Antigravity](https://antigravity.google/) (Google's AI-powered code editor) to better understand the AI-assisted development workflow.
