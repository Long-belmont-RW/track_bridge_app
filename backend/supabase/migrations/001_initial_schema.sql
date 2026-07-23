-- Enable the moddatetime extension for automatic timestamp updates
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- 1. Create companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  contact_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 2. Create drivers table, linking to auth.users and companies
CREATE TABLE drivers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(50),
  vehicle_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- 3. Create deliveries table with strict constraints and geo-coordinates
CREATE TABLE deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  tracking_number VARCHAR(100) UNIQUE NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_lat NUMERIC(10, 7),
  recipient_lng NUMERIC(10, 7),
  recipient_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'disputed')),
  delivery_notes TEXT,
  proof_of_delivery_signature_url TEXT,
  proof_of_delivery_photo_url TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- 4. Attach moddatetime triggers to automatically update the 'updated_at' columns
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON companies 
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON drivers 
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON deliveries 
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);