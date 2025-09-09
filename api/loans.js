// Input validation helper
function validateLoanData(data) {
  const required = ['borrower_id', 'borrower', 'amount', 'interest', 'weeks', 'start_date'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (typeof data.amount !== 'number' || data.amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  if (typeof data.interest !== 'number' || data.interest < 0) {
    throw new Error('Interest must be a non-negative number');
  }

  if (!Number.isInteger(data.weeks) || data.weeks <= 0) {
    throw new Error('Weeks must be a positive integer');
  }

  if (!data.start_date || !/^\d{4}-\d{2}-\d{2}$/.test(data.start_date)) {
    throw new Error('Start date must be in YYYY-MM-DD format');
  }
}

const { createClient } = require('@supabase/supabase-js')

// Database credentials from environment variables with validation
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_ANON_KEY');
}

export default async function handler(req, res) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('id', { ascending: false }) // Most recent first

      if (error) {
        console.error('Supabase select error:', error);
        throw new Error(`Failed to fetch loans: ${error.message}`);
      }

      res.status(200).json(data || [])

    } else if (req.method === 'POST') {
      // Validate input data
      validateLoanData(req.body);

      const { data, error } = await supabase
        .from('loans')
        .insert([req.body])
        .select()

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Failed to create loan: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to create loan: No data returned');
      }

      res.status(201).json(data[0])

    } else if (req.method === 'PUT') {
      const loanId = req.query.id || req.url.split('/').pop()

      if (!loanId || isNaN(parseInt(loanId))) {
        return res.status(400).json({ error: 'Valid loan ID required' })
      }

      // Validate input data for updates (partial validation)
      if (req.body.amount !== undefined && (typeof req.body.amount !== 'number' || req.body.amount <= 0)) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      if (req.body.interest !== undefined && (typeof req.body.interest !== 'number' || req.body.interest < 0)) {
        return res.status(400).json({ error: 'Interest must be a non-negative number' });
      }
      if (req.body.weeks !== undefined && (!Number.isInteger(req.body.weeks) || req.body.weeks <= 0)) {
        return res.status(400).json({ error: 'Weeks must be a positive integer' });
      }

      const { data, error } = await supabase
        .from('loans')
        .update(req.body)
        .eq('id', parseInt(loanId))
        .select()

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Failed to update loan: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Loan not found' });
      }

      res.status(200).json(data[0])

    } else if (req.method === 'DELETE') {
      const loanId = req.query.id || req.url.split('/').pop()

      if (loanId) {
        if (isNaN(parseInt(loanId))) {
          return res.status(400).json({ error: 'Valid loan ID required' })
        }

        // Check if loan exists first
        const { data: existingLoan, error: checkError } = await supabase
          .from('loans')
          .select('id')
          .eq('id', parseInt(loanId))
          .single()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
          throw checkError
        }

        if (!existingLoan) {
          return res.status(404).json({ error: 'Loan not found' })
        }

        // Delete related payments first
        const { error: paymentError } = await supabase
          .from('payments')
          .delete()
          .eq('loan_id', parseInt(loanId))

        if (paymentError) {
          console.error('Payment deletion error:', paymentError);
          throw new Error(`Failed to delete payments: ${paymentError.message}`);
        }

        // Then delete the loan
        const { error: loanError } = await supabase
          .from('loans')
          .delete()
          .eq('id', parseInt(loanId))

        if (loanError) {
          console.error('Loan deletion error:', loanError);
          throw new Error(`Failed to delete loan: ${loanError.message}`);
        }

        res.status(200).json({ message: 'Loan and related payments deleted successfully' })
      } else {
        // Prevent accidental mass deletion - require explicit confirmation
        return res.status(400).json({
          error: 'Mass deletion not allowed. Please specify a loan ID.',
          hint: 'To delete all data, use a specific admin endpoint or contact system administrator.'
        })
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  }
}