// MCP server entry point for Vercel (API route style)
import { NextApiRequest, NextApiResponse } from 'next';

// Helper to generate a random natural number between min and max (inclusive)
function randomNatural(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// MCP tool: random_number
async function handleRandomNumber(req: NextApiRequest, res: NextApiResponse) {
  const { min, max } = req.body?.input || {};
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
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Basic MCP tool dispatch
  const { tool } = req.body || {};
  if (tool === 'random_number') {
    return handleRandomNumber(req, res);
  }
  return res.status(400).json({ error: 'Unknown tool' });
}
