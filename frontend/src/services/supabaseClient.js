import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cutjijvgiaqfmgzbwzlv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1dGppanZnaWFxZm1nemJ3emx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjY4NDgsImV4cCI6MjA2ODk0Mjg0OH0.VJ2Mx7FKsi6lwThTXGnMURCyG1aTvJN4pt1mGb7pgoA';

export const supabase = createClient(supabaseUrl, supabaseKey); 