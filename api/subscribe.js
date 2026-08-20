const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ success: false, error: 'Server configuration error.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: existing } = await supabase
    .from('waitlist')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({ success: true, message: 'Already on the list!' });
  }

  const { error } = await supabase
    .from('waitlist')
    .insert([{ email, signed_up_at: new Date().toISOString() }]);

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ success: false, error: 'Failed to save. Please try again.' });
  }

  return res.status(200).json({ success: true, message: 'Successfully joined the waitlist!' });
};
