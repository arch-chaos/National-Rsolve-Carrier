import { useState, useEffect, useRef } from 'react'
import { api } from '../api'
import { connectSocket, disconnectSocket } from '../socket'

export default function Fleet() {
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [liveFeed, setLiveFeed] = useState([])
  const feedRef = useRef(null)

  const load = () =>
    Promise.all([api.getTrucks(), api.getLiveTrucks()]).then(([all, live]) => {
      const liveMap = {}
      live.trucks.forEach((t) => { liveMap[t.id] = t.last_location })
      setTrucks(all.trucks.map((t) => ({ ...t, last_location: liveMap[t.id] || null })))
    }).catch(console.error)

  useEffect(() => {
    Promise.all([load(), api.getDrivers().then((r) => setDrivers(r.drivers))])
      .catch(console.error)
      .finally(() => setLoading(false))

    const socket = connectSocket()
    socket.on('location_update', (data) => {
      setTrucks((prev) =>
        prev.map((t) =>
          t.id === data.truck_id
            ? { ...t, last_location: { latitude: data.latitude, longitude: data.longitude, speed: data.speed }, status: data.speed > 5 ? 'on_route' : t.status }
            : t
        )
      )
      setLiveFeed((prev) =>
        [{ msg: `Truck #${data.truck_id} — ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)} @ ${data.speed?.toFixed(0) || 0} km/h`, time: new Date().toLocaleTimeString('en-US', { hour12: false }) }, ...prev].slice(0, 20)
      )
    })
    return () => { socket.off('location_update'); disconnectSocket() }
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this truck?')) return
    try {
      await api.deleteTruck(id)
      load()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await api.createTruck({
      plate_number: fd.get('plate_number'),
      status: fd.get('status'),
      driver_id: fd.get('driver_id') ? Number(fd.get('driver_id')) : null,
    })
    setShowForm(false)
    load()
  }

  if (loading) return <div className="loading">Loading fleet...</div>

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Fleet</h1>
          <p className="page-sub">Manage vehicles and live tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Truck'}
        </button>
      </div>

      <div className="card mb" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', padding: '12px 16px', borderRadius: 10, fontSize: 13 }}>
        <strong>Driver GPS:</strong> Drivers log in with their <strong>Driver Code</strong> (Drivers page). The system auto-assigns the truck from their route. Truck Codes shown here are for reference only.
      </div>

      {showForm && (
        <div className="card mb">
          <div className="card-header"><h3>New Truck</h3></div>
          <div className="card-body">
            <form className="form-inline" onSubmit={handleAdd}>
              <div className="form-group">
                <label>Plate Number</label>
                <input name="plate_number" required placeholder="e.g. TR-99" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue="idle">
                  <option value="idle">Idle</option>
                  <option value="on_route">On Route</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div className="form-group">
                <label>Driver</label>
                <select name="driver_id">
                  <option value="">— None —</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>All Vehicles</h3>
          <span className="badge">{trucks.length} trucks</span>
        </div>
        <div className="card-body">
          {trucks.length === 0 ? (
            <p className="empty">No trucks registered</p>
          ) : (
            <table className="table">
              <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehicle</th>
                    <th>Access Code</th>
                    <th>Status</th>
                    <th>Driver</th>
                    <th>Last Location</th>
                    <th>Speed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trucks.map((t) => {
                    const loc = t.last_location
                    return (
                      <tr key={t.id}>
                        <td><span className="badge" style={{background:'var(--blue-bg)',color:'var(--blue)'}}>{t.id}</span></td>
                        <td className="td-name">{t.plate_number}</td>
                        <td><code style={{
                          background: 'rgba(59,130,246,0.08)', padding: '2px 8px', borderRadius: 4,
                          fontSize: 13, fontWeight: 700, color: '#3b82f6', letterSpacing: 2, cursor: 'pointer'
                        }} onClick={() => { navigator.clipboard?.writeText(t.access_code); alert('Copied: ' + t.access_code) }}>{t.access_code}</code></td>
                        <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                      <td>{t.driver?.name || '—'}</td>
                      <td>{loc ? `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : '—'}</td>
                      <td>{loc ? `${loc.speed?.toFixed(0) || 0} km/h` : '—'}</td>
                      <td>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(t.id)}>Delete</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid-2col">
        <div className="card">
          <div className="card-header">
            <h3>Simulate GPS Ping</h3>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
              Send a test location ping to see real-time updates.
            </p>
            <Simulator onPing={load} trucks={trucks} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Live GPS Feed</h3>
            <span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}>
              {liveFeed.length > 0 ? 'LIVE' : 'Waiting...'}
            </span>
          </div>
          <div className="card-body" ref={feedRef} style={{ maxHeight: 260, overflowY: 'auto' }}>
            {liveFeed.length === 0 ? (
              <p className="empty">No GPS pings yet. Send one above or from a truck device.</p>
            ) : (
              <div className="feed">
                {liveFeed.map((item, i) => (
                  <div className="feed-item" key={i}>
                    <span className="feed-dot" style={{ background: 'var(--green)' }} />
                    <div>
                      <p>{item.msg}</p>
                      <small>{item.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Simulator({ onPing, trucks }) {
  const [truckId, setTruckId] = useState(trucks[0]?.id || '')
  const [sending, setSending] = useState(false)
  const [intervalRef, setIntervalRef] = useState(null)
  const running = intervalRef !== null

  const sendOne = async () => {
    if (!truckId) return
    const lat = 40.7 + Math.random() * 0.1
    const lng = -74.0 + Math.random() * 0.1
    await api.sendLocation({ truck_id: Number(truckId), latitude: lat, longitude: lng, speed: 40 + Math.random() * 30 }).catch(console.error)
  }

  const toggleAuto = () => {
    if (running) {
      clearInterval(intervalRef)
      setIntervalRef(null)
    } else {
      const id = setInterval(sendOne, 3000)
      setIntervalRef(id)
    }
  }

  useEffect(() => {
    return () => { if (intervalRef) clearInterval(intervalRef) }
  }, [intervalRef])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="form-inline">
        <div className="form-group" style={{ minWidth: 140 }}>
          <label>Truck</label>
          <select value={truckId} onChange={(e) => setTruckId(e.target.value)}>
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>{t.plate_number}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={sendOne} disabled={!truckId || sending}>
          Send Ping
        </button>
        <button className={`btn btn-sm ${running ? 'btn-danger' : 'btn-primary'}`}
          onClick={toggleAuto} disabled={!truckId}>
          {running ? 'Stop Auto' : 'Auto Ping (3s)'}
        </button>
      </div>
    </div>
  )
}
