// Module augmentation so TypeScript accepts <model-viewer> in JSX.
// The export {} makes this file a module (required for declare module to augment).
export {}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': import('react').DetailedHTMLProps<
        import('react').HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string
        alt?: string
        poster?: string
        loading?: 'auto' | 'lazy' | 'eager'
        reveal?: 'auto' | 'interaction' | 'manual'
        'auto-rotate'?: boolean | string
        'auto-rotate-delay'?: number | string
        'rotation-per-second'?: string
        'camera-controls'?: boolean | string
        'interaction-prompt'?: 'auto' | 'none'
        'environment-image'?: string
        exposure?: number | string
        'shadow-intensity'?: number | string
        'shadow-softness'?: number | string
        ar?: boolean | string
      }
    }
  }
}
