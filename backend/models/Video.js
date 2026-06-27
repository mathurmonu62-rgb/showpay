// ─── VIDEO MODEL (Supabase) ──────────────────────────────────────────────────
const supabase = require('../config/supabase');

const TABLE = 'videos';

const Video = {
  async count() {
    const { count, error } = await supabase.from(TABLE).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }
};

module.exports = Video;
