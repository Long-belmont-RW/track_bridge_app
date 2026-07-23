import { supabase } from '../utils/supabaseClient.js';
import fs from 'fs';
import csv from 'csv-parser';
import { geocodeAddress } from '../utils/geocoder.js';

export const createDelivery = async (req, res) => {
  try {
    let {
      tracking_number,
      recipient_name,
      recipient_address,
      recipient_lat,
      recipient_lng,
      recipient_phone,
      company_id
    } = req.body;

    if (!recipient_lat || !recipient_lng) {
      const coords = await geocodeAddress(recipient_address);
      if (coords) {
        recipient_lat = coords.lat;
        recipient_lng = coords.lng;
      }
    }

    const { data, error } = await supabase
      .from('deliveries')
      .insert([
        {
          tracking_number,
          recipient_name,
          recipient_address,
          recipient_lat,
          recipient_lng,
          recipient_phone,
          company_id,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('Error creating delivery:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ data: data[0] });
  } catch (err) {
    console.error('Server error creating delivery:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDriverDeliveries = async (req, res) => {
  try {
    const driver_id = req.user.id;

    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('driver_id', driver_id)
      .in('status', ['assigned', 'in_transit']);

    if (error) {
      console.error('Error fetching driver deliveries:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err) {
    console.error('Server error fetching driver deliveries:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Proof of delivery photo is required.' });
    }

    // Prepare file for upload
    const fileExt = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('proof_of_delivery')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error('Error uploading proof of delivery:', uploadError);
      return res.status(400).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('proof_of_delivery')
      .getPublicUrl(filePath);

    const photoUrl = publicUrlData.publicUrl;

    // Update database row
    const { data: updateData, error: updateError } = await supabase
      .from('deliveries')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        proof_of_delivery_photo_url: photoUrl
      })
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Error updating delivery status:', updateError);
      return res.status(400).json({ error: updateError.message });
    }

    return res.status(200).json({ data: updateData[0] });
  } catch (err) {
    console.error('Server error completing delivery:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const bulkUploadDeliveries = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No CSV file uploaded.' });
  }

  const filePath = req.file.path;
  const results = [];
  const errors = [];
  const company_id = req.user.company_id || req.user.user_metadata?.company_id || req.user.id;
  
  let totalProcessed = 0;
  let successfulInserts = 0;

  try {
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const data of stream) {
      totalProcessed++;
      
      // Validation
      if (!data.tracking_number || !data.recipient_name || !data.recipient_address) {
        errors.push({
          row: totalProcessed,
          reason: 'Missing required fields'
        });
        continue;
      }

      let lat = data.recipient_lat ? parseFloat(data.recipient_lat) : null;
      let lng = data.recipient_lng ? parseFloat(data.recipient_lng) : null;

      if (!lat || !lng) {
        const coords = await geocodeAddress(data.recipient_address);
        await delay(550);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      results.push({
        tracking_number: data.tracking_number,
        recipient_name: data.recipient_name,
        recipient_address: data.recipient_address,
        recipient_lat: lat,
        recipient_lng: lng,
        recipient_phone: data.recipient_phone || null,
        company_id: company_id,
        status: 'pending'
      });

      if (results.length >= 500) {
        const chunkToInsert = [...results];
        results.length = 0;

        let authClient = supabase;
        if (req.headers.authorization) {
          const { createClient } = await import('@supabase/supabase-js');
          authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
            global: {
              headers: {
                Authorization: req.headers.authorization
              }
            }
          });
        }

        const { error } = await authClient.from('deliveries').insert(chunkToInsert);
        if (error) {
          console.error('Error inserting chunk:', error);
          errors.push({
            row: `${totalProcessed - chunkToInsert.length + 1}-${totalProcessed}`,
            reason: error.message || 'Error inserting batch'
          });
        } else {
          successfulInserts += chunkToInsert.length;
        }
      }
    }

    // Process remaining results
    if (results.length > 0) {
      let authClient = supabase;
      if (req.headers.authorization) {
        const { createClient } = await import('@supabase/supabase-js');
        authClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
          global: {
            headers: {
              Authorization: req.headers.authorization
            }
          }
        });
      }
      const { error } = await authClient.from('deliveries').insert(results);
      if (error) {
        console.error('Error inserting final chunk:', error);
        errors.push({
          row: `${totalProcessed - results.length + 1}-${totalProcessed}`,
          reason: error.message || 'Error inserting final batch'
        });
      } else {
        successfulInserts += results.length;
      }
    }

    // Clean up file
    try {
      fs.unlinkSync(filePath);
    } catch (cleanupErr) {
      console.error('Error cleaning up file:', cleanupErr);
    }

    // Send response
    return res.status(200).json({
      success: true,
      total_processed: totalProcessed,
      successful_inserts: successfulInserts,
      failed_inserts: totalProcessed - successfulInserts,
      errors: errors
    });

  } catch (err) {
    console.error('Server error processing CSV:', err);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error('Cleanup error:', e);
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
