import fs from 'fs';
import path from 'path';

const LOGIN_URL = 'http://localhost:5000/api/auth/login';
const TEST_EMAIL = 'testcompany@logistics.com';
const TEST_PASSWORD = 'securepassword123';
const BULK_UPLOAD_URL = 'http://localhost:5000/api/deliveries/bulk-upload';
const GENERATE_ROUTES_URL = 'http://localhost:5000/api/routes/generate';
const CSV_FILENAME = 'test_deliveries.csv';

// Helper to generate random offset
function getRandomOffset(maxDistanceKm) {
  const deg = maxDistanceKm / 111;
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * deg;
  return {
    latOffset: Math.cos(angle) * radius,
    lngOffset: Math.sin(angle) * radius
  };
}

const generateMockData = () => {
  const records = [];
  const centerLat = 9.0765;
  const centerLng = 7.3986;

  // 45 clustered within ~1.5km
  for (let i = 1; i <= 45; i++) {
    const offset = getRandomOffset(1.5);
    const lat = (centerLat + offset.latOffset).toFixed(6);
    const lng = (centerLng + offset.lngOffset).toFixed(6);
    
    records.push({
      tracking_number: `TRK-CLUSTER-${i}`,
      recipient_name: `Cluster Recipient ${i}`,
      recipient_address: `${i} Cluster St, Abuja`,
      recipient_lat: lat,
      recipient_lng: lng,
      recipient_phone: `555-010${i.toString().padStart(2, '0')}`
    });
  }

  // 5 outliers further away (e.g. 50+ km)
  for (let i = 1; i <= 5; i++) {
    const offset = getRandomOffset(100); 
    const lat = (centerLat + 1 + offset.latOffset).toFixed(6);
    const lng = (centerLng + 1 + offset.lngOffset).toFixed(6);
    
    records.push({
      tracking_number: `TRK-OUTLIER-${i}`,
      recipient_name: `Outlier Recipient ${i}`,
      recipient_address: `${i} Outlier Ave`,
      recipient_lat: lat,
      recipient_lng: lng,
      recipient_phone: `555-020${i.toString().padStart(2, '0')}`
    });
  }

  return records;
};

const writeCSV = (records, filename) => {
  const header = ['tracking_number', 'recipient_name', 'recipient_address', 'recipient_lat', 'recipient_lng', 'recipient_phone'];
  const rows = records.map(record => 
    header.map(fieldName => `"${record[fieldName]}"`).join(',')
  );
  
  const csvContent = [header.join(','), ...rows].join('\n');
  fs.writeFileSync(filename, csvContent, 'utf-8');
};

const runTest = async () => {
  try {
    console.log(`Step 1: Authenticating via ${LOGIN_URL}...`);
    const loginRes = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });

    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Authentication failed (${loginRes.status}): ${errText}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Authentication successful. Token retrieved.\n');

    console.log('Step 2: Generating mock data...');
    const records = generateMockData();

    const csvFilename = path.join(process.cwd(), CSV_FILENAME);
    console.log(`Step 3: Writing data to ${csvFilename}...\n`);
    writeCSV(records, csvFilename);

    console.log(`Step 4: Uploading CSV to ${BULK_UPLOAD_URL}...`);
    
    // Construct FormData with native Blob for fetch
    const fileBuffer = fs.readFileSync(csvFilename);
    const blob = new Blob([fileBuffer], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', blob, CSV_FILENAME);

    const uploadResponse = await fetch(BULK_UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed (${uploadResponse.status}): ${errorText}`);
    }
    
    const uploadData = await uploadResponse.json();
    console.log('Upload successful:', {
      success: uploadData.success,
      total_processed: uploadData.total_processed,
      successful_inserts: uploadData.successful_inserts,
      failed_inserts: uploadData.failed_inserts
    }, '\n');

    if (uploadData.errors && uploadData.errors.length > 0) {
      console.log('Upload Errors Details (First 5):', uploadData.errors.slice(0, 5), '\n');
    }

    console.log(`Step 5: Generating routes via ${GENERATE_ROUTES_URL}...`);
    const routeResponse = await fetch(GENERATE_ROUTES_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!routeResponse.ok) {
      const errorText = await routeResponse.text();
      throw new Error(`Route generation failed (${routeResponse.status}): ${errorText}`);
    }

    const routeData = await routeResponse.json();
    
    console.log('\n--- Route Generation Summary ---');
    if (routeData.data) {
        let totalRoutes = 0;
        let outlierCount = 0;
        
        const routes = Array.isArray(routeData.data) ? routeData.data : (routeData.data.routes || routeData.data.clusters || []);
        const outliers = Array.isArray(routeData.data.outliers) ? routeData.data.outliers : (routeData.outliers || []);

        // Some implementations return routes and outliers together in one array, others separate them.
        if (Array.isArray(routeData.data)) {
            routeData.data.forEach((route) => {
               if (route.is_outlier) {
                   outlierCount += (route.deliveries ? route.deliveries.length : 1);
               } else {
                   totalRoutes++;
                   console.log(`  Route ${totalRoutes}: ${route.deliveries ? route.deliveries.length : 0} deliveries`);
               }
            });
        } else {
            routes.forEach((route) => {
                totalRoutes++;
                console.log(`  Route ${totalRoutes}: ${route.deliveries ? route.deliveries.length : 0} deliveries`);
            });
            outlierCount = outliers.length;
        }
        
        console.log(`\nTotal Routes Generated (is_outlier: false): ${totalRoutes}`);
        console.log(`Outlier count (is_outlier: true): ${outlierCount}`);
    } else {
        console.log('Unexpected route data format:', JSON.stringify(routeData, null, 2));
    }
    console.log('--------------------------------\n');

    console.log('Step 6: Cleaning up...');
    if (fs.existsSync(csvFilename)) {
      fs.unlinkSync(csvFilename);
      console.log(`Deleted ${csvFilename}`);
    }

    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

runTest();
