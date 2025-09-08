// Test the database connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

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

    console.log('\n🎉 Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testDatabase();