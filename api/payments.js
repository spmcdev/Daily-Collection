// Input validation helper for payments
function validatePaymentData(data) {
  const required = ['loan_id', 'week', 'amount'];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Convert string values to numbers if needed
  const loanId = typeof data.loan_id === 'string' ? parseInt(data.loan_id) : data.loan_id;
  const week = typeof data.week === 'string' ? parseInt(data.week) : data.week;
  const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;

  if (!Number.isInteger(loanId) || loanId <= 0) {
    throw new Error('Loan ID must be a positive integer');
  }

  if (!Number.isInteger(week) || week <= 0) {
    throw new Error('Week must be a positive integer');
  }

  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  // Return validated data
  return { loan_id: loanId, week: week, amount: amount };
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
        .from('payments')
        .select('*')

      if (error) throw error

      res.status(200).json(data)

    } else if (req.method === 'POST') {
      // Validate input data and get cleaned data
      const paymentData = validatePaymentData(req.body);

      // Check if payment already exists for this loan_id and week
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('*')
        .eq('loan_id', paymentData.loan_id)
        .eq('week', paymentData.week)

      if (checkError) {
        console.error('Supabase check error:', checkError);
        throw new Error(`Failed to check existing payment: ${checkError.message}`);
      }

      if (existingPayment && existingPayment.length > 0) {
        // Return the existing payment data
        res.status(200).json(existingPayment[0])
      } else {
        // Create new payment
        const { data, error } = await supabase
          .from('payments')
          .insert([paymentData])
          .select()

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Failed to create payment: ${error.message}`);
        }

        if (!data || data.length === 0) {
          throw new Error('Failed to create payment: No data returned');
        }

        res.status(201).json(data[0])
      }

    } else if (req.method === 'DELETE') {
      const paymentId = req.query.id || req.url.split('/').pop()

      if (paymentId) {
        if (isNaN(parseInt(paymentId))) {
          return res.status(400).json({ error: 'Valid payment ID required' })
        }

        // Check if payment exists first
        const { data: existingPayment, error: checkError } = await supabase
          .from('payments')
          .select('id')
          .eq('id', parseInt(paymentId))
          .single()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
          throw checkError
        }

        if (!existingPayment) {
          return res.status(404).json({ error: 'Payment not found' })
        }

        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('id', parseInt(paymentId))

        if (error) {
          console.error('Payment deletion error:', error);
          throw new Error(`Failed to delete payment: ${error.message}`);
        }

        res.status(200).json({ message: 'Payment deleted successfully' })
      } else {
        // Prevent accidental mass deletion
        return res.status(400).json({
          error: 'Mass deletion not allowed. Please specify a payment ID.',
          hint: 'To delete all payments, use a specific admin endpoint or contact system administrator.'
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