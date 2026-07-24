import { supabaseAdmin } from './src/utils/supabaseClient.js';

async function testQuery() {
  const { data, error } = await supabaseAdmin
    .from('deliveries')
    .select(`
      tracking_number,
      route_id,
      routes (
        driver_id,
        driver:driver_id (
          first_name,
          last_name
        )
      )
    `)
    .eq('tracking_number', 'TRK-24225')
    .single();
    
  console.log('Result:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

testQuery();
