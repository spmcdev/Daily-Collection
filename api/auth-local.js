const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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
    if (req.method === 'POST') {
      const { action } = req.body;

      if (action === 'login') {
        const { username, password } = req.body;

        // Find user
        const result = await query('SELECT * FROM users WHERE username = $1 AND is_active = true', [username]);
        
        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.user = {
          id: user.id,
          username: user.username,
          role: user.role,
          borrower_name: user.borrower_name
        };

        res.json({ 
          success: true, 
          user: {
            username: user.username,
            role: user.role,
            borrower_name: user.borrower_name
          }
        });

      } else if (action === 'logout') {
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({ error: 'Could not log out' });
          }
          res.json({ success: true });
        });

      } else if (action === 'check') {
        if (req.session.user) {
          res.json({ 
            authenticated: true, 
            user: req.session.user 
          });
        } else {
          res.json({ authenticated: false });
        }

      } else {
        res.status(400).json({ error: 'Invalid action' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Auth API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { handler };