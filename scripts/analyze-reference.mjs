// Download the reference clip and measure it: ffprobe metadata, full frame
// extraction, and contact sheets. Writes everything under scripts/.work/ which
// is NOT committed (reference media + intermediate frames stay out of the repo).
//
//   node analyze-reference.mjs
//
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')
const ffprobe = require('ffprobe-static').path

const REF_URL =
  'https://cdn.dribbble.com/userupload/25879749/file/large-0be08344c5864e28a21aada7d4f250b9.mp4'
const WORK = new URL('./.work/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const FRAMES = `${WORK}/frames`
const SHEETS = `${WORK}/sheets`
const REF = `${WORK}/reference.mp4`

mkdirSync(FRAMES, { recursive: true })
mkdirSync(SHEETS, { recursive: true })

const res = await fetch(REF_URL, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://dribbble.com/' } })
if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`)
writeFileSync(REF, Buffer.from(await res.arrayBuffer()))
console.log('saved', REF)

const probe = execFileSync(ffprobe, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', REF])
writeFileSync(`${WORK}/probe.json`, probe)
console.log('ffprobe ->', `${WORK}/probe.json`)

execFileSync(ffmpeg, ['-v', 'error', '-i', REF, '-vsync', '0', `${FRAMES}/f_%03d.png`])
console.log('extracted all frames ->', FRAMES)

// overview at ~0.2s steps + finer sheets around each transition
execFileSync(ffmpeg, ['-v', 'error', '-i', REF, '-vf', "select='not(mod(n,6))',scale=240:180,tile=5x5", '-frames:v', '1', `${SHEETS}/overview.png`])
execFileSync(ffmpeg, ['-v', 'error', '-i', REF, '-vf', "select='between(n,42,78)*not(mod(n,2))',scale=280:210,tile=5x4", '-frames:v', '1', `${SHEETS}/transition_in.png`])
execFileSync(ffmpeg, ['-v', 'error', '-i', REF, '-vf', "select='between(n,112,149)*not(mod(n,2))',scale=280:210,tile=5x4", '-frames:v', '1', `${SHEETS}/transition_out.png`])
console.log('contact sheets ->', SHEETS)
console.log('done. Inspect probe.json + sheets before adjusting referenceTiming.js')
