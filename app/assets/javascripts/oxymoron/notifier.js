angular.module("oxymoron.notifier", [])
  .run(['$rootScope', 'ngNotify', 'Validate', '$state', '$http', '$location', function ($rootScope, ngNotify, Validate, $state, $http, $location) {
    ngNotify.config({
        theme: 'pure',
        position: 'top',
        duration: 2000,
        type: 'info'
    });

    $rootScope.$on('loading:finish', function (h, res) {
      var csrf = res.headers()['x-csrf-token'] || res.headers()['X-CSRF-token'];
      console.log(csrf)
      if (csrf) {
        $http.defaults.headers.common['X-CSRF-Token'] = csrf;
      }
      if (res.data) {
        if (res.data.msg) {
          ngNotify.set(res.data.msg, 'success');
        }

        if (res.data.redirect_to_url) {
          $location.url(res.data.redirect_to_url);
        }
        else if (res.data.redirect_to) {
          $state.go(res.data.redirect_to, res.data.redirect_options || {});
        }

        if (res.data.reload) {
          window.location.reload();
        }
      }
    })

    $rootScope.$on('loading:error', function (h, res, p) {
      if (angular.isObject(res.data)) {
        if (res.data.msg) {
          ngNotify.set(res.data.msg, 'error');
        }
        if (res.data.errors) {
          Validate(res.data.form_name || res.config.data.form_name, res.data.errors)
        }
        if (res.data && res.data.redirect_to) {
          $state.go(res.data.redirect_to)
        }
      } else {
        if ([-1, 304].indexOf(res.status) == -1) {
          ngNotify.set(res.statusText, 'error');
        }
      }
    })
  }])