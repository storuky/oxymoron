angular.module("oxymoron.notifier", [])
  .run(['$rootScope', 'ngNotify', 'Validate', '$state', '$http', '$location', function ($rootScope, ngNotify, Validate, $state, $http, $location) {
    ngNotify.config({
        theme: 'pure',
        position: 'top',
        duration: 2000,
        type: 'info'
    });

    $rootScope.$on('loading:finish', function (h, res) {
      callback('success', res)
    })

    $rootScope.$on('loading:error', function (h, res, p) {
      callback('error', res)
    })

    function callback (type, res) {
      var headers = res.headers();
      var csrf = headers['x-csrf-token'] || headers['X-CSRF-token'] || headers['X-CSRF-Token'] || headers['X-CSRF-TOKEN'];

      if (csrf) {
        $http.defaults.headers.common['X-CSRF-Token'] = csrf;
      }
      if (res.data && angular.isObject(res.data)) {
        if (res.data.msg) {
          ngNotify.set(res.data.msg, type);
        }

        if (res.data.errors) {
          Validate(res.data.form_name || res.config.data.form_name, res.data.errors)
        }

        if (res.data.redirect_to_url) {
          $location.url(res.data.redirect_to_url);
        } else if (res.data.redirect_to) {
          $state.go(res.data.redirect_to, res.data.redirect_options || {});
        }

        if (res.data.reload) {
          window.location.reload();
        }
      }
    }
  }])