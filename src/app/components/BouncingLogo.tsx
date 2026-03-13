'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

type Props = {
  src: string
  alt?: string
  href?: string
  width?: number
  speed?: number
}

export default function BouncingLogo({
  src,
  alt = '',
  href = '/',
  width = 110,
  speed = 1.5,
}: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  // Store position and velocity in refs so animation loop never triggers re-renders
  const posRef = useRef({ x: 80, y: 80 })
  const velRef = useRef({ vx: speed, vy: speed * 0.85 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    function animate() {
      const pos = posRef.current
      const vel = velRef.current
      const w = el!.offsetWidth
      const h = el!.offsetHeight
      const maxX = window.innerWidth - w
      const maxY = window.innerHeight - h

      pos.x += vel.vx
      pos.y += vel.vy

      // Bounce off left/right
      if (pos.x <= 0)    { pos.x = 0;    vel.vx =  Math.abs(vel.vx) }
      if (pos.x >= maxX) { pos.x = maxX; vel.vx = -Math.abs(vel.vx) }
      // Bounce off top/bottom
      if (pos.y <= 0)    { pos.y = 0;    vel.vy =  Math.abs(vel.vy) }
      if (pos.y >= maxY) { pos.y = maxY; vel.vy = -Math.abs(vel.vy) }

      el!.style.transform = `translate(${pos.x}px, ${pos.y}px)`

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, []) // intentionally empty — pos/vel/speed are stable refs

  return (
    <div
      ref={elRef}
      className="fixed top-0 left-0 z-40 will-change-transform"
      style={{ width }}
    >
      <Link href={href} className="block cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          className="hover:scale-110 transition-transform duration-100 select-none"
          draggable={false}
        />
      </Link>
    </div>
  )
}
