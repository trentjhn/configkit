/**
 * ScanlineOverlay
 * Global CRT atmosphere — renders two fixed layers:
 *   1. Static horizontal scanline grid (::before pseudo-element via .scanlines class)
 *   2. A single animated bright line that sweeps top-to-bottom
 * Both layers are pointer-events:none so they never block interaction.
 */
export default function ScanlineOverlay() {
  return (
    <>
      {/* Layer 1: static scanline grid via ::before */}
      <div className="scanlines" aria-hidden="true" />

      {/* Layer 2: moving sweep line */}
      <div className="scan-line" aria-hidden="true" />
    </>
  )
}
