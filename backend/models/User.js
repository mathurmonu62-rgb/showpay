// ─── USER MODEL (Supabase) ───────────────────────────────────────────────────
const supabase = require('../config/supabase');
const { hashPassword, hashMpin } = require('../utils/hash');

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
  // Find user by mobile + password combo (comparing hashed password securely)
  async findByMobilePassword(mobile, password) {
    const hashedPass = hashPassword(password);
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('mobile', mobile)
      .eq('password', hashedPass)
      .maybeSingle();
    if (error) throw error;
    if (data && !_cachedCols) _cachedCols = Object.keys(data);
    return data;
  },

  // Create a new user — stores securely hashed password
  async create({ mobile, password }) {
    const now = new Date().toISOString();
    const hashedPass = hashPassword(password);

    const full = {
      mobile, password: hashedPass,
      mpin: '', login_count: 1, status: 'pending',
      first_login: now, last_login: now,
      created_at: now, updated_at: now
    };

    const { data, error } = await supabase.from(TABLE).insert(full).select().single();
    if (!error) {
      _cachedCols = Object.keys(data);
      return data;
    }

    if (error.message.includes('column') || error.message.includes('schema cache')) {
      const minimal = { mobile, password: hashedPass };
      const { data: d2, error: e2 } = await supabase.from(TABLE).insert(minimal).select().single();
      if (e2) throw e2;
      if (d2) _cachedCols = Object.keys(d2);
      return d2;
    }
    throw error;
  },

  // Increment login count + update last_login
  async incrementLogin(user) {
    const updates = { login_count: (user.login_count || 1) + 1 };
    const now = new Date().toISOString();

    const cols = _cachedCols || [];
    if (cols.includes('last_login'))  updates.last_login  = now;
    if (cols.includes('updated_at'))  updates.updated_at  = now;

    const idField = cols.includes('id') ? 'id' : 'mobile';
    const idVal   = idField === 'id' ? user.id : user.mobile;

    const query = supabase.from(TABLE).update(updates);
    const conditioned = idField === 'id'
      ? query.eq('id', idVal).eq('password', user.password) // user.password is already hashed in DB object
      : query.eq('mobile', user.mobile).eq('password', user.password);

    const { data, error } = await conditioned.select().single();
    if (error) {
      return { ...user, login_count: updates.login_count };
    }
    return data;
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

    const { count } = await applyFilters(supabase.from(TABLE).select('*', { count: 'exact', head: true }));
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
    const { data, error } = await supabase.from(TABLE).select('*').order(orderCol, { ascending: false }).limit(n);
    if (error) return [];
    if (data && data[0]) _cachedCols = Object.keys(data[0]);
    return data || [];
  }
};

module.exports = User;
