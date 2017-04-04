angular.module("oxymoron.directives.fileupload", [])
  .directive('fileupload', ['$http', '$timeout', '$cookies', 'ngNotify', function ($http, $timeout, $cookies, ngNotify) {
    return {
      scope: {
        fileupload: "=",
        ngModel: "=",
        hash: "=",
        percentCompleted: "="
      },
      restrict: 'A',
      link: function($scope, element, attrs) {
        $scope.percentCompleted = undefined;

        element.bind('change', function(){
          if ($scope.xhr) $scope.xhr.abort();

          var fd = new FormData();

          angular.forEach(element[0].files, function (file) {
            fd.append("attachments[]", file);
          })

          $scope.xhr = new XMLHttpRequest;

          $scope.percentCompleted = 0;
          
          $scope.xhr.upload.onprogress = function(e) {
              $scope.$apply(function() {
                  if (e.lengthComputable) {
                      $scope.percentCompleted = Math.round(e.loaded / e.total * 100);
                  }
              });
          };

          $scope.xhr.onload = function() {
            var res = JSON.parse(this.responseText)
            
            if (this.status == 200) {
              $scope.$apply(function() {
                if (!$scope.hash) {
                  if (attrs.multiple) {
                    $scope.ngModel = $scope.ngModel || [];
                    angular.forEach(res, function (attachment) {
                      $scope.ngModel.push(attachment);
                    });
                  } else {
                    $scope.ngModel = res[0];
                  }
                } else {
                  $scope.ngModel = $scope.ngModel || {};
                  angular.forEach(res, function(value, key) {
                    $scope.ngModel[key] = $scope.ngModel[key] || [];
                    angular.forEach(value, function (attachment) {
                      $scope.ngModel[key].push(attachment);
                    });
                  });
                }

                $scope.percentCompleted = undefined;
              });
            } else {
              ngNotify.set(res.msg || "Uploading error", "error")
            }
          };


          $scope.xhr.open('POST', $scope.fileupload);
          $scope.xhr.setRequestHeader('X-XSRF-Token', $cookies.get('XSRF-TOKEN'));
          $scope.xhr.send(fd);

          element[0].value = '';
        })
      }
    }
  }])