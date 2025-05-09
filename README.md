# MCP Server for Vercel

This is a minimal Model Context Protocol (MCP) backend server, deployable on Vercel, with a single tool:

- `random_number`: Generates a random natural number between `min` and `max` (inclusive).

## API Usage

POST `/api` with JSON body:

```
{
  "tool": "random_number",
  "input": { "min": 1, "max": 10 }
}
```

Response:
```
{
  "output": { "value": 7 }
}
```

## Local Development

- Install dependencies: `npm install`
- Run locally: `npm run dev`

## Deploy

- Deploy to Vercel as a Node.js API route (see `vercel.json`).