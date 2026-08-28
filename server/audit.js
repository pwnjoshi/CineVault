const fetch = require('node-fetch');

async function runComprehensiveAudit() {
  console.log('=====================================================');
  console.log('  CINEVAULT STUDIO COMPREHENSIVE END-TO-END AUDIT   ');
  console.log('=====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`[FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
    }
  }

  // 1. Audit Surface Routes (HTTP 200)
  const surfaces = [
    { path: '/', name: 'Public Landing Page' },
    { path: '/dashboard', name: 'Studio Workspace Dashboard' },
    { path: '/premiere', name: 'Adobe Premiere Pro UXP Panel' },
    { path: '/health', name: 'Server Health Endpoint' }
  ];

  for (const s of surfaces) {
    try {
      const res = await fetch(`http://localhost:4000${s.path}`);
      assert(res.status === 200, `Surface Route: ${s.name}`, `Status ${res.status}`);
    } catch (e) {
      assert(false, `Surface Route: ${s.name}`, e.message);
    }
  }

  // 2. Audit Agent Search Pipeline (Gemini + Parallel)
  let searchData = null;
  try {
    const res = await fetch('http://localhost:4000/api/search-footage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shot_query: 'black-and-white footage of a crowded factory floor, 1960s, USA, industrial machinery and workers',
        filters: { era: '1950s-1960s', rights: 'all', color: 'monochrome', price: 'any' }
      })
    });
    searchData = await res.json();
    assert(searchData.success === true, 'API: Search Footage Agent Execution');
    assert(Array.isArray(searchData.candidates) && searchData.candidates.length > 0, 'API: Search Candidates Returned', `${searchData.candidates.length} clips found`);
    assert(!!searchData.trace && Array.isArray(searchData.trace.steps) && searchData.trace.steps.length >= 4, 'API: Multi-Step Agent Reasoning Trace', `${searchData.trace?.steps?.length} trace steps`);
    assert(!!searchData.candidates[0].clearance_details, 'API: Conservative Public Domain Clearance Audit Metadata');
  } catch (e) {
    assert(false, 'API: Search Footage', e.message);
  }

  // 3. Audit Shortlist Operations
  if (searchData && searchData.candidates && searchData.candidates[0]) {
    const candidate = searchData.candidates[0];
    try {
      const addRes = await fetch('http://localhost:4000/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate)
      });
      const addJson = await addRes.json();
      assert(addJson.success === true, 'API: Add Candidate to Shortlist');

      const getRes = await fetch('http://localhost:4000/api/shortlist');
      const getJson = await getRes.json();
      assert(getJson.success === true && getJson.shortlist.length > 0, 'API: Retrieve Project Shortlist');
    } catch (e) {
      assert(false, 'API: Shortlist Operations', e.message);
    }
  }

  // 4. Audit Multi-Format NLE Timeline Exports
  const formats = [
    { fmt: 'premiere_xml', label: 'Adobe Premiere Pro XML (.xml)', mime: 'application/xml' },
    { fmt: 'edl', label: 'CMX 3600 Edit Decision List (.edl)', mime: 'text/plain' },
    { fmt: 'fcpxml', label: 'DaVinci Resolve / FCPXML (.fcpxml)', mime: 'application/xml' },
    { fmt: 'csv', label: 'Metadata Production Spreadsheet (.csv)', mime: 'text/csv' }
  ];

  for (const f of formats) {
    try {
      const res = await fetch(`http://localhost:4000/api/shortlist/export?format=${f.fmt}`);
      const text = await res.text();
      assert(res.status === 200 && text.length > 50, `API Export: ${f.label}`, `${text.length} bytes generated`);
    } catch (e) {
      assert(false, `API Export: ${f.label}`, e.message);
    }
  }

  // 5. Audit Parallel Price Drop Monitor & Webhook Simulation
  try {
    const monRes = await fetch('http://localhost:4000/api/monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate: searchData.candidates[0],
        watch_for: 'Price discount or license scope alteration'
      })
    });
    const monJson = await monRes.json();
    assert(monJson.success === true, 'API: Enroll Clip in Parallel Price Monitor');

    const monitorId = monJson.monitor_item?.id || monJson.monitor?.id;
    const checkRes = await fetch('http://localhost:4000/api/monitor/check-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monitor_id: monitorId })
    });
    const checkJson = await checkRes.json();
    assert(checkJson.success === true && checkJson.updated_count >= 1, 'API: Parallel Monitor Live Verification Scan');
  } catch (e) {
    assert(false, 'API: Parallel Monitor Live Verification Scan', e.message);
  }

  // 6. Audit Authentication & RBAC Session Flow
  let authToken = '';
  try {
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'joshipawan2021@gmail.com' })
    });
    const loginJson = await loginRes.json();
    authToken = loginJson.token;
    assert(loginJson.success === true && !!authToken, 'API Auth: Google Cloud Workspace SSO / Credential Login');

    const meRes = await fetch('http://localhost:4000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const meJson = await meRes.json();
    assert(meJson.authenticated === true, 'API Auth: Authenticated Session Token Validation (/me)');
  } catch (e) {
    assert(false, 'API Auth', e.message);
  }

  // 7. Audit Autonomous Script-to-Timeline AI
  try {
    const scriptRes = await fetch('http://localhost:4000/api/script-to-timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script_text: 'SCENE 1: INT. FACTORY - 1962 - DAY\nAssembly line machines stamp metal.\n\nSCENE 2: EXT. SPACE LAUNCHPAD - 1969 - DAWN\nSaturn V rocket launch.'
      })
    });
    const scriptJson = await scriptRes.json();
    assert(scriptJson.success === true && scriptJson.data?.total_scenes >= 2, 'API: Autonomous Script-to-Timeline Multi-Scene Sourcing');
  } catch (e) {
    assert(false, 'API: Script-to-Timeline', e.message);
  }

  // 8. Audit Visual Moodboard & Reverse Shot Matcher
  try {
    const imgRes = await fetch('http://localhost:4000/api/image-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        prompt_hint: '1960s vintage monochrome'
      })
    });
    const imgJson = await imgRes.json();
    assert(imgJson.success === true && imgJson.data?.candidates?.length >= 1, 'API: Visual Moodboard & Multimodal Reverse Shot Matching');
  } catch (e) {
    assert(false, 'API: Visual Moodboard', e.message);
  }

  console.log('\n=====================================================');
  console.log(`  AUDIT RESULT: ${passed} / ${total} CHECKS PASSED (${Math.round(passed / total * 100)}%)`);
  console.log('=====================================================');
}

runComprehensiveAudit().catch(console.error);
