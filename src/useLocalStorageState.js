import { useEffect, useState } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    // if local store is empty we ruturn initial value ([] in this case)
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  // saving watched to localStorage
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
