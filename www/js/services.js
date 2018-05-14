angular.module('starter.services', [])

.service('WebService', function ($http, $q) {
	this.call = function(options) {
		var deferred = $q.defer();
		options['headers'] = {
			'Content-Type' : 'application/x-www-form-urlencoded'
		};
		$http(options).then(function(response) {
			deferred.resolve(response);
		}, function(error) {
			deferred.reject(error);
		});

		return deferred.promise;
	};

})

.service('LocalStorage', function ($rootScope) {
	this.set = function(key, value) {
		window.localStorage.setItem(key, value);
	};
	this.get = function(key) {
		return window.localStorage.getItem(key);
	};
	this.remove = function(key) {
		window.localStorage.removeItem(key);
	};
})

.service('Alert', function($ionicPopup, $q){
	this.showAlert = function(tit, msg) {
		var deferred = $q.defer();

		var alertPopup = $ionicPopup.alert({
			title: tit,
			template: msg
		});

		alertPopup.then(function(res) {
			console.log('Thank you for not eating my delicious ice cream cone');
			deferred.resolve();
		});

		return deferred.promise;
	};
});