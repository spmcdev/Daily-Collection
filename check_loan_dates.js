const { createClient } = require('@supabase/supabase-js');

// Database credentials from environment variables
const SUPABASE_URL = "https://extzvxpizdxqzlvebioo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dHp2eHBpemR4cXpsdmViaW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzk4MzUsImV4cCI6MjA3MjY1NTgzNX0.TXUQOCEtQH6su0Ojonu_9sAOJAo-67_zZk90f_BZlU8";

async function checkLoanDates() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log("=== CHECKING LOAN DATES FOR SORTING ===");

    // Get loans 25 and 26 specifically
    const { data: loans25and26, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .in('id', [25, 26]);

    if (loansError) throw loansError;

    console.log("Loans 25 and 26 details:");
    loans25and26.forEach(loan => {
      console.log(`Loan ${loan.id}: Start Date: ${loan.start_date}`);
    });

    // Get all loans for borrower 001 to see the full date range
    const { data: allLoans, error: allLoansError } = await supabase
      .from('loans')
      .select('id, start_date')
      .eq('borrower_id', '001')
      .order('start_date', { ascending: false });

    if (allLoansError) throw allLoansError;

    console.log("\nAll loans sorted by start_date (newest first):");
    allLoans.forEach(loan => {
      console.log(`Loan ${loan.id}: ${loan.start_date}`);
    });

    // Test the sorting logic
    console.log("\n=== TESTING SORTING LOGIC ===");
    const testLoans = [...loans25and26];
    console.log("Before sorting:", testLoans.map(l => ({id: l.id, date: l.start_date})));

    testLoans.sort((a, b) => {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);
      console.log(`Comparing Loan ${a.id} (${dateA.toISOString()}) vs Loan ${b.id} (${dateB.toISOString()})`);
      return dateB.getTime() - dateA.getTime();
    });

    console.log("After sorting:", testLoans.map(l => ({id: l.id, date: l.start_date})));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkLoanDates();