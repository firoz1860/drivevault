// Deterministically capture the 150 stage frames from the running app.
// Start the client first (e.g. `npm run dev` or `npm run preview` in ../client),
// then:
//
//   BASE_URL=http://localhost:5173 node capture-frames.mjs
//
// Each frame is produced by seeking the one timeline to an absolute time via
// window.__carSpecs, waiting for the rendered time to match + two rAFs, then
// element-screenshotting the exact 800x600 stage. Output: .work/out-frames/.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:5173'
const OUT = new URL('./.work/out-frames/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 880, height: 720 }, deviceScaleFactor: 1 })
await page.goto(`${BASE}/car-specs?capture=1`, { waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__carSpecs && window.__carSpecs.isReady && window.__carSpecs.isReady(), { timeout: 20000 })
await page.evaluate(() => {
  const el = document.querySelector('[data-cs-stage]')
  el.scrollIntoView({ block: 'start' })
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
})

const N = await page.evaluate(() => window.__carSpecs.frameCount)
const FPS = await page.evaluate(() => window.__carSpecs.fps)
const stage = page.locator('[data-cs-stage]')

for (let n = 0; n < N; n++) {
  await page.evaluate((f) => window.__carSpecs.seekFrame(f), n)
  await page.evaluate(
    ([f, fps]) =>
      new Promise((res) => {
        const target = f / fps
        let tries = 0
        const tick = () => {
          const rt = window.__carSpecs.getRenderedTime()
          if (Math.abs(rt - target) < 1e-3 || tries > 25) requestAnimationFrame(() => requestAnimationFrame(res))
          else {
            tries++
            requestAnimationFrame(tick)
          }
        }
        tick()
      }),
    [n, FPS],
  )
  await stage.screenshot({ path: `${OUT}/out_${String(n).padStart(3, '0')}.png` })
}

await browser.close()
console.log(`captured ${N} frames -> ${OUT}`)
