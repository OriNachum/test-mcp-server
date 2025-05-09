import { VercelRequest, VercelResponse } from '@vercel/node';
import { ToolCallRequest, ToolCallResponse, defineTool } from '@modelcontextprotocol/sdk';

// Define the MCP tool using the SDK
const randomNumberTool = defineTool({
  name: 'random_number',
  description: 'Generate a random natural number between min and max (inclusive)',
  inputSchema: {
    type: 'object',
    properties: {
      min: { type: 'integer', minimum: 0 },
      max: { type: 'integer', minimum: 0 }
    },
    required: ['min', 'max']
  },
  outputSchema: {
    type: 'object',
    properties: {
      value: { type: 'integer', minimum: 0 }
    },
    required: ['value']
  },
  handler: async ({ input }) => {
    const { min, max } = input;
    if (min < 0 || max < min) {
      throw new Error('Invalid input: min and max must be natural numbers, min <= max.');
    }
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    return { value };
  }
});

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = getBody(req);
  // Use the MCP SDK to handle the tool call
  try {
    const toolReq: ToolCallRequest = body;
    if (toolReq.tool !== 'random_number') {
      return res.status(400).json({ error: 'Unknown tool' });
    }
    const toolRes: ToolCallResponse = await randomNumberTool.invoke(toolReq);
    return res.status(200).json(toolRes);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Invalid request' });
  }
}
