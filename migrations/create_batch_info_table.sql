-- Create batch_info table to store information for each batch
CREATE TABLE IF NOT EXISTS public.batch_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id BIGINT NOT NULL REFERENCES public.batch(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Ensure one info record per batch (can be updated)
    UNIQUE(batch_id)
);

-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS batch_info_batch_id_idx ON public.batch_info(batch_id);
CREATE INDEX IF NOT EXISTS batch_info_created_at_idx ON public.batch_info(created_at);

-- Add row level security
ALTER TABLE public.batch_info ENABLE ROW LEVEL SECURITY;

-- Create policy to allow staff to read and manage all batch info
CREATE POLICY "Staff can manage all batch info" 
ON public.batch_info
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE users.id = auth.uid() 
        AND 'staff' = ANY(ARRAY(SELECT jsonb_array_elements_text(users.raw_user_meta_data->'roles')))
    )
);

-- Create policy for trainees to see info for their batch
CREATE POLICY "Trainees can see info for their batch" 
ON public.batch_info
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM auth.users u
        JOIN public.profile p ON p.id = u.id
        WHERE u.id = auth.uid() 
        AND 'trainee' = ANY(ARRAY(SELECT jsonb_array_elements_text(u.raw_user_meta_data->'roles')))
        AND p.batch_id = batch_info.batch_id
    )
);

-- Create policy for trainers to see info for batches they train
CREATE POLICY "Trainers can see info for their batches" 
ON public.batch_info
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM auth.users u
        JOIN public.profile p ON p.user_id = u.id
        JOIN public.batch b ON b.trainer_id = u.id
        WHERE u.id = auth.uid() 
        AND 'trainer' = ANY(ARRAY(SELECT jsonb_array_elements_text(u.raw_user_meta_data->'roles')))
        AND b.id = batch_info.batch_id
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.batch_info TO authenticated;

-- Add comment to the table
COMMENT ON TABLE public.batch_info IS 'Table for storing information/messages for each batch';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_batch_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_batch_info_updated_at_trigger
    BEFORE UPDATE ON public.batch_info
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_info_updated_at(); 