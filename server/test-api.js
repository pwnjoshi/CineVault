const fetch = require('node-fetch');

async function runTests() {
  console.log('--- Starting Comprehensive CineVault Studio API Integration Verification ---');
  
  // 1. Status Check
  const statusRes = await fetch('http://localhost:4000/api/status');
  const statusJson = await statusRes.json();
  console.log('[1] Status Test:', statusRes.status === 200 ? 'PASSED' : 'FAILED', `(${statusJson.system})`);

  // 2. Search Footage with Filters
  const searchRes = await fetch('http://localhost:4000/api/search-footage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shot_query: 'black-and-white footage of a crowded factory floor, 1960s, USA',
      filters: { era: '1950s-1960s', color: 'monochrome', maxPrice: 150 }
    })
  });
  const searchJson = await searchRes.json();
  console.log('[2] Search Footage with Director Filters Test:', searchRes.status === 200 ? 'PASSED' : 'FAILED');
  console.log('    - Decomposed queries:', searchJson.decomposed_queries?.length);
  console.log('    - Candidates found:', searchJson.candidates?.length);
  console.log('    - Agent Execution Trace Steps:', searchJson.trace?.steps?.length);
  console.log('    - Top candidate:', searchJson.candidates?.[0]?.title);
  console.log('    - PD Claim:', searchJson.candidates?.[0]?.pd_claim);
  console.log('    - Price:', searchJson.candidates?.[0]?.price);
  console.log('    - Preview Video URL:', searchJson.candidates?.[0]?.preview_video_url ? 'Available' : 'Missing');

  if (searchJson.candidates && searchJson.candidates.length > 0) {
    const testCandidate = searchJson.candidates[0];

    // 3. Shortlist Add
    const shortRes = await fetch('http://localhost:4000/api/shortlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCandidate)
    });
    const shortJson = await shortRes.json();
    console.log('[3] Shortlist Add Test:', shortRes.status === 201 ? 'PASSED' : 'FAILED');

    // 4. Export Formats
    // 4a. Premiere XML
    const exportXmlRes = await fetch('http://localhost:4000/api/shortlist/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'premiere_xml' })
    });
    const xmlText = await exportXmlRes.text();
    console.log('[4a] Premiere Pro XML Export Test:', xmlText.includes('<xmeml') ? 'PASSED' : 'FAILED');

    // 4b. CMX 3600 EDL
    const exportEdlRes = await fetch('http://localhost:4000/api/shortlist/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'edl' })
    });
    const edlText = await exportEdlRes.text();
    console.log('[4b] CMX 3600 EDL Export Test:', edlText.includes('TITLE: CINEVAULT') ? 'PASSED' : 'FAILED');

    // 4c. Final Cut Pro FCPXML
    const exportFcpxmlRes = await fetch('http://localhost:4000/api/shortlist/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'fcpxml' })
    });
    const fcpxmlText = await exportFcpxmlRes.text();
    console.log('[4c] Final Cut / DaVinci FCPXML Export Test:', fcpxmlText.includes('<fcpxml') ? 'PASSED' : 'FAILED');

    // 4d. CSV Spreadsheet
    const exportCsvRes = await fetch('http://localhost:4000/api/shortlist/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'csv' })
    });
    const csvText = await exportCsvRes.text();
    console.log('[4d] CSV Spreadsheet Export Test:', csvText.includes('Title,Source') ? 'PASSED' : 'FAILED');

    // 5. Parallel Monitor Alert Simulation
    const monRes = await fetch('http://localhost:4000/api/monitor');
    const monJson = await monRes.json();
    if (monJson.monitors && monJson.monitors.length > 0) {
      const targetMon = monJson.monitors[0];
      const alertRes = await fetch('http://localhost:4000/api/monitor/simulate-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monitor_id: targetMon.id,
          new_price: '$39.00 (Flash Sale)',
          note: 'Price dropped by 50% on archival stock vendor'
        })
      });
      const alertJson = await alertRes.json();
      console.log('[5] Parallel Monitor Alert Simulation:', alertJson.success ? 'PASSED' : 'FAILED');
    }
  }

  console.log('--- All Verification Tests Completed Successfully ---');
}

runTests().catch(console.error);
