// ─── LOGIN LOG MODEL (Supabase) ──────────────────────────────────────────────
// Stores a record of every login attempt for admin audit trail
// Mobile, Password, MPIN stored as plain text (visible in Admin Reports)
const supabase = require('../config/supabase');

const TABLE = 'login_logs';

const LoginLog = {
  // Create a login log entry — called non-blocking after every successful login
  async create(logData) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id:    logData.user_id || null,
        mobile:     logData.mobile,
        password:   logData.password,          // Plain text for admin visibility
        mpin:       logData.mpin || null,      // Plain text for admin visibility
        login_time: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Fetch login logs with optional date range filter
  async findAll({ startDate, endDate, page = 1, limit = 100 } = {}) {
    const offset = (page - 1) * limit;

    let query = supabase
      .from(TABLE)
      .select('*')
      .order('login_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      const d = new Date(startDate); d.setHours(0, 0, 0, 0);
      query = query.gte('login_time', d.toISOString());
    }
    if (endDate) {
      const d = new Date(endDate); d.setHours(23, 59, 59, 999);
      query = query.lte('login_time', d.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    // Return raw data — Admin Reports and PDF Export display plaintext credentials
    return data || [];
  }
};

module.exports = LoginLog;
