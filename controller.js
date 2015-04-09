var libraryApp = angular.module('libraryApp', ['ngSanitize', 'ngRoute', 'ngResource']);

libraryApp.config(appConfig);
libraryApp.controller('libraryCtrl', libraryController);

function appConfig($routeProvider) {
	$routeProvider.when('/dc', {
		templateUrl : 'dc.html',
		controller : 'libraryCtrl'
	}).when('/marvel', {
		templateUrl : 'marvel.html',
		controller : 'libraryCtrl'
	}).when('/manga', {
		templateUrl : 'manga.html',
		controller : 'libraryCtrl'
	});
}

function libraryController($scope, $http, $sce) {
	$scope.getDC = function() {
		$http.get('http://localhost:8080/dc').success(function(data) {
			$scope.content = generateResultListTemplate($scope, data);
		});
	};
	$scope.getMarvel = function() {
		$http.get('http://localhost:8080/marvel').success(function(data) {
			$scope.content = generateResultListTemplate($scope, data);
		});
	};
	$scope.getManga = function() {
		$http.get('http://localhost:8080/manga').success(function(data) {
			$scope.content = generateResultListTemplate($scope, data);
		});
	};
}

function generateResultListTemplate($scope, data) {
	if (data instanceof Array) {
		var result = [];

		// var template = '';
		data.forEach(function(book) {
			result.push(book);
			// template += '<div class="container searchbox-div"><div>' + book.isbn + '</div><div>' + book.author + '</div><div><strong>' + book.title + '</strong></div><div> ' + book.category + '</div></div>';
		});

		// console.log(result);
		return result;
	} else {
		return new Error(data);
	}
}