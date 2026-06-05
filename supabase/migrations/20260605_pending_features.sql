-- Pending feature migrations (idempotent)
-- fulfillment_type on orders, phone_verified_at + registration_otps for SMS OTP signup

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_type TEXT NOT NULL DEFAULT 'delivery';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_fulfillment_type_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_fulfillment_type_check
      CHECK (fulfillment_type IN ('delivery', 'pickup'));
  END IF;
END $$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.registration_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_otps_phone
  ON public.registration_otps (phone);

CREATE INDEX IF NOT EXISTS idx_registration_otps_expires
  ON public.registration_otps (expires_at);

ALTER TABLE public.registration_otps ENABLE ROW LEVEL SECURITY;
