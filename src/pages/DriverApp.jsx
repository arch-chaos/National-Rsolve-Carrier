import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function DriverApp() {
  const [params] = useSearchParams()
  const truckId = params.get('truck_id')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [speed, setSpeed] = useState(0)
  const [status, setStatus] = useState('idle')
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')
  const watchRef = useRef(null)

  useEffect(() => {
    if (!truckId) return
    if (!navigator.geolocation) {
      setError('GPS not available on this device')
      return
    }
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0
        setLat(latitude)
        setLng(longitude)
        setSpeed(spd)
        setStatus(spd > 5 ? 'on_route' : spd > 0.5 ? 'paused' : 'idle')
        try {
          await api.sendLocation({ truck_id: Number(truckId), latitude, longitude, speed: spd })
          setLogs((prev) =>
            [{ lat, lng, speed: spd, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }, ...prev].slice(0, 10)
          )
        } catch {}
      },
      (err) => setError(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current) }
  }, [truckId])

  if (!truckId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0e17', padding: 20 }}>
        <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h1 style={{ color: '#e8edf5', fontSize: '1.2rem', margin: '0 0 16px' }}>Driver GPS Tracker</h1>
          <p style={{ color: '#8899b4', marginBottom: 16 }}>Open this page with your truck ID:</p>
          <code style={{ display: 'block', background: '#1a2340', padding: 12, borderRadius: 8, color: '#3b82f6', wordBreak: 'break-all' }}>
            {window.location.origin}/driver?truck_id=1
          </code>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0a0e17', minHeight: '100vh', color: '#e8edf5', fontFamily: 'Inter, sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: '1.1rem', margin: 0 }}>Truck #{truckId}</h1>
            <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600,
              background: status === 'on_route' ? 'rgba(34,197,94,0.12)' : status === 'paused' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
              color: status === 'on_route' ? '#22c55e' : status === 'paused' ? '#f59e0b' : '#ef4444' }}>
              {status}
            </span>
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#1a2340', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#5d6f8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Latitude</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{lat?.toFixed(6) || '—'}</div>
            </div>
            <div style={{ background: '#1a2340', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#5d6f8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Longitude</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{lng?.toFixed(6) || '—'}</div>
            </div>
            <div style={{ background: '#1a2340', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#5d6f8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Speed</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{speed} km/h</div>
            </div>
            <div style={{ background: '#1a2340', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#5d6f8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Pings Sent</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{logs.length}</div>
            </div>
          </div>

          {lat !== null && (
            <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center', padding: '10px', borderRadius: 8, background: '#3b82f6', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
              Open in Google Maps
            </a>
          )}
        </div>

        <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: '0.9rem', margin: '0 0 12px', color: '#8899b4' }}>Recent Pings</h3>
          {logs.length === 0 ? (
            <p style={{ color: '#5d6f8a', textAlign: 'center', padding: 20 }}>Waiting for GPS...</p>
          ) : (
            logs.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.85rem', color: '#8899b4' }}>
                <span>{l.lat?.toFixed(4)}, {l.lng?.toFixed(4)}</span>
                <span>{l.speed} km/h @ {l.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
