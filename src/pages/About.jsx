function About() {
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Overview</p>
        <h2>Internal transport management workspace.</h2>
      </div>
      <div className="about-grid">
        <p>
          This portal is used by dispatch and operations staff to monitor fleet movement, review route status, and manage transport activity across the business.
        </p>
        <p>
          The interface is structured for daily operational use and will connect to backend services for live vehicle data, route assignment, and reporting once those services are available.
        </p>
      </div>
    </section>
  )
}

export default About
