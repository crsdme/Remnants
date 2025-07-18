import { useMemo } from 'react'

import { debounce } from '@/utils/lib'

import { useEvent } from '../useEvent/useEvent'

/**
 * @name useDebounceCallback
 * @description - Hook that creates a debounced callback
 * @category Utilities
 *
 * @template Params The type of the params
 * @template Return The type of the return
 * @param {(...args: Params) => Return} callback The callback function
 * @param {number} delay The delay in milliseconds
 * @returns {(...args: Params) => Return} The callback with debounce
 *
 * @example
 * const debouncedCallback = useDebounceCallback(() => console.log('callback'), 500);
 */
export function useDebounceCallback<Params extends unknown[], Return>(callback: (...args: Params) => Return, delay: number) {
  const internalCallback = useEvent(callback)
  const debounced = useMemo(() => debounce(internalCallback, delay), [delay])

  return debounced
}
