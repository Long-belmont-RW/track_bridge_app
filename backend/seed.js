import { supabaseAdmin } from './src/utils/supabaseClient.js';

async function seed() {
  console.log('Seeding mock route and deliveries...');

  // Find user by email
  const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  const user = users.find(u => u.email === 'driver_1784852426108@logistics.com');
  if (!user) {
    console.error('Driver with that email not found.');
    return;
  }
  
  // Find driver record
  const { data: drivers } = await supabaseAdmin.from('drivers').select('*').eq('id', user.id).limit(1);
  let driver = drivers?.[0];
  if (!driver) {
    console.error('Driver record not found in drivers table for user id:', user.id);
    return;
  }
  
  if (!driver.company_id) {
    console.log('Driver has no company_id, finding a company...');
    const companyUser = users.find(u => u.user_metadata?.role === 'company' || u.user_metadata?.role === 'admin');
    if (companyUser) {
      driver.company_id = companyUser.id;
      await supabaseAdmin.from('drivers').update({ company_id: companyUser.id }).eq('id', driver.id);
    }
  }

  // 2. Create a route for this driver
  const { data: route, error: routeError } = await supabaseAdmin
    .from('routes')
    .insert([
      {
        driver_id: driver.id,
        company_id: driver.company_id
      }
    ])
    .select()
    .single();

  if (routeError) {
    console.error('Error creating route:', routeError);
    return;
  }
  console.log('Created route:', route.id);

  // 3. Create mock deliveries assigned to this route
  const mockDeliveries = [
    {
      tracking_number: `TRK-${Math.floor(Math.random() * 100000)}`,
      recipient_name: 'John Doe',
      recipient_address: '123 Fake Street, London',
      recipient_lat: 51.5074,
      recipient_lng: -0.1278,
      recipient_phone: '+44 1234 567890',
      company_id: driver.company_id,
      driver_id: driver.id,
      route_id: route.id,
      status: 'assigned'
    },
    {
      tracking_number: `TRK-${Math.floor(Math.random() * 100000)}`,
      recipient_name: 'Jane Smith',
      recipient_address: '456 Mock Avenue, Manchester',
      recipient_lat: 53.4808,
      recipient_lng: -2.2426,
      recipient_phone: '+44 9876 543210',
      company_id: driver.company_id,
      driver_id: driver.id,
      route_id: route.id,
      status: 'assigned'
    }
  ];

  const { data: deliveries, error: deliveryError } = await supabaseAdmin
    .from('deliveries')
    .insert(mockDeliveries)
    .select();

  if (deliveryError) {
    console.error('Error creating deliveries:', deliveryError);
    return;
  }

  console.log(`Successfully seeded ${deliveries.length} deliveries for driver ${driver.first_name}`);
}

seed();
