import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [routes, setRoutes] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getStats(),
      api.getRoutes(),
      api.getActivity(),
    ]).then(([s, r, a]) => {
      setStats(s)
      setRoutes(r.routes)
      setActivity(a.activity)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard...</div>

  const cards = [
    { label: 'Active Trucks', value: stats.active_trucks, color: 'green', icon: '\u{1F69A}' },
    { label: 'Idle Trucks', value: stats.idle_trucks, color: 'amber', icon: '\u23F8' },
    { label: 'Maintenance', value: stats.maintenance_trucks, color: 'red', icon: '\u{1F527}' },
    { label: 'Active Routes', value: stats.active_routes, color: 'blue', icon: '\u{1F4CD}' },
    { label: 'Completed Today', value: stats.completed_today, color: 'green', icon: '\u2705' },
    { label: 'On-Time Perf.', value: `${stats.on_time_performance}%`, color: 'blue', icon: '\u23F1' },
  ]

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-sub">Real-time fleet overview</p>
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <div className={`stat-card stat-${c.color}`} key={c.label}>
            <div className="stat-top">
              <span className="stat-value">{c.value}</span>
              <span className="stat-icon">{c.icon}</span>
            </div>
            <span className="stat-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="grid-2col">
        <div className="card">
          <div className="card-header">
            <h3>Live Dispatch Board</h3>
          </div>
          <div className="card-body">
            {routes.length === 0 ? (
              <p className="empty">No routes assigned</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Driver</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.slice(0, 5).map((r) => (
                    <tr key={r.id}>
                      <td className="td-name">{r.name}</td>
                      <td>{r.driver?.name || '—'}</td>
                      <td>{r.origin}</td>
                      <td>{r.destination}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="card-body">
            {activity.length === 0 ? (
              <p className="empty">No recent activity</p>
            ) : (
              <div className="feed">
                {activity.slice(0, 8).map((a, i) => (
                  <div className="feed-item" key={i}>
                    <span className="feed-dot" />
                    <div>
                      <p>{a.message}</p>
                      <small>{new Date(a.timestamp).toLocaleTimeString()}</small>
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
