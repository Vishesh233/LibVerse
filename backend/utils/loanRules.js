const { FINE_PER_DAY } = require('./fineCalculator');

/**
 * Lending rules in one place: loans, renewals and the library card's back all read these.
 */
const LOAN_DAYS = 14; // a new loan is due this many days after it is issued
const RENEWAL_DAYS = 7; // each renewal adds this many days
const MAX_RENEWALS = 3;

module.exports = { LOAN_DAYS, RENEWAL_DAYS, MAX_RENEWALS, FINE_PER_DAY };
