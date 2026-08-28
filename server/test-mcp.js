const { handleMCPToolCall } = require('./dist/mcp-server');

async function testMCP() {
  console.log('--- Testing Reelfind MCP Server Tools ---');
  
  const searchResult = await handleMCPToolCall('parallel_search', {
    objective: '1960s factory floor',
    search_queries: ['1960s American automobile assembly line factory floor black and white archival']
  });
  console.log('[MCP] parallel_search tool output length:', searchResult.content[0].text.length > 50 ? 'PASSED' : 'FAILED');

  const extractResult = await handleMCPToolCall('parallel_extract', {
    url: 'https://catalog.archives.gov/id/1154823',
    fields: ['price', 'license_scope', 'copyright']
  });
  console.log('[MCP] parallel_extract tool output length:', extractResult.content[0].text.length > 50 ? 'PASSED' : 'FAILED');

  const monitorResult = await handleMCPToolCall('parallel_monitor', {
    url: 'https://www.britishpathe.com/asset/1964_factory_floor',
    watch_for: 'Price discount'
  });
  console.log('[MCP] parallel_monitor tool output length:', monitorResult.content[0].text.length > 30 ? 'PASSED' : 'FAILED');

  console.log('--- MCP Tool Verification Complete ---');
}

testMCP().catch(console.error);
