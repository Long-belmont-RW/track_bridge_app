import { supabaseAdmin } from '../utils/supabaseClient.js';

export const inviteDriver = async (req, res) => {
  try {
    const company_id = req.user.id;
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ error: 'Email, password, name, and phone are required' });
    }

    const nameParts = name.trim().split(' ');
    const first_name = nameParts[0];
    const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'driver', company_id }
    });

    if (authError) throw authError;

    // We use .update() because the database trigger already initialized the row
    const { data: driverData, error: driverError } = await supabaseAdmin
      .from('drivers')
      .update({
        company_id,
        first_name,
        last_name,
        phone_number: phone
      })
      .eq('id', authData.user.id)
      .select();

    if (driverError) throw driverError;

    return res.status(201).json({ 
      message: 'Driver created successfully', 
      driver: { id: authData.user.id, first_name, last_name, phone_number: phone } 
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getMyRoutes = async (req, res) => {
  try {
    const role = req.user?.user_metadata?.role || req.user?.role;
    if (role !== 'driver') {
      return res.status(403).json({ error: 'Forbidden: Access restricted to drivers.' });
    }

    const driver_id = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('routes')
      .select(`
        *,
        deliveries (*)
      `)
      .eq('driver_id', driver_id);

    if (error) {
      console.error('Error fetching driver routes:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err) {
    console.error('Server error in getMyRoutes:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};