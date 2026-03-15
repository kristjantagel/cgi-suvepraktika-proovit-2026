import { useState, useEffect } from 'react';
import { fetchRecommendation, createReservation, fetchTables } from './api/tables.js';
import FilterPanel from './components/FilterPanel.jsx';
import FloorPlan from './components/FloorPlan.jsx';
import BookingPanel from './components/BookingPanel.jsx';
import ConfirmationView from './components/ConfirmationView.jsx';
import './App.css';

function App() {
  /** @type {[import('./types/index.js').Table[], Function]} */
  const [tables, setTables] = useState([]);
  const [recommendedTableId, setRecommendedTableId] = useState(/** @type {number|null} */ (null));
  const [selectedTableId, setSelectedTableId] = useState(/** @type {number|null} */ (null));
  /** @type {[import('./types/index.js').RecommendationRequest|null, Function]} */
  const [searchParams, setSearchParams] = useState(null);
  /** @type {['idle'|'confirming'|'confirmed'|'error', Function]} */
  const [bookingState, setBookingState] = useState('idle');
  /** @type {[import('./types/index.js').ConfirmedBooking|null, Function]} */
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(/** @type {string|null} */ (null));

  // Load floor plan on initial mount so the user sees the restaurant layout immediately
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    // Clamp hours to valid range: start max 22:00, end max 23:59
    const startHour = Math.min(d.getHours(), 22);
    const endHour = Math.min(startHour + 2, 23);
    const start = `${String(startHour).padStart(2, '0')}:00:00`;
    const end = `${String(endHour).padStart(2, '0')}:00:00`;

    setIsLoading(true);
    fetchTables(today, start, end)
      .then(data => setTables(data))
      .catch(() => {}) // silent fail on initial load
      .finally(() => setIsLoading(false));
  }, []);

  /** @param {import('./types/index.js').RecommendationRequest} params */
  const handleSearch = async (params) => {
    setError(null);
    setIsLoading(true);
    setSelectedTableId(null);
    setBookingState('idle');
    setSearchParams(params);

    try {
      const data = await fetchRecommendation(params);
      setTables(data.tables);
      setRecommendedTableId(data.recommendedTableId);
      // Auto-select the recommended table if it is available
      if (data.recommendedTableId) {
        const rec = data.tables.find(t => t.id === data.recommendedTableId);
        if (rec && rec.status === 'AVAILABLE') {
          setSelectedTableId(data.recommendedTableId);
          setBookingState('confirming');
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load tables. Please try again.';
      setError(msg);
      setTables([]);
      setRecommendedTableId(null);
    } finally {
      setIsLoading(false);
    }
  };

  /** @param {import('./types/index.js').Table} table */
  const handleTableSelect = (table) => {
    if (table.status !== 'AVAILABLE') return;
    if (!searchParams) {
      setError('Please use the filter above to select a date, time, and party size before booking.');
      return;
    }
    setSelectedTableId(table.id);
    setBookingState('confirming');
    setError(null);
  };

  /**
   * @param {string} guestName
   * @param {string} guestEmail
   */
  const handleConfirm = async (guestName, guestEmail) => {
    if (!selectedTableId || !searchParams) return;

    setError(null);
    setIsLoading(true);

    /** @type {import('./types/index.js').ReservationRequest} */
    const body = {
      ...searchParams,
      tableId: selectedTableId,
      guestName,
      guestEmail,
    };

    try {
      await createReservation(body);

      const selectedTable = tables.find(t => t.id === selectedTableId);

      /** @type {import('./types/index.js').ConfirmedBooking} */
      const booking = {
        tableId: selectedTableId,
        capacity: selectedTable?.capacity ?? 0,
        zone: selectedTable?.zone ?? 'INDOOR',
        date: searchParams.date,
        startTime: searchParams.startTime,
        partySize: searchParams.partySize,
        guestName,
      };

      setConfirmedBooking(booking);
      setBookingState('confirmed');

      // Optimistically mark the booked table as OCCUPIED immediately so the
      // floor plan reflects the new state even before the async refresh returns
      setTables(prev =>
        prev.map(t => t.id === selectedTableId ? { ...t, status: 'OCCUPIED' } : t)
      );

      // Also refresh from server for full accuracy (e.g. other concurrent bookings)
      try {
        const refreshed = await fetchRecommendation(searchParams);
        setTables(refreshed.tables);
        setRecommendedTableId(refreshed.recommendedTableId);
      } catch {
        // Non-critical — floor plan refresh failing shouldn't surface as an error
        // The optimistic update above already covers the booked table
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('This table was just taken by another guest. Please select a different table.');
        setSelectedTableId(null);
        setBookingState('idle');
        // Refresh floor plan to show updated availability
        try {
          const refreshed = await fetchRecommendation(searchParams);
          setTables(refreshed.tables);
          setRecommendedTableId(refreshed.recommendedTableId);
        } catch {
          // ignore
        }
      } else if (status === 400) {
        setError('Please check your details and try again.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Booking failed. Please try again.');
      }
      setBookingState(selectedTableId ? 'confirming' : 'idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedTableId(null);
    setBookingState('idle');
    setError(null);
  };

  const handleReset = () => {
    setRecommendedTableId(null);
    setSelectedTableId(null);
    setBookingState('idle');
    setConfirmedBooking(null);
    setError(null);
    // Re-fetch with current search params to ensure floor plan is fresh
    if (searchParams) {
      const end = searchParams.startTime.replace(/(\d+):/, (_, h) => `${String(Number(h) + 2).padStart(2, '0')}:`);
      fetchTables(searchParams.date, searchParams.startTime, end)
        .then(data => setTables(data))
        .catch(() => {});
    }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo" aria-hidden="true">BV</div>
          <div>
            <h1 className="app-title">Bella Vista</h1>
            <p className="app-tagline">Reserve your table</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="app-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className="app-layout">
          {/* Left column: floor plan */}
          <section className="app-col-floor" aria-label="Restaurant floor plan">
            <FloorPlan
              tables={tables}
              recommendedTableId={recommendedTableId}
              selectedTableId={selectedTableId}
              onTableSelect={handleTableSelect}
              isLoading={isLoading}
              filterZone={searchParams?.zone || null}
            />
          </section>

          {/* Right column: filter + booking/confirmation */}
          <aside className="app-col-panel">
            <FilterPanel onSearch={handleSearch} />

            {bookingState === 'confirmed' && confirmedBooking ? (
              <ConfirmationView booking={confirmedBooking} onReset={handleReset} />
            ) : bookingState === 'confirming' && selectedTable ? (
              <BookingPanel
                table={selectedTable}
                searchParams={searchParams}
                isRecommended={selectedTableId === recommendedTableId}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ) : null}
          </aside>
        </div>
      </main>

      <footer className="app-footer">
        <p>Bella Vista Restaurant &mdash; Table Reservation System</p>
      </footer>
    </div>
  );
}

export default App;
