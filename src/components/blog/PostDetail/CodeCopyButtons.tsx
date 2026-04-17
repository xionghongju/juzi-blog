'use client'

import { useEffect } from 'react'

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

export function CodeCopyButtons() {
  useEffect(() => {
    const prose = document.querySelector('.prose')
    if (!prose) return

    const pres = Array.from(prose.querySelectorAll('pre'))
    const cleanups: (() => void)[] = []

    pres.forEach((pre) => {
      if (pre.querySelector('[data-copy-btn]')) return

      const btn = document.createElement('button')
      btn.setAttribute('data-copy-btn', '')
      btn.title = '复制代码'
      btn.innerHTML = COPY_ICON

      Object.assign(btn.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '5px',
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        opacity: '0',
        transition: 'opacity 0.15s, color 0.15s, background 0.15s',
        lineHeight: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })

      let timer: ReturnType<typeof setTimeout>

      const handleClick = async () => {
        const code = pre.querySelector('code')?.textContent ?? ''
        await navigator.clipboard.writeText(code)
        btn.innerHTML = CHECK_ICON
        btn.style.color = 'rgba(134,239,172,0.9)'
        clearTimeout(timer)
        timer = setTimeout(() => {
          btn.innerHTML = COPY_ICON
          btn.style.color = 'rgba(255,255,255,0.5)'
        }, 2000)
      }

      const showBtn = () => { btn.style.opacity = '1' }
      const hideBtn = () => { btn.style.opacity = '0' }

      btn.addEventListener('click', handleClick)
      pre.addEventListener('mouseenter', showBtn)
      pre.addEventListener('mouseleave', hideBtn)

      pre.style.position = 'relative'
      pre.appendChild(btn)

      cleanups.push(() => {
        clearTimeout(timer)
        btn.removeEventListener('click', handleClick)
        pre.removeEventListener('mouseenter', showBtn)
        pre.removeEventListener('mouseleave', hideBtn)
        btn.remove()
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
