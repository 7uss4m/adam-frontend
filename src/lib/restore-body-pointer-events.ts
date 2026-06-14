/** Radix layers (Dialog/Dropdown/Toast) can leave body stuck with pointer-events: none. */
export function restoreBodyPointerEvents() {
  if (typeof document === "undefined") return;

  const fix = () => {
    const hasOpenLayer = document.querySelector(
      [
        '[data-state="open"][role="dialog"]',
        '[data-state="open"][role="alertdialog"]',
        '[data-state="open"][role="menu"]',
        '[data-state="open"][data-radix-toast]',
      ].join(", ")
    );

    if (!hasOpenLayer && document.body.style.pointerEvents === "none") {
      document.body.style.removeProperty("pointer-events");
    }
  };

  fix();
  window.setTimeout(fix, 0);
  window.setTimeout(fix, 100);
}
