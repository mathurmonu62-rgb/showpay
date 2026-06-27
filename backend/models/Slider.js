// ─── SLIDER MODEL (Supabase) ─────────────────────────────────────────────────
const supabase = require('../config/supabase');

const TABLE = 'sliders';

const Slider = {
  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
};

module.exports = Slider;
