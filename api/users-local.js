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

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

async function handler(req, res) {
  try {
    // Check admin access for all operations
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get all users
      const result = await query('SELECT id, username, role, borrower_name, is_active, created_at FROM users ORDER BY created_at DESC');
      res.json(result.rows);

    } else if (req.method === 'POST') {
      const { action } = req.body;

      if (action === 'create_user') {
        const { username, password, role, borrower_name } = req.body;

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user
        const result = await query(
          'INSERT INTO users (username, password_hash, role, borrower_name) VALUES ($1, $2, $3, $4) RETURNING id, username, role, borrower_name, is_active, created_at',
          [username, password_hash, role, borrower_name]
        );

        res.json({ success: true, user: result.rows[0] });

      } else if (action === 'reset_password') {
        const { user_id, new_password } = req.body;

        // Hash new password
        const password_hash = await bcrypt.hash(new_password, 10);

        // Update password
        const result = await query(
          'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username',
          [password_hash, user_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'Password reset successfully' });

      } else if (action === 'toggle_status') {
        const { user_id } = req.body;

        // Toggle user active status
        const result = await query(
          'UPDATE users SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, username, is_active',
          [user_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });

      } else if (action === 'update_role') {
        const { user_id, role } = req.body;

        // Update user role
        const result = await query(
          'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, role',
          [role, user_id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });

      } else {
        res.status(400).json({ error: 'Invalid action' });
      }

    } else if (req.method === 'DELETE') {
      const userId = req.url.split('/').pop();

      if (userId) {
        // Prevent deleting the last admin
        const adminCount = await query('SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true', ['admin']);
        if (parseInt(adminCount.rows[0].count) <= 1) {
          const userToDelete = await query('SELECT role FROM users WHERE id = $1', [userId]);
          if (userToDelete.rows.length > 0 && userToDelete.rows[0].role === 'admin') {
            return res.status(400).json({ error: 'Cannot delete the last admin user' });
          }
        }

        const result = await query('DELETE FROM users WHERE id = $1 RETURNING username', [userId]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'User deleted successfully' });
      } else {
        res.status(400).json({ error: 'User ID required' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Users API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { handler };