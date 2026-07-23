import { useEffect, useRef, useState } from "react";

export default function RotatingWords({ words, interval = 1900, className = "" }) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reducedRef.current) return undefined;
    const id = setInterval(() => {
      setPrevIndex(index);
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [index, interval, words.length]);

  if (reducedRef.current) {
    return <span className={`accent ${className}`}>{words.join(", ")}.</span>;
  }

  return (
    <span className={`rotating-words ${className}`} aria-live="polite">
      {/* Invisible longest word reserves the box width/height */}
      <span className="rotating-words-ghost" aria-hidden="true">
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      {words.map((word, i) => {
        let state = "rw-idle";
        if (i === index) state = "rw-enter";
        else if (i === prevIndex) state = "rw-exit";
        return (
          <span key={word} className={`rotating-word accent ${state}`}>
            {word}
          </span>
        );
      })}
    </span>
  );
}
