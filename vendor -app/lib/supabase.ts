import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fcrhcwvpivkadkkbxcom.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjcmhjd3ZwaXZrYWRra2J4Y29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzUzMDQsImV4cCI6MjA4MDQxMTMwNH0.MjBw7_aVc2VlfND7Ec93sNOp352xcC0B8sZZvaH-Jkg';

// Initialize Supabase client
let supabaseClient: SupabaseClient | null = null;

// FORCE MOCK MODE: Always use mock client to remove backend connections
const forceMock = true;

if (!forceMock && supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }
}

// --- MOCK DATA AND LOGIC ---
const MOCK_DATA: Record<string, any[]> = {
  products: [
    { id: 'shirt-1', name: 'Shirt - Wash & Iron', category: 'Shirt', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 25, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'shirt-2', name: 'Shirt - Steam Press', category: 'Shirt', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 15, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'shirt-3', name: 'Shirt - Dry Cleaning', category: 'Shirt', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 60, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'shirt-4', name: 'Shirt - Stain Removal', category: 'Shirt', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 40, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'shirt-5', name: 'Shirt - Wash & Fold', category: 'Shirt', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 20, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'pant-1', name: 'Pant - Wash & Iron', category: 'Pant', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 30, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'pant-2', name: 'Pant - Steam Press', category: 'Pant', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 20, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'pant-3', name: 'Pant - Dry Cleaning', category: 'Pant', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 70, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'pant-4', name: 'Pant - Stain Removal', category: 'Pant', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 45, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'saree-1', name: 'Saree - Wash & Iron', category: 'Saree', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 80, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'saree-2', name: 'Saree - Steam Press', category: 'Saree', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 50, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'saree-3', name: 'Saree - Dry Cleaning', category: 'Saree', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 150, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'saree-4', name: 'Saree - Stain Removal', category: 'Saree', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 100, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
    { id: 'saree-5', name: 'Saree - Polishing', category: 'Saree', weight: '1 Unit', weight_in_kg: 1, price_per_kg: 120, is_available: true, shop_id: null, updated_at: new Date().toISOString() },
  ],
  vendors: [{ id: 'mock-shop-123', name: 'Mock Laundry Shop', shop_type: 'multi' }]
};

const createSafeSupabaseProxy = (): any => {
  return new Proxy({} as any, {
    get(target, prop) {
      if (!supabaseClient || forceMock) {
        if (prop === 'auth') {
          return {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: { id: 'mock-user' }, session: {} }, error: null }),
            signUp: async () => ({ data: { user: { id: 'mock-user' }, session: {} }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
          };
        }

        if (prop === 'from') {
          return (tableName: string) => {
            if (!MOCK_DATA[tableName]) MOCK_DATA[tableName] = [];
            let filters: Array<{ column: string, value: any, type: string }> = [];
            let pendingUpdate: any = null;
            let pendingInsert: any = null;

            const applyFilters = (data: any[]) => {
              let filtered = [...data];
              filters.forEach(f => {
                if (f.type === 'eq') filtered = filtered.filter(item => item[f.column] === f.value);
                else if (f.type === 'is') filtered = filtered.filter(item => f.value === null ? (item[f.column] === null || item[f.column] === undefined) : item[f.column] === f.value);
              });
              return filtered;
            };

            const mockQuery: any = {
              select: () => mockQuery,
              insert: (data: any) => { pendingInsert = data; return mockQuery; },
              update: (data: any) => { pendingUpdate = data; return mockQuery; },
              delete: () => mockQuery,
              eq: (col: string, val: any) => { filters.push({ column: col, value: val, type: 'eq' }); return mockQuery; },
              neq: () => mockQuery,
              gt: () => mockQuery,
              gte: () => mockQuery,
              lt: () => mockQuery,
              lte: () => mockQuery,
              like: () => mockQuery,
              ilike: () => mockQuery,
              is: (col: string, val: any) => { filters.push({ column: col, value: val, type: 'is' }); return mockQuery; },
              not: () => mockQuery,
              in: () => mockQuery,
              order: () => mockQuery,
              limit: () => mockQuery,
              range: () => mockQuery,
              single: async () => {
                const filtered = applyFilters(MOCK_DATA[tableName]);
                return { data: filtered[0] || {}, error: null };
              },
              maybeSingle: async () => {
                const filtered = applyFilters(MOCK_DATA[tableName]);
                return { data: filtered[0] || null, error: null };
              },
              then: async (onfulfilled: any) => {
                let data = MOCK_DATA[tableName];
                if (pendingUpdate) {
                  const filtered = applyFilters(data);
                  filtered.forEach(item => Object.assign(item, pendingUpdate));
                } else if (pendingInsert) {
                  const items = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
                  MOCK_DATA[tableName].push(...items);
                }
                const resultData = applyFilters(MOCK_DATA[tableName]);
                return onfulfilled({ data: resultData, error: null });
              },
            };
            return mockQuery;
          };
        }

        if (prop === 'storage') {
          return {
            from: () => ({
              upload: async () => ({ data: { path: 'mock-path' }, error: null }),
              getPublicUrl: () => ({ data: { publicUrl: 'https://via.placeholder.com/150' } }),
            }),
          };
        }
        return () => Promise.resolve({ data: null, error: null });
      }
      return (supabaseClient as any)[prop];
    },
  });
};

export const supabase = createSafeSupabaseProxy() as SupabaseClient;

