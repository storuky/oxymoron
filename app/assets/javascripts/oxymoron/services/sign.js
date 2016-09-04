angular.module("oxymoron.services.sign", [])
  .service('Sign', ['$http', function ($http) {
    var Sign = this;

    Sign.out = function (callback) {
      $http.delete(Routes.destroy_user_session_path())
        .success(function () {
          if (callback)
            callback()
          else
            window.location = "/";
        })
    }

    Sign.in = function (user, callback) {
      $http.post(Routes.user_session_path(), {user: user})
        .success(function () {
          if (callback)
            callback();
          else
            window.location.reload();
        })
    }

    Sign.up = function (user, callback) {
      $http.post(Routes.user_registration_path(), {user: user})
        .success(function () {
          if (callback)
            callback();
          else
            window.location.reload();
        })
    }
  }])