angular.module("oxymoron.services.sign", [])
  .service('Sign', ['$http', function ($http) {
    var Sign = this;

    Sign.out = function (callback) {
      $http.delete(Routes.destroy_user_session_path())
        .success(function () {
          if (callback)
            callback()
        })
    }

    Sign.in = function (user_params, callback) {
      $http.post(Routes.user_session_path(), {user: user_params})
        .success(function () {
          if (callback)
            callback();
        })
    }

    Sign.up = function (user_params, callback) {
      $http.post(Routes.user_registration_path(), {user: user_params})
        .success(function () {
          if (callback)
            callback();
        })
    }
  }])