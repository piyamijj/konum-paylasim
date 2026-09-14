interface LiveMapProps {
  sharerLocation: { lat: number; lng: number; accuracy?: number } | null;
  viewerLocation?: { lat: number; lng: number } | null;
  isSharer?: boolean;
}

export default function LiveMap(_props: LiveMapProps) {
  return (
    <div style={{ background: "lime", color: "black", height: "100%", width: "100%", fontSize: "16px", padding: "8px" }}>
      HELLO FROM LIVEMAP (minimal stub)
    </div>
  );
}