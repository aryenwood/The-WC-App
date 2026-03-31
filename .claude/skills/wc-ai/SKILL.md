---
name: wc-ai
description: "AI integration patterns for the WC App and Wood Consulting builds. Use this skill for any AI-powered feature: chat interfaces, content generation, data analysis, smart suggestions, structured output, tool use, and streaming responses. Covers model selection, Firebase proxy pattern for secure API calls, direct API calls, streaming, and tool use / structured output patterns."
---

# WC AI Skill

## Model Selection

Choose the right model for the task. Cost and latency matter.

| Model | Best For | Cost | Latency |
|-------|----------|------|---------|
| **Claude Haiku** | Fast classification, simple Q&A, routing, low-stakes generation | Lowest | Fastest |
| **Claude Sonnet** | General-purpose generation, summarization, analysis, most features | Medium | Medium |
| **Claude Opus** | Complex reasoning, multi-step analysis, high-stakes output, code generation | Highest | Slowest |
| **GPT-4o** | Alternative for comparison, vision tasks, specific tool-use patterns | Medium-High | Medium |
| **GPT-4o-mini** | Budget alternative to Haiku for simple tasks | Low | Fast |

**Default to Sonnet** unless you have a specific reason to choose another model. Use Haiku for high-volume, low-complexity tasks. Use Opus for anything that requires deep reasoning or where quality is non-negotiable.

---

## Base Call Pattern — Firebase Proxy (Recommended)

Never expose API keys in client-side code. Route all AI calls through a Firebase Cloud Function.

### Firebase Function (Backend)

```javascript
const functions = require('firebase-functions');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: functions.config().anthropic.api_key
});

exports.aiChat = functions.https.onCall(async (data, context) => {
  // Optional: require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  const { messages, model = 'claude-sonnet-4-20250514', maxTokens = 1024 } = data;

  try {
    const response = await client.messages.create({
      model: model,
      max_tokens: maxTokens,
      messages: messages
    });

    return {
      content: response.content[0].text,
      usage: response.usage,
      model: response.model
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Client-Side Call

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const aiChat = httpsCallable(functions, 'aiChat');

async function askAI(userMessage) {
  const result = await aiChat({
    messages: [
      { role: 'user', content: userMessage }
    ],
    model: 'claude-sonnet-4-20250514',
    maxTokens: 1024
  });

  return result.data.content;
}
```

---

## Direct API Call (Server-Side Only)

For scripts, local development, or server contexts where you control the environment.

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateContent(prompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  return response.content[0].text;
}
```

---

## Streaming Pattern

For chat interfaces and long-form generation where you want to show output as it arrives.

### Firebase Function (Streaming Endpoint)

```javascript
exports.aiChatStream = functions.https.onRequest(async (req, res) => {
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { messages, model = 'claude-sonnet-4-20250514' } = req.body;

  const stream = await client.messages.stream({
    model: model,
    max_tokens: 2048,
    messages: messages
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
});
```

### Client-Side Streaming Consumer

```javascript
async function streamAIResponse(userMessage, outputEl) {
  const response = await fetch('/api/aiChatStream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        const data = JSON.parse(line.slice(6));
        outputEl.textContent += data.text;
      }
    }
  }
}
```

---

## Tool Use / Structured Output

> **Note:** This section is partial — content was truncated during capture. Core patterns below.

### Structured Output with Tool Use

Force the model to return structured JSON by defining a tool schema:

```javascript
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  tools: [
    {
      name: 'extract_rep_data',
      description: 'Extract structured rep performance data from text',
      input_schema: {
        type: 'object',
        properties: {
          rep_name: { type: 'string', description: 'Full name of the sales rep' },
          installs_today: { type: 'number', description: 'Number of installs today' },
          revenue: { type: 'number', description: 'Revenue generated in dollars' },
          territory: { type: 'string', description: 'Territory or region name' }
        },
        required: ['rep_name', 'installs_today']
      }
    }
  ],
  tool_choice: { type: 'tool', name: 'extract_rep_data' },
  messages: [
    { role: 'user', content: 'Jake closed 4 installs in Phoenix today for $12,400 total revenue.' }
  ]
});

// Access structured output
const toolResult = response.content.find(c => c.type === 'tool_use');
const data = toolResult.input;
// { rep_name: "Jake", installs_today: 4, revenue: 12400, territory: "Phoenix" }
```

### Agentic Tool Use (Multi-Turn)

```javascript
const tools = [
  {
    name: 'get_rep_stats',
    description: 'Get current stats for a sales rep',
    input_schema: {
      type: 'object',
      properties: {
        rep_id: { type: 'string' }
      },
      required: ['rep_id']
    }
  },
  {
    name: 'update_leaderboard',
    description: 'Update the leaderboard with new stats',
    input_schema: {
      type: 'object',
      properties: {
        rep_id: { type: 'string' },
        new_score: { type: 'number' }
      },
      required: ['rep_id', 'new_score']
    }
  }
];

// Handle tool use in a loop
let messages = [{ role: 'user', content: 'Update Jake\'s leaderboard position' }];

while (true) {
  const response = await client.messages.create({
    model: 'c',  // NOTE: Content truncated here in original capture
    // ... remaining implementation follows standard Anthropic tool use loop pattern
  });

  // Check if model wants to use a tool
  const toolUse = response.content.find(c => c.type === 'tool_use');
  if (!toolUse) break; // No more tool calls, we're done

  // Execute the tool and feed result back
  const toolResult = await executeLocalTool(toolUse.name, toolUse.input);
  messages.push({ role: 'assistant', content: response.content });
  messages.push({
    role: 'user',
    content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(toolResult) }]
  });
}
```

> **Truncation note:** The original content for this skill was cut off at `model: 'c`. The agentic tool use loop above has been completed based on standard Anthropic SDK patterns. Additional patterns (vision, embeddings, batch processing) should be added as the skill evolves.
