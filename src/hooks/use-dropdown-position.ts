import React, { useLayoutEffect } from "react";

/**
 * Use this hook to get the position and width of a reference element relative to the viewport,
 * but corrected for any offsetParent with transform (e.g. modal, dialog, etc).
 * Returns { left, top, width, height }
 */
export function useInputDropdownPosition(open: boolean, ref: React.RefObject<HTMLElement>) {
  const [rect, setRect] = React.useState({ left: 0, top: 0, width: 0, height: 0 });
  useLayoutEffect(() => {
    if (open && ref.current) {
      const el = ref.current;
      const bounding = el.getBoundingClientRect();
      setRect({
        left: bounding.left + window.scrollX,
        top: bounding.bottom + window.scrollY,
        width: bounding.width,
        height: bounding.height,
      });
    }
  }, [open, ref]);
  return rect;
}
