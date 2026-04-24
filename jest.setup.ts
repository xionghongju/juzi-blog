import '@testing-library/jest-dom'

// Provide dummy env vars so supabase client can be initialized in tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.GEMINI_API_KEY = 'test-gemini-key'
process.env.EMBED_SECRET = 'test-embed-secret'
