angular.module("oxymoron.services.interceptor", [])
  .factory('httpInterceptor', ['$q', '$rootScope', '$log', function ($q, $rootScope, $log) {
    return {
      request: function (config) {
        $rootScope.$broadcast('loading:progress');
        return config || $q.when(config);
      },
      response: function (response) {
        $rootScope.$broadcast('loading:finish', response);
        return response || $q.when(response);
      },
      responseError: function (response) {
        $rootScope.$broadcast('loading:error', response);
        return $q.reject(response);
      }
    };
  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
  }])