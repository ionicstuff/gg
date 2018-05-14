angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $q, $ionicModal, $httpParamSerializer, $ionicLoading, $ionicHistory, $ionicPlatform, $timeout, Alert, LocalStorage, WebService) {
	var watchID = undefined;
	$scope.imgBasePath = 'http://www.gamegods.com/assets/uploads/';
	$scope.searchAlphabetsOptions = [
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'A',
		'B',
		'C',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'J',
		'K',
		'L',
		'M',
		'N',
		'O',
		'P',
		'Q',
		'R',
		'S',
		'T',
		'U',
		'V',
		'W',
		'X',
		'Y',
		'Z'
	];
	$scope.userInfo = {};
	$scope.platforms = [
		{
			id: 1,
			text: 'PC',
			sortText: 'PC'
		},
		{
			id: 2,
			text: 'PLAYSTATION',
			sortText: 'PS'
		},
		{
			id: 3,
			text: 'XBOX',
			sortText: 'XBOX'
		},
		{
			id: 4,
			text: 'NINTENDO',
			sortText: 'NINTENDO'
		},
		{
			id: 5,
			text: 'MOBILE',
			sortText: 'MOBILE'
		},
		{
			id: 6,
			text: 'VR',
			sortText: 'VR'
		}
	];
	$scope.goTo = function(state, args, isAnimate) {
		if (!isAnimate) {
			$ionicHistory.nextViewOptions({
				disableAnimate: true
			});
		}
		$state.go(state, args);
	};

	$scope.goBack = function() {
		$ionicHistory.goBack();
	};

	$scope.myPlatform = '';

	var launchChat = function() {
		CCCometChat.launchCometChat(false, function success(data){ },function error(data){  });
	};

	// $scope.$on('$locationChangeSuccess', function($event, next, current) {
	// 	console.log('Hello');
	// 	$scope.myPlatform = 'pc';
	// });

	$scope.togglePlatform = function(platform) {
		$scope.myPlatform = platform;
	};

	$scope.getUserSession = function() {
		$ionicLoading.show();
		var postData = {};
		var userId = LocalStorage.get('UserID');
		postData['user_id'] =  parseInt(userId, 10);
		postData['profile_id'] = parseInt(userId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_profiledetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			var data = response.data;
			if (data.status == '1') {
				var userData = data.UserDetails[0];
				$scope.userInfo['userId'] = userData.user_id;
				$scope.userInfo['firstname'] = userData.firstname;
				$scope.userInfo['lastname'] = userData.lastname;
				$scope.userInfo['email'] = userData.email;
				$scope.userInfo['UserCoverImage'] = userData.UserCoverImage;
				$scope.userInfo['UserProfileImage'] = userData.UserProfileImage;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.logout = function() {
		LocalStorage.remove('UserID');
		LocalStorage.remove('Username');
		LocalStorage.remove('Password');
		$scope.goTo('app.login-register', {});
	};

	$scope.getFormatedDate = function(rawDate) {
		var arrayOut = rawDate.split(' ');
		return arrayOut.join('T');
	};

	$scope.getCount = function(count) {
		if (count) {
			return count;
		}

		return '0';
	};

	$scope.loginUser = function() {
		var deferred = $q.defer();

		var userName = LocalStorage.get('Username');
		var password = LocalStorage.get('Password');

		if (userName && password) {
			CCCometChat.login(userName, password, function successCallback(response) {
				appConfig.cometchat.loginDone = true;
				deferred.resolve();
			},function failCallback(response) {
				deferred.reject('Chat Login failed.. Tray again!');
			});
		} else {
			deferred.reject('Please login to access chat!');
		}

		return deferred.promise;
	};

	$scope.initCometChat = function() {
		var deferred = $q.defer();
		if (!appConfig.cometchat.initDone) {
			$ionicPlatform.ready(function() {
				if(ionic.Platform.isIOS()) {
					// init cometchat for ios
				} else {
					console.log('Platform is android');
					CCCometChat.getInstance(function() {
						CCCometChat.initializeCometChat("http://www.gamegods.com/cometchat","RJ1GD-CM5OS-F4XTU-TE4HW-9XTJM", "dd934951955da17419e0d5e948bc13dc", false, function success(response){
							appConfig.cometchat.initDone = true;
							deferred.resolve();
						},function fail(error){
							deferred.reject('Failed To Init chat!');
						});
					}, function() {
						deferred.reject('Failed to get instance of chat');
					});
				}
			});
		} else {
			deferred.resolve();
		}

		return deferred.promise;
	};

	$scope.launchChatNow = function() {
		// show loading
		$ionicLoading.show();
		$scope.initCometChat().then(function() {
			if (appConfig.cometchat.loginDone) {
				$ionicLoading.hide();
				launchChat();
			} else {
				$scope.loginUser().then(function() {
					$ionicLoading.hide();
					launchChat();
				}, function() {
					$ionicLoading.hide();
				});
			}
		}, function() {
			$ionicLoading.hide();
		});
	};

	$scope.initCometChat();

	$scope.comments = [];
	$scope.newComment = {};
	var commentId = undefined;
	var commentCategory = undefined;
	$ionicModal.fromTemplateUrl('templates/modals/comments.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.commentsModal = modal;
	});

	$scope.getComments = function(cID, category) {
		$ionicLoading.show();
		commentId = cID;
		commentCategory = category;
		var postData = {};
		postData['commentid'] = parseInt(commentId, 10);
		postData['category'] = commentCategory;
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_allcommentreplies',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.comments = data.CommentRplyList;
				$scope.commentsModal.show();
			} else {
				Alert.showAlert('Oppss..!', 'Game details not available.');
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
		});
	};

	$scope.closeComments = function() {
		commentId = undefined;
		commentCategory = undefined;
		$scope.comments = [];
		$scope.commentsModal.hide();
	};

	$scope.postComment = function(commentTxt) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['commentid'] = parseInt(commentId, 10);
			postData['user_id'] = userId;
			postData['commenttext'] = commentTxt;
			postData['category'] = commentCategory;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'add_commentreply',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					window.plugins.toast.showWithOptions({
						message: 'Comment added..!',
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
							$scope.comments = data.CommentList;
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.followUnfollowUser = function(object, toId) {
		$ionicLoading.show();
		var postData = {};
		var myId = LocalStorage.get('UserID');
		postData['user_id'] = parseInt(myId, 10);
		postData['to_id'] = parseInt(toId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'userfollowunfollow',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				object.isfollow = data.isfollow;
				window.plugins.toast.showWithOptions({
					message: data.msg,
					duration: 'short', // 2000 ms
					position: 'bottom'
				}, function(result) {
					if (result.event === 'hide') {
						$scope.comments = data.CommentList;
					}
				});
			} else {
				Alert.showAlert('Oppss..!', error.data.msg);
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.likeDislikeGame = function(game) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['game_id'] = parseInt(game.GameID, 10);
			postData['user_id'] = userId;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'gamelike',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					game.islike = data.islike;
					game.Clike = data.Clike;
					window.plugins.toast.showWithOptions({
						message: data.msg,
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.checkGenreSelection = function() {
		$ionicLoading.show();
		var deferred = $q.defer();
		var postData = {};
		var myId = LocalStorage.get('UserID');
		postData['user_id'] = parseInt(myId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'check_genre',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			deferred.resolve(data.status);
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
			deferred.reject(error);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});

		return deferred.promise;
	};

	$scope.checkPltformSelection = function() {
		$ionicLoading.show();
		var deferred = $q.defer();
		var postData = {};
		var myId = LocalStorage.get('UserID');
		postData['user_id'] = parseInt(myId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'check_pltform',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			deferred.resolve(data.status);
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
			deferred.reject(error);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});

		return deferred.promise;
	};

	function onSuccess(position) {
		$ionicLoading.show();
		navigator.geolocation.clearWatch(watchID);
		console.log(position.coords.latitude);
		console.log(position.coords.longitude);
		var city = '';
		var state = '';
		var country = '';
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		$scope.userInfo['lat'] = lat;
		$scope.userInfo['lng'] = lng;
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(lat, lng);
		$scope.userInfo['locationAvailable'] = true;
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				// console.log(results);
				if (results[0]) {
					var addressComponents = results[0].address_components;
					var allPromises = [];
					for (var i = 0; i < addressComponents.length; i++) {
						var insertPromise = $q.defer();
						if (addressComponents[i].types.indexOf('locality') >= 0) {
							$scope.userInfo['city'] = addressComponents[i].long_name;
						} else if (addressComponents[i].types.indexOf('administrative_area_level_1') >= 0) {
							$scope.userInfo['state'] = addressComponents[i].long_name;
						} else if (addressComponents[i].types.indexOf('country') >= 0) {
							$scope.userInfo['country'] = addressComponents[i].long_name;
						} else if (addressComponents[i].types.indexOf('sublocality_level_1') >= 0) {
							$scope.userInfo['area'] = addressComponents[i].long_name;
						}
						insertPromise.resolve();
						allPromises.push(insertPromise.promise);
					}
					$q.all(allPromises).then(function() {
						$ionicLoading.hide();
						// $scope.$apply();
						locationPromise.resolve(position.coords);
					});
				}
			}
		});
    };

    function onError(error) {
		console.log(JSON.stringify(error));
		locationPromise.reject(error);
    };

	$scope.getCurrentLocation = function() {
		locationPromise = $q.defer();
		cordova.plugins.diagnostic.isLocationAvailable(function(available){
			if (!available) {
				cordova.plugins.diagnostic.switchToLocationSettings();
				watchID = navigator.geolocation.watchPosition(onSuccess, onError, { enableHighAccuracy: true, timeout: 60000 });
			} else {
				navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true });
			}
		}, function(error){
			console.error("The following error occurred: "+error);
		});
		return locationPromise.promise;
	};

	document.addEventListener('deviceready', function() {
		cordova.plugins.diagnostic.isLocationAvailable(function(available) {
			$scope.userInfo['locationAvailable'] = available;
			if (available) {
				$scope.getCurrentLocation();
			}
		}, function(error){
			console.error("The following error occurred: "+error);
		});
	}, false);
})

.controller('LoginCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {

  $scope.loginData = {};
	$scope.submitted = false;

	$scope.login = function(loginData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'login',
				data: $httpParamSerializer(loginData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					LocalStorage.set('UserID', data.Userdetails.id);
					LocalStorage.set('Username', loginData.email);
					LocalStorage.set('Password', loginData.pwd);
					$scope.userInfo['userId'] = data.Userdetails.id;

					var userID = data.Userdetails.id;

					// check user filled interest
					$scope.checkGenreSelection().then(function(isDone) {
						if (isDone == '1') {
							$scope.checkPltformSelection().then(function(isDone) {
								if (isDone == '1') {
									LocalStorage.set('interestFilled', 'filled');
									$scope.goTo('menu.profile', {userId: userID});
								} else {
									$scope.goTo('menu.platform', {});
								}
							}, function() {
								Alert.showAlert('Error', 'Error in checking platform selection.');
							});
						} else {
							$scope.goTo('menu.interests', {});
						}
					}, function() {
						Alert.showAlert('Error', 'Error in checking genre selection.');
					});
				} else {
					Alert.showAlert('Error', data.msg);
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('SignupCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.signupData = {};
	$scope.submitted = false;

	$scope.signup = function(signupData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'register',
				data: signupData
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					LocalStorage.set('UserID', data.Userdetails.id);
					LocalStorage.set('Username', signupData.email);
					LocalStorage.set('Password', signupData.password);
					// $scope.loginUser();
					$scope.userInfo['userId'] = data.Userdetails.id;
					$scope.goTo('menu.interests', {});
				} else {
					Alert.showAlert('Error', data.msg);
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('ForgotPwdCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.signupData = {};
	$scope.submitted = false;

	$scope.forgotPassword = function(signupData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'forget_password',
				data: signupData
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					Alert.showAlert('Success.!', data.msg);
				} else {
					Alert.showAlert('Error', data.msg);
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('UserImagesCtrl', function($scope, $ionicLoading, $httpParamSerializer, $stateParams, WebService, Alert, LocalStorage){
	var imageURI = undefined;
	var imageKey = undefined;

	var win = function (r) {
		$ionicLoading.hide();
		// console.log("Code = " + r.responseCode);
		// console.log("Response = " + r.response);
		// console.log("Sent = " + r.bytesSent);
		var response = JSON.parse(r.response);
		console.log(response);
		console.log(response[imageKey]);

		if (response.status == 1) {
			$scope.userData[imageKey] = response[imageKey];
			$scope.userInfo[imageKey] = response[imageKey];
		}
	};

	var fail = function (error) {
		$ionicLoading.hide();
		alert("An error has occurred: Code = " + error.code);
		console.log(JSON.stringify(error));
		console.log("upload error source " + error.source);
		console.log("upload error target " + error.target);
	};

	$scope.selectImage = function(ikey, url, w, h) {
		imageKey = ikey;
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					$ionicLoading.show();
					var userId = LocalStorage.get('UserID');
					console.log('Image URI: ' + results[0]);
					imageURI = results[0];
					var userInfo = {
						user_id: userId
					};

					// Upload file code here
					var options = new FileUploadOptions();
					options.fileKey = imageKey;
					options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
					options.mimeType = 'image/jpeg';
					options.httpMethod = 'POST';
					options.chunkedMode = false;
					options.params = userInfo;
					// options.headers = {'': ''};
					var ft = new FileTransfer();

					console.log(imageURI);
					console.log(options);

					console.log(appConfig.baseUrl + url);

					// ft.upload(imageURI, encodeURI('http://192.168.0.50/scripts/test.php'), win, fail, options);
					ft.upload(imageURI, encodeURI(appConfig.baseUrl + url), win, fail, options);
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1,
				width: w,
				height: h
			}
		);
	};
})

.controller('CreateMemeCtrl', function($scope, $ionicLoading, $httpParamSerializer, $q, $http, WebService, Alert, LocalStorage) {
	$scope.meme = {
		upperFontColor: 'FFFFFF',
		upperStrokColor: '000000',
		bottomFontColor: 'FFFFFF',
		bottomStrokColor: '000000',
		topTextSize: 42,
		bottomTextSize: 42
	};
	$scope.options = {
		// html attributes
		required: [false, true],
		format: 'hex',
		restrictToFormat: [false, true],
		case: ['upper'],
		alpha: [false],
	};

	var imagePath = 'img/meme-default.jpg';

	$scope.captureImage = function() {
		var options = {
			// Some common settings are 20, 50, and 100
			quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: false,
			correctOrientation: true  //Corrects Android orientation quirks
		};

		navigator.camera.getPicture(function cameraSuccess(imageUri) {
			imagePath = imageUri;
			$scope.createMeme($scope.meme);
		}, function cameraError(error) {
			console.debug("Unable to obtain picture: " + error, "app");
		}, options);
	};

	$scope.selectImage = function() {
		console.log("Select Image");
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					// $ionicLoading.show();
					console.log('Image URI: ' + results[0]);
					var imageUri = results[0];
					imagePath = imageUri;
					$scope.createMeme($scope.meme);
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1
			}
		);
	};

	$scope.createMeme = function(meme) {
		console.meme(meme.topText, meme.bottomText, imagePath, meme.topTextSize, meme.bottomTextSize, meme.upperFontColor, meme.upperStrokColor, meme.bottomFontColor, meme.bottomStrokColor);
	};

	$scope.createMeme($scope.meme);

	$scope.addMeme = function(memeData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var allouterPromises = [];
			// set form data
			var fd = new FormData();
			var userID = LocalStorage.get('UserID');
			var uri = document.getElementById('myCanvas').toDataURL();
			fd.append('user_id', userID);
			fd.append('memename', memeData.memename);
			fd.append('base_image', uri);

			var action = 'memeadd';
			var toastMessage = 'Meme added..!';
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + action,
				// url: 'http://192.168.0.50/scripts/test.php',
				data: fd,
				headers: {
					'Content-Type': undefined
				}
			};

			$http(options).success(function (response) {
				$ionicLoading.hide();
				if (response.status == '1') {
					window.plugins.toast.showWithOptions({
						message: toastMessage,
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
							$scope.goTo('menu.photos', {userId: userID, tab: 'memes'});
						}
					});
				} else {
					Alert.showAlert('Oops!!', 'Error saving data.');
				}
			}).error(function (err) {
				$ionicLoading.hide();
				Alert.showAlert('Oops!!', err);
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('ProfileCtrl', function($scope, $ionicLoading, $httpParamSerializer, $stateParams, WebService, Alert, LocalStorage){
	$scope.userData = {};
	$scope.statusData = {};

	$scope.getProfile = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		console.log($scope.userIds);
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_profiledetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			// console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.userData = data.UserDetails[0];
				if (sessionId == profileId) {
					$scope.userInfo['userId'] = $scope.userData.user_id;
					$scope.userInfo['firstname'] = $scope.userData.firstname;
					$scope.userInfo['lastname'] = $scope.userData.lastname;
					$scope.userInfo['email'] = $scope.userData.email;
					$scope.userInfo['UserCoverImage'] = $scope.userData.UserCoverImage;
					$scope.userInfo['UserProfileImage'] = $scope.userData.UserProfileImage;
				}
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getProfile();

	$scope.shownGroup = '1';
	$scope.shownTimeline = '1';

	$scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
			$scope.shownGroup = null;
		} else {
			$scope.shownGroup = group;
		}
	};

	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};

	$scope.toggleTimeline = function(group) {
		if ($scope.isTimelineShown(group)) {
			$scope.shownTimeline = null;
		} else {
			$scope.shownTimeline = group;
		}
	};

	$scope.isTimelineShown = function(group) {
		return $scope.shownTimeline === group;
	};

	$scope.addNewStatus = function(statusData) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['fromid'] = parseInt(userId, 10);
			postData['toid'] = parseInt(userId, 10);
			postData['statustext'] = statusData.text
			postData['privacy'] = statusData.privacy;
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'add_newstatus',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {

				} else {
					Alert.showAlert('Oppss..!', 'Game details not available.');
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	};
})

.controller('FollowersCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.followers = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_userfollowers',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.followers = data.FollowerList;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();
})

.controller('FollowingCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.following = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_userfollowings',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.following = data.FollowingList;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();
})

.controller('PhotosCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.currentTab = 'photos';
	$scope.photos = [];
	$scope.albums = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		var tab = $stateParams.tab;
		if (tab) {
			$scope.currentTab = tab;
		}
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'getuserphoto',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.photos = data.PhotoList;
				$scope.albums = data.AlbumList;
				$scope.memes = data.MemeList;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();

	$scope.changeTab = function(tab) {
		$scope.currentTab = tab;
	};
})

.controller('CreateAlbumCtrl', function($scope, $filter, $ionicLoading, $httpParamSerializer, $q, $http, WebService, Alert, LocalStorage) {
	$scope.album = {};
	$scope.submitted = false;

	$scope.locations = [
		{
			id: 'Search',
			text: 'Genre/Game/Location'
		},
		{
			id: '1',
			text: 'Action'
		},
		{
			id: '2',
			text: 'Action-Adventure'
		},
		{
			id: '3',
			text: 'Adventure'
		},
		{
			id: '4',
			text: 'Role-Playing'
		},
		{
			id: '5',
			text: 'Simulation'
		},
		{
			id: '6',
			text: 'Strategy'
		},
		{
			id: '7',
			text: 'Sports'
		},
		{
			id: '8',
			text: 'Others'
		}
	];

	var imageKey = undefined;
	var imageURI = undefined;
	var normalImages = {};

	$scope.captureImage = function(ikey, h, w) {
		var options = {
			// Some common settings are 20, 50, and 100
			quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: true,
			targetHeight: h,
			targetWidth: w,
			correctOrientation: true  //Corrects Android orientation quirks
		};

		navigator.camera.getPicture(function cameraSuccess(imageUri) {
			$scope.album[ikey] = imageUri;
			normalImages[ikey] = imageUri;
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
				$scope.$apply();
			}
		}, function cameraError(error) {
			console.debug("Unable to obtain picture: " + error, "app");
		}, options);
	};

	$scope.selectImage = function(ikey, w, h) {
		console.log("Select Image");
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					// $ionicLoading.show();
					console.log('Image URI: ' + results[0]);
					var imageUri = results[0];
					$scope.album[ikey] = imageUri;
					normalImages[ikey] = imageUri;
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
						$scope.$apply();
					}
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1,
				width: w,
				height: h
			}
		);
	};

	$scope.addAlbum = function(albumData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var allouterPromises = [];
			// set form data
			var fd = new FormData();
			var userID = LocalStorage.get('UserID');
			fd.append('user_id', userID);
			fd.append('name', albumData.eventtitle);
			fd.append('platform', albumData.platform);
			var albumDate = $filter('date')(albumData.albumDate, "yyyy-MM-dd");
			fd.append('date', albumDate);
			fd.append('type', albumData.type);

			angular.forEach(normalImages, function(image, imageKey) {
				var outerPromise = $q.defer();
				window.resolveLocalFileSystemURL(image, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([this.result], { type:file.type});
							fd.append(imageKey, imgBlob);
							fd.append(imageKey+'Name', file.name);
							outerPromise.resolve();
						};
						reader.readAsArrayBuffer(file);
					});
				});
				allouterPromises.push(outerPromise.promise);
			});

			$q.all(allouterPromises).then(function() {
				var action = 'add_album';
				var toastMessage = 'Album added..!';
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + action,
					// url: 'http://192.168.0.50/scripts/test.php',
					data: fd,
					headers: {
						'Content-Type': undefined
					}
				};

				$http(options).success(function (response) {
					$ionicLoading.hide();
					if (response.status == '1') {
						window.plugins.toast.showWithOptions({
							message: toastMessage,
							duration: 'short', // 2000 ms
							position: 'bottom'
						}, function(result) {
							if (result.event === 'hide') {
								$scope.goTo('menu.photos', {userId: userID, tab: 'albums'});
							}
						});
					} else {
						Alert.showAlert('Oops!!', 'Error saving data.');
					}
				}).error(function (err) {
					$ionicLoading.hide();
					Alert.showAlert('Oops!!', err);
				});
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('UserLikedGamesCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.games = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'usergameliked',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.games = data.Gamelist;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();
})

.controller('FriendsCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.friends = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_allfriends',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.friends = data.FriendLst;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();
})

.controller('UserVideosCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.videos = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'getuservideo',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.videos = data.Videolist;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();
})

.controller('UserCommunitiesCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.tab = 'created';
	$scope.createdCommunities = [];
	$scope.joinedCommunities = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'getusercommunities',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.createdCommunities = data.CommunityCreatedlist;
				$scope.joinedCommunities = data.Communityjoinedlist;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();

	$scope.setTab = function(tab) {
		$scope.tab = tab;
	};
})

.controller('UserTeamsCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.tab = 'created';
	$scope.createdTeams = [];
	$scope.joinedTeams = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'getuserteams',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.createdTeams = data.TeamCreated;
				$scope.joinedTeams = data.TeamJoined;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();

	$scope.setTab = function(tab) {
		$scope.tab = tab;
	};
})

.controller('UserTournamentsCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.tab = 'created';
	$scope.createdTournaments = [];
	$scope.participatedTournaments = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'getusertournaments',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.createdTournaments = data.TournamentCreated;
				$scope.participatedTournaments = data.Tournamentparticipated;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();

	$scope.setTab = function(tab) {
		$scope.tab = tab;
	};
})

.controller('UserEventsCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.tab = 'created';
	$scope.createdEvents = [];
	$scope.attendedEvents = [];

	$scope.getAll = function() {
		$ionicLoading.show();
		var postData = {};
		var sessionId = LocalStorage.get('UserID');
		var profileId = $stateParams.userId;
		$scope.userIds = {
			userId: sessionId,
			profile_id: profileId
		};
		postData['user_id'] =  parseInt(sessionId, 10);
		postData['profile_id'] = parseInt(profileId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'getuserevents',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.createdEvents = data.EventsCreated;
				$scope.attendedEvents = data.EventsAttended;
				$scope.userData = data.images;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getAll();

	$scope.setTab = function(tab) {
		$scope.tab = tab;
	};
})

.controller('EventsCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.events = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: 1,
		searchAlphabet: null,
		eventname: null
	};

	$scope.setPlatform = function(platform) {
		$scope.pagination.page = 0;
		$scope.pagination.platform = platform.id;
		$scope.events = [];
		$scope.index();
	};

	$scope.search = function() {
		$scope.pagination.page = 0;
		$scope.events = [];
		$scope.index();
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		postData['platform'] = $scope.pagination.platform;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		if ($scope.pagination.searchAlphabet) {
			postData['alphabet'] = $scope.pagination.searchAlphabet;
		}
		if ($scope.pagination.eventname) {
			postData['eventname'] = $scope.pagination.eventname;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_events',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.events.push.apply($scope.events, data.Eventlist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			// Alert.showAlert('Oppss..!', error.data.msg);
			$scope.noMoreItemsAvailable = true;
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};
})

.controller('NotificationsCtrl', function($scope, $ionicLoading, $filter, $httpParamSerializer, $q, WebService, Alert, LocalStorage) {
	$scope.notifications = [];
	$scope.selectedIds = [];
	$scope.filter = {};
	$scope.action = {
		isReaded: '3'
	};
	$scope.allSelected = false;

	$scope.getNotifications = function() {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['user_id'] = userId;
			if ($scope.action.onDate) {
				postData['date'] = $filter('date')($scope.action.onDate, "yyyy-MM-dd");
			}
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'get_notifications',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					$scope.notifications = data.NotificationList;
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.getNotifications();

	$scope.toggleId = function(notification) {
		var index = $scope.selectedIds.indexOf(notification.NotificationID);
		if (index == -1) {
			$scope.selectedIds.push(notification.NotificationID);
		} else {
			$scope.selectedIds.splice(index, 1);
		}
	};

	$scope.toggleSelectAll = function() {
		if ($scope.allSelected) {
			$scope.selectedIds = [];
		} else {
			$scope.selectedIds = [];
			angular.forEach($scope.notifications, function(notification, nKey) {
				$scope.selectedIds.push(notification.NotificationID);
			});
		}

		$scope.allSelected = !$scope.allSelected;
	};

	$scope.isSelected = function(notification) {
		var index = $scope.selectedIds.indexOf(notification.NotificationID);
		if (index == -1) {
			return false
		}

		return true;
	};

	$scope.performAction = function(action) {
		if (action.isReaded != '3') {
			if ($scope.selectedIds.length > 0) {
				$ionicLoading.show();
				var allPromises = [];
				var notificationlist = [];
				for (var i = 0; i < $scope.selectedIds.length; i++) {
					var deferrer = $q.defer();
					notificationlist.push({'ID': $scope.selectedIds[i]});
					deferrer.resolve();
					allPromises.push(deferrer.promise);
				}

				$q.all(allPromises).then(function() {
					var postData = {};
					var userId = LocalStorage.get('UserID');
					postData['user_id'] = userId;
					postData['action'] = action.isReaded;
					postData['notificationlist'] = JSON.stringify(notificationlist);
					var options = {
						method: 'POST',
						url: appConfig.baseUrl + 'readunread',
						data: $httpParamSerializer(postData)
					};

					WebService.call(options).then(function(response) {
						console.log(JSON.stringify(response));
						var data = response.data;
						if (data.status == '1') {
							$scope.allSelected = false;
							$scope.selectedIds = [];
							$scope.getNotifications();
						}
					}, function(error) {
						Alert.showAlert('Oppss..!', error.data.msg);
					}).finally(function() {
						$ionicLoading.hide();
						// called no matter success or failure
					});
				});
			} else {
				window.plugins.toast.showWithOptions({
					message: 'Please select anyone notification',
					duration: 'short', // 2000 ms
					position: 'bottom'
				}, function(result) {
					if (result.event === 'hide') {
					}
				});
			}

			action.isReaded = '3';
		}
	};
})

.controller('EventCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.event = {};

	$scope.view = function() {
		$ionicLoading.show();
		var postData = {};
		postData['event_id'] = parseInt($stateParams.eventId, 10);;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'eventdetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.event = data.Eventsdetails[0];
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.view();
})

.controller('AddEventCtrl', function($scope, $filter, $ionicLoading, $httpParamSerializer, $q, $http, WebService, Alert, LocalStorage) {
	$scope.event = {};
	$scope.submitted = false;

	var imageKey = undefined;
	var imageURI = undefined;
	var normalImages = {};

	$scope.captureImage = function(ikey, h, w) {
		var options = {
			// Some common settings are 20, 50, and 100
			quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: true,
			targetHeight: h,
			targetWidth: w,
			correctOrientation: true  //Corrects Android orientation quirks
		};

		navigator.camera.getPicture(function cameraSuccess(imageUri) {
			$scope.event[ikey] = imageUri;
			normalImages[ikey] = imageUri;
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
				$scope.$apply();
			}
		}, function cameraError(error) {
			console.debug("Unable to obtain picture: " + error, "app");
		}, options);
	};

	$scope.selectImage = function(ikey, w, h) {
		console.log("Select Image");
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					// $ionicLoading.show();
					console.log('Image URI: ' + results[0]);
					var imageUri = results[0];
					$scope.event[ikey] = imageUri;
					normalImages[ikey] = imageUri;
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
						$scope.$apply();
					}
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1,
				width: w,
				height: h
			}
		);
	};

	$scope.addEvent = function(eventData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var allouterPromises = [];
			// set form data
			var fd = new FormData();
			var userID = LocalStorage.get('UserID');
			fd.append('user_id', userID);
			fd.append('eventtitle', eventData.eventtitle);
			fd.append('eventplatformid', 1);
			var startDate = $filter('date')(eventData.eventstartdate, "yyyy-MM-dd");
			fd.append('eventstartdate', startDate);
			var endDate = $filter('date')(eventData.eventenddate, "yyyy-MM-dd");
			fd.append('eventenddate', endDate);

			var fromHours = eventData.fromHours;
			if (eventData.fromMeridiem == 'am' && fromHours == 12) {
				fromHours = '00';
			} else if (eventData.fromMeridiem == 'pm' && fromHours != 12) {
				fromHours += 12;
			}
			fd.append('eventstarttime', fromHours + ':' + eventData.fromMinutes + ':00');
			var toHours = eventData.toHours;
			if (eventData.toMeridiem == 'am' && toHours == 12) {
				toHours = '00';
			} else if (eventData.toMeridiem == 'pm' && toHours != 12) {
				toHours += 12;
			}
			fd.append('eventendtime', toHours + ':' + eventData.toMinutes + ':00');
			fd.append('eventaddress', eventData.eventaddress);
			fd.append('eventmaplink', eventData.eventmaplink);
			fd.append('eventweblink', eventData.eventweblink);
			fd.append('eventfacebooklink', eventData.eventfacebooklink);
			fd.append('eventtwitterlink', eventData.eventtwitterlink);
			fd.append('eventtwitchlink', eventData.eventtwitchlink);
			fd.append('eventdescription', eventData.eventdescription);

			angular.forEach(normalImages, function(image, imageKey) {
				var outerPromise = $q.defer();
				window.resolveLocalFileSystemURL(image, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([this.result], { type:file.type});
							fd.append(imageKey, imgBlob);
							fd.append(imageKey+'Name', file.name);
							outerPromise.resolve();
						};
						reader.readAsArrayBuffer(file);
					});
				});
				allouterPromises.push(outerPromise.promise);
			});

			$q.all(allouterPromises).then(function() {
				var action = 'create_event';
				var toastMessage = 'Deal added..!';
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + action,
					// url: 'http://192.168.0.50/scripts/test.php',
					data: fd,
					headers: {
						'Content-Type': undefined
					}
				};

				$http(options).success(function (response) {
					$ionicLoading.hide();
					if (response.status == '1') {
						window.plugins.toast.showWithOptions({
							message: 'Event added..!',
							duration: 'short', // 2000 ms
							position: 'bottom'
						}, function(result) {
							if (result.event === 'hide') {
								$scope.goTo('menu.events', {});
							}
						});
					} else {
						Alert.showAlert('Oops!!', 'Error saving data.');
					}
				}).error(function (err) {
					$ionicLoading.hide();
					Alert.showAlert('Oops!!', err);
				});
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('GamesCtrl', function($scope, $ionicLoading, $ionicModal, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.games = [];
	$scope.selectedPlatform = $scope.platforms[0];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: 1,
		searchAlphabet: null,
		gamename: null
	};

	$scope.setPlatform = function(platform) {
		$scope.pagination.page = 0;
		$scope.selectedPlatform = platform;
		$scope.pagination.platform = platform.id;
		$scope.games = [];
		$scope.index();
	};

	$scope.search = function() {
		$scope.pagination.page = 0;
		$scope.games = [];
		$scope.index();
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		postData['platform'] = $scope.pagination.platform;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		if ($scope.pagination.searchAlphabet) {
			postData['alphabet'] = $scope.pagination.searchAlphabet;
		}
		if ($scope.pagination.gamename) {
			postData['gamename'] = $scope.pagination.gamename;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_games',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.games.push.apply($scope.games, data.Gamelist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			$scope.noMoreItemsAvailable = true;
			// Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};

	$ionicModal.fromTemplateUrl('templates/modals/popular-games.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.popularGamesModal = modal;
	});

	$scope.popularGames = [];
	$scope.getPopularGames = function() {
		$ionicLoading.show();
		var postData = {};
		postData['PNO'] = 0;
		postData['platform'] = $scope.selectedPlatform.id;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_populargames',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.popularGames = data.GameList;
				$scope.popularGamesModal.show();
			} else {
				Alert.showAlert('Oppss..!', 'Game details not available.');
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
		});
	};

	$scope.closePopularGames = function() {
		$scope.popularGamesModal.hide();
	};
})

.controller('GameViewCtrl', function($scope, $http, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.game = {};
	$scope.view = 'news';
	$scope.gameComment = {};

	$scope.toggleView = function(type) {
		$scope.view = type;
	};

	$scope.gameView = function() {
		$ionicLoading.show();
		var postData = {};
		postData['game_id'] = parseInt($stateParams.gameId, 10);
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = parseInt(userId, 10);
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_gamedetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.game = data.GameDetails;
			} else {
				Alert.showAlert('Oppss..!', 'Game details not available.');
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
		});
	};

	$scope.gameView();

	$scope.postGameComment = function(mainId, comment) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['game_id'] = parseInt(mainId, 10);
			postData['user_id'] = userId;
			postData['Text'] = comment;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'comment_game',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					game.GameComment = data.commentlist;
					window.plugins.toast.showWithOptions({
						message: 'Comment added',
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
							$scope.gameView();
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please login to post comment',
				duration: 'short', // 2000 ms
				position: 'bottom'
			}, function(result) {
				if (result.event === 'hide') {
				}
			});
		}
	};
})

.controller('GameAddCtrl', function($scope, $filter, $ionicLoading, $httpParamSerializer, $q, $http, WebService, Alert, LocalStorage) {
	$scope.game = {
		gamehashtag: '#',
		newslist: [
			{
				news: ''
			},
			{
				news: ''
			}
		],
		videolist: [
			{
				video: ''
			},
			{
				video: ''
			}
		]
	};
	$scope.submitted = false;
	$scope.genres = [];

	var imageKey = undefined;
	var imageURI = undefined;
	var normalImages = {};

	$scope.captureImage = function(ikey, h, w) {
		var options = {
			// Some common settings are 20, 50, and 100
			quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: true,
			targetHeight: h,
			targetWidth: w,
			correctOrientation: true  //Corrects Android orientation quirks
		};

		navigator.camera.getPicture(function cameraSuccess(imageUri) {
			$scope.team[ikey] = imageUri;
			normalImages[ikey] = imageUri;
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
				$scope.$apply();
			}
		}, function cameraError(error) {
			console.debug("Unable to obtain picture: " + error, "app");
		}, options);
	};

	$scope.selectImage = function(ikey, w, h) {
		console.log("Select Image");
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					// $ionicLoading.show();
					console.log('Image URI: ' + results[0]);
					var imageUri = results[0];
					$scope.team[ikey] = imageUri;
					normalImages[ikey] = imageUri;
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
						$scope.$apply();
					}
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1,
				width: w,
				height: h
			}
		);
	};

	$scope.addGame = function(gameData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var allouterPromises = [];
			// set form data
			var fd = new FormData();
			var userID = LocalStorage.get('UserID');
			fd.append('user_id', userID);
			fd.append('gametitle', gameData.gametitle);
			fd.append('gamehashtag', gameData.gamehashtag);
			fd.append('gamegenreid', gameData.gamegenreid);
			fd.append('gameplatformid', gameData.gameplatformid);
			fd.append('gameabout', gameData.gameabout);
			fd.append('gameguide', gameData.gameguide);
			fd.append('newslist', JSON.stringify(gameData.newslist));
			fd.append('videolist', JSON.stringify(gameData.videolist));

			angular.forEach(normalImages, function(image, imageKey) {
				var outerPromise = $q.defer();
				window.resolveLocalFileSystemURL(image, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([this.result], { type:file.type});
							fd.append(imageKey, imgBlob);
							fd.append(imageKey+'Name', file.name);
							outerPromise.resolve();
						};
						reader.readAsArrayBuffer(file);
					});
				});
				allouterPromises.push(outerPromise.promise);
			});

			$q.all(allouterPromises).then(function() {
				var action = 'add_game';
				var toastMessage = 'Game added..!';
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + action,
					// url: 'http://192.168.0.50/scripts/test.php',
					data: fd,
					headers: {
						'Content-Type': undefined
					}
				};

				$http(options).success(function (response) {
					$ionicLoading.hide();
					if (response.status == '1') {
						window.plugins.toast.showWithOptions({
							message: toastMessage,
							duration: 'short', // 2000 ms
							position: 'bottom'
						}, function(result) {
							if (result.event === 'hide') {
								$scope.goTo('menu.games', {});
							}
						});
					} else {
						Alert.showAlert('Oops!!', 'Error saving data.');
					}
				}).error(function (err) {
					$ionicLoading.hide();
					Alert.showAlert('Oops!!', err);
				});
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};

	$scope.removeElement = function(index, objArray) {
		objArray.splice(index, 1);
	};

	$scope.addElement = function(objArray, element) {
		objArray.push(element);
	};

	$scope.getGenre = function() {
		$ionicLoading.show();
		var postData = {};
		var options = {
			method: 'GET',
			url: appConfig.baseUrl + 'get_genres'
		};

		WebService.call(options).then(function(response) {
			var data = response.data;
			if (data.status == '1') {
				$scope.genres = data.Genrelist;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
		});
	};

	$scope.getGenre();
})

.controller('CommunitiesCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.communities = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: 1,
		searchAlphabet: null,
		communityname: null
	};

	$scope.setPlatform = function(platform) {
		$scope.pagination.page = 0;
		$scope.pagination.platform = platform.id;
		$scope.communities = [];
		$scope.index();
	};

	$scope.search = function() {
		$scope.pagination.page = 0;
		$scope.communities = [];
		$scope.index();
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		postData['platform'] = $scope.pagination.platform;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		if ($scope.pagination.searchAlphabet) {
			postData['alphabet'] = $scope.pagination.searchAlphabet;
		}
		if ($scope.pagination.communityname) {
			postData['communityname'] = $scope.pagination.communityname;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_communities',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.communities.push.apply($scope.communities, data.Communitylist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			// Alert.showAlert('Oppss..!', error.data.msg);
			$scope.noMoreItemsAvailable = true;
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};

	$scope.likeDislike = function(community) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['community_id'] = parseInt(community.CommunityID, 10);
			postData['user_id'] = userId;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'communitylike',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					community.islike = data.islike;
					community.Clike = data.Clike;
					window.plugins.toast.showWithOptions({
						message: data.msg,
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.communityJoin = function(community) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['community_id'] = parseInt(community.CommunityID, 10);
			postData['user_id'] = userId;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'communityjoin',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					window.plugins.toast.showWithOptions({
						message: data.msg,
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};
})

.controller('CommunityViewCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.view = 'about';

	$scope.toggleView = function(type) {
		$scope.view = type;
	};

	$scope.community = {};

	$scope.getCommunity = function() {
		$ionicLoading.show();
		var postData = {};
		postData['community_id'] = parseInt($stateParams.communityId, 10);;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'communitydetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.community = data.Communitydetails[0];
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getCommunity();
})

.controller('CommunityAddCtrl', function($scope, $filter, $ionicLoading, $httpParamSerializer, $q, $http, WebService, Alert, LocalStorage) {
	$scope.community = {};
	$scope.submitted = false;

	var imageKey = undefined;
	var imageURI = undefined;
	var normalImages = {};

	$scope.captureImage = function(ikey, h, w) {
		var options = {
			// Some common settings are 20, 50, and 100
			quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: true,
			targetHeight: h,
			targetWidth: w,
			correctOrientation: true  //Corrects Android orientation quirks
		};

		navigator.camera.getPicture(function cameraSuccess(imageUri) {
			$scope.community[ikey] = imageUri;
			normalImages[ikey] = imageUri;
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
				$scope.$apply();
			}
		}, function cameraError(error) {
			console.debug("Unable to obtain picture: " + error, "app");
		}, options);
	};

	$scope.selectImage = function(ikey, w, h) {
		console.log("Select Image");
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					// $ionicLoading.show();
					console.log('Image URI: ' + results[0]);
					var imageUri = results[0];
					$scope.community[ikey] = imageUri;
					normalImages[ikey] = imageUri;
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
						$scope.$apply();
					}
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1,
				width: w,
				height: h
			}
		);
	};

	$scope.addCommunity = function(communityData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var allouterPromises = [];
			// set form data
			var fd = new FormData();
			var userID = LocalStorage.get('UserID');
			fd.append('user_id', userID);
			fd.append('communitytitle', communityData.communitytitle);
			fd.append('communitydescription', communityData.communitydescription);
			fd.append('communitytype', communityData.communitytype);

			angular.forEach(normalImages, function(image, imageKey) {
				var outerPromise = $q.defer();
				window.resolveLocalFileSystemURL(image, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([this.result], { type:file.type});
							fd.append(imageKey, imgBlob);
							fd.append(imageKey+'Name', file.name);
							outerPromise.resolve();
						};
						reader.readAsArrayBuffer(file);
					});
				});
				allouterPromises.push(outerPromise.promise);
			});

			$q.all(allouterPromises).then(function() {
				var action = 'create_community';
				var toastMessage = 'Community added..!';
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + action,
					// url: 'http://192.168.0.50/scripts/test.php',
					data: fd,
					headers: {
						'Content-Type': undefined
					}
				};

				$http(options).success(function (response) {
					$ionicLoading.hide();
					if (response.status == '1') {
						window.plugins.toast.showWithOptions({
							message: toastMessage,
							duration: 'short', // 2000 ms
							position: 'bottom'
						}, function(result) {
							if (result.event === 'hide') {
								$scope.goTo('menu.communities', {});
							}
						});
					} else {
						Alert.showAlert('Oops!!', 'Error saving data.');
					}
				}).error(function (err) {
					$ionicLoading.hide();
					Alert.showAlert('Oops!!', err);
				});
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('TeamsCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.teams = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: 1,
		searchAlphabet: null,
		teamname: null
	};

	$scope.setPlatform = function(platform) {
		$scope.pagination.page = 0;
		$scope.pagination.platform = platform.id;
		$scope.teams = [];
		$scope.index();
	};

	$scope.search = function() {
		$scope.pagination.page = 0;
		$scope.teams = [];
		$scope.index();
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		postData['platform'] = $scope.pagination.platform;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		if ($scope.pagination.searchAlphabet) {
			postData['alphabet'] = $scope.pagination.searchAlphabet;
		}
		if ($scope.pagination.teamname) {
			postData['teamname'] = $scope.pagination.teamname;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_teams',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.teams.push.apply($scope.teams, data.Teamlist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			$scope.noMoreItemsAvailable = true;
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};

	$scope.likeDislike = function(team) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['team_id'] = parseInt(team.TeamID, 10);
			postData['user_id'] = userId;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'teamlike',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					team.Tlike = data.Tlike;
					team.islike = data.islike;
					window.plugins.toast.showWithOptions({
						message: data.msg,
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.teamFollow = function(team) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['team_id'] = parseInt(team.TeamID, 10);
			postData['user_id'] = userId;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'teamfollow',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					window.plugins.toast.showWithOptions({
						message: data.msg,
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.teamJoin = function(team) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['team_id'] = parseInt(team.TeamID, 10);
			postData['user_id'] = userId;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'teamjoin',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					window.plugins.toast.showWithOptions({
						message: data.msg,
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};
})

.controller('TeamViewCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.view = 'about';

	$scope.toggleView = function(type) {
		$scope.view = type;
	};

	$scope.team = {};

	$scope.getTeam = function() {
		$ionicLoading.show();
		var postData = {};
		postData['team_id'] = parseInt($stateParams.teamId, 10);
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'teamdetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.team = data.Teamdetails[0];
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getTeam();
})

.controller('TeamAddCtrl', function($scope, $filter, $ionicLoading, $httpParamSerializer, $q, $http, WebService, Alert, LocalStorage) {
	$scope.team = {};
	$scope.submitted = false;

	var imageKey = undefined;
	var imageURI = undefined;
	var normalImages = {};

	$scope.captureImage = function(ikey, h, w) {
		var options = {
			// Some common settings are 20, 50, and 100
			quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: true,
			targetHeight: h,
			targetWidth: w,
			correctOrientation: true  //Corrects Android orientation quirks
		};

		navigator.camera.getPicture(function cameraSuccess(imageUri) {
			$scope.team[ikey] = imageUri;
			normalImages[ikey] = imageUri;
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
				$scope.$apply();
			}
		}, function cameraError(error) {
			console.debug("Unable to obtain picture: " + error, "app");
		}, options);
	};

	$scope.selectImage = function(ikey, w, h) {
		console.log("Select Image");
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					// $ionicLoading.show();
					console.log('Image URI: ' + results[0]);
					var imageUri = results[0];
					$scope.team[ikey] = imageUri;
					normalImages[ikey] = imageUri;
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
						$scope.$apply();
					}
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1,
				width: w,
				height: h
			}
		);
	};

	$scope.addTeam = function(teamData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var allouterPromises = [];
			// set form data
			var fd = new FormData();
			var userID = LocalStorage.get('UserID');
			fd.append('user_id', userID);
			fd.append('teamname', teamData.teamname);
			fd.append('teamblast', teamData.teamblast);
			fd.append('teamplatformid', teamData.teamplatformid);
			fd.append('teamtag', teamData.teamtag);
			fd.append('teamwebsite', teamData.teamwebsite);
			fd.append('teamisrecruitingmember', teamData.teamisrecruitingmember);

			angular.forEach(normalImages, function(image, imageKey) {
				var outerPromise = $q.defer();
				window.resolveLocalFileSystemURL(image, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([this.result], { type:file.type});
							fd.append(imageKey, imgBlob);
							fd.append(imageKey+'Name', file.name);
							outerPromise.resolve();
						};
						reader.readAsArrayBuffer(file);
					});
				});
				allouterPromises.push(outerPromise.promise);
			});

			$q.all(allouterPromises).then(function() {
				var action = 'create_team';
				var toastMessage = 'Team added..!';
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + action,
					// url: 'http://192.168.0.50/scripts/test.php',
					data: fd,
					headers: {
						'Content-Type': undefined
					}
				};

				$http(options).success(function (response) {
					$ionicLoading.hide();
					if (response.status == '1') {
						window.plugins.toast.showWithOptions({
							message: toastMessage,
							duration: 'short', // 2000 ms
							position: 'bottom'
						}, function(result) {
							if (result.event === 'hide') {
								$scope.goTo('menu.teams', {});
							}
						});
					} else {
						Alert.showAlert('Oops!!', 'Error saving data.');
					}
				}).error(function (err) {
					$ionicLoading.hide();
					Alert.showAlert('Oops!!', err);
				});
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('NewsMainCtrl', function($scope, $ionicLoading, $ionicSlideBoxDelegate, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.items = [];
	$scope.sliderImages = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: null
	};

	$scope.changePatform = function(platform) {
		$scope.items = [];
		$scope.pagination.page = 0;
		$scope.pagination.platform = platform;
		$scope.index();
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		postData['platform'] = $scope.pagination.platform;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = parseInt(userId, 10);
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_newsfeed',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.sliderImages = data.sliderimagelist;
				$scope.items.push.apply($scope.items, data.Newsfeedlist);
				$scope.pagination.page += 1;
				$ionicSlideBoxDelegate.$getByHandle('news-slider').update();
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			$scope.noMoreItemsAvailable = true;
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};
})

.controller('NewsViewCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.newsDetails = {};
	$scope.relatedNews = [];

	$scope.viewNews = function() {
		$ionicLoading.show();
		var postData = {};
		postData['newsfeedid'] = parseInt($stateParams.newsId, 10);
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_newsfeeddetail',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.newsDetails = data.Newsfeeddetail;
				$scope.relatedNews = data.Relatednews;
			} else {
				Alert.showAlert('Oppss..!', error.data.msg);
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.viewNews();
})

.controller('NewsFriendsCtrl', function($scope, $ionicLoading, $ionicModal, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.items = [];
	$scope.comments = [];
	$scope.statusData = {};
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = parseInt(userId, 10);
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_friendsnewsfeed',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.items.push.apply($scope.items, data.Newsfeedlist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			$scope.noMoreItemsAvailable = true;
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};

	$ionicModal.fromTemplateUrl('templates/modals/comments.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.newsCommentsModal = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modals/birthdays.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.pollsModal = modal;
	});

	var commentId = undefined;
	$scope.myItem = {};

	$scope.getMyComments = function(item) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			$scope.myItem = item;
			commentId = item.TimlinePostId;
			var postData = {};
			postData['user_id'] = parseInt(userId, 10);
			postData['timelinpostid'] = commentId;
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'get_allstatuscomment',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					$scope.comments = data.CommentList;
					$scope.newsCommentsModal.show();
				} else {
					Alert.showAlert('Oppss..!', 'Game details not available.');
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	};

	$scope.closeComments = function() {
		commentId = undefined;
		commentCategory = undefined;
		$scope.comments = [];
		$scope.newsCommentsModal.hide();
	};

	$scope.postComment = function(commentTxt) {
		console.log('Hello');
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['timelinpostid'] = parseInt(commentId, 10);
			postData['user_id'] = userId;
			postData['commenttext'] = commentTxt;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'add_commentpost',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					window.plugins.toast.showWithOptions({
						message: 'Comment added..!',
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
							$scope.comments = data.CommentList;
							$scope.myItem.CountCommentpost = data.CommentList.length;
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.addNewStatus = function(statusData) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['fromid'] = parseInt(userId, 10);
			postData['toid'] = parseInt(userId, 10);
			postData['statustext'] = statusData.text
			postData['privacy'] = statusData.privacy;
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'add_newstatus',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {

				} else {
					Alert.showAlert('Oppss..!', 'Game details not available.');
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	};
})

.controller('NewsGlobalCtrl', function($scope, $ionicLoading, $ionicModal, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.items = [];
	$scope.comments = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0
	};

	$ionicModal.fromTemplateUrl('templates/modals/polls.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.pollsModal = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modals/did-you-know.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.knowModal = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modals/tournaments.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.tournamentsModal = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modals/trending-now.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.trendingNowModal = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modals/latest-videos.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.latestVideosModal = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modals/comments.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.newsCommentsModal = modal;
	});

	$scope.closeTrendingNow = function() {
		$scope.trendingNowModal.hide();
	};

	$scope.trendingnews = [];
	$scope.showTrendingNow = function() {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			var postData = {};
			postData['PNO'] = 0;
			postData['user_id'] = userId;
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'trendingnews',
				data: postData
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					$scope.trendingnews = data.TrendingNewsList;
					$scope.trendingNowModal.show();
				} else {
					$scope.noMoreItemsAvailable = true;
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$scope.$broadcast('scroll.infiniteScrollComplete');
				// called no matter success or failure
			});
		}
	};

	$scope.closeLatestVideos = function() {
		$scope.latestVideosModal.hide();
	};

	$scope.showLatestVideos = function() {
		$scope.latestVideosModal.show();
	};

	$scope.closePolls = function() {
		$scope.pollsModal.hide();
	};

	$scope.showPolls = function() {
		$scope.pollsModal.show();
	};

	$scope.trendingTournaments = [];
	$scope.showTournament = function() {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			var postData = {};
			postData['PNO'] = 0;
			postData['user_id'] = userId;
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'trendingtournaments',
				data: postData
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					$scope.trendingTournaments = data.TrendingTournament;
					$scope.tournamentsModal.show();
				} else {
					$scope.noMoreItemsAvailable = true;
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$scope.$broadcast('scroll.infiniteScrollComplete');
				// called no matter success or failure
			});
		}
	};

	$scope.closeTournament = function() {
		$scope.tournamentsModal.hide();
	};

	$scope.showKnow = function() {
		$scope.didyouknowData = [];
		$ionicLoading.show();
		var options = {
			method: 'GET',
			url: appConfig.baseUrl + 'didyouknow'
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.didyouknowData = data.Facts;
				$scope.knowModal.show();
			} else {
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.closeKnow = function() {
		$scope.knowModal.hide();
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_globalnewsfeed',
			data: postData
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.items.push.apply($scope.items, data.Newsfeedlist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};
	var commentId = undefined;
	$scope.myItem = {};

	$scope.getMyComments = function(item) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			$scope.myItem = item;
			commentId = item.TimlinePostId;
			var postData = {};
			postData['user_id'] = parseInt(userId, 10);
			postData['timelinpostid'] = commentId;
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'get_allstatuscomment',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					$scope.comments = data.CommentList;
					$scope.newsCommentsModal.show();
				} else {
					Alert.showAlert('Oppss..!', 'Game details not available.');
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	};

	$scope.closeComments = function() {
		commentId = undefined;
		commentCategory = undefined;
		$scope.comments = [];
		$scope.newsCommentsModal.hide();
	};

	$scope.postComment = function(commentTxt) {
		console.log('Hello');
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['timelinpostid'] = parseInt(commentId, 10);
			postData['user_id'] = userId;
			postData['commenttext'] = commentTxt;

			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'add_commentpost',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					window.plugins.toast.showWithOptions({
						message: 'Comment added..!',
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
							$scope.comments = data.CommentList;
							$scope.myItem.CountCommentpost = data.CommentList.length;
						}
					});
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
				// called no matter success or failure
			});
		}
	};

	$scope.addNewStatus = function(statusData) {
		var userId = LocalStorage.get('UserID');
		if (userId) {
			$ionicLoading.show();
			var postData = {};
			postData['fromid'] = parseInt(userId, 10);
			postData['toid'] = parseInt(userId, 10);
			postData['statustext'] = statusData.text
			postData['privacy'] = statusData.privacy;
			var options = {
				method: 'POST',
				url: appConfig.baseUrl + 'add_newstatus',
				data: $httpParamSerializer(postData)
			};

			WebService.call(options).then(function(response) {
				console.log(JSON.stringify(response));
				var data = response.data;
				if (data.status == '1') {
					window.plugins.toast.showWithOptions({
						message: 'Post added..!',
						duration: 'short', // 2000 ms
						position: 'bottom'
					}, function(result) {
						if (result.event === 'hide') {
							$scope.items.unshift(data.StatusList[0]);
						}
					});
				} else {
					Alert.showAlert('Oppss..!', 'Game details not available.');
				}
			}, function(error) {
				Alert.showAlert('Oppss..!', error.data.msg);
			}).finally(function() {
				$ionicLoading.hide();
			});
		}
	};
})

.controller('ExploreCtrl', function($scope, $ionicLoading, $ionicModal, $httpParamSerializer, WebService, Alert, LocalStorage) {

  $scope.recommndations = {};
  $scope.preferences = {};
 $scope.trendings = {};
  $scope.searchData = {};

	$scope.view = 'recommendations';

	$scope.toggleView = function(type) {
		$scope.view = type;
  };

  //noddy is working on search

  $scope.getSearchResult = function(searchData) {

    $ionicLoading.show();

    var postData = {};
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
    }
    console.log(searchData.searchstring);
    postData['searchtext'] = searchData.searchstring;
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'explore',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
        console.log(data);

        //noddy will write something here
        $scope.trendings = data.trending;
        $scope.view = 'search';
        //noddy will write something here

			} else {
				$ionicLoading.hide();
			}
		}, function(error) {
			$ionicLoading.hide();
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

  //

	$scope.getYourPreferences = function() {
		$ionicLoading.show();
		var postData = {};
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'yourpreferrence',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			//console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.recommndations = data.yourpreferences;
				$scope.preferences = data.ourrecommndations;
			} else {
				$ionicLoading.hide();
			}
		}, function(error) {
			$ionicLoading.hide();
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getYourPreferences();


})


.controller('TournamentsCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.view = 'overview';
	$scope.tournaments = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: 1,
		searchAlphabet: null,
		tournamentname: null,
		tournamenttype: '0'
	};

	$scope.setPlatform = function(platform) {
		$scope.pagination.platform = platform.id;
		$scope.pagination.page = 0;
		$scope.tournaments = [];
		$scope.index();
	};

	$scope.search = function() {
		$scope.tournaments = [];
		$scope.pagination.page = 0;
		$scope.index();
	};

	$scope.toggleView = function(type) {
		$scope.view = type;
	};

	$scope.index = function(category) {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		postData['platform'] = $scope.pagination.platform;
		postData['tournamenttype'] = $scope.pagination.tournamenttype;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		if ($scope.pagination.searchAlphabet) {
			postData['alphabet'] = $scope.pagination.searchAlphabet;
		}
		if ($scope.pagination.tournamentname) {
			postData['tournamentname'] = $scope.pagination.tournamentname;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_tournaments',
			data: postData
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.tournaments.push.apply($scope.tournaments, data.Tournamentlist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};
})

.controller('TournamentViewCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.view = 'overview';

	$scope.toggleView = function(type) {
		$scope.view = type;
	};

	$scope.tournament = {};

	$scope.getTournament = function() {
		$ionicLoading.show();
		var postData = {};
		postData['tournament_id'] = parseInt($stateParams.tournamentId, 10);;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'tournamentdetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				// $scope.tournament = data.Teamdetails[0];
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getTournament();
})

.controller('TournamentAddCtrl', function($scope, $filter, $ionicLoading, $httpParamSerializer, $q, $http, WebService, Alert, LocalStorage) {
	$scope.tournament = {};
	$scope.submitted = false;

	var imageKey = undefined;
	var imageURI = undefined;
	var normalImages = {};

	$scope.captureImage = function(ikey, h, w) {
		var options = {
			// Some common settings are 20, 50, and 100
			quality: 100,
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: Camera.PictureSourceType.CAMERA,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: true,
			targetHeight: h,
			targetWidth: w,
			correctOrientation: true  //Corrects Android orientation quirks
		};

		navigator.camera.getPicture(function cameraSuccess(imageUri) {
			$scope.tournament[ikey] = imageUri;
			normalImages[ikey] = imageUri;
			if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
				$scope.$apply();
			}
		}, function cameraError(error) {
			console.debug("Unable to obtain picture: " + error, "app");
		}, options);
	};

	$scope.selectImage = function(ikey, w, h) {
		console.log("Select Image");
		window.imagePicker.getPictures(
			function(results) {
				if (results.length >= 1) {
					// $ionicLoading.show();
					console.log('Image URI: ' + results[0]);
					var imageUri = results[0];
					$scope.tournament[ikey] = imageUri;
					normalImages[ikey] = imageUri;
					if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
						$scope.$apply();
					}
				}
			}, function (error) {
				console.log('Error: ' + error);
			}, {
				maximumImagesCount: 1,
				width: w,
				height: h
			}
		);
	};

	$scope.addTournament = function(tournamentData, inValid) {
		$scope.submitted = true;
		if (!inValid) {
			$ionicLoading.show();
			var allouterPromises = [];
			// set form data
			var fd = new FormData();
			var userID = LocalStorage.get('UserID');
			fd.append('user_id', userID);
			fd.append('tournamenttype', tournamentData.tournamenttype);
			fd.append('tournamenttitle', tournamentData.tournamenttitle);
			fd.append('tournamentplatform', tournamentData.tournamentplatform);
			var tournamentDate = $filter('date')(tournamentData.tournamentdate, "yyyy-MM-dd");
			fd.append('tournamentdate', tournamentDate);
			var fromHours = tournamentData.fromHours;
			if (tournamentData.fromMeridiem == 'am' && fromHours == 12) {
				fromHours = '00';
			} else if (tournamentData.fromMeridiem == 'pm' && fromHours != 12) {
				fromHours += 12;
			}
			fd.append('tournamentstarttime', fromHours + ':' + tournamentData.fromMinutes + ':00');
			var checkInHours = tournamentData.checkInHours;
			if (tournamentData.checkInMeridiem == 'am' && checkInHours == 12) {
				checkInHours = '00';
			} else if (tournamentData.checkInMeridiem == 'pm' && checkInHours != 12) {
				checkInHours += 12;
			}
			fd.append('tournamentcheckintime', checkInHours + ':' + tournamentData.checkInMinutes + ':00');
			var checkOutHours = tournamentData.checkOutHours;
			if (tournamentData.checkOutMeridiem == 'am' && checkOutHours == 12) {
				checkOutHours = '00';
			} else if (tournamentData.checkOutMeridiem == 'pm' && checkOutHours != 12) {
				checkOutHours += 12;
			}
			fd.append('tournamentcheckouttime', checkOutHours + ':' + tournamentData.checkOutMinutes + ':00');
			fd.append('tournamentnumberofteams', tournamentData.tournamentnumberofteams);
			fd.append('tournamentnumberofplayers', tournamentData.tournamentnumberofplayers);
			fd.append('tournamententryfees', tournamentData.tournamententryfees);
			fd.append('tournamentprize', tournamentData.tournamentprize);
			fd.append('tournamentnormalrules', tournamentData.tournamentnormalrules);
			fd.append('tournamentrules', tournamentData.tournamentrules);
			fd.append('tournamentrulesdetails', tournamentData.tournamentrulesdetails);

			angular.forEach(normalImages, function(image, imageKey) {
				var outerPromise = $q.defer();
				window.resolveLocalFileSystemURL(image, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							var imgBlob = new Blob([this.result], { type:file.type});
							fd.append(imageKey, imgBlob);
							fd.append(imageKey+'Name', file.name);
							outerPromise.resolve();
						};
						reader.readAsArrayBuffer(file);
					});
				});
				allouterPromises.push(outerPromise.promise);
			});

			$q.all(allouterPromises).then(function() {
				var action = 'create_tournament';
				var toastMessage = 'Tournament added..!';
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + action,
					// url: 'http://192.168.0.50/scripts/test.php',
					data: fd,
					headers: {
						'Content-Type': undefined
					}
				};

				$http(options).success(function (response) {
					$ionicLoading.hide();
					if (response.status == '1') {
						window.plugins.toast.showWithOptions({
							message: toastMessage,
							duration: 'short', // 2000 ms
							position: 'bottom'
						}, function(result) {
							if (result.event === 'hide') {
								$scope.goTo('menu.tournaments', {});
							}
						});
					} else {
						Alert.showAlert('Oops!!', 'Error saving data.');
					}
				}).error(function (err) {
					$ionicLoading.hide();
					Alert.showAlert('Oops!!', err);
				});
			});
		} else {
			window.plugins.toast.showWithOptions({
				message: 'Please fill form properly',
				duration: 'short', // 2000 ms
				position: 'bottom',
				styling: {
					backgroundColor: '#FF0000',
					textColor: '#FFFF00'
				}
			});
		}
	};
})

.controller('StreamsVideosCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.videoView = {
		view: 'trending'
	};
	$scope.videos = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: 1,
		category: 1,
		searchAlphabet: null,
		videoname: null
	};

	$scope.setPlatform = function(platform) {
		$scope.pagination.platform = platform.id;
		$scope.pagination.page = 0;
		$scope.videos = [];
		$scope.index($scope.videoView.view);
	};

	$scope.search = function() {
		$scope.videos = [];
		$scope.pagination.page = 0;
		$scope.index($scope.videoView.view);
	};
	var categories = {
		'trending': 1,
		'top-10-goals': 2,
		'top-10-killstreak': 3
	};

	$scope.toggleView = function(type) {
		$scope.videos = [];
		$scope.videoView.view = type;
		$scope.index(type);
	};

	$scope.index = function(category) {
		$scope.pagination.category = categories[category];
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_videos',
			data: $scope.pagination
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.videos.push.apply($scope.videos, data.Videolist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};
})

.controller('ProductsCtrl', function($scope, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.products = [];
	$scope.noMoreItemsAvailable = false;
	$scope.pagination = {
		page : 0,
		platform: 1,
		searchAlphabet: null,
		productname: null
	};

	$scope.setPlatform = function(platform) {
		$scope.pagination.platform = platform.id;
		$scope.products = [];
		$scope.index();
	};

	$scope.search = function() {
		$scope.products = [];
		$scope.index();
	};

	$scope.index = function() {
		var postData = {};
		postData['PNO'] = $scope.pagination.page;
		postData['platform'] = $scope.pagination.platform;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		if ($scope.pagination.productname) {
			postData['productname'] = $scope.pagination.productname;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_products',
			data: postData
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.products.push.apply($scope.products, data.productlist);
				$scope.pagination.page += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};
})

.controller('ProductViewCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.view = 'about';

	$scope.toggleView = function(type) {
		$scope.view = type;
	};

	$scope.product = {};

	$scope.getProduct = function() {
		$ionicLoading.show();
		var postData = {};
		postData['product_id'] = parseInt($stateParams.productId, 10);;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'productsdetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.product = data.Productdetails[0];
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getProduct();
})

.controller('IntroCtrl', function($scope, LocalStorage) {
	$scope.checkStatus = function() {
		var status = LocalStorage.get('sliderShown');
		if (status) {
			var userId = LocalStorage.get('UserID');
			if (userId) {
				$scope.userInfo['userId'] = userId;
				var interestFilled = LocalStorage.get('interestFilled');
				if (interestFilled) {
					$scope.goTo('menu.profile', {userId: userId});
				} else {
					$scope.goTo('menu.interests', {});
				}
			} else {
				$scope.goTo('app.login-register', {});
			}
		} else {
			LocalStorage.set('sliderShown', 'shown');
		}
	};
})

.controller('InterestsCtrl', function($scope, $ionicLoading, $httpParamSerializer, $q, LocalStorage, WebService, Alert) {
	$scope.interests = [
		{
			id: 1,
			icon: 'img/icon-action.png',
			activeIcon: 'img/icon-action-active.png',
			title: 'action',
			selected: false
		},
		{
			id: 2,
			icon: 'img/icon-action-adventure.png',
			activeIcon: 'img/icon-action-adventure-active.png',
			title: 'Action-adventure',
			selected: false
		},
		{
			id: 3,
			icon: 'img/icon-adventure.png',
			activeIcon: 'img/icon-adventure-active.png',
			title: 'adventure',
			selected: false
		},
		{
			id: 4,
			icon: 'img/icon-role-laying.png',
			activeIcon: 'img/icon-role-laying-active.png',
			title: 'Role Playing',
			selected: false
		},
		{
			id: 5,
			icon: 'img/icon-simulation.png',
			activeIcon: 'img/icon-simulation-active.png',
			title: 'simulation',
			selected: false
		},
		{
			id: 6,
			icon: 'img/icon-strategy.png',
			activeIcon: 'img/icon-strategy-active.png',
			title: 'strategy',
			selected: false
		},
		{
			id: 7,
			icon: 'img/icon-sports.png',
			activeIcon: 'img/icon-sports-active.png',
			title: 'sports',
			selected: false
		},
		{
			id: 9,
			icon: 'img/icon-racing.png',
			activeIcon: 'img/icon-racing-active.png',
			title: 'racing',
			selected: false
		},
		{
			id: 8,
			icon: 'img/icon-others.png',
			activeIcon: 'img/icon-others-active.png',
			title: 'others',
			selected: false
		}
	];

	$scope.toggleSelection = function(interest) {
		interest.selected = !interest.selected;
	};

	$scope.getUserSession();

	$scope.saveInterest = function() {
		var genrelist = [];

		var allPromises = [];
		angular.forEach($scope.interests, function(interest, interestKey) {
			var deferrer = $q.defer();
			if (interest.selected) {
				genrelist.push({'ID': interest.id});
			}

			deferrer.resolve();
			allPromises.push(deferrer.promise);
		});

		$q.all(allPromises).then(function() {
			if (genrelist.length > 0) {
				$ionicLoading.show();
				var postData = {};
				var userId = LocalStorage.get('UserID');
				postData['user_id'] = userId;
				postData['genrelist'] = JSON.stringify(genrelist);
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + 'store_genere',
					data: $httpParamSerializer(postData)
				};

				WebService.call(options).then(function(response) {
					console.log(JSON.stringify(response));
					var data = response.data;
					if (data.status == '1') {
						$scope.goTo('menu.platform', {});
					}
				}, function(error) {
					Alert.showAlert('Oppss..!', error.data.msg);
				}).finally(function() {
					// called no matter success or failure
					$ionicLoading.hide();
				});
			} else {
				window.plugins.toast.showWithOptions({
					message: 'Please select any one genre.',
					duration: 'short', // 2000 ms
					position: 'bottom',
					styling: {
						backgroundColor: '#FF0000',
						textColor: '#FFFF00'
					}
				});
			}
		});
	};
})

.controller('PlatformCtrl', function($scope, $ionicLoading, $httpParamSerializer, $q, LocalStorage, WebService, Alert) {
	$scope.platforms = [
		{
			id: 2,
			icon: 'img/icon-playstation.png',
			activeIcon: 'img/icon-playstation-active.png',
			title: 'playstation',
			selected: false
		},
		{
			id: 3,
			icon: 'img/icon-xbox.png',
			activeIcon: 'img/icon-xbox-active.png',
			title: 'xbox',
			selected: false
		},
		{
			id: 4,
			icon: 'img/icon-nintendo.png',
			activeIcon: 'img/icon-nintendo-active.png',
			title: 'nintendo',
			selected: false
		},
		{
			id: 1,
			icon: 'img/icon-pc.png',
			activeIcon: 'img/icon-pc-active.png',
			title: 'pc',
			selected: false
		},
		{
			id: 5,
			icon: 'img/icon-mobile.png',
			activeIcon: 'img/icon-mobile-active.png',
			title: 'mobile',
			selected: false
		},
		{
			id: 6,
			icon: 'img/icon-vr.png',
			activeIcon: 'img/icon-vr-active.png',
			title: 'vr',
			selected: false
		}
	];

	$scope.toggleSelection = function(platform) {
		platform.selected = !platform.selected;
	};

	$scope.getUserSession();

	$scope.savePlatforms = function() {
		var platformlist = [];

		var allPromises = [];
		angular.forEach($scope.platforms, function(platform, platformKey) {
			var deferrer = $q.defer();
			if (platform.selected) {
				platformlist.push({'ID': platform.id});
			}

			deferrer.resolve();
			allPromises.push(deferrer.promise);
		});

		$q.all(allPromises).then(function() {
			if (platformlist.length > 0) {
				$ionicLoading.show();
				var postData = {};
				var userID = LocalStorage.get('UserID');
				postData['user_id'] = userID;
				postData['platformlist'] = JSON.stringify(platformlist);
				var options = {
					method: 'POST',
					url: appConfig.baseUrl + 'store_platforms',
					data: $httpParamSerializer(postData)
				};

				WebService.call(options).then(function(response) {
					console.log(JSON.stringify(response));
					var data = response.data;
					if (data.status == '1') {
						LocalStorage.set('interestFilled', 'filled');
						$scope.goTo('menu.profile', {userId: userID});
					}
				}, function(error) {
					Alert.showAlert('Oppss..!', error.data.msg);
				}).finally(function() {
					// called no matter success or failure
					$ionicLoading.hide();
				});
			} else {
				window.plugins.toast.showWithOptions({
					message: 'Please select any one platform.',
					duration: 'short', // 2000 ms
					position: 'bottom',
					styling: {
						backgroundColor: '#FF0000',
						textColor: '#FFFF00'
					}
				});
			}
		});
	};
})

.controller('CafeLocatorCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	var postData = {};
	$scope.cafes = [];
	$scope.noMoreItemsAvailable = false;
	$scope.search = {};

	// Map object
	$scope.map = {
		center: {
			latitude: $scope.userInfo.lat,
			longitude: $scope.userInfo.lng
		},
		zoom: 10,
		control: {}
	};

	$scope.marker = {
		id: 0,
		coords: {
			latitude: $scope.userInfo.lat,
			longitude: $scope.userInfo.lng
		},
		options: { draggable: true },
		events: {
			dragend: function (marker, eventName, args) {
				console.log('marker dragend');
				var lati = marker.getPosition().lat();
				var longi = marker.getPosition().lng();
				console.log('Lat - ' + lati);
				console.log('Lon - ' + longi);
				postData = {
					PNO: 0,
					lat: lati,
					long: longi
				};
				$scope.cafes = [];
				$scope.index();
			}
		}
	};

	$scope.searchCafe = function(searchText) {
		postData = {
			PNO: 0,
			gamecafetext: searchText
		};

		$scope.cafes = [];
		$scope.index();
	};

	$scope.refreshLocation = function() {
		$scope.getCurrentLocation().then(function(coords) {
			$scope.map.center.latitude = coords.latitude;
			$scope.map.center.longitude = coords.longitude;
			$scope.marker.coords.latitude = coords.latitude;
			$scope.marker.coords.longitude = coords.longitude;
			$scope.map.control.refresh();
			postData = {
				PNO: 0,
				lat: coords.latitude,
				long: coords.longitude
			};

			$scope.cafes = [];
			$scope.index();
		});
	};

	$scope.index = function() {
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'get_gamecafes',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.cafes.push.apply($scope.cafes, data.Cafelist);
				postData.PNO += 1;
			} else {
				$scope.noMoreItemsAvailable = true;
			}
		}, function(error) {
			$scope.noMoreItemsAvailable = true;
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			// called no matter success or failure
		});
	};
})

.controller('CafeViewCtrl', function($scope, $stateParams, $ionicLoading, $httpParamSerializer, WebService, Alert, LocalStorage) {
	$scope.cafe = {};

	$scope.map = {
		center: {
			latitude: $scope.userInfo.lat,
			longitude: $scope.userInfo.lng
		},
		zoom: 10,
		control: {}
	};

	$scope.marker = {
		id: 0,
		coords: {
			latitude: $scope.userInfo.lat,
			longitude: $scope.userInfo.lng
		},
		options: { draggable: false },
		events: {}
	};

	$scope.getCafe = function() {
		$ionicLoading.show();
		var postData = {};
		postData['user_id'] = parseInt($stateParams.cafeId, 10);;
		var userId = LocalStorage.get('UserID');
		if (userId) {
			postData['user_id'] = userId;
		}
		var options = {
			method: 'POST',
			url: appConfig.baseUrl + 'cafedetails',
			data: $httpParamSerializer(postData)
		};

		WebService.call(options).then(function(response) {
			console.log(JSON.stringify(response));
			var data = response.data;
			if (data.status == '1') {
				$scope.cafe = data.Cafedetails[0];
				$scope.map.center.latitude = $scope.cafe.GamingcafeLat;
				$scope.map.center.longitude = $scope.cafe.GamingcafeLong;
				$scope.marker.coords.latitude = $scope.cafe.GamingcafeLat;
				$scope.marker.coords.longitude = $scope.cafe.GamingcafeLong;
			}
		}, function(error) {
			Alert.showAlert('Oppss..!', error.data.msg);
		}).finally(function() {
			$ionicLoading.hide();
			// called no matter success or failure
		});
	};

	$scope.getCafe();
})

.controller('PlaylistsCtrl', function($scope) {
	$scope.playlists = [
		{ title: 'Reggae', id: 1 },
		{ title: 'Chill', id: 2 },
		{ title: 'Dubstep', id: 3 },
		{ title: 'Indie', id: 4 },
		{ title: 'Rap', id: 5 },
		{ title: 'Cowbell', id: 6 }
	];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.filter('range', function() {
	return function(input, total) {
		total = parseInt(total);

		for (var i=0; i<total; i++) {
			input.push(i);
		}

		return input;
	};
})

.filter('range2', function() {
	return function(input, min, max) {
		min = parseInt(min); //Make string input int
		max = parseInt(max);
		for (var i=min; i<max; i++)
			input.push(i);
		return input;
	};
})

.filter('cut', function () {
	return function (value, wordwise, max, tail) {
		if (!value) return '';

		max = parseInt(max, 10);
		if (!max) return value;
		if (value.length <= max) return value;

		value = value.substr(0, max);
		if (wordwise) {
			var lastspace = value.lastIndexOf(' ');
			if (lastspace !== -1) {
				//Also remove . and , so its gives a cleaner result.
				if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
					lastspace = lastspace - 1;
				}
				value = value.substr(0, lastspace);
			}
		}

		return value + (tail || ' …');
	};
})

.filter('formatTime', function ($filter) {
	return function (time, format) {
		if (time) {
			var parts = time.split(':');
			var date = new Date(0, 0, 0, parts[0], parts[1], parts[2]);
			return $filter('date')(date, format || 'h:mm a');
		}
	};
})

.filter('dateSuffix', function($filter) {
	var suffixes = ["th", "st", "nd", "rd"];
	return function(input) {
		if (input) {
			var dtfilter = $filter('date')(input, 'MMMM dd');
			var day = parseInt(dtfilter.slice(-2));
			var relevantDigits = (day < 30) ? day % 20 : day % 30;
			var suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
			return day+suffix;
		}
	};
})

.filter('timeTillNow', function($filter) {
	return function(input) {
		var output = '';
		var inputDate = new Date(input);
		var now = new Date();
		var seconds = Math.floor((now - (inputDate))/1000);
		if (seconds < 60) {
			return seconds + ' seconds';
		}
		var minutes = Math.floor(seconds/60);
		if (minutes < 60) {
			return minutes + ' minutes';
		}
		var hours = Math.floor(minutes/60);
		if (hours < 24) {
			return hours + ' hours';
		}
		var days = Math.floor(hours/24);

		return days + 'days';
	};
})

.filter('unsafe', function($sce) { return $sce.trustAsHtml; })

.filter('twoDigit', function(){
   return function(value){
     value = parseInt(value);
      if(!isNaN(value)) {
      	if (value >= 0 && value < 10) {
      		return "0"+ value;
      	}
      	return value;
      }
      return "00";
   }
});
