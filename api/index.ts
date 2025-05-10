import { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Helper to get session ID from headers
function getSessionId(req: VercelRequest) {
  return req.headers['mcp-session-id'] as string | undefined;
}

// Main Vercel handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sessionId = getSessionId(req);
  let transport: StreamableHTTPServerTransport;

  if (req.method === 'POST') {
    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          transports[sessionId] = transport;
        }
      });
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
      const server = new McpServer({
        name: "Random Number MCP Server",
        version: "1.0.0"
      });
      server.tool(
        "random_number",
        { min: z.number().int().nonnegative(), max: z.number().int().nonnegative() },
        async ({ min, max }) => {
          if (min > max) throw new Error("min must be <= max");
          const value = Math.floor(Math.random() * (max - min + 1)) + min;
          return {
            content: [
              { type: "text", text: value.toString() }
            ]
          };
        }
      );
      await server.connect(transport);
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }
    await transport.handleRequest(req, res, req.body);
  } else if (req.method === 'GET' || req.method === 'DELETE') {
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
