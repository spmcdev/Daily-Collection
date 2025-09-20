const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Helper function to execute queries
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function handler(req, res) {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      const borrowerId = req.query.borrower_id;
      
      if (!borrowerId) {
        return res.status(400).json({ error: 'Borrower ID required' });
      }
      
      // Check permissions - users can only access their own data
      if (req.session.user.role === 'user' && borrowerId !== req.session.user.username) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Get loans for the borrower
      const loansResult = await query('SELECT * FROM loans WHERE borrower_id = $1 ORDER BY id DESC', [borrowerId]);
      const loans = loansResult.rows;
      
      // Get all payments for this borrower's loans
      const loanIds = loans.map(loan => loan.id);
      let payments = [];
      
      if (loanIds.length > 0) {
        const placeholders = loanIds.map((_, index) => `$${index + 1}`).join(',');
        const paymentsResult = await query(`SELECT * FROM payments WHERE loan_id IN (${placeholders}) ORDER BY loan_id, week`, loanIds);
        payments = paymentsResult.rows;
      }
      
      res.json({
        loans,
        payments
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Borrower Summary API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { handler };