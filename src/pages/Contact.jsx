function Contact() {
  return (
    <section className="section contact-section">
      <div className="section-heading">
        <p className="eyebrow">Admin support</p>
        <h2>Support and operational coordination.</h2>
      </div>
      <div className="contact-grid">
        <div className="contact-details">
          <h3>Internal contact</h3>
          <p>Email: ops@nationalresolvecarrier.com</p>
          <p>Phone: +1 (555) 014-2048</p>
          <p>Priority: Dispatch desk and fleet coordination</p>
        </div>
        <div className="contact-form">
          <input type="text" placeholder="Request title" />
          <input type="email" placeholder="Operator email" />
          <textarea rows="4" placeholder="Describe the issue or routing requirement" />
          <button type="button">Log request</button>
        </div>
      </div>
    </section>
  )
}

export default Contact
