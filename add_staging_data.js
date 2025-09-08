const { createClient } = require('@supabase/supabase-js');

// Staging database credentials
const SUPABASE_URL = "https://bkiglesjdwgvomsyfxkc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWdsZXNqZHdndm9tc3lmeGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDk5NjAsImV4cCI6MjA3MjkyNTk2MH0.k89ZlaOQwlJjRux02JqGHLEizrhy7D9cVCXa8Cq9KgU";

async function addStagingSampleData() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("🔗 Connected to staging Supabase");

    // Sample loans data
    const sampleLoans = [
      {
        borrower_id: "DEMO001",
        borrower: "John Smith (Demo)",
        amount: 50000.00,
        interest: 5.0,
        weeks: 10,
        start_date: "2025-08-09"
      },
      {
        borrower_id: "DEMO002",
        borrower: "Sarah Johnson (Demo)",
        amount: 25000.00,
        interest: 4.5,
        weeks: 8,
        start_date: "2025-08-19"
      },
      {
        borrower_id: "DEMO003",
        borrower: "Mike Wilson (Demo)",
        amount: 75000.00,
        interest: 6.0,
        weeks: 12,
        start_date: "2025-08-29"
      },
      {
        borrower_id: "DEMO004",
        borrower: "Emma Davis (Demo)",
        amount: 30000.00,
        interest: 4.0,
        weeks: 6,
        start_date: "2025-07-25"
      },
      {
        borrower_id: "DEMO005",
        borrower: "Robert Brown (Demo)",
        amount: 45000.00,
        interest: 5.5,
        weeks: 9,
        start_date: "2025-08-24"
      }
    ];

    console.log("📝 Adding sample loans...");
    const loansResult = await supabase
      .from('loans')
      .insert(sampleLoans)
      .select();

    console.log(`✅ Added ${loansResult.data.length} loans`);

    // Generate payments for the loans
    const samplePayments = [];
    loansResult.data.forEach(loan => {
      const weeklyInstallment = (loan.amount * (1 + loan.interest/100) / loan.weeks);
      // Add payments for first 3 weeks
      for(let week = 1; week <= 3; week++) {
        samplePayments.push({
          loan_id: loan.id,
          week: week,
          amount: Math.round(weeklyInstallment * 100) / 100
        });
      }
    });

    console.log("📝 Adding sample payments...");
    const paymentsResult = await supabase
      .from('payments')
      .insert(samplePayments)
      .select();

    console.log(`✅ Added ${paymentsResult.data.length} payments`);

    console.log("🎉 Sample data added successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • ${loansResult.data.length} demo loans`);
    console.log(`   • ${paymentsResult.data.length} demo payments`);
    console.log("\n🔗 Your staging site should now show data!");

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addStagingSampleData();