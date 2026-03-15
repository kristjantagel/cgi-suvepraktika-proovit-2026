import TableShape from './TableShape.jsx';
import './FloorPlan.css';

/**
 * @param {Object}   props
 * @param {import('../types/index.js').Table[]} props.tables
 * @param {number|null}  props.recommendedTableId
 * @param {number|null}  props.selectedTableId
 * @param {(table: import('../types/index.js').Table) => void} props.onTableSelect
 * @param {boolean}  props.isLoading
 */
function FloorPlan({ tables, recommendedTableId, selectedTableId, onTableSelect, isLoading, filterZone }) {
  const isEmpty = tables.length === 0;

  return (
    <div className="floor-plan-wrapper">
      {isEmpty && !isLoading ? (
        <div className="floor-plan-placeholder">
          Search for available tables above
        </div>
      ) : isEmpty && isLoading ? (
        <div className="floor-plan-placeholder">
          Loading restaurant floor plan...
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          width="100%"
          style={{ maxHeight: '560px' }}
          aria-label="Restaurant floor plan"
          role="img"
        >
          {/* Zone labels */}
          <text x="20" y="4" className="zone-label">Indoor</text>
          <text x="68" y="4" className="zone-label">Terrace</text>
          <text x="68" y="58" className="zone-label">Private Room</text>

          {/* Zone dividers */}
          <line x1="50" y1="0" x2="50" y2="100" className="zone-divider" />
          <line x1="50" y1="55" x2="100" y2="55" className="zone-divider" />

          {/* Tables */}
          {tables.map(table => (
            <TableShape
              key={table.id}
              table={table}
              isRecommended={table.id === recommendedTableId}
              isSelected={table.id === selectedTableId}
              onSelect={onTableSelect}
              isDimmed={!!filterZone && table.zone !== filterZone}
            />
          ))}

          {/* No-results message when tables array is empty after a search */}
          {tables.length === 0 && !isLoading && (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '4px', fill: '#999', fontFamily: 'system-ui, sans-serif' }}
            >
              No tables available
            </text>
          )}
        </svg>
      )}

      {isLoading && (
        <div className="floor-plan-loading-overlay" aria-live="polite" aria-busy="true">
          <div className="floor-plan-spinner" aria-hidden="true" />
          Loading floor plan...
        </div>
      )}

      {!isEmpty && (
        <div className="floor-plan-legend" aria-label="Floor plan legend">
          <div className="legend-item">
            <div className="legend-dot legend-dot--available" aria-hidden="true" />
            Available
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot--occupied" aria-hidden="true" />
            Occupied
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot--recommended" aria-hidden="true" />
            Recommended
          </div>
          <div className="legend-item">
            <div className="legend-dot legend-dot--selected" aria-hidden="true" />
            Selected
          </div>
          {filterZone && (
            <div className="legend-item">
              <div className="legend-dot legend-dot--available" style={{ opacity: 0.35 }} aria-hidden="true" />
              Outside filter
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FloorPlan;
