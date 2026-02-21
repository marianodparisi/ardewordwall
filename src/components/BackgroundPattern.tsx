export function BackgroundPattern() {
  return (
    <div
      className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/leaf.png')",
        backgroundSize: '300px',
      }}
    />
  )
}
