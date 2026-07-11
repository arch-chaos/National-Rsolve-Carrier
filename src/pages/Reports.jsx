import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Reports() {
  const [report, setReport] = useState(null)
  const [days, setDays] = useState(7)
  const [truckReport, setTruckReport] = useState(null)
  const [truckId, setTruckId] = useState('')
  const [trucks, setTrucks] = useState([])
  const [tab, setTab] = useState('trips')

  useEffect(() => {
    api.getTrucks().then((r) => setTrucks(r.trucks)).catch(console.error)
  }, [])

  const loadTripReport = async (d) => {
    const r = await api.getTripReport(d || days)
    setReport(r.report)
  }

  const loadTruckReport = async () => {
    if (!truckId) return
    const r = await api.getTruckReport(Number(truckId), days)
    setTruckReport(r.report)
  }

  useEffect(() => { loadTripReport() }, [])

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Reports</h1>
        <p className="page-sub">Operational analytics and trip history</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'trips' ? 'active' : ''}`}
          onClick={() => setTab('trips')}>Trip Summary</button>
        <button className={`tab ${tab === 'truck' ? 'active' : ''}`}
          onClick={() => setTab('truck')}>Truck Report</button>
      </div>

      {tab === 'trips' && (
        <div className="card">
          <div className="card-header">
            <h3>Trip Report</h3>
            <select value={days} onChange={(e) => { setDays(Number(e.target.value)); loadTripReport(Number(e.target.value)) }}>
              <option value={1}>Last 24h</option>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <div className="card-body">
            {!report ? (
              <p className="empty">Loading...</p>
            ) : (
              <>
                <div className="stat-grid stat-grid-sm">
                  <div className="stat-card stat-blue">
                    <span className="stat-value">{report.total_trips}</span>
                    <span className="stat-label">Total Trips</span>
                  </div>
                  <div className="stat-card stat-green">
                    <span className="stat-value">{report.routes.filter(r => r.status === 'completed').length}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat-card stat-amber">
                    <span className="stat-value">{report.routes.filter(r => r.status === 'in_progress').length}</span>
                    <span className="stat-label">In Progress</span>
                  </div>
                  <div className="stat-card stat-red">
                    <span className="stat-value">{report.routes.filter(r => r.status === 'cancelled').length}</span>
                    <span className="stat-label">Cancelled</span>
                  </div>
                </div>
                <table className="table mt">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Origin → Destination</th>
                      <th>Truck</th>
                      <th>Driver</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.routes.map((r) => (
                      <tr key={r.id}>
                        <td className="td-name">{r.name}</td>
                        <td>{r.origin} → {r.destination}</td>
                        <td>{r.truck?.plate_number || '—'}</td>
                        <td>{r.driver?.name || '—'}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'truck' && (
        <div className="card">
          <div className="card-header">
            <h3>Truck Report</h3>
          </div>
          <div className="card-body">
            <div className="form-inline mb">
              <div className="form-group">
                <label>Select Truck</label>
                <select value={truckId} onChange={(e) => setTruckId(e.target.value)}>
                  <option value="">— Choose —</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>{t.plate_number}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Period</label>
                <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={loadTruckReport}
                disabled={!truckId}>Generate</button>
            </div>

            {truckReport && (
              <>
                <div className="stat-grid stat-grid-sm">
                  <div className="stat-card stat-blue">
                    <span className="stat-value">{truckReport.distance_km || truckReport.total_distance_km} km</span>
                    <span className="stat-label">Distance</span>
                  </div>
                  <div className="stat-card stat-green">
                    <span className="stat-value">{truckReport.routes_completed}</span>
                    <span className="stat-label">Routes</span>
                  </div>
                  <div className="stat-card stat-amber">
                    <span className="stat-value">{truckReport.location_points}</span>
                    <span className="stat-label">GPS Points</span>
                  </div>
                </div>
                {truckReport.routes?.length > 0 && (
                  <table className="table mt">
                    <thead>
                      <tr>
                        <th>Route</th>
                        <th>Origin → Destination</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {truckReport.routes.map((r) => (
                        <tr key={r.id}>
                          <td className="td-name">{r.name}</td>
                          <td>{r.origin} → {r.destination}</td>
                          <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
