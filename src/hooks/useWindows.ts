'use client'
import { useEffect, useState } from "react"

interface WindowSize {
  width: number
  height: number
}

const useWindows = (): WindowSize | null => {
  const [size, setSize] = useState<WindowSize | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize() // مقدار اولیه بعد از mount
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return size
}

export default useWindows
