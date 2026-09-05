import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Angad Ayurveda — Ayurvedic Supplement";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e0f0dd 0%, #fdfaf3 55%, #c2e1bd 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 108, fontWeight: 700, color: "#21471f", letterSpacing: -2 }}>
          Angad Ayurveda
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 40, color: "#2f6f2b" }}>Ayurvedic Supplement</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 26, color: "#4a5a46" }}>
          Metabolism · Digestion · Daily energy
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            gap: 20,
            fontSize: 22,
            color: "#275824",
            background: "rgba(255,255,255,0.7)",
            padding: "14px 32px",
            borderRadius: 999,
          }}
        >
          100% Herbal · Cash on Delivery · 7-Day Replacement
        </div>
      </div>
    ),
    size
  );
}
