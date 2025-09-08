// Test single insert to see if data insertion works
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testSingleInsert() {
  console.log('🧪 Testing Single Data Insert...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Try inserting a single loan using the standard Supabase client
    console.log('📝 Inserting single loan...');
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .insert([
        {
          borrower_id: 'TEST001',
          borrower: 'Test User',
          amount: 50000.00,
          interest: 10.0,
          weeks: 20,
          start_date: '2025-01-01'
        }
      ])
      .select();

    if (loanError) {
      console.log('❌ Loan insert error:', loanError.message);
      console.log('Error details:', loanError);
    } else {
      console.log('✅ Loan inserted successfully:', loanData);
    }

    // Check if the data was actually inserted
    console.log('\n🔍 Checking if data exists...');
    const { data: checkData, error: checkError } = await supabase
      .from('loans')
      .select('*')
      .eq('borrower_id', 'TEST001');

    if (checkError) {
      console.log('❌ Check error:', checkError.message);
    } else {
      console.log('✅ Found data:', checkData);
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testSingleInsert();