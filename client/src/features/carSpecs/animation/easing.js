// Pure easing + interpolation helpers. No side effects, no clock access.
// Everything the timeline needs to map a normalized progress to a value.

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))

export const lerp = (a, b, t) => a + (b - a) * t

// Map x from [a,b] to [0,1], clamped. Returns 0 when b===a.
export const invLerp = (a, b, x) => (b === a ? 0 : clamp((x - a) / (b - a)))

// Map x from [inMin,inMax] to [outMin,outMax] with clamping.
export const remap = (x, inMin, inMax, outMin, outMax) =>
  lerp(outMin, outMax, invLerp(inMin, inMax, x))

// Classic cubic in/out — matches the smooth settle of the reference transitions.
export const easeInOutCubic = (t) => {
  const x = clamp(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

// Gentler smoothstep for opacity fades.
export const easeInOut = (t) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}

// Ramp a raw value across [start,end] then apply an easing curve.
export const ramp = (x, start, end, ease = easeInOutCubic) => ease(invLerp(start, end, x))

export const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
