-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_by UUID NOT NULL REFERENCES auth.users(id),
    group_type TEXT NOT NULL,
    batch_id UUID REFERENCES public.batch(id),
    recipient_ids UUID[] DEFAULT NULL,
    
    -- Add indexes for common query patterns
    CONSTRAINT valid_group_type CHECK (group_type IN ('ALL', 'ALL_STAFF', 'ALL_TRAINERS', 'ALL_TRAINEES', 'BATCH', 'CUSTOM'))
);

-- Add appropriate indexes
CREATE INDEX IF NOT EXISTS notifications_sent_by_idx ON public.notifications(sent_by);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS notifications_batch_id_idx ON public.notifications(batch_id);

-- Add row level security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow staff to read all notifications
CREATE POLICY "Staff can read all notifications" 
ON public.notifications
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profile
        WHERE profile.id = auth.uid() AND profile.role = 'STAFF'
    )
);

-- Create policy to allow staff to create notifications
CREATE POLICY "Staff can create notifications" 
ON public.notifications
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profile
        WHERE profile.id = auth.uid() AND profile.role = 'STAFF'
    )
);

-- Create policy for trainers to see notifications sent to them
CREATE POLICY "Trainers see notifications for trainers" 
ON public.notifications
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profile
        WHERE profile.id = auth.uid() AND profile.role = 'TRAINER'
    ) AND (
        group_type = 'ALL' OR 
        group_type = 'ALL_TRAINERS' OR
        (group_type = 'CUSTOM' AND auth.uid()::text = ANY(recipient_ids::text[]))
    )
);

-- Create policy for trainees to see notifications sent to them
CREATE POLICY "Trainees see notifications for their batch or directly to them" 
ON public.notifications
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profile
        WHERE profile.id = auth.uid() AND profile.role = 'TRAINEE'
    ) AND (
        group_type = 'ALL' OR 
        group_type = 'ALL_TRAINEES' OR
        (group_type = 'BATCH' AND batch_id = (SELECT batch_id FROM public.profile WHERE id = auth.uid())) OR
        (group_type = 'CUSTOM' AND auth.uid()::text = ANY(recipient_ids::text[]))
    )
);

-- Grant permissions
GRANT SELECT, INSERT ON public.notifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO authenticated;

-- Add comment to the table
COMMENT ON TABLE public.notifications IS 'Table for storing staff notifications sent to users';