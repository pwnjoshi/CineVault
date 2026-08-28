import * as readline from 'readline';
import { parallelClient } from './parallel-client';

/**
 * CineVault Studio Model Context Protocol (MCP) Server for Parallel API
 * Exposes Parallel Search, Extract, and Monitor as standardized MCP tools
 * conforming to the Model Context Protocol specification.
 */

interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

const MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'parallel_search',
    description: 'Searches the global Parallel web index for archival and historical footage sources across institutional and commercial repositories.',
    inputSchema: {
      type: 'object',
      properties: {
        objective: {
          type: 'string',
          description: 'High-level description of the footage sought (e.g. "1960s factory floor assembly line black and white")'
        },
        search_queries: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of targeted sub-queries to execute across archives'
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of candidate URLs to return (default: 10)'
        }
      },
      required: ['objective', 'search_queries']
    }
  },
  {
    name: 'parallel_extract',
    description: 'Deep-scrapes a candidate footage source page to extract exact licensing price, rights scope, resolution, and public domain claims.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The target footage webpage URL to extract metadata from'
        },
        fields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to extract (e.g. ["price", "license_scope", "copyright", "resolution"])'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'parallel_monitor',
    description: 'Enrolls a target footage listing into the Parallel Monitor service to track price drops and availability shifts.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The footage URL to track'
        },
        watch_for: {
          type: 'string',
          description: 'Description of changes to alert on (e.g. "Price reduction or rights change")'
        }
      },
      required: ['url']
    }
  }
];

export async function handleMCPToolCall(toolName: string, args: any): Promise<any> {
  console.log(`[MCP Server] Executing tool "${toolName}" with arguments:`, args);

  switch (toolName) {
    case 'parallel_search': {
      const searchRes = await parallelClient.search(args.objective, args.search_queries || [args.objective]);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(searchRes, null, 2)
          }
        ]
      };
    }
    case 'parallel_extract': {
      const extractRes = await parallelClient.extract(args.url, args.fields);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(extractRes, null, 2)
          }
        ]
      };
    }
    case 'parallel_monitor': {
      const monRes = await parallelClient.monitorAdd(args.url, args.watch_for || 'Price change');
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(monRes, null, 2)
          }
        ]
      };
    }
    default:
      throw new Error(`Unknown MCP tool: ${toolName}`);
  }
}

/**
 * Standard MCP JSON-RPC stdio protocol loop
 */
export function startMCPServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  console.error('[Reelfind MCP Server] Running on stdio. Listening for MCP requests...');

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    try {
      const req: MCPRequest = JSON.parse(line);

      if (req.method === 'tools/list') {
        const response = {
          jsonrpc: '2.0',
          id: req.id,
          result: {
            tools: MCP_TOOLS
          }
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      } else if (req.method === 'tools/call') {
        const { name, arguments: toolArgs } = req.params;
        const result = await handleMCPToolCall(name, toolArgs);
        const response = {
          jsonrpc: '2.0',
          id: req.id,
          result
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      } else {
        const response = {
          jsonrpc: '2.0',
          id: req.id,
          result: {}
        };
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (err: any) {
      console.error('[MCP Server] Error processing line:', err);
      process.stdout.write(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: err.message || 'Internal error' }
      }) + '\n');
    }
  });
}

// Standalone execution entrypoint
if (require.main === module) {
  startMCPServer();
}
