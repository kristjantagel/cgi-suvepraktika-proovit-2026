import { useState } from 'react';
import './BookingPanel.css';

/** @param {string} zone @returns {string} */
function humanZone(zone) {
  if (zone === 'PRIVATE_ROOM') return 'Private Room';
  if (zone === 'TERRACE') return 'Terrace';
  return 'Indoor';
}

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'\-]{2,100}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @param {string} name @returns {boolean} */
function isValidName(name) {
  return NAME_REGEX.test(name.trim());
}

/** @param {string} email @returns {boolean} */
function isValidEmail(email) {
  return EMAIL_REGEX.test(email.trim());
}

/** @param {string[]} features @returns {string} */
function humanFeatures(features) {
  if (!features || features.length === 0) return 'None';
  return features
    .map(f => f.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()))
    .join(', ');
}

/** @param {string} isoDate @returns {string} */
function humanDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

/** @param {string} timeStr - "HH:mm:ss" @returns {string} */
function humanTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m), 0);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/**
 * @param {Object}   props
 * @param {import('../types/index.js').Table}                   props.table
 * @param {import('../types/index.js').RecommendationRequest}   props.searchParams
 * @param {boolean}  props.isRecommended
 * @param {(guestName: string, guestEmail: string) => void}     props.onConfirm
 * @param {() => void} props.onCancel
 */
function BookingPanel({ table, searchParams, isRecommended, onConfirm, onCancel }) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false });

  const nameInvalid = touched.name && !isValidName(guestName);
  const emailInvalid = touched.email && !isValidEmail(guestEmail);
  const partySizeExceeds = searchParams && searchParams.partySize > table.capacity;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (!isValidName(guestName) || !isValidEmail(guestEmail) || partySizeExceeds) return;
    onConfirm(guestName.trim(), guestEmail.trim());
  };

  return (
    <section className="booking-panel" aria-label="Booking details">
      <h2>Reserve Table</h2>
      <p className="booking-subtitle">Complete your reservation</p>

      {isRecommended && (
        <div className="booking-recommended-badge" role="status">
          Recommended for you
        </div>
      )}

      <div className="booking-table-info" aria-label="Table details">
        <dl>
          <dt>Zone</dt>
          <dd>{humanZone(table.zone)}</dd>

          <dt>Seats</dt>
          <dd>{table.capacity}</dd>

          <dt>Features</dt>
          <dd>{humanFeatures(table.features)}</dd>
        </dl>
      </div>

      {searchParams && (
        <div className="booking-search-summary" aria-label="Booking summary">
          <span className="booking-tag">{humanDate(searchParams.date)}</span>
          <span className="booking-tag">{humanTime(searchParams.startTime)}</span>
          <span className="booking-tag">{searchParams.partySize} {searchParams.partySize === 1 ? 'guest' : 'guests'}</span>
        </div>
      )}

      <form className="booking-form" onSubmit={handleSubmit} noValidate>
        <div className="booking-field">
          <label htmlFor="bp-name">Full Name <span aria-hidden="true">*</span></label>
          <input
            id="bp-name"
            type="text"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            placeholder="Jane Smith"
            required
            aria-required="true"
            aria-invalid={nameInvalid ? 'true' : undefined}
            aria-describedby={nameInvalid ? 'bp-name-err' : undefined}
            className={nameInvalid ? 'booking-field--error' : ''}
            autoComplete="name"
          />
          {nameInvalid && (
            <span id="bp-name-err" role="alert" style={{ fontSize: '0.78rem', color: '#e74c3c' }}>
              Please enter a valid name (letters, spaces, hyphens only)
            </span>
          )}
        </div>

        <div className="booking-field">
          <label htmlFor="bp-email">Email Address <span aria-hidden="true">*</span></label>
          <input
            id="bp-email"
            type="email"
            value={guestEmail}
            onChange={e => setGuestEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            placeholder="jane@example.com"
            required
            aria-required="true"
            aria-invalid={emailInvalid ? 'true' : undefined}
            aria-describedby={emailInvalid ? 'bp-email-err' : undefined}
            className={emailInvalid ? 'booking-field--error' : ''}
            autoComplete="email"
          />
          {emailInvalid && (
            <span id="bp-email-err" role="alert" style={{ fontSize: '0.78rem', color: '#e74c3c' }}>
              Please enter a valid email address
            </span>
          )}
        </div>

        {partySizeExceeds && (
          <p role="alert" style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '10px' }}>
            This table seats {table.capacity} — your party of {searchParams.partySize} is too large. Please select a bigger table.
          </p>
        )}

        <div className="booking-actions">
          <button type="submit" className="booking-confirm-btn" disabled={partySizeExceeds}>
            Confirm Booking
          </button>
          <button type="button" className="booking-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default BookingPanel;
