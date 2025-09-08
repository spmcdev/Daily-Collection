// Simple database test - just check if data exists
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function simpleTest() {
  console.log('🧪 Simple Database Test...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Check loans table
    console.log('📊 Checking loans table...');
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('count')
      .limit(1);

    if (loansError) {
      console.log('❌ Loans table error:', loansError.message);
    } else {
      console.log('✅ Loans table accessible');
    }

    // Check payments table
    console.log('💰 Checking payments table...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('count')
      .limit(1);

    if (paymentsError) {
      console.log('❌ Payments table error:', paymentsError.message);
    } else {
      console.log('✅ Payments table accessible');
    }

    // Try to get actual data
    console.log('\n🔍 Getting actual data...');
    const { data: loansData, error: loansDataError } = await supabase
      .from('loans')
      .select('*')
      .limit(3);

    if (loansDataError) {
      console.log('❌ Error getting loans data:', loansDataError.message);
    } else {
      console.log(`✅ Found ${loansData.length} loans in database`);
      if (loansData.length > 0) {
        loansData.forEach(loan => {
          console.log(`   • ${loan.borrower_id}: ${loan.borrower}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

simpleTest();