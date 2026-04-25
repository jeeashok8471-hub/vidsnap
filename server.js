const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'VidSnap chal rahi hai!' });
});

// Get video info
app.post('/api/info', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL daal bhai!' });
  }

  const isYT = url.includes('youtube.com') || url.includes('youtu.be');
  const isIG = url.includes('instagram.com');

  if (!isYT && !isIG) {
    return res.status(400).json({ error: 'Sirf YouTube ya Instagram links allowed hain!' });
  }

  // FIXED: python3 -m yt_dlp instead of yt-dlp
  const cmd = `python3 -m yt_dlp --dump-json --no-playlist "${url}"`;

  exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', stderr);
      return res.status(500).json({ error: 'Video info nahi mili. Link check karo!' });
    }

    try {
      const info = JSON.parse(stdout);

      const formats = (info.formats || [])
        .filter(f => f.ext !== 'mhtml' && (f.vcodec !== 'none' || f.acodec !== 'none'))
        .map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          quality: f.format_note || (f.height ? `${f.height}p` : 'audio'),
          filesize: f.filesize ? Math.round(f.filesize / 1024 / 1024) + ' MB' : '~',
          hasVideo: f.vcodec !== 'none',
          hasAudio: f.acodec !== 'none',
          height: f.height || 0,
        }))
        .filter((f, i, arr) => arr.findIndex(x => x.quality === f.quality) === i)
        .sort((a, b) => b.height - a.height)
        .slice(0, 8);

      res.json({
        title: info.title,
        thumbnail: info.thumbnail,
        duration: formatDuration(info.duration),
        uploader: info.uploader || info.channel,
        view_count: formatViews(info.view_count),
        platform: isYT ? 'youtube' : 'instagram',
        formats,
      });
    } catch (e) {
      res.status(500).json({ error: 'Response parse nahi hua!' });
    }
  });
});

// Download video
app.post('/api/download', (req, res) => {
  const { url, format_id } = req.body;

  if (!url) return res.status(400).json({ error: 'URL chahiye!' });

  const tmpDir = '/tmp';
  const filename = `vidsnap_${Date.now()}`;
  const outputPath = path.join(tmpDir, filename);

  let formatArg = format_id
    ? `-f "${format_id}+bestaudio/best[ext=mp4]/best"`
    : `-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"`;

  if (format_id === 'audio') {
    formatArg = `-f "bestaudio" -x --audio-format mp3`;
  }

  // FIXED: python3 -m yt_dlp instead of yt-dlp
  const cmd = `python3 -m yt_dlp ${formatArg} --merge-output-format mp4 -o "${outputPath}.%(ext)s" "${url}"`;

  exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Download error:', stderr);
      return res.status(500).json({ error: 'Download fail ho gayi!' });
    }

    const files = fs.readdirSync(tmpDir).filter(f => f.startsWith(filename));
    if (files.length === 0) {
      return res.status(500).json({ error: 'File nahi mili!' });
    }

    const filePath = path.join(tmpDir, files[0]);
    const ext = path.extname(files[0]);

    res.setHeader('Content-Disposition', `attachment; filename="vidsnap_download${ext}"`);
    res.setHeader('Content-Type', ext === '.mp3' ? 'audio/mpeg' : 'video/mp4');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on('end', () => { try { fs.unlinkSync(filePath); } catch(e){} });
    stream.on('error', () => { res.status(500).json({ error: 'File stream error!' }); });
  });
});

function formatDuration(seconds) {
  if (!seconds) return '–';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(views) {
  if (!views) return '–';
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M views';
  if (views >= 1000) return (views / 1000).toFixed(0) + 'K views';
  return views + ' views';
}

app.listen(PORT, () => {
  console.log(`VidSnap server chal raha hai port ${PORT} pe!`);
});
