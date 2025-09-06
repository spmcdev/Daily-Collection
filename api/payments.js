const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = "https://extzvxpizdxqzlvebioo.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dHp2eHBpemR4cXpsdmViaW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzk4MzUsImV4cCI6MjA3MjY1NTgzNX0.TXUQOCEtQH6su0Ojonu_9sAOJAo-67_zZk90f_BZlU8"

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
      const paymentData = req.body

      // Check if payment already exists for this loan_id and week
      const { data: existingPayment, error: checkError } = await supabase
        .from('payments')
        .select('*')
        .eq('loan_id', paymentData.loan_id)
        .eq('week', paymentData.week)

      if (checkError) throw checkError

      if (existingPayment && existingPayment.length > 0) {
        // Return the existing payment data
        res.status(200).json(existingPayment)
      } else {
        // Create new payment
        const { data, error } = await supabase
          .from('payments')
          .insert([paymentData])
          .select()

        if (error) throw error

        res.status(200).json(data[0] || {})
      }

    } else if (req.method === 'DELETE') {
      const paymentId = req.query.id || req.url.split('/').pop()

      if (paymentId) {
        const { error } = await supabase
          .from('payments')
          .delete()
          .eq('id', parseInt(paymentId))

        if (error) throw error

        res.status(200).json({ message: 'Payment deleted' })
      } else {
        // Delete all payments if no specific ID
        const { error } = await supabase
          .from('payments')
          .delete()
          .neq('id', 0) // Delete all payments

        if (error) throw error

        res.status(200).json({ message: 'All payments deleted successfully' })
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  }
}