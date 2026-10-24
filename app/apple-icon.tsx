import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 18, background: '#2f5d46', paddingBottom: 34 }}>
      <div style={{ width: 22, height: 112, background: '#f5f3ee' }} /><div style={{ width: 22, height: 78, background: '#f5f3ee' }} /><div style={{ width: 22, height: 95, background: '#f5f3ee' }} />
    </div>,
    size
  )
}
