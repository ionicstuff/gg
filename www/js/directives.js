var app = angular.module('starter.directives', []);

app.directive('popupSelect', function($timeout, $q, $ionicPopup) {
	return {
		restrict: 'EA',
		scope: {
			options: '=',
			title: '@',
			valueField: '@',
			displayField: '@'
		},
		require:'?ngModel',
		link: function($scope, element, attrs, ngModel) {
			$scope.selected = {};
			$scope.display = {};
			var popupTitle = $scope.title || 'Select option';
			var displayElement = angular.element(element.find('span'));
			// displayElement.html(popupTitle);
			element.on('click', function(){
				// To set default value
				$scope.selected.value = ngModel.$viewValue;
				// scope.choice = '';
				var myPopup = $ionicPopup.show({
					templateUrl: 'templates/popup/select-popup.html',
					title: popupTitle,
					cssClass: 'popup-select',
					scope: $scope,
					buttons: [
						{
							text: 'Close'
						},
						{
							text: '<b>Select</b>',
							type: 'button-custom',
							onTap: function(e) {
								e.preventDefault();
								ngModel.$setViewValue($scope.selected.value);
								ngModel.$render();
								if ($scope.display.value) {
									displayElement.html($scope.display.value);
								} else {
									displayElement.html(popupTitle);
								}
								myPopup.close();
							}
						}
					]
				});

				myPopup.then(function(res) {
					console.log('Tapped!', res);
				});
			});
		}
	};
});

app.directive('passwordVerify', function() {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController
		link: function(scope, elem, attrs, ngModel) {
			if (!ngModel) return; // do nothing if no ng-model

			// watch own value and re-validate on change
			scope.$watch(attrs.ngModel, function() {
				validate();
			});

			// observe the other value and re-validate on change
			attrs.$observe('passwordVerify', function(val) {
				validate();
			});

			var validate = function() {
				// values
				var val1 = ngModel.$viewValue;
				var val2 = attrs.passwordVerify;

				// set validity
				ngModel.$setValidity('passwordVerify', val1 === val2);
			};
		}
	}
});

app.directive('setHeight', function($window){
	return{
		restrict: 'E',
        scope: {
            val: '='
        },
		link: function(scope, element, attrs){
			scope.$watch('val', function(newValue, oldValue) {
                if (newValue)
                    console.log("I see a data change!");
            }, true);
			// var element = angular.element(document.querySelector('.widget-content')); 
			// // var height = element[0].offsetHeight + 20;
			// var height = $('.widget-content').height();
			// console.log('Helloooooooooooooooooooooooooooooooo');
			// console.log(height);
			// element.css('min-height', height + 'px');
		}
	}
});