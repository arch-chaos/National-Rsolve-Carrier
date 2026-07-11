import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = () =>
    api.getDrivers().then((r) => setDrivers(r.drivers)).catch(console.error)

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this driver?')) return
    try {
      await api.deleteDriver(id)
      load()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    await api.createDriver({
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      license_number: fd.get('license_number'),
    })
    setShowForm(false)
    load()
  }

  if (loading) return <div className="loading">Loading drivers...</div>

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Drivers</h1>
          <p className="page-sub">Manage driver records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Driver'}
        </button>
      </div>

      {showForm && (
        <div className="card mb">
          <div className="card-header"><h3>New Driver</h3></div>
          <div className="card-body">
            <form className="form-inline" onSubmit={handleAdd}>
              <div className="form-group">
                <label>Name</label>
                <input name="name" required placeholder="Full name" />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" required placeholder="+1-555-0100" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" placeholder="driver@nrc.com" />
              </div>
              <div className="form-group">
                <label>License #</label>
                <input name="license_number" placeholder="LIC-XXX" />
              </div>
              <button type="submit" className="btn btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>All Drivers</h3>
          <span className="badge">{drivers.length} drivers</span>
        </div>
        <div className="card-body">
          {drivers.length === 0 ? (
            <p className="empty">No drivers registered</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>License</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td className="td-name">{d.name}</td>
                    <td>{d.phone}</td>
                    <td>{d.email || '—'}</td>
                    <td>{d.license_number}</td>
                    <td>
                      <button className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(d.id)}>Delete</button>
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
