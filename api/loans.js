const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = "https://extzvxpizdxqzlvebioo.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dHp2eHBpemR4cXpsdmViaW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzk4MzUsImV4cCI6MjA3MjY1NTgzNX0.TXUQOCEtQH6su0Ojonu_9sAOJAo-67_zZk90f_BZlU8"

export default async function handler(req, res) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('loans')
        .select('*')

      if (error) throw error

      res.status(200).json(data)

    } else if (req.method === 'POST') {
      const { data, error } = await supabase
        .from('loans')
        .insert([req.body])
        .select()

      if (error) throw error

      res.status(200).json(data[0])

    } else if (req.method === 'PUT') {
      const loanId = req.query.id || req.url.split('/').pop()

      if (loanId) {
        const { data, error } = await supabase
          .from('loans')
          .update(req.body)
          .eq('id', parseInt(loanId))
          .select()

        if (error) throw error

        res.status(200).json(data[0])
      } else {
        res.status(400).json({ error: 'Loan ID required' })
      }

    } else if (req.method === 'DELETE') {
      const loanId = req.query.id || req.url.split('/').pop()

      if (loanId) {
        // Delete related payments first
        await supabase
          .from('payments')
          .delete()
          .eq('loan_id', parseInt(loanId))

        // Then delete the loan
        const { error } = await supabase
          .from('loans')
          .delete()
          .eq('id', parseInt(loanId))

        if (error) throw error

        res.status(200).json({ message: 'Loan and all payments deleted successfully' })
      } else {
        res.status(400).json({ error: 'Loan ID required' })
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  }
}