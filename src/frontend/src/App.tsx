import "./maintenance.css";

export default function App() {
  return (
    <div className="maintenance-root">
      <div className="maintenance-card">
        <img
          src="/assets/uploads/nira_rebel_photo-019d1c52-1b51-77f0-b8ce-2159e2ba622a.jpeg"
          alt="Nira Rebel HR Agency"
          className="maintenance-logo"
        />

        <h1 className="maintenance-heading">We Have Moved</h1>

        <p className="maintenance-body">
          This website has moved to a new address. Please visit us at:
        </p>

        <a
          href="https://nirarebelhragency.com"
          target="_blank"
          rel="noopener noreferrer"
          className="maintenance-link"
        >
          nirarebelhragency.com
        </a>

        <p className="maintenance-note">
          Thank you for your continued support &mdash; Nira Rebel HR Agency
        </p>
      </div>
    </div>
  );
}
