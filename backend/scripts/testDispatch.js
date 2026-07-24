const COMPANY_LOGIN_URL = 'http://localhost:5000/api/auth/login';
const INVITE_DRIVER_URL = 'http://localhost:5000/api/drivers/invite';
const ROUTE_ASSIGN_BASE_URL = 'http://localhost:5000/api/routes';

// Using the successful cluster ID from your previous test output
const TARGET_ROUTE_ID = 'd6b61665-ce2f-4dca-bb3f-80ebe13e1a7a'; 
const COMPANY_EMAIL = 'testcompany@logistics.com'; 
const COMPANY_PASSWORD = 'securepassword123'; 

async function runDispatchTest() {
  try {
    console.log(`Step 1: Logging in as company (${COMPANY_EMAIL})...`);
    const loginRes = await fetch(COMPANY_LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: COMPANY_EMAIL, password: COMPANY_PASSWORD })
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Authentication successful. Token retrieved.\n');

    console.log('Step 2: Provisioning a new driver account...');
    const driverPayload = {
      email: `driver_${Date.now()}@logistics.com`,
      password: 'SecureDriver123!',
      name: 'Test Driver Alpha',
      phone: '555-999-0000'
    };

    const inviteRes = await fetch(INVITE_DRIVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(driverPayload)
    });

    if (!inviteRes.ok) throw new Error(`Driver invite failed: ${await inviteRes.text()}`);
    const inviteData = await inviteRes.json();
    const newDriverId = inviteData.driver.id;
    console.log(`Driver provisioned successfully! Driver ID: ${newDriverId}\n`);

    console.log(`Step 3: Assigning Route (${TARGET_ROUTE_ID}) to Driver (${newDriverId})...`);
    const assignRes = await fetch(`${ROUTE_ASSIGN_BASE_URL}/${TARGET_ROUTE_ID}/assign`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ driver_id: newDriverId })
    });

    if (!assignRes.ok) throw new Error(`Route assignment failed: ${await assignRes.text()}`);
    const assignData = await assignRes.json();
    
    console.log('Route assigned successfully!');
    console.log('Updated Route Record:', assignData);
    console.log('\n✅ Dispatch flow test completed successfully.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runDispatchTest();