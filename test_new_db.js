// Test the new staging database connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bkiglesjdwgvomsyfxkc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWdsZXNqZHdndm9tc3lmeGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDk5NjAsImV4cCI6MjA3MjkyNTk2MH0.k89ZlaOQwlJjRux02JqGHLEizrhy7D9cVCXa8Cq9KgU";

async function testNewDatabase() {
  console.log('🧪 Testing new staging database connection...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Test loans table
    console.log('📊 Testing loans table...');
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .limit(5);

    if (loansError) {
      console.log('❌ Loans table error:', loansError.message);
    } else {
      console.log(`✅ Found ${loans.length} loans in database`);
      loans.forEach(loan => {
        console.log(`   - ${loan.borrower_id}: ${loan.borrower} - Rs.${loan.amount}`);
      });
    }

    // Test payments table
    console.log('\n💰 Testing payments table...');
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .limit(5);

    if (paymentsError) {
      console.log('❌ Payments table error:', paymentsError.message);
    } else {
      console.log(`✅ Found ${payments.length} payments in database`);
      payments.forEach(payment => {
        console.log(`   - Loan ${payment.loan_id}, Week ${payment.week}: Rs.${payment.amount}`);
      });
    }

    console.log('\n🎉 New staging database test completed successfully!');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testNewDatabase();