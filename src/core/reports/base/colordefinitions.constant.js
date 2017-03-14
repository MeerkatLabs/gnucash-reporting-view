(function() {

    /**
     * Color Definition constants for all of the code.
     */
    angular.module('gnucash-reports-view.reports')
        .constant('colorDefinitions', {
            // Core Value
            base: 'LightSteelBlue',

            // Color Scale values.
            best: 'ForestGreen',
            good: 'DarkSeaGreen',
            info: 'Khaki',
            warning: 'SandyBrown',
            error: 'LightCoral',

            // Total Sale Values
            totalGood: 'LightCyan',
            totalBad: 'LightCoral',

            // Credit Debit Values
            credit: 'DarkSeaGreen',
            debit: 'LightCoral'
        });

})();