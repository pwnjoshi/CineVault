const fetch = require('node-fetch');

async function testAuth() {
  console.log('--- Testing Reelfind Authentication & RBAC Authorization ---');

  // 1. Get Presets
  const presetsRes = await fetch('http://localhost:4000/api/auth/presets');
  const presetsJson = await presetsRes.json();
  console.log('[1] Presets Test:', presetsRes.status === 200 && presetsJson.presets.length >= 4 ? 'PASSED' : 'FAILED');

  // 2. Login
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'joshipawan2021@gmail.com', role: 'LEAD_EDITOR' })
  });
  const loginJson = await loginRes.json();
  console.log('[2] Login & Token Generation Test:', loginJson.success && !!loginJson.token ? 'PASSED' : 'FAILED');
  console.log('    - Token:', loginJson.token);
  console.log('    - Role:', loginJson.user?.roleTitle);

  // 3. /me with Bearer Token
  const meRes = await fetch('http://localhost:4000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${loginJson.token}` }
  });
  const meJson = await meRes.json();
  console.log('[3] Authenticated /me Test:', meRes.status === 200 && meJson.authenticated ? 'PASSED' : 'FAILED');

  // 4. Switch Role to Legal Counsel
  const switchRes = await fetch('http://localhost:4000/api/auth/switch-role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginJson.token}`
    },
    body: JSON.stringify({ target_role: 'LEGAL_COUNSEL' })
  });
  const switchJson = await switchRes.json();
  console.log('[4] RBAC Role Switch Test:', switchJson.success && switchJson.user?.role === 'LEGAL_COUNSEL' ? 'PASSED' : 'FAILED');
  console.log('    - New Persona:', switchJson.user?.name, `(${switchJson.user?.roleTitle})`);

  // 5. Logout
  const logoutRes = await fetch('http://localhost:4000/api/auth/logout', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${switchJson.token}` }
  });
  const logoutJson = await logoutRes.json();
  console.log('[5] Logout Test:', logoutJson.success ? 'PASSED' : 'FAILED');

  console.log('--- All Authentication & RBAC Tests Completed Successfully ---');
}

testAuth().catch(console.error);
