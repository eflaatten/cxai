import { useEffect } from "react";

export const useSwipe = (onSwipeLeft, onSwipeRight) => {
  useEffect(() => {
    let startX = null;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      if (!startX) return;

      const deltaX = e.touches[0].clientX - startX;

      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
        startX = null;
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onSwipeLeft, onSwipeRight]);
};
