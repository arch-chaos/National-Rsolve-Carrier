export default function Contact() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Support</h1>
        <p className="page-sub">Operational coordination and help desk</p>
      </div>

      <div className="grid-2col">
        <div className="card">
          <div className="card-header"><h3>Contact Information</h3></div>
          <div className="card-body">
            <div className="contact-detail">
              <span className="contact-label">Email</span>
              <span>ops@nationalresolvecarrier.com</span>
            </div>
            <div className="contact-detail">
              <span className="contact-label">Phone</span>
              <span>+1 (555) 014-2048</span>
            </div>
            <div className="contact-detail">
              <span className="contact-label">Priority</span>
              <span>Dispatch desk &amp; fleet coordination</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Log Request</h3></div>
          <div className="card-body">
            <form onSubmit={(e) => { e.preventDefault(); alert('Request submitted (demo)') }}>
              <div className="form-group">
                <label>Request Title</label>
                <input type="text" placeholder="Brief description" required />
              </div>
              <div className="form-group">
                <label>Operator Email</label>
                <input type="email" placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={4} placeholder="Describe the issue or routing requirement" required />
              </div>
              <button type="submit" className="btn btn-primary">Log Request</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
