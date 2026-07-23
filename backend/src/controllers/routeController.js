import { supabase } from '../utils/supabaseClient.js';
import { performDBSCAN } from '../utils/clustering.js';

export const generateRoutes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('status', 'pending');

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
