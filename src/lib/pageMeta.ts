import { useEffect } from 'react'
import { SITE } from './site'

/**
 * Gives each route its own title and description.
 *
 * This is a single-page app, so without this every page shares whatever is in
 * index.html. That makes browser tabs useless and gives search engines one
 * description for the whole site.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`

    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', description)
    }

    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', SITE.url + window.location.pathname)
  }, [title, description])
}
