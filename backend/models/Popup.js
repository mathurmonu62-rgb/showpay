// ─── POPUP MODEL (Supabase) ──────────────────────────────────────────────────
// Handles the 'telegram_popup' single-row table
const supabase = require('../config/supabase');

const TABLE = 'telegram_popup';

const Popup = {
  async get() {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsert(updates) {
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from(TABLE)
      .upsert({ id: 1, ...updates })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

module.exports = Popup;
