import { VercelRequest, VercelResponse } from '@vercel/node';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Create an MCP server instance
const server = new McpServer({
  name: "Random Number MCP Server",
  version: "1.0.0"
});

// Define the handler function with correct signature and content type
const randomNumberHandler = async (
  { min, max }: { min: number, max: number },
  _extra: any
) => {
  if (min > max) throw new Error("min must be <= max");
  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  return {
    content: [
      { type: "text" as const, text: value.toString() }
    ]
  };
};

// Register the tool
server.tool(
  "random_number",
  { min: z.number().int().nonnegative(), max: z.number().int().nonnegative() },
  randomNumberHandler
);

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
  try {
    if (body.tool !== 'random_number') {
      return res.status(400).json({ error: 'Unknown tool' });
    }
    // Call the handler directly
    const result = await randomNumberHandler(body.input, {});
    return res.status(200).json({ output: result });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Invalid request' });
  }
}
