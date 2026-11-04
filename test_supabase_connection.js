const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper to parse .env.local manually without extra dependencies
function loadEnvLocal() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

async function testSupabaseConnection() {
  console.log('====================================================');
  console.log('ATHEER STORE — SUPABASE CLOUD CONNECTION TEST');
  console.log('Project ID: zdkpxfxvazwwzemimykc');
  console.log('Project URL: https://zdkpxfxvazwwzemimykc.supabase.co');
  console.log('====================================================\n');

  const fileEnv = loadEnvLocal();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    fileEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    fileEnv.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    fileEnv.SUPABASE_SERVICE_ROLE_KEY;

  console.log('--- 1. Environment Variable Audit ---');
  console.log(`• .env.local file: ${fs.existsSync(path.join(__dirname, '.env.local')) ? 'Found' : 'Not yet created'}`);
  console.log(`• Target URL: ${supabaseUrl || '(Not set)'}`);
  
  const isPublishableSet = publishableKey && !publishableKey.includes('your-') && !publishableKey.includes('<');
  console.log(`• Publishable Key: ${isPublishableSet ? `Configured (${publishableKey.slice(0, 10)}...)` : 'Missing / Placeholder'}`);

  const isSecretSet = secretKey && !secretKey.includes('your-') && !secretKey.includes('<');
  console.log(`• Secret Key (Server-Only): ${isSecretSet ? `Configured (${secretKey.slice(0, 8)}...)` : 'Missing / Placeholder'}`);

  if (!supabaseUrl || !isPublishableSet) {
    console.log('\n====================================================');
    console.log('CONNECTION STATUS: NOT CONNECTED (Awaiting Credentials)');
    console.log('====================================================');
    console.log('Supabase credentials have not yet been provided in .env.local.');
    console.log('Please copy .env.example to .env.local and insert your real keys from:');
    console.log('https://supabase.com/dashboard/project/zdkpxfxvazwwzemimykc/settings/api');
    console.log('====================================================\n');
    return { connected: false, reason: 'missing_credentials' };
  }

  // If credentials are provided, attempt real HTTPS connection test
  console.log('\n--- 2. Live Cloud Handshake Test ---');
  try {
    const client = createClient(supabaseUrl, publishableKey);
    const startMs = Date.now();
    
    // Attempt pinging the database
    const { data, error, status } = await client
      .from('shipping_zones')
      .select('count', { count: 'exact', head: true });

    const durationMs = Date.now() - startMs;

    if (error) {
      console.log(`[FAILED] Handshake rejected by Supabase (HTTP ${status}): ${error.message}`);
      if (error.message.includes('relation "public.shipping_zones" does not exist')) {
        console.log('ℹ️  Authentication succeeded, but tables are not yet created.');
        console.log('    Action needed: Run the database migrations in the Supabase SQL Editor.');
        return { connected: true, tablesMigrated: false };
      }
      return { connected: false, error: error.message };
    }

    console.log(`[PASS] Supabase cloud connection verified in ${durationMs}ms!`);
    console.log(`       HTTP Status: ${status}`);
    
    // If secret key is provided, test server administrative access
    if (isSecretSet) {
      console.log('\n--- 3. Server Secret Key Verification ---');
      const serverClient = createClient(supabaseUrl, secretKey, {
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { error: adminError } = await serverClient
        .from('orders')
        .select('count', { count: 'exact', head: true });

      if (adminError && !adminError.message.includes('relation "public.orders" does not exist')) {
        console.log(`[WARN] Secret key check failed: ${adminError.message}`);
      } else {
        console.log(`[PASS] Server secret key verified successfully.`);
      }
    }

    console.log('\n====================================================');
    console.log('CONNECTION STATUS: FULLY CONNECTED & VERIFIED');
    console.log('====================================================\n');
    return { connected: true, tablesMigrated: true };
  } catch (networkErr) {
    console.log(`[ERROR] Network error reaching ${supabaseUrl}:`, networkErr.message);
    return { connected: false, error: networkErr.message };
  }
}

testSupabaseConnection().catch((e) => {
  console.error('Test execution error:', e);
});
