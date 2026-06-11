import { useCallback, useRef } from 'react';

// Custom hook for debouncing a function
function useDebounce(func, wait) {
  const timeout = useRef();

  return useCallback(
    (...args) => {
      const context = this;

      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => func.apply(context, args), wait);
    },
    [func, wait]
  );
}

export default useDebounce;
