-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret-here';

-- Create users table
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    website_url TEXT NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create seo_reports table
CREATE TABLE public.seo_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    website_url TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    issues_count INTEGER DEFAULT 0,
    critical_issues INTEGER DEFAULT 0,
    report_data JSONB NOT NULL,
    metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX idx_seo_reports_user_id ON public.seo_reports(user_id);
CREATE INDEX idx_seo_reports_created_at ON public.seo_reports(created_at);
CREATE INDEX idx_seo_reports_user_created ON public.seo_reports(user_id, created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for seo_reports table
CREATE POLICY "Users can view own reports" ON public.seo_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = seo_reports.user_id 
            AND auth.uid()::text = users.id::text
        )
    );

CREATE POLICY "Users can insert own reports" ON public.seo_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = seo_reports.user_id 
            AND auth.uid()::text = users.id::text
        )
    );

-- Service role can do everything (for API operations)
CREATE POLICY "Service role full access users" ON public.users
    FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role full access reports" ON public.seo_reports
    FOR ALL USING (current_setting('role') = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.seo_reports TO authenticated;

-- Grant permissions to service role (for API operations)
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.seo_reports TO service_role;

-- Sample data for testing (optional)
-- INSERT INTO public.users (email, website_url, subscription_status) 
-- VALUES ('test@example.com', 'https://example.com', 'trialing');

-- View to get user report summaries
CREATE VIEW user_report_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.website_url,
    u.subscription_status,
    COUNT(r.id) as total_reports,
    AVG(r.score) as average_score,
    SUM(r.critical_issues) as total_critical_issues,
    MAX(r.created_at) as last_report_date
FROM public.users u
LEFT JOIN public.seo_reports r ON u.id = r.user_id
GROUP BY u.id, u.email, u.website_url, u.subscription_status;