import React from "react";

interface Props {
  className?: string;
}

export default function TikTokIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-1.877V4h-3.273v12.57a2.844 2.844 0 1 1-2.844-2.844c.197 0 .39.02.577.057V10.51a6.118 6.118 0 0 0-.577-.027A6.117 6.117 0 1 0 15.82 16.6V9.888a8.06 8.06 0 0 0 4.77 1.58V8.195a4.804 4.804 0 0 1-1-.509z" />
    </svg>
  );
}
