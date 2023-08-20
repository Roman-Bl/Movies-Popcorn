import { useEffect } from "react";
export function useKeyboard(button, action) {
  // adding listen event to close if Esc button is pressed on keyboard
  useEffect(
    function () {
      function callback(e) {
        if (e.code === button) {
          action();
          //   console.log("CLOSING");
        }
      }
      // adding global listener to the document - going outside React
      document.addEventListener("keydown", callback);

      // adding clean up
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [action, button]
  );
}

// // initialize useRef
// const inputEl = useRef(null);

// // creating useEffect for focus on mount
// useEffect(function () {
//   inputEl.current.focus();
//   // creating focus on Enter btn pressed
//   function callback(e) {
//     // if (document.activeElement === inputEl.current) return;
//     console.log("event");
//     if (e.code === "Enter") {
//       inputEl.current.focus();
//       // setQuery("");
//     }
//   }
//   document.addEventListener("keydown", callback);
//   // cleaning up
//   return () => document.removeEventListener("keydown", callback);
// }, []);
