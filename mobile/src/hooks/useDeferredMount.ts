import { useState, useEffect } from 'react'

/**
 * Retourne `true` après le premier rendu (deferred mount).
 * Utile pour différer l'affichage de contenus lourds au second frame.
 */
export function useDeferredMount(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  return mounted
}
