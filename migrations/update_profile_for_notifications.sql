-- Update profile table to support notification features

-- First, check if role column exists and add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profile' 
        AND column_name = 'role'
    ) THEN
        -- Add role column with enum check constraint
        ALTER TABLE public.profile ADD COLUMN role TEXT NOT NULL DEFAULT 'TRAINEE';
        
        -- Add constraint to ensure valid roles
        ALTER TABLE public.profile 
        ADD CONSTRAINT valid_role 
        CHECK (role IN ('STAFF', 'TRAINER', 'TRAINEE'));
        
        -- Add index on role for faster queries
        CREATE INDEX profile_role_idx ON public.profile(role);
    END IF;
END
$$;

-- Ensure batch_id column exists for filtering trainees by batch
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profile' 
        AND column_name = 'batch_id'
    ) THEN
        -- Add batch_id column with foreign key to batch table
        ALTER TABLE public.profile ADD COLUMN batch_id UUID REFERENCES public.batch(id);
        
        -- Add index on batch_id for faster queries
        CREATE INDEX profile_batch_id_idx ON public.profile(batch_id);
    END IF;
END
$$;

-- Add comments to explain columns
COMMENT ON COLUMN public.profile.role IS 'User role: STAFF, TRAINER, or TRAINEE';
COMMENT ON COLUMN public.profile.batch_id IS 'Reference to batch for trainees';

-- Update existing records if needed (example query)
-- Set administrators and staff with certain emails as STAFF
UPDATE public.profile
SET role = 'STAFF'
WHERE 
    email LIKE '%@admin.com' OR
    email LIKE '%@staff.com' OR
    email IN ('admin@example.com', 'staff@example.com');

-- Set trainers with certain emails as TRAINER
UPDATE public.profile
SET role = 'TRAINER'
WHERE 
    email LIKE '%@trainer.com' OR
    email IN ('trainer1@example.com', 'trainer2@example.com');