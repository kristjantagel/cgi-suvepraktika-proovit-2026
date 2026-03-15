import { useState, useEffect } from 'react';
import { fetchMealSuggestion } from '../api/tables.js';
import './ConfirmationView.css';

/** @param {string} zone @returns {string} */
function humanZone(zone) {
  if (zone === 'PRIVATE_ROOM') return 'Private Room';
  if (zone === 'TERRACE') return 'Terrace';
  return 'Indoor';
}

/** @param {string} isoDate @returns {string} */
function humanDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

/** @param {string} timeStr @returns {string} */
function humanTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m), 0);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/**
 * @param {Object}   props
 * @param {import('../types/index.js').ConfirmedBooking} props.booking
 * @param {() => void} props.onReset
 */
function ConfirmationView({ booking, onReset }) {
  const [meal, setMeal] = useState(/** @type {{name: string, category?: string, area?: string, thumbnailUrl?: string}|null} */ (null));

  useEffect(() => {
    fetchMealSuggestion()
      .then(data => setMeal(data))
      .catch(() => {}); // graceful degradation — show nothing if fetch fails
  }, []);

  return (
    <section className="confirmation-view" aria-live="polite">
      <div className="confirmation-icon" aria-hidden="true">
        <svg viewBox="0 0 52 52" width="52" height="52" fill="none">
          <circle cx="26" cy="26" r="25" stroke="#2ecc71" strokeWidth="2" />
          <polyline points="14,27 22,35 38,18" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="confirmation-heading">Booking Confirmed!</h2>
      <p className="confirmation-sub">
        Your reservation has been created. See you soon, {booking.guestName}!
      </p>

      <div className="confirmation-card" aria-label="Reservation summary">
        <dl className="confirmation-dl">
          <div className="confirmation-row">
            <dt>Guest</dt>
            <dd>{booking.guestName}</dd>
          </div>
          <div className="confirmation-row">
            <dt>Date</dt>
            <dd>{humanDate(booking.date)}</dd>
          </div>
          <div className="confirmation-row">
            <dt>Time</dt>
            <dd>{humanTime(booking.startTime)}</dd>
          </div>
          <div className="confirmation-row">
            <dt>Party Size</dt>
            <dd>{booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}</dd>
          </div>
          <div className="confirmation-row">
            <dt>Zone</dt>
            <dd>{humanZone(booking.zone)}</dd>
          </div>
          <div className="confirmation-row">
            <dt>Table Capacity</dt>
            <dd>{booking.capacity} seats</dd>
          </div>
        </dl>
      </div>

      {meal && (
        <div className="meal-suggestion" aria-label="Today's meal recommendation">
          <h3 className="meal-suggestion-heading">Today's Recommendation</h3>
          <div className="meal-suggestion-content">
            {meal.thumbnailUrl && (
              <img
                className="meal-suggestion-img"
                src={meal.thumbnailUrl}
                alt={meal.name}
                width="80"
                height="80"
                loading="lazy"
              />
            )}
            <div className="meal-suggestion-text">
              <p className="meal-suggestion-name">{meal.name}</p>
              {(meal.category || meal.area) && (
                <p className="meal-suggestion-meta">
                  {[meal.category, meal.area].filter(Boolean).join(' · ')}
                </p>
              )}
              <p className="meal-suggestion-note">Pair your visit with our chef's suggestion</p>
            </div>
          </div>
        </div>
      )}

      <button className="confirmation-reset-btn" onClick={onReset}>
        Make Another Reservation
      </button>
    </section>
  );
}

export default ConfirmationView;
