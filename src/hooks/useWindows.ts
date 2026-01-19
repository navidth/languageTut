'use client'
import { useLayoutEffect, useState } from "react"

interface WindowSize {
  width: number
  height: number
}

const useWindows = (): WindowSize | null => {
  const [size, setSize] = useState<WindowSize | null>(null)

  useLayoutEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return size
}

export default useWindows
