import React, { useEffect, useMemo, useState } from 'react'

const MODEL_VIEWER_SRC = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
export const DEFAULT_CAR_MODEL = 'https://threejs.org/examples/models/gltf/ferrari.glb'

const CarModelViewer = ({src, poster, alt = '3D car model', className = ''}) => {
  const [failed, setFailed] = useState(false)
  const viewerSrc = src || DEFAULT_CAR_MODEL

  useEffect(() => {
    if (customElements.get('model-viewer') || document.querySelector(`script[src="${MODEL_VIEWER_SRC}"]`)) return
    const script = document.createElement('script')
    script.type = 'module'
    script.src = MODEL_VIEWER_SRC
    script.onerror = () => setFailed(true)
    document.head.appendChild(script)
  }, [])

  const viewerProps = useMemo(() => ({
    src: viewerSrc,
    poster,
    alt,
    'camera-controls': '',
    'auto-rotate': '',
    'shadow-intensity': '1',
    exposure: '0.9',
    loading: 'eager',
    reveal: 'auto',
    className: className || 'w-full h-full',
    style: {width: '100%', height: '100%', background: '#f8fafc'},
    onError: () => setFailed(true),
  }), [alt, className, poster, viewerSrc])

  if (failed) {
    return (
      <div className='relative w-full h-full'>
        <img src={poster} alt={alt} className={`w-full h-full object-cover ${className}`}/>
        <div className='absolute left-4 bottom-4 bg-white/90 border border-borderColor rounded-md px-3 py-2 text-sm text-gray-600'>
          3D preview unavailable. Showing image.
        </div>
      </div>
    )
  }

  return React.createElement('model-viewer', viewerProps,
      <div slot='poster' className='w-full h-full grid place-items-center bg-light text-gray-500 text-sm'>
        Loading 3D preview...
      </div>
  )
}

export default CarModelViewer
