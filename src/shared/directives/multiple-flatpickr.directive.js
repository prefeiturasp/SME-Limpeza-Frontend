(function () {
  'use strict';

  angular
    .module('app')
    .directive('multipleFlatpickr', multipleFlatpickr);

  function multipleFlatpickr() {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        fpOptions: '<?'
      },
      link: function (scope, elem, attrs, ngModel) {
        var baseOptions = {
          dateFormat: 'd/m/Y',
          mode: 'multiple',
          onChange: function (selectedDates) {
            scope.$applyAsync(function () {
              ngModel.$setViewValue(selectedDates);
            });
          }
        };

        var options = angular.extend({}, baseOptions, scope.fpOptions || {});
        var fp = flatpickr(elem[0], options);

        ngModel.$render = function () {
          var val = ngModel.$viewValue || [];
          fp.setDate(val, true);
        };

        scope.$on('$destroy', function () {
          if (fp && fp.destroy) fp.destroy();
        });
      }
    };
  }
})();