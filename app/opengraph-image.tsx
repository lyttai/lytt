import { ImageResponse } from 'next/og'

export const alt = 'lytt a private ai assistant'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f5f3ee', color: '#1c1b19', padding: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}><div style={{ width: 64, height: 64, background: '#2f5d46', display: 'flex' }} /><div style={{ fontSize: 56, fontWeight: 600 }}>lytt</div></div>
      <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.1, maxWidth: 900 }}>Ask lytt. Get a straight answer.</div>
      <div style={{ fontSize: 30, color: '#5f5b53' }}>A private AI assistant on its own hardware</div>
    </div>,
    size
  )
}
