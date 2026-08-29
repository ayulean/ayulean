export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 align-middle" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const state = i < full ? "full" : i === full && half ? "half" : "empty";
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`half-${size}-${i}`}>
                <stop offset="50%" stopColor="#e0b455" />
                <stop offset="50%" stopColor="#d8d8d2" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85z"
              fill={state === "full" ? "#e0b455" : state === "half" ? `url(#half-${size}-${i})` : "#d8d8d2"}
            />
          </svg>
        );
      })}
    </span>
  );
}

export default Stars;
