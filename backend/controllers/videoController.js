const supabase = require('../config/supabase');
const { success, error } = require('../utils/response');
const path = require('path');
const fs = require('fs');

// ─── GET POPUP VIDEO ───────────────────────────────────────────────────────────
const getVideo = async (req, res) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') return success(res, 'No video found', null);
      throw fetchError;
    }
    return success(res, 'Video fetched', data);
  } catch (err) {
    console.error('Get video error:', err);
    return error(res, 'Server error', 500);
  }
};

// ─── UPLOAD VIDEO ──────────────────────────────────────────────────────────────
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'No video file provided');
    }

    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/video/${req.file.filename}`;

    const { data, error: insertError } = await supabase
      .from('videos')
      .insert({ video_url: videoUrl, filename: req.file.filename })
      .select()
      .single();

    if (insertError) throw insertError;
    return success(res, 'Video uploaded successfully', data, 201);
  } catch (err) {
    console.error('Upload video error:', err);
    return error(res, 'Server error', 500);
  }
};

// ─── DELETE VIDEO ──────────────────────────────────────────────────────────────
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !video) return error(res, 'Video not found', 404);

    const filePath = path.join(__dirname, '../uploads/video', video.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const { error: deleteError } = await supabase.from('videos').delete().eq('id', id);
    if (deleteError) throw deleteError;

    return success(res, 'Video deleted successfully');
  } catch (err) {
    console.error('Delete video error:', err);
    return error(res, 'Server error', 500);
  }
};

module.exports = { getVideo, uploadVideo, deleteVideo };
