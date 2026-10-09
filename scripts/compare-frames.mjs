// Build the ref-vs-output comparison contact sheet at the key timestamps.
// Requires analyze-reference.mjs (reference frames) and capture-frames.mjs
// (output frames) to have run first.
//
//   node compare-frames.mjs
//
import { execFileSync } from 'node:child_process'
import { mkdirSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')

const root = (p) => new URL(p, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const REFF = root('./.work/frames')
const OUTF = root('./.work/out-frames')
const CMP = root('./.work/compare')
const DOCS = root('../docs/car-specs')
mkdirSync(CMP, { recursive: true })

// 0-indexed reference frame numbers for the required comparison points.
const KEYS = [0, 48, 54, 60, 66, 75, 117, 132, 149]
KEYS.forEach((n, i) => {
  const idx = String(i).padStart(2, '0')
  copyFileSync(`${REFF}/f_${String(n + 1).padStart(3, '0')}.png`, `${CMP}/ref_${idx}.png`) // ffmpeg frames are 1-indexed
  copyFileSync(`${OUTF}/out_${String(n).padStart(3, '0')}.png`, `${CMP}/out_${idx}.png`)
})

execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', `${CMP}/ref_%02d.png`, '-vf', 'scale=260:195,tile=9x1:padding=3:color=white', '-frames:v', '1', `${CMP}/row_ref.png`])
execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', `${CMP}/out_%02d.png`, '-vf', 'crop=800:600:0:0,scale=260:195,tile=9x1:padding=3:color=white', '-frames:v', '1', `${CMP}/row_out.png`])
execFileSync(ffmpeg, ['-y', '-v', 'error', '-i', `${CMP}/row_ref.png`, '-i', `${CMP}/row_out.png`, '-filter_complex', 'vstack=inputs=2', `${DOCS}/comparison.png`])
console.log('comparison.png ->', DOCS, '(top row = reference, bottom row = output; frames', KEYS.join(','), ')')
