import { useCallback } from 'react'

export const useCursor = () => {
  const setPointerCursor = useCallback(() => {
    document.body.classList.add('cursor-clicking')
  }, [])

  const resetCursor = useCallback(() => {
    document.body.classList.remove('cursor-clicking')
  }, [])

  const withPointerCursor = useCallback((callback: () => void, delay = 100) => {
    setPointerCursor()
    
    setTimeout(() => {
      callback()
      setTimeout(() => {
        resetCursor()
      }, 300)
    }, delay)
  }, [setPointerCursor, resetCursor])

  return {
    setPointerCursor,
    resetCursor,
    withPointerCursor
  }
}