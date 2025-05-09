import { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to parse JSON body for Vercel (since body may be a string)
function getBody(req: VercelRequest): any {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
}

// Helper to generate a random natural number between min and max (inclusive)
function randomNatural(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// MCP tool: random_number
async function handleRandomNumber(req: VercelRequest, res: VercelResponse) {
  const body = getBody(req);
  const { min, max } = body.input || {};
  if (
    typeof min !== 'number' ||
    typeof max !== 'number' ||
    min < 0 ||
    max < min
  ) {
    return res.status(400).json({ error: 'Invalid input: min and max must be natural numbers, min <= max.' });
  }
  const value = randomNatural(min, max);
  return res.status(200).json({ output: { value } });
}

// MCP entrypoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = getBody(req);
  const { tool } = body;
  if (tool === 'random_number') {
    return handleRandomNumber(req, res);
  }
  return res.status(400).json({ error: 'Unknown tool' });
}
