/**
 * @param {Object}  props
 * @param {import('../types/index.js').Table} props.table
 * @param {boolean} props.isRecommended
 * @param {boolean} props.isSelected
 * @param {(table: import('../types/index.js').Table) => void} props.onSelect
 * @param {boolean} [props.isDimmed]
 */
function TableShape({ table, isRecommended, isSelected, onSelect, isDimmed }) {
  const { id, capacity, zone, x, y, width, height, features, status } = table;

  const isAvailable = status === 'AVAILABLE';
  const isInteractive = isAvailable && !isDimmed;

  let className = 'table-occupied';
  if (isAvailable) {
    className = isRecommended && !isDimmed ? 'table-recommended' : 'table-available';
  }
  if (isSelected && !isDimmed) {
    className += ' table-selected';
  }

  const handleClick = () => {
    if (isInteractive) {
      onSelect(table);
    }
  };

  const featureLabel = features.length > 0
    ? features.map(f => f.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())).join(', ')
    : 'None';

  const zoneLabel = zone === 'PRIVATE_ROOM' ? 'Private Room'
    : zone === 'TERRACE' ? 'Terrace'
    : 'Indoor';

  const tooltipText = `Zone: ${zoneLabel} | Seats: ${capacity} | Features: ${featureLabel}`;

  const cx = x + width / 2;
  const cy = y + height / 2;

  const groupStyle = isDimmed ? { opacity: 0.35, cursor: 'default' } : undefined;

  return (
    <g
      className={className}
      onClick={handleClick}
      style={groupStyle}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? `Table ${id}, ${zoneLabel}, seats ${capacity}. Click to select.` : `Table ${id}, ${zoneLabel}, seats ${capacity}. ${isDimmed ? 'Outside filter.' : 'Occupied.'}`}
      aria-pressed={isSelected && !isDimmed ? 'true' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(table); } } : undefined}
    >
      <title>{tooltipText}</title>
      <rect x={x} y={y} width={width} height={height} rx="0.5" ry="0.5" />
      <text x={cx} y={cy}>{capacity}p</text>
    </g>
  );
}

export default TableShape;
