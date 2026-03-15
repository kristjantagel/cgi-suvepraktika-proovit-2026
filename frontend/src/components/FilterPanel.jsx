import { useState } from 'react';
import './FilterPanel.css';

/** @returns {string} today as "YYYY-MM-DD" */
function todayString() {
  return new Date().toISOString().slice(0, 10);
}

/** @returns {string} next full hour as "HH:mm" */
function nextFullHour() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const hh = String(d.getHours()).padStart(2, '0');
  return `${hh}:00`;
}

const PREFERENCES = [
  { value: 'QUIET',          label: 'Quiet / Private' },
  { value: 'WINDOW_SEAT',    label: 'Window Seat' },
  { value: 'NEAR_PLAY_AREA', label: 'Near Play Area' },
];

const ZONES = [
  { value: '',             label: 'All Zones' },
  { value: 'INDOOR',       label: 'Indoor' },
  { value: 'TERRACE',      label: 'Terrace' },
  { value: 'PRIVATE_ROOM', label: 'Private Room' },
];

/**
 * @param {Object} props
 * @param {(params: import('../types/index.js').RecommendationRequest) => void} props.onSearch
 */
function FilterPanel({ onSearch }) {
  const [date, setDate] = useState(todayString());
  const [time, setTime] = useState(nextFullHour());
  const [partySize, setPartySize] = useState(2);
  const [zone, setZone] = useState('');
  const [preferences, setPreferences] = useState(/** @type {string[]} */ ([]));

  const togglePreference = (value) => {
    setPreferences(prev =>
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format time as HH:mm:ss for the backend LocalTime type
    const startTime = time.length === 5 ? `${time}:00` : time;

    /** @type {import('../types/index.js').RecommendationRequest} */
    const params = {
      date,
      startTime,
      partySize: Number(partySize),
      zone: zone || null,
      preferences,
      tableId: null,
      guestName: null,
      guestEmail: null,
    };

    onSearch(params);
  };

  return (
    <aside className="filter-panel" aria-label="Search filters">
      <h2>Find a Table</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="filter-group">
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="fp-date">Date</label>
              <input
                id="fp-date"
                type="date"
                value={date}
                min={todayString()}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div className="filter-field">
              <label htmlFor="fp-time">Time</label>
              <input
                id="fp-time"
                type="time"
                value={time}
                min={date === todayString() ? nextFullHour() : '00:00'}
                max="22:00"
                onChange={e => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="filter-field">
            <label htmlFor="fp-party">Party Size</label>
            <select
              id="fp-party"
              value={partySize}
              onChange={e => setPartySize(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="fp-zone">Zone</label>
            <select
              id="fp-zone"
              value={zone}
              onChange={e => setZone(e.target.value)}
            >
              {ZONES.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>
        </div>

        <hr className="filter-divider" />

        <div className="filter-field" style={{ marginBottom: '18px' }}>
          <span
            id="fp-prefs-label"
            style={{ fontSize: '0.8rem', fontWeight: 500, color: '#555', marginBottom: '8px', display: 'block' }}
          >
            Preferences
          </span>
          <div className="filter-checkboxes" role="group" aria-labelledby="fp-prefs-label">
            {PREFERENCES.map(pref => (
              <label key={pref.value} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={preferences.includes(pref.value)}
                  onChange={() => togglePreference(pref.value)}
                />
                {pref.label}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="filter-search-btn">
          Find Table
        </button>
      </form>
    </aside>
  );
}

export default FilterPanel;
