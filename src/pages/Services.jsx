const services = [
  {
    title: 'Vehicle monitoring',
    description: 'View current truck status, movement activity, and location data from the operations dashboard.',
  },
  {
    title: 'Route control',
    description: 'Assign routes, update trip progress, and manage vehicle movement from the dispatch view.',
  },
  {
    title: 'Reporting',
    description: 'Review trip history, delivery outcomes, and operational activity for planning and review.',
  },
]

const vehicles = [
  { id: 'TR-04', status: 'On route', location: 'North Hub', eta: '14:30' },
  { id: 'TR-11', status: 'Paused', location: 'West Gate', eta: '16:00' },
  { id: 'TR-18', status: 'Ready', location: 'Central Yard', eta: '10:45' },
]

function Services() {
  return (
    <>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Operations</p>
          <h2>Fleet control view</h2>
        </div>

        <div className="operations-grid">
          <div className="map-panel">
            <div className="map-overlay">
              <span className="map-label">Live route map</span>
              <div className="map-route" />
              <div className="map-pin pin-a">TR-04</div>
              <div className="map-pin pin-b">TR-11</div>
              <div className="map-pin pin-c">TR-18</div>
            </div>
          </div>

          <div className="operations-side">
            <div className="panel-card">
              <h3>Vehicle status</h3>
              {vehicles.map((vehicle) => (
                <div className="vehicle-row" key={vehicle.id}>
                  <div>
                    <strong>{vehicle.id}</strong>
                    <p>{vehicle.location}</p>
                  </div>
                  <span className="status-pill">{vehicle.status}</span>
                </div>
              ))}
            </div>

            <div className="panel-card">
              <h3>Dispatch actions</h3>
              <button className="action-btn">Assign route</button>
              <button className="action-btn secondary">Flag delay</button>
              <button className="action-btn secondary">View reports</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Admin tools</p>
          <h2>Core modules for managing transport operations.</h2>
        </div>
        <div className="card-grid">
          {services.map((service) => (
            <article className="info-card" key={service.title}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Services
