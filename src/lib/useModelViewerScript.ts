import { useEffect } from 'react'

const SCRIPT_ID = 'sh-model-viewer-script'
// Self-hosted and pinned: the CSP in vercel.json only allows scripts from 'self',
// and the npm package's three.js peer range clashes with ours, so we ship the
// standalone build. Only the product page mounts the hook, so only it loads this.
const SCRIPT_SRC = '/vendor/model-viewer-4.4.0.min.js'

export function useModelViewerScript(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    if (document.getElementById(SCRIPT_ID)) return
    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.type = 'module'
    s.src = SCRIPT_SRC
    document.head.appendChild(s)
  }, [enabled])
}
