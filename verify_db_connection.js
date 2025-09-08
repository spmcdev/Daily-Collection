// Verify which database we're actually connecting to
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function verifyConnection() {
  console.log('🔍 Verifying Database Connection...\n');
  console.log('Database URL:', SUPABASE_URL);
  console.log('Project Ref:', SUPABASE_URL.split('.')[0].split('//')[1]);
  console.log();

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Test basic connection
    console.log('📡 Testing connection...');
    const { data, error } = await supabase.from('loans').select('count').limit(1);

    if (error) {
      console.log('❌ Connection error:', error.message);
      return;
    }

    console.log('✅ Connection successful');

    // Check if tables exist
    console.log('\n📋 Checking tables...');

    // Check loans table
    try {
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .limit(1);

      if (loansError) {
        console.log('❌ Loans table error:', loansError.message);
      } else {
        console.log('✅ Loans table exists');
      }
    } catch (e) {
      console.log('❌ Loans table check failed:', e.message);
    }

    // Check payments table
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .limit(1);

      if (paymentsError) {
        console.log('❌ Payments table error:', paymentsError.message);
      } else {
        console.log('✅ Payments table exists');
      }
    } catch (e) {
      console.log('❌ Payments table check failed:', e.message);
    }

    // Try to get actual count
    console.log('\n📊 Getting data counts...');
    try {
      const { count: loansCount, error: countError } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.log('❌ Count error:', countError.message);
      } else {
        console.log(`📈 Loans count: ${loansCount}`);
      }
    } catch (e) {
      console.log('❌ Count failed:', e.message);
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

verifyConnection();