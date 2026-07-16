import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../api'

function getCode() {
  try { return localStorage.getItem('nrc_driver_code') } catch { return null }
}
function getPlate() {
  try { return localStorage.getItem('nrc_driver_plate') } catch { return null }
}
function setCode(v) {
  try { localStorage.setItem('nrc_driver_code', v) } catch {}
}
function setPlate(v) {
  try { localStorage.setItem('nrc_driver_plate', v) } catch {}
}
function clearSaved() {
  try { localStorage.removeItem('nrc_driver_code'); localStorage.removeItem('nrc_driver_plate'); localStorage.removeItem('nrc_driver_active') } catch {}
}

export default function DriverApp() {
  const [step, setStep] = useState('code')
  const [code, setCodeState] = useState(getCode() || '')
  const [plate, setPlateState] = useState(getPlate() || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [driverInfo, setDriverInfo] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [truckInfo, setTruckInfo] = useState(null)
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [speed, setSpeed] = useState(0)
  const [pStatus, setPStatus] = useState('idle')
  const [pings, setPings] = useState(0)
  const [gpsBusy, setGpsBusy] = useState(false)
  const watchRef = useRef(null)

  useEffect(() => {
    const c = getCode(); const p = getPlate()
    const wasActive = localStorage.getItem('nrc_driver_active')
    if (c && p && wasActive) handleVerify(c, p)
  }, [])

  const handleVerify = async (cd, pn) => {
    const c = (cd || code).trim().toUpperCase()
    const p = (pn || plate).trim().toUpperCase()
    if (!c) { setError('Enter your driver code'); return }
    if (!p) { setError('Enter the truck plate number'); return }
    setBusy(true); setError('')
    try {
      const res = await api.verifyDriver(c, p)
      if (res.valid) {
        setDriverInfo(res.driver); setRouteInfo(res.route); setTruckInfo(res.truck)
        setCodeState(c); setPlateState(p); setCode(c); setPlate(p)
        setStep('tracking')
        setCode(c); setPlate(p)
        startGps(res.truck.id)
      } else {
        setError(res.error || 'Verification failed')
      }
    } catch {
      setError('Server unreachable. Connect to office WiFi.')
    }
    setBusy(false)
  }

  const startGps = useCallback((truckId) => {
    setError(''); setGpsBusy(true)
    if (!navigator.geolocation) {
      setError('GPS not available'); setGpsBusy(false); return
    }
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)

    api.sendLocation({ truck_id: truckId, latitude: 0, longitude: 0, speed: 0 }).catch(() => {})
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const spd = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0
        setLat(latitude); setLng(longitude); setSpeed(spd)
        setPStatus(spd > 5 ? 'on_route' : spd > 0.5 ? 'paused' : 'idle')
        setPings((p) => p + 1)
        api.sendLocation({ truck_id: truckId, latitude, longitude, speed: spd }).catch(() => {})
      },
      (err) => {
        if (err.code === 1) setError('Location blocked. Browser menu → Settings → Site settings → Location → Allow')
        else if (err.code === 2) setError('GPS unavailable. Turn ON phone location.')
        else setError('GPS timeout. Tap Retry.')
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 8000 }
    )
    setGpsBusy(false)
    try { localStorage.setItem('nrc_driver_active', '1') } catch {}
  }, [])

  useEffect(() => {
    const h = () => {
      if (document.visibilityState === 'visible' && step === 'tracking' && !watchRef.current && truckInfo) {
        startGps(truckInfo.id)
      }
    }
    document.addEventListener('visibilitychange', h)
    return () => document.removeEventListener('visibilitychange', h)
  }, [step, startGps, truckInfo])

  const stopTracking = () => {
    if (watchRef.current) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null }
    clearSaved()
    setStep('code'); setDriverInfo(null); setRouteInfo(null); setTruckInfo(null)
    setLat(null); setLng(null); setSpeed(0); setPings(0); setError('')
  }

  const handleSubmit = (e) => { e.preventDefault(); handleVerify() }

  return (
    <div style={{ background: '#eef0f5', minHeight: '100vh', color: '#1a1d2e', fontFamily: 'Inter, sans-serif', padding: 16 }}>
      <div className="bubble-1" />
      <div className="bubble-2" />
      <div className="bubble-3" />
      <div style={{ maxWidth: 440, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {step === 'code' && (
          <div style={{
            background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.35)', borderRadius: 18, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.04)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: 'white', fontSize: 18, boxShadow: '0 8px 24px rgba(59,130,246,0.2)'
              }}>N</div>
              <h1 style={{ fontSize: 18, margin: 0, color: '#1a1d2e' }}>NRC Driver Tracker</h1>
              <p style={{ color: '#888da0', fontSize: 13, marginTop: 4 }}>National Resolve Carrier</p>
            </div>
            {error && <div style={{
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.1)',
              color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16
            }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', color: '#888da0', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Driver Code</label>
              <input value={code} onChange={(e) => setCodeState(e.target.value.toUpperCase())}
                placeholder="e.g. A7X9K2" maxLength={6} required
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.25)',
                  color: '#1a1d2e', fontSize: 20, fontWeight: 700, textAlign: 'center',
                  letterSpacing: 6, outline: 'none', marginBottom: 16, textTransform: 'uppercase'
                }} />
              <label style={{ display: 'block', color: '#888da0', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Truck Plate</label>
              <input value={plate} onChange={(e) => setPlateState(e.target.value.toUpperCase())}
                placeholder="e.g. TR-04" required
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.25)',
                  color: '#1a1d2e', fontSize: 16, fontWeight: 600, textAlign: 'center',
                  outline: 'none', marginBottom: 16, textTransform: 'uppercase'
                }} />
              <button type="submit" disabled={busy}
                style={{
                  width: '100%', padding: 14, borderRadius: 8, border: 'none',
                  background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.2)'
                }}>
                {busy ? 'Verifying...' : 'Start Tracking'}
              </button>
            </form>
            <p style={{ color: '#888da0', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
              Get your driver code and truck plate from dispatcher
            </p>
          </div>
        )}

        {step === 'tracking' && (
          <>
            <div style={{
              background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.35)', borderRadius: 18, padding: 20, marginBottom: 12,
              boxShadow: '0 24px 80px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e' }}>{truckInfo?.plate_number}</div>
                  <div style={{ fontSize: 12, color: '#888da0' }}>{driverInfo?.name} · {routeInfo?.name}</div>
                  <div style={{ fontSize: 11, color: '#888da0', marginTop: 2 }}>
                    {document.visibilityState === 'visible' ? 'Tracking active' : 'Phone locked — paused'}
                  </div>
                </div>
                <span style={{
                  padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  background: pStatus === 'on_route' ? 'rgba(22,163,74,0.08)' : pStatus === 'paused' ? 'rgba(217,119,6,0.08)' : 'rgba(220,38,38,0.08)',
                  color: pStatus === 'on_route' ? '#16a34a' : pStatus === 'paused' ? '#d97706' : '#dc2626',
                  border: pStatus === 'on_route' ? '1px solid rgba(22,163,74,0.15)' : pStatus === 'paused' ? '1px solid rgba(217,119,6,0.15)' : '1px solid rgba(220,38,38,0.15)'
                }}>{pStatus}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[{ label: 'Latitude', val: lat?.toFixed(6) || '—' }, { label: 'Longitude', val: lng?.toFixed(6) || '—' },
                  { label: 'Speed', val: `${speed} km/h` }, { label: 'Pings Sent', val: pings }].map((c) => (
                  <div key={c.label} style={{
                    background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 12, textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 10, color: '#888da0', textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginTop: 2 }}>{c.val}</div>
                  </div>
                ))}
              </div>
              {lat && lng && (
                <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank"
                  style={{
                    display: 'block', textAlign: 'center', padding: 10, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
                    color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: 13, marginBottom: 16
                  }}>
                  Open in Google Maps
                </a>
              )}
              <button onClick={stopTracking}
                style={{
                  width: '100%', padding: 12, borderRadius: 8,
                  border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.06)',
                  color: '#dc2626', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}>
                Stop Tracking
              </button>
            </div>
            {error && <div style={{
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.1)',
              color: '#dc2626', padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 12
            }}>
              {error}
              <button onClick={() => { setError(''); startGps(truckInfo?.id) }}
                style={{
                  display: 'block', marginTop: 8, padding: '8px 16px', borderRadius: 6,
                  border: '1px solid rgba(220,38,38,0.2)', background: 'transparent',
                  color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                }}>Retry GPS</button>
            </div>}
          </>
        )}
      </div>
    </div>
  )
}
