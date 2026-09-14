import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { UploadCloud, Loader2, AlertTriangle } from 'lucide-react'

interface StlViewerProps {
  file: File | null
  onFileSelect: (file: File | null) => void
}

export function StlViewer({ file, onFileSelect }: StlViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    if (!file || !containerRef.current) {
      setStatus('idle')
      return
    }

    const container = containerRef.current
    setStatus('loading')

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x141414)

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const key = new THREE.DirectionalLight(0x9333ea, 1.1)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xf4f1ea, 0.5)
    rim.position.set(-4, -2, -3)
    scene.add(rim)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    let mesh: THREE.Mesh | undefined
    let frameId: number

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const loader = new STLLoader()
        const geometry = loader.parse(e.target!.result as ArrayBuffer)
        geometry.center()
        geometry.computeVertexNormals()

        const material = new THREE.MeshStandardMaterial({
          color: 0xf4f1ea,
          metalness: 0.15,
          roughness: 0.55,
        })
        mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)

        geometry.computeBoundingSphere()
        const radius = geometry.boundingSphere?.radius ?? 1
        camera.position.set(radius * 1.8, radius * 1.4, radius * 1.8)
        controls.target.set(0, 0, 0)
        controls.update()

        setStatus('ready')

        const animate = () => {
          frameId = requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()
      } catch {
        setStatus('error')
      }
    }
    reader.onerror = () => setStatus('error')
    reader.readAsArrayBuffer(file)

    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      controls.dispose()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [file])

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0]
    if (picked && picked.name.toLowerCase().endsWith('.stl')) {
      onFileSelect(picked)
    } else if (picked) {
      onFileSelect(null)
      setStatus('error')
    }
  }

  if (!file) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-signal-soft bg-panel-raised' : 'border-ink/20 bg-panel'
        }`}
      >
        <UploadCloud className="text-ink-dim" size={28} aria-hidden="true" />
        <p className="text-sm text-ink">Drag an STL file here, or</p>
        <label className="cursor-pointer font-mono-label text-[11px] uppercase text-signal-soft underline underline-offset-4">
          browse files
          <input
            type="file"
            accept=".stl"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        <p className="text-xs text-ink-dim">.stl only, previewed in-browser — no upload yet</p>
        {status === 'error' && (
          <p role="alert" className="flex items-center gap-1 text-xs text-signal-soft">
            <AlertTriangle size={14} aria-hidden="true" /> That file isn't a valid .stl
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-72 overflow-hidden rounded-2xl border border-hairline bg-panel">
        <div ref={containerRef} className="h-full w-full" />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-panel/80 font-mono-label text-xs uppercase text-ink-dim">
            <Loader2 className="animate-spin" size={16} aria-hidden="true" /> Reading model
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-panel/90 font-mono-label text-xs uppercase text-signal-soft">
            <AlertTriangle size={16} aria-hidden="true" /> Couldn't render this file
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-ink-dim">
        <span>{file.name}</span>
        <button
          type="button"
          onClick={() => onFileSelect(null)}
          className="font-mono-label uppercase text-signal-soft underline underline-offset-4"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
