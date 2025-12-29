import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const TurnstileWidget = forwardRef(function TurnstileWidget({ siteKey, onToken }, ref) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset() {
      const id = widgetIdRef.current;
      if (id != null && window.turnstile?.reset) window.turnstile.reset(id);
    },
    remove() {
      const id = widgetIdRef.current;
      if (id != null && window.turnstile?.remove) window.turnstile.remove(id);
      widgetIdRef.current = null;
      onToken?.("");
    },
  }));

  useEffect(() => {
    let cancelled = false;

    function mount() {
      if (cancelled) return;
      if (!window.turnstile || !containerRef.current) return;

      // Jika sebelumnya sudah render, bersihkan dulu
      if (widgetIdRef.current != null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "error-callback": () => onToken(""),
        "expired-callback": () => onToken(""),
      });
    }

    if (window.turnstile?.ready) {
      window.turnstile.ready(mount);
    } else {
      const t = setInterval(() => {
        if (window.turnstile?.render) {
          clearInterval(t);
          mount();
        }
      }, 50);
      return () => clearInterval(t);
    }

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      if (id != null && window.turnstile?.remove) window.turnstile.remove(id);
      widgetIdRef.current = null;
    };
  }, [siteKey, onToken]);

  return <div ref={containerRef} data-theme="light" />;
});

export default TurnstileWidget;
