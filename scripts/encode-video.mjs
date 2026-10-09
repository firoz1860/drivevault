// Encode the captured frames into the deliverables and verify with ffprobe.
// Produces an 800x600, CFR 30fps, 150-frame (5.000s) MP4 that matches the
// reference VIDEO stream exactly, plus a WebM and a poster. Frames are cropped
// 800x600 (the element screenshot can overshoot by 1px).
//
//   node encode-video.mjs
//
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')
const ffprobe = require('ffprobe-static').path

const root = (p) => new URL(p, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const IN = root('./.work/out-frames')
const OUT = root('../docs/car-specs')
mkdirSync(OUT, { recursive: true })

const run = (args) => execFileSync(ffmpeg, args, { stdio: 'inherit' })

// MP4 (H.264, yuv420p) — matches the source cadence: 30fps CFR, 150 frames.
run(['-y', '-v', 'error', '-framerate', '30', '-i', `${IN}/out_%03d.png`,
  '-vf', 'crop=800:600:0:0,format=yuv420p', '-r', '30',
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '17',
  '-movflags', '+faststart', `${OUT}/car-specs-transition.mp4`])

// WebM (VP9).
run(['-y', '-v', 'error', '-framerate', '30', '-i', `${IN}/out_%03d.png`,
  '-vf', 'crop=800:600:0:0', '-r', '30', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34',
  `${OUT}/car-specs-transition.webm`])

// Poster (first frame).
run(['-y', '-v', 'error', '-i', `${IN}/out_000.png`, '-vf', 'crop=800:600:0:0', `${OUT}/poster.png`])

const info = execFileSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height,avg_frame_rate,nb_frames,duration,codec_name',
  '-of', 'default=noprint_wrappers=1', `${OUT}/car-specs-transition.mp4`]).toString()
console.log('--- ffprobe (MP4) ---\n' + info)
