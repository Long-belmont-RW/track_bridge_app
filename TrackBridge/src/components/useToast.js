import { useCallback, useRef, useState } from "react";

// Minimal in-app toast notification (one of the notification channels
// described in the spec — push/email/SMS are separate backend concerns).
export default function useToast() {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");
  const timerRef = useRef(null);

  const show = useCallback((msg, toneValue = "success") => {
    setMessage(msg);
    setTone(toneValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(""), 3200);
  }, []);

  const close = useCallback(() => setMessage(""), []);

  return { message, tone, show, close };
}
