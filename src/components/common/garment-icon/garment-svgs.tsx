import type { GarmentIconKind } from "./resolve-garment-kind";

interface GarmentSvgProps {
  kind: GarmentIconKind;
  className?: string;
}

export function GarmentSvg({ kind, className }: GarmentSvgProps) {
  switch (kind) {
    case "shirt":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M8.5 4 5 5.5 2.5 10l3.2 1.8 1.3-2.3V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5l1.3 2.3L21.5 10 19 5.5 15.5 4"
            fill="currentColor"
            fillOpacity={0.14}
          />
          <path d="M8.5 4 12 7.5 15.5 4" />
          <path d="M8.5 4 10 8.5 12 7.5 14 8.5 15.5 4" />
          <path d="M12 7.5V21" />
          <circle cx="12" cy="11.5" r="0.5" fill="currentColor" />
          <circle cx="12" cy="15" r="0.5" fill="currentColor" />
          <circle cx="12" cy="18.5" r="0.5" fill="currentColor" />
        </svg>
      );

    case "tshirt":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"
            fill="currentColor"
            fillOpacity={0.14}
          />
        </svg>
      );

    case "trousers":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M6.5 3h11l1 17.5a1 1 0 0 1-1 1h-3.6a1 1 0 0 1-1-.9L12 10.5l-.9 10.1a1 1 0 0 1-1 .9H6.5a1 1 0 0 1-1-1L6.5 3Z"
            fill="currentColor"
            fillOpacity={0.14}
          />
          <path d="M6.2 6.5h11.6" />
          <path d="M12 3v3.5" />
        </svg>
      );

    case "suit":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M8.5 3.5 4.5 5.5 2.5 12l3 1.5L7 9.5V20a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5l1.5 4 3-1.5-2-6.5-4-2"
            fill="currentColor"
            fillOpacity={0.14}
          />
          <path d="M8.5 3.5 12 11.5l3.5-8" />
          <path d="M8.5 3.5 7.5 8l2 1.5-1 1.5L12 11.5" />
          <path d="M15.5 3.5 16.5 8l-2 1.5 1 1.5L12 11.5" />
          <path d="M12 11.5V21" />
          <path d="M14.5 15h1.5" />
        </svg>
      );

    case "dress":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M9 3 7.5 7.5 9 11l-4.5 9.2a1 1 0 0 0 .9 1.3h13.2a1 1 0 0 0 .9-1.3L15 11l1.5-3.5L15 3l-3 2.2L9 3Z"
            fill="currentColor"
            fillOpacity={0.14}
          />
          <path d="M9 11h6" />
        </svg>
      );

    case "duvet":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <rect
            x="3.5"
            y="4"
            width="17"
            height="16"
            rx="3"
            fill="currentColor"
            fillOpacity={0.14}
          />
          <path d="M3.5 9.5h17" />
          <path d="M3.5 14.5h17" />
          <path d="M9.2 4v16" />
          <path d="M14.8 4v16" />
        </svg>
      );

    case "bedding":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M3 12h18v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5Z"
            fill="currentColor"
            fillOpacity={0.14}
          />
          <path d="M4 12V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V12" />
          <path d="M7 12V9.5A1.5 1.5 0 0 1 8.5 8h2A1.5 1.5 0 0 1 12 9.5V12" />
          <path d="M12 12V9.5A1.5 1.5 0 0 1 13.5 8h2A1.5 1.5 0 0 1 17 9.5V12" />
          <path d="M4 18v2" />
          <path d="M20 18v2" />
        </svg>
      );

    case "shoes":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path
            d="M3 16.5V10a1 1 0 0 1 1.6-.8c1.1.9 2.4 1.3 3.7 1.3 1.4 0 2.5-.7 3.2-2.2a1 1 0 0 1 1.7-.2l2.8 3.4c1.2 1 2.7 1.5 4.2 1.8A1.5 1.5 0 0 1 21.5 15v1.5a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 16.5Z"
            fill="currentColor"
            fillOpacity={0.14}
          />
          <path d="M3 15.5h18.5" />
          <path d="M12.5 10.5 14 9.5" />
          <path d="M14.5 12.2 16 11.2" />
        </svg>
      );

    case "other":
    default:
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M12 7a2 2 0 1 0-2-2" />
          <path d="M12 7v2" />
          <path
            d="M12 9 3.6 15.3A1.5 1.5 0 0 0 4.5 18h15a1.5 1.5 0 0 0 .9-2.7L12 9Z"
            fill="currentColor"
            fillOpacity={0.14}
          />
        </svg>
      );
  }
}
