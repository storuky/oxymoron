angular.module("oxymoron.directives.clickOutside", [])
  .directive('clickOutside', ['$document', function ($document) {
    return {
      restrict: 'A',
      scope: {
        clickOutside: '&'
      },
      link: function (scope, el, attr) {
        var handler = function (e) {
          if (el !== e.target && !el[0].contains(e.target) && document.body.contains(e.target)) {
            scope.$apply(function () {
                scope.$eval(scope.clickOutside);
            });
          }
        }

        $document.bind('click', handler);

        scope.$on('$destroy', function () {
          $document.unbind('click', handler)
        })
      }
    }
  }])