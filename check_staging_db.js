const { createClient } = require('@supabase/supabase-js');

// Staging database credentials
const SUPABASE_URL = "https://bkiglesjdwgvomsyfxkc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWdsZXNqZHdndm9tc3lmeGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDk5NjAsImV4cCI6MjA3MjkyNTk2MH0.k89ZlaOQwlJjRux02JqGHLEizrhy7D9cVCXa8Cq9KgU";

async function checkStagingData() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("🔗 Checking staging database...");

    // Check loans
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*');

    if (loansError) throw loansError;

    console.log(`📊 Loans in staging database: ${loans.length}`);
    loans.forEach(loan => {
      console.log(`   • ${loan.id}: ${loan.borrower} (${loan.borrower_id}) - රු. ${loan.amount}`);
    });

    // Check payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*');

    if (paymentsError) throw paymentsError;

    console.log(`💰 Payments in staging database: ${payments.length}`);
    payments.forEach(payment => {
      console.log(`   • Payment ${payment.id}: Loan ${payment.loan_id}, Week ${payment.week}, රු. ${payment.amount}`);
    });

    // Test API endpoints
    console.log("\n🔍 Testing API endpoints...");

    // Test loans endpoint
    try {
      const loansResponse = await fetch('https://daily-collection-git-staging-demo-naveens-projects-d9df705a.vercel.app/api/loans');
      const loansData = await loansResponse.json();
      console.log(`✅ Loans API: ${loansData.length} loans returned`);
    } catch (error) {
      console.log(`❌ Loans API Error: ${error.message}`);
    }

    // Test payments endpoint
    try {
      const paymentsResponse = await fetch('https://daily-collection-git-staging-demo-naveens-projects-d9df705a.vercel.app/api/payments');
      const paymentsData = await paymentsResponse.json();
      console.log(`✅ Payments API: ${paymentsData.length} payments returned`);
    } catch (error) {
      console.log(`❌ Payments API Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStagingData();