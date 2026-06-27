// models/Admin.js — Admin helper (credentials are hardcoded, this is for future use)
const supabase = require('../config/supabase');

const Admin = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};

module.exports = Admin;
