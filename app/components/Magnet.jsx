"use client";

import { useRef, useState } from "react";

export default function Magnet({ children, strength = 0.3 }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      onMouseMove={(event) => {
        if (!ref.current) return;
        const { clientX, clientY } = event;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        setOffset({
          x: (clientX - (left + width / 2)) * strength,
          y: (clientY - (top + height / 2)) * strength,
        });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        display: "inline-block",
      }}
    >
      {children}
    </div>
  );
}
