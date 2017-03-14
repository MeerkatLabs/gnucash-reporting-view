/**
 * Define the formatters that are going to be used by the constant.  This will prevent them from being constructed each
 * time they are executed.
 * @type {{currency: *, currencyNoParts: *}}
 * @private
 */
var _formatters = {
    // Currency with parts.
    currency: d3.format('$,.02f'),

    // Currency with no parts.
    currencyNoParts: d3.format('$,'),

    // Date formatter %x
    date: d3.time.format('%x'),

    // Percentage formatter
    percentage: d3.format('.02%')

};

angular.module('gnucash-reports-view.reports')
    .constant('formatters', {

        /**
         * Full currency including parts.
         * @param d decimal
         * @returns {*}
         */
        currency: function(d) {
            return _formatters.currency(d);
        },

        /**
         * Currency String without the parts of a currency.
         * @param d decimal
         * @returns {*}
         */
        currencyNoParts: function(d) {
            return _formatters.currencyNoParts(d);
        },

        /**
         * Converts the time in seconds into a date using the %x formatter.
         * @param timeInSeconds
         * @returns {*}
         */
        date: function(timeInSeconds) {
            return _formatters.date(new Date(timeInSeconds*1000));
        },

        /**
         * Converts the value into a percentage.
         */
        percentage: function(value) {
            return _formatters.percentage(value);
        }
    });
