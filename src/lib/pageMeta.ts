import { useEffect } from 'react'
import { SITE } from './site'

function setMeta(selector: string, attr: string, value: string) {
  let tag = document.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    const [a, v] = selector.match(/\[([^\]=]+)="([^"]+)"\]/)!.slice(1)
    tag.setAttribute(a, v)
    document.head.appendChild(tag)
  }
  tag.setAttribute(attr, value)
}

/**
 * Gives each route its own title and description.
 *
 * This is a single-page app, so without this every page shares whatever is in
 * index.html. That makes browser tabs useless and gives search engines one
 * description for the whole site.
 */
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} · ${SITE.name}`
      : `${SITE.name} · ${SITE.tagline}`

    document.title = fullTitle

    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
      setMeta('meta[name="twitter:description"]', 'content', description)
    }

    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)

    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', SITE.url + window.location.pathname)
  }, [title, description])
}
