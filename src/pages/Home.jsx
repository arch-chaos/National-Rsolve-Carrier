import { Link } from 'react-router-dom'

const fleetCards = [
  { title: 'Active trucks', value: '24', detail: '18 currently moving' },
  { title: 'Idle trucks', value: '6', detail: 'Awaiting dispatch' },
  { title: 'Delivery status', value: '92%', detail: 'On-time performance' },
]

const routes = [
  { name: 'North Corridor', status: 'On schedule', driver: 'M. Khan', eta: '14:30' },
  { name: 'Coastal Run', status: 'Delay 12 min', driver: 'S. Ali', eta: '16:00' },
  { name: 'Central Hub', status: 'Ready', driver: 'R. Thomas', eta: '10:45' },
]

const activityFeed = [
  'Truck TR-04 sent new GPS ping at 09:42',
  'Route reassigned for Truck TR-11',
  'Delivery completed for Route 17',
]

function Home() {
  return (
    <>
      <section className="hero admin-hero">
        <div className="hero-copy">
          <p className="eyebrow">Control center</p>
          <h1>Track vehicles, manage dispatch, and monitor route progress from one operational view.</h1>
          <p>
            Live fleet information is displayed here for dispatchers to review current activity, assign work, and respond to service issues quickly.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/services">Open operations</Link>
            <Link className="btn btn-secondary" to="/contact">Support queue</Link>
          </div>
        </div>

        <div className="hero-panel">
          <h3>Today’s operations</h3>
          <ul>
            <li>Fleet tracking active</li>
            <li>Route updates in progress</li>
            <li>Dispatch actions pending</li>
          </ul>
        </div>
      </section>

      <section className="stats-section" aria-label="Fleet summary">
        {fleetCards.map((card) => (
          <article className="stat-card" key={card.title}>
            <strong>{card.value}</strong>
            <span>{card.title}</span>
            <small>{card.detail}</small>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Route overview</p>
          <h2>Live dispatch board</h2>
        </div>
        <div className="table-card">
          {routes.map((route) => (
            <div className="table-row" key={route.name}>
              <div>
                <strong>{route.name}</strong>
                <p>{route.driver}</p>
              </div>
              <div className="row-meta">
                <span className="meta-text">ETA {route.eta}</span>
                <span className="status-pill">{route.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Operations feed</p>
          <h2>Recent activity</h2>
        </div>
        <div className="feed-card">
          {activityFeed.map((item) => (
            <div className="feed-item" key={item}>
              <span className="dot" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
