var libraryApp = angular.module('libraryApp', ['ngSanitize', 'ngRoute', 'ngResource']);

libraryApp.config(appConfig);
libraryApp.controller('libraryCtrl', libraryController);

function appConfig($routeProvider) {
	$routeProvider.when('/home', {
		templateUrl : 'dashboard.html',
		controller : 'libraryCtrl'
	}).when('/dc', {
		templateUrl : 'dc.html',
		controller : 'libraryCtrl'
	}).when('/marvel', {
		templateUrl : 'marvel.html',
		controller : 'libraryCtrl'
	}).when('/manga', {
		templateUrl : 'manga.html',
		controller : 'libraryCtrl'
	}).otherwise({
		redirectTo: '/home'
    });
}

function libraryController($scope, $http, $sce) {
	$scope.searchInputBox = [
		{
			placeholder : 'ISBN',
			button : 'Find by ISBN'
		},
		{
			placeholder : 'Author Last Name or First Name',
			button : 'Find by author'
		},
		{
			placeholder : 'Title of a book',
			button : 'Find by title'
		}
	];

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
	$scope.findByISBN = function(isbn) {
		if (isbn != null) {
			$http.get('http://localhost:8080/isbn-search', { headers: { isbn : isbn } }).success(function(data) {
				console.log(data);
				$scope.content = [data];
			});
			console.log('$scope.content ------- ', $scope.content);
		} else {
			alert('ISBN must be a number');
		}
	};
    $scope.findByAuthor = function(isbn) {

    };
}

function generateResultListTemplate($scope, data) {
	if (!(data instanceof Error)) {
		var result = [];
		_.each(data, function(book) {
			result.push(book);
		});
		return result;
	} else {
		return new Error(data);
	}
}