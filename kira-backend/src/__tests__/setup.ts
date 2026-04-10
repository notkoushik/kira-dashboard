// Test setup file
import 'dotenv/config';

// Mock environment for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-jwt-key-minimum-32-characters-required';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.API_PORT = '3001';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Global test utilities
global.testUtils = {
  testUserId: 'test-user-123',
  testUserEmail: 'test@example.com',
  testToken: 'test-jwt-token',
};

declare global {
  var testUtils: {
    testUserId: string;
    testUserEmail: string;
    testToken: string;
  };
}
