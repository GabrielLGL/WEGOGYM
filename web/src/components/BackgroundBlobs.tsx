export default function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="blob-animate absolute rounded-full blur-[40px] opacity-25"
        style={{
          width: "50vw",
          height: "50vw",
          background: "var(--blob-1)",
          top: "-10%",
          left: "-10%",
        }}
      />
      <div
        className="blob-animate absolute rounded-full blur-[40px] opacity-25"
        style={{
          width: "40vw",
          height: "40vw",
          background: "var(--blob-2)",
          bottom: "-10%",
          right: "-10%",
          animationDelay: "-5s",
        }}
      />
    </div>
  );
}
