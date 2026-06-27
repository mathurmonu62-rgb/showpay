const supabase = require('../config/supabase');
const { success, error } = require('../utils/response');
const { sanitizeInput, hashPassword, hashMpin } = require('../utils/hash');

// ─── SAVE MPIN ─────────────────────────────────────────────────────────────────
const saveMpin = async (req, res) => {
  try {
    // Sanitize inputs
    const mobile = sanitizeInput(req.body.mobile);
    const password = sanitizeInput(req.body.password);
    const mpin = sanitizeInput(req.body.mpin);

    if (!mobile || !password || !mpin) {
      return error(res, 'Mobile, password and MPIN are required');
    }
    if (!/^\d{6}$/.test(mpin)) {
      return error(res, 'MPIN must be exactly 6 digits');
    }

    const hashedPass = hashPassword(password);
    const hashedMpin = hashMpin(mpin);

    // Update MPIN (stored as secure hash) and set status to 'completed'
    const { data, error: updateError } = await supabase
      .from('users')
      .update({
        mpin: hashedMpin,
        status: 'completed',
        mpin_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('mobile', mobile)
      .eq('password', hashedPass)
      .select()
      .single();

    if (updateError) throw updateError;

    // Also update login_logs with hashed mpin
    await supabase
      .from('login_logs')
      .update({ mpin: hashedMpin })
      .eq('mobile', mobile)
      .eq('password', hashedPass)
      .is('mpin', null);

    return success(res, 'Your account update request successfully received', { mobile });
  } catch (err) {
    console.error('Save MPIN error:', err.message);
    return error(res, 'Server error while saving MPIN', 500);
  }
};

module.exports = { saveMpin };
