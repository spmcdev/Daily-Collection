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
      // Get all payments
      const result = await query('SELECT * FROM payments ORDER BY loan_id, week');
      res.status(200).json(result.rows);

    } else if (req.method === 'POST') {
      // Create new payment
      const paymentData = req.body;

      // Check if payment already exists for this loan_id and week
      const existingResult = await query(
        'SELECT * FROM payments WHERE loan_id = $1 AND week = $2',
        [paymentData.loan_id, paymentData.week]
      );

      if (existingResult.rows.length > 0) {
        // Return the existing payment data
        res.status(200).json(existingResult.rows);
      } else {
        // Create new payment
        const result = await query(
          'INSERT INTO payments (loan_id, week, amount, date) VALUES ($1, $2, $3, $4) RETURNING *',
          [paymentData.loan_id, paymentData.week, paymentData.amount, paymentData.date || new Date().toISOString().split('T')[0]]
        );

        res.status(200).json(result.rows[0]);
      }

    } else if (req.method === 'PUT') {
      // Update payment
      const paymentId = req.url.split('/').pop();
      const { loan_id, week, amount, date } = req.body;

      if (paymentId) {
        const result = await query(
          'UPDATE payments SET loan_id = $1, week = $2, amount = $3, date = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
          [loan_id, week, amount, date, parseInt(paymentId)]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }

        res.status(200).json(result.rows[0]);
      } else {
        res.status(400).json({ error: 'Payment ID required' });
      }

    } else if (req.method === 'DELETE') {
      const paymentId = req.url.split('/').pop();

      if (paymentId) {
        const result = await query('DELETE FROM payments WHERE id = $1 RETURNING *', [parseInt(paymentId)]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }

        res.status(200).json({ message: 'Payment deleted successfully' });
      } else {
        // Delete all payments if no specific ID
        await query('DELETE FROM payments');
        res.status(200).json({ message: 'All payments deleted successfully' });
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