const supabase = require('../config/supabase');
const { success, error } = require('../utils/response');
const path = require('path');
const fs = require('fs');

// ─── GET ALL SLIDERS ───────────────────────────────────────────────────────────
const getSliders = async (req, res) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('sliders')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;
    return success(res, 'Sliders fetched', data);
  } catch (err) {
    console.error('Get sliders error:', err);
    return error(res, 'Server error', 500);
  }
};

// ─── UPLOAD SLIDER ─────────────────────────────────────────────────────────────
const uploadSlider = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'No image file provided');
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/slider/${req.file.filename}`;

    const { data, error: insertError } = await supabase
      .from('sliders')
      .insert({ image_url: imageUrl, filename: req.file.filename })
      .select()
      .single();

    if (insertError) throw insertError;
    return success(res, 'Slider uploaded successfully', data, 201);
  } catch (err) {
    console.error('Upload slider error:', err);
    return error(res, 'Server error while uploading slider', 500);
  }
};

// ─── DELETE SLIDER ─────────────────────────────────────────────────────────────
const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: slider, error: fetchError } = await supabase
      .from('sliders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !slider) return error(res, 'Slider not found', 404);

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads/slider', slider.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const { error: deleteError } = await supabase.from('sliders').delete().eq('id', id);
    if (deleteError) throw deleteError;

    return success(res, 'Slider deleted successfully');
  } catch (err) {
    console.error('Delete slider error:', err);
    return error(res, 'Server error', 500);
  }
};

module.exports = { getSliders, uploadSlider, deleteSlider };
