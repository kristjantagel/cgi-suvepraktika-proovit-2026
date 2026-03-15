/**
 * @typedef {'INDOOR' | 'TERRACE' | 'PRIVATE_ROOM'} Zone
 * @typedef {'QUIET' | 'WINDOW_SEAT' | 'NEAR_PLAY_AREA'} Preference
 * @typedef {'AVAILABLE' | 'OCCUPIED'} TableStatus
 */

/**
 * A table returned by the recommendation endpoint.
 * All positional values (x, y, width, height) are in SVG viewBox percentage units (0-100).
 *
 * @typedef {Object} Table
 * @property {number}        id
 * @property {number}        capacity
 * @property {Zone}          zone
 * @property {number}        x
 * @property {number}        y
 * @property {number}        width
 * @property {number}        height
 * @property {Preference[]}  features
 * @property {TableStatus}   status
 */

/**
 * @typedef {Object} RecommendationRequest
 * @property {string}        date         - "YYYY-MM-DD"
 * @property {string}        startTime    - "HH:mm:ss"
 * @property {number}        partySize
 * @property {Zone|null}     [zone]
 * @property {Preference[]}  [preferences]
 * @property {number|null}   [tableId]
 * @property {string|null}   [guestName]
 * @property {string|null}   [guestEmail]
 */

/**
 * @typedef {Object} RecommendationResponse
 * @property {Table[]} tables
 * @property {number}  recommendedTableId
 */

/**
 * @typedef {Object} ReservationRequest
 * @property {string}        date
 * @property {string}        startTime
 * @property {number}        partySize
 * @property {Zone|null}     [zone]
 * @property {Preference[]}  [preferences]
 * @property {number}        tableId
 * @property {string}        guestName
 * @property {string}        guestEmail
 */

/**
 * The confirmed booking details stored in state after a successful reservation.
 *
 * @typedef {Object} ConfirmedBooking
 * @property {number}  tableId
 * @property {number}  capacity
 * @property {Zone}    zone
 * @property {string}  date
 * @property {string}  startTime
 * @property {number}  partySize
 * @property {string}  guestName
 */
