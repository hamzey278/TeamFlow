import { useEffect } from "react";

export function useKeyPress(targetKey: string, callback: () => void) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.getAttribute("contenteditable") === "true";
      
      if (isInput && event.key === targetKey) {
        return;
      }

      if (event.key === targetKey) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [targetKey, callback]);
}
