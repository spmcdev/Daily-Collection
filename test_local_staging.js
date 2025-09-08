// Test staging database connection from local server
async function testLocalStaging() {
  const baseUrl = 'http://127.0.0.1:3000';

  console.log('🧪 Testing Local Staging Database Connection...\n');

  try {
    // Test loans endpoint
    console.log('📊 Testing /api/loans...');
    const loansResponse = await fetch(`${baseUrl}/api/loans`);
    const loansText = await loansResponse.text();

    console.log(`Status: ${loansResponse.status}`);
    console.log(`Content-Type: ${loansResponse.headers.get('content-type')}`);

    if (loansResponse.headers.get('content-type')?.includes('application/json')) {
      const loansData = JSON.parse(loansText);
      console.log(`✅ SUCCESS: ${loansData.length} loans retrieved from staging database!`);
      loansData.slice(0, 3).forEach(loan => {
        console.log(`   • Loan ${loan.id}: ${loan.borrower} (${loan.borrower_id})`);
      });
    } else {
      console.log(`❌ FAILED: API returning HTML instead of JSON`);
      console.log(`Response: ${loansText.substring(0, 200)}...`);
    }

    // Test payments endpoint
    console.log('\n💰 Testing /api/payments...');
    const paymentsResponse = await fetch(`${baseUrl}/api/payments`);
    const paymentsText = await paymentsResponse.text();

    console.log(`Status: ${paymentsResponse.status}`);
    console.log(`Content-Type: ${paymentsResponse.headers.get('content-type')}`);

    if (paymentsResponse.headers.get('content-type')?.includes('application/json')) {
      const paymentsData = JSON.parse(paymentsText);
      console.log(`✅ SUCCESS: ${paymentsData.length} payments retrieved from staging database!`);
      paymentsData.slice(0, 3).forEach(payment => {
        console.log(`   • Payment ${payment.id}: Loan ${payment.loan_id}, Week ${payment.week}`);
      });
    } else {
      console.log(`❌ FAILED: API returning HTML instead of JSON`);
      console.log(`Response: ${paymentsText.substring(0, 200)}...`);
    }

    console.log('\n🎉 Local staging database test completed!');

  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
  }
}

testLocalStaging();