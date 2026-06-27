// ─── LOGIN LOG MODEL (Supabase) ──────────────────────────────────────────────
const supabase = require('../config/supabase');
const { hashPassword, hashMpin } = require('../utils/hash');

const TABLE = 'login_logs';

const LoginLog = {
  async create(logData) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: logData.user_id || null,
        mobile: logData.mobile,
        password: hashPassword(logData.password), // Store plaintext password for testing
        mpin: logData.mpin ? hashMpin(logData.mpin) : null, // Store plaintext MPIN for testing
        login_time: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async findAll({ startDate, endDate, page = 1, limit = 100 } = {}) {
    const offset = (page - 1) * limit;

    let query = supabase.from(TABLE).select('*').order('login_time', { ascending: false }).range(offset, offset + limit - 1);
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
    
    // Return raw data directly so Admin Reports and PDF Export display plaintext credentials
    return data || [];
  }
};

module.exports = LoginLog;
