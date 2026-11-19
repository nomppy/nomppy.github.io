// Links to other sites open in a new tab; links within the site (sunken.fyi
// and its subdomains, like garden.sunken.fyi) open in the same tab. This sets
// every link on the page, including ones added later (the feeds, the photo
// viewer, page changes), so the browser also shows the right behaviour on
// hover and in the right-click menu.
// /friend counts as another site: it redirects to someone else's website.
const OWN_HOSTS = /(^|\.)sunken\.fyi$/
const NEW_TAB_PATHS = ['/friend']

// true: new tab, false: same tab, null: leave alone (mailto:, #anchors, …)
function newTab(a: HTMLAnchorElement): boolean | null {
  const href = a.getAttribute('href')
  if (!href || href.startsWith('#')) return null
  let url: URL
  try {
    url = new URL(href, location.href)
  } catch {
    return null
  }
  if (!/^https?:$/.test(url.protocol)) return null
  const own = url.origin === location.origin || OWN_HOSTS.test(url.hostname)
  if (own) return NEW_TAB_PATHS.includes(url.pathname.replace(/\/$/, ''))
  return true
}

function set(a: HTMLAnchorElement) {
  const want = newTab(a)
  if (want === null) return
  const rel = new Set((a.rel || '').split(/\s+/).filter(Boolean))
  if (want) {
    if (a.target !== '_blank') a.target = '_blank'
    rel.add('noopener')
  } else {
    if (a.hasAttribute('target')) a.removeAttribute('target')
    rel.delete('noopener')
  }
  const r = [...rel].join(' ')
  if ((a.getAttribute('rel') || '') !== r) r ? a.setAttribute('rel', r) : a.removeAttribute('rel')
}

const setAll = (root: ParentNode) => root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(set)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    setAll(document)
    new MutationObserver((changes) => {
      for (const c of changes) {
        if (c.type === 'attributes') {
          if (c.target instanceof HTMLAnchorElement) set(c.target)
          continue
        }
        c.addedNodes.forEach((n) => {
          if (n instanceof HTMLAnchorElement) set(n)
          if (n instanceof Element) setAll(n)
        })
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] })
  })
})
