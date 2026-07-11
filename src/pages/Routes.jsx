import { useState, useEffect } from 'react'
import { api } from '../api'

export default function RoutesPage() {
  const [routes, setRoutes] = useState([])
  const [trucks, setTrucks] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = () =>
    api.getRoutes().then((r) => setRoutes(r.routes)).catch(console.error)

  useEffect(() => {
    Promise.all([
      load(),
      api.getTrucks().then((r) => setTrucks(r.trucks)),
      api.getDrivers().then((r) => setDrivers(r.drivers)),
    ]).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this route?')) return
    await api.deleteRoute(id)
    load()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await api.createRoute({
      name: fd.get('name'),
      origin: fd.get('origin'),
      destination: fd.get('destination'),
      status: fd.get('status'),
      truck_id: fd.get('truck_id') ? Number(fd.get('truck_id')) : null,
      driver_id: fd.get('driver_id') ? Number(fd.get('driver_id')) : null,
    })
    setShowForm(false)
    load()
  }

  const handleStatusUpdate = async (id, status) => {
    await api.updateRoute(id, { status })
    load()
  }

  if (loading) return <div className="loading">Loading routes...</div>

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Routes</h1>
          <p className="page-sub">Dispatch and route management</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Route'}
        </button>
      </div>

      {showForm && (
        <div className="card mb">
          <div className="card-header"><h3>Create Route</h3></div>
          <div className="card-body">
            <form className="form-grid" onSubmit={handleAdd}>
              <div className="form-group">
                <label>Route Name</label>
                <input name="name" required placeholder="e.g. North Corridor" />
              </div>
              <div className="form-group">
                <label>Origin</label>
                <input name="origin" required placeholder="e.g. North Hub" />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input name="destination" required placeholder="e.g. City Center" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" defaultValue="pending">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Truck</label>
                <select name="truck_id">
                  <option value="">— None —</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>{t.plate_number}</option>
                  ))}
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
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Create Route</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>All Routes</h3>
          <span className="badge">{routes.length} routes</span>
        </div>
        <div className="card-body">
          {routes.length === 0 ? (
            <p className="empty">No routes created</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Truck</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.id}>
                    <td className="td-name">{r.name}</td>
                    <td>{r.origin}</td>
                    <td>{r.destination}</td>
                    <td>{r.truck?.plate_number || '—'}</td>
                    <td>{r.driver?.name || '—'}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>
                      <div className="action-group">
                        <select className="btn btn-sm" defaultValue=""
                          onChange={(e) => e.value && handleStatusUpdate(r.id, e.target.value)}>
                          <option value="" disabled>Update</option>
                          <option value="in_progress">Start</option>
                          <option value="completed">Complete</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(r.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
