import { supabase, supabaseAdmin } from '../utils/supabaseClient.js';
import { performDBSCAN } from '../utils/clustering.js';

export const generateRoutes = async (req, res) => {
  try {
    const company_id = req.user.company_id || req.user.user_metadata?.company_id || req.user.id;
    const { data, error } = await supabaseAdmin
      .from('deliveries')
      .select('*')
      .eq('status', 'pending')
      .eq('company_id', company_id);

    if (error) {
      throw error;
    }

    const validData = data.filter(d => d.recipient_lat != null && d.recipient_lng != null);

    const routes = performDBSCAN(validData, 3, 4);

    return res.status(200).json(routes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const assignRoute = async (req, res) => {
  try {
    const route_id = req.params.id;
    const { driver_id } = req.body;
    const company_id = req.user.id;

    if (!driver_id) {
      return res.status(400).json({ error: 'driver_id is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('routes')
      .update({ driver_id })
      .eq('id', route_id)
      .eq('company_id', company_id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Route not found or unauthorized' });
    }

    return res.status(200).json({ message: 'Route assigned successfully', data: data[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
