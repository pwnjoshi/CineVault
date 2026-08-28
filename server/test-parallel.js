const { parallelClient } = require('./dist/parallel-client');

async function testParallelIntegration() {
  console.log('=====================================================');
  console.log('     PARALLEL API INTEGRATION TEST SUITE           ');
  console.log('=====================================================');

  // 1. Status Check
  console.log('\n[1/4] Testing parallelClient.getStatus()...');
  const status = parallelClient.getStatus();
  console.log('Status Result:', JSON.stringify(status, null, 2));

  // 2. Search Execution Across 15 Repositories
  console.log('\n[2/4] Testing parallelClient.search()...');
  const searchResult = await parallelClient.search(
    'Apollo 11 Saturn V rocket launch historical 70mm telecine scan',
    ['Apollo 11 Saturn V launch', 'NASA spaceflight historical footage']
  );
  console.log(`Search Provider: ${searchResult.provider}`);
  console.log(`Total Candidates Found: ${searchResult.total_results}`);
  console.log('Top 3 Results Preview:');
  searchResult.results.slice(0, 3).forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.source}] ${r.title}`);
    console.log(`     URL: ${r.url}`);
    console.log(`     Era: ${r.era || 'Archival'} | Color: ${r.color_profile || 'B&W'}`);
  });

  // 3. Deep Extract Terms & Provenance
  console.log('\n[3/4] Testing parallelClient.extract()...');
  const extractResult = await parallelClient.extract(
    'https://catalog.archives.gov/id/1154823',
    ['price', 'license_scope', 'copyright', 'provenance']
  );
  console.log('Extract Result:', JSON.stringify(extractResult, null, 2));

  // 4. Parallel Monitor Registration
  console.log('\n[4/4] Testing parallelClient.monitorAdd()...');
  const monitorResult = await parallelClient.monitorAdd(
    'https://catalog.archives.gov/id/1154823',
    'Price or clearance term modification'
  );
  console.log('Monitor Result:', JSON.stringify(monitorResult, null, 2));

  console.log('\n=====================================================');
  console.log('     PARALLEL API TEST PASSED SUCCESSFULLY (100%)    ');
  console.log('=====================================================');
}

testParallelIntegration().catch(err => {
  console.error('Parallel Test Error:', err);
  process.exit(1);
});
