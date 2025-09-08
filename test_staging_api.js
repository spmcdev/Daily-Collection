// Test staging API endpoints directly
async function testStagingAPI() {
  const baseUrl = 'https://daily-collection-git-staging-demo-naveens-projects-d9df705a.vercel.app';

  console.log('🧪 Testing Staging API Endpoints...\n');

  try {
    // Test loans endpoint
    console.log('📊 Testing /api/loans...');
    const loansResponse = await fetch(`${baseUrl}/api/loans`);
    const loansText = await loansResponse.text();

    console.log(`Status: ${loansResponse.status}`);
    console.log(`Content-Type: ${loansResponse.headers.get('content-type')}`);

    if (loansResponse.headers.get('content-type')?.includes('application/json')) {
      const loansData = JSON.parse(loansText);
      console.log(`✅ Loans API working: ${loansData.length} loans found`);
      loansData.slice(0, 3).forEach(loan => {
        console.log(`   • Loan ${loan.id}: ${loan.borrower} (${loan.borrower_id})`);
      });
    } else {
      console.log(`❌ Loans API returning HTML instead of JSON`);
      console.log(`First 200 chars: ${loansText.substring(0, 200)}...`);
    }

    console.log('\n💰 Testing /api/payments...');
    const paymentsResponse = await fetch(`${baseUrl}/api/payments`);
    const paymentsText = await paymentsResponse.text();

    console.log(`Status: ${paymentsResponse.status}`);
    console.log(`Content-Type: ${paymentsResponse.headers.get('content-type')}`);

    if (paymentsResponse.headers.get('content-type')?.includes('application/json')) {
      const paymentsData = JSON.parse(paymentsText);
      console.log(`✅ Payments API working: ${paymentsData.length} payments found`);
      paymentsData.slice(0, 3).forEach(payment => {
        console.log(`   • Payment ${payment.id}: Loan ${payment.loan_id}, Week ${payment.week}`);
      });
    } else {
      console.log(`❌ Payments API returning HTML instead of JSON`);
      console.log(`First 200 chars: ${paymentsText.substring(0, 200)}...`);
    }

  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

testStagingAPI();