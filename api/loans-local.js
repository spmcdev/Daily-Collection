const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Disable SSL for local development
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
    if (req.method === 'GET') {
      // Get all loans or specific loan by ID
      if (req.params && req.params.id) {
        const result = await query('SELECT * FROM loans WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Loan not found' });
        }
        res.status(200).json(result.rows[0]);
      } else {
        const result = await query('SELECT * FROM loans ORDER BY id DESC');
        res.status(200).json(result.rows);
      }

    } else if (req.method === 'POST') {
      // Create new loan
      const { borrower_id, borrower, amount, interest, weeks, start_date } = req.body;
      
      const result = await query(
        'INSERT INTO loans (borrower_id, borrower, amount, interest, weeks, start_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [borrower_id, borrower, amount, interest, weeks, start_date]
      );

      res.status(200).json(result.rows[0]);

    } else if (req.method === 'PUT') {
      // Update loan
      const loanId = req.url.split('/').pop();
      const { borrower_id, borrower, amount, interest, weeks, start_date } = req.body;

      if (loanId) {
        const result = await query(
          'UPDATE loans SET borrower_id = $1, borrower = $2, amount = $3, interest = $4, weeks = $5, start_date = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
          [borrower_id, borrower, amount, interest, weeks, start_date, parseInt(loanId)]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Loan not found' });
        }

        res.status(200).json(result.rows[0]);
      } else {
        res.status(400).json({ error: 'Loan ID required' });
      }

    } else if (req.method === 'DELETE') {
      const loanId = req.url.split('/').pop();

      if (loanId) {
        // Delete related payments first (CASCADE should handle this, but being explicit)
        await query('DELETE FROM payments WHERE loan_id = $1', [parseInt(loanId)]);
        
        // Then delete the loan
        const result = await query('DELETE FROM loans WHERE id = $1 RETURNING *', [parseInt(loanId)]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Loan not found' });
        }

        res.status(200).json({ message: 'Loan and all payments deleted successfully' });
      } else {
        // Delete all loans and payments if no specific ID
        await query('DELETE FROM payments');
        await query('DELETE FROM loans');
        
        res.status(200).json({ message: 'All loans and payments deleted successfully' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { handler };