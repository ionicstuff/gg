var appConfig = {
	baseUrl: 'http://www.gamegods.com/webservice/',
	cometchat: {
		siteURL: 'http://www.gamegods.com/cometchat',
		licenceKey: 'RJ1GD-CM5OS-F4XTU-TE4HW-9XTJM',
		apiKey: 'dd934951955da17419e0d5e948bc13dc',
		initDone: false,
		loginDone: false
	}
};

angular.module('starter', ['ionic', 'ngSanitize', 'uiGmapgoogle-maps', 'color.picker', 'angular.vertilize', 'angularLazyImg', 'yaru22.angular-timeago', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform, LocalStorage) {
	$ionicPlatform.ready(function() {
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}

		console.log('Init now');

		if(ionic.Platform.isIOS()) {
			// init cometchat for ios
		} else {
			console.log('Platform is android');
		}
	});
})

.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
	$sceDelegateProvider.resourceUrlWhitelist(['self',
		'https://www.youtube.com/embed/*',
	]);
	$stateProvider
	.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/app/container.html',
		controller: 'AppCtrl'
	})

	.state('app.intro', {
		url: '/intro',
		views: {
			'defaultView': {
				templateUrl: 'templates/app/intro.html',
				controller: 'IntroCtrl'
			}
		}
	})

	.state('app.login-register', {
		url: '/login-register',
		views: {
			'defaultView': {
				templateUrl: 'templates/app/login-register.html',
				controller: 'IntroCtrl'
			}
		}
	})

	.state('app.login', {
		url: '/login',
		views: {
			'defaultView': {
				templateUrl: 'templates/app/login.html',
				controller: 'LoginCtrl'
			}
		}
	})

	.state('app.signup', {
		url: '/signup',
		views: {
			'defaultView': {
				templateUrl: 'templates/app/signup.html',
				controller: 'SignupCtrl'
			}
		}
	})

	.state('app.forgot-password', {
		url: '/forgot-password',
		views: {
			'defaultView': {
				templateUrl: 'templates/app/forgot-password.html',
				controller: 'ForgotPwdCtrl'
			}
		}
	})

	.state('menu', {
		url: '/menu',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	})

	.state('menu.interests', {
		url: '/interests',
		views: {
			'menuContent': {
				templateUrl: 'templates/interests.html',
				controller: 'InterestsCtrl'
			}
		}
	})

	.state('menu.platform', {
		url: '/platform',
		views: {
			'menuContent': {
				templateUrl: 'templates/platform.html',
				controller: 'PlatformCtrl'
			}
		}
	})

	.state('menu.profile', {
		cache: false,
		url: '/profile/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/profile.html',
				controller: 'ProfileCtrl'
			}
		}
	})


	.state('menu.followers', {
		url: '/followers/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/followers.html',
				controller: 'FollowersCtrl'
			}
		}
	})

	.state('menu.following', {
		url: '/following/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/following.html',
				controller: 'FollowingCtrl'
			}
		}
	})

	.state('menu.friends', {
		url: '/friends/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/friends.html',
				controller: 'FriendsCtrl'
			}
		}
	})

	.state('menu.photos', {
		url: '/photos/:userId/:tab',
		views: {
			'menuContent': {
				templateUrl: 'templates/photos.html',
				controller: 'PhotosCtrl'
			}
		}
	})

	.state('menu.add-photo', {
		url: '/add-photo',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-photo.html'
			}
		}
	})

	.state('menu.add-album', {
		url: '/add-album',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-album.html',
				controller: 'CreateAlbumCtrl'
			}
		}
	})

	.state('menu.add-meme', {
		url: '/add-meme',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-meme.html',
				controller: 'CreateMemeCtrl'
			}
		}
	})

	.state('menu.albums', {
		url: '/albums',
		views: {
			'menuContent': {
				templateUrl: 'templates/albums.html'
			}
		}
	})

	.state('menu.user-liked-games', {
		url: '/user-liked-games/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/user-liked-games.html',
				controller: 'UserLikedGamesCtrl'
			}
		}
	})

	.state('menu.user-videos', {
		url: '/user-videos/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/user-videos.html',
				controller: 'UserVideosCtrl'
			}
		}
	})

	.state('menu.user-communities', {
		url: '/user-communities/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/user-communities.html',
				controller: 'UserCommunitiesCtrl'
			}
		}
	})

	.state('menu.user-teams', {
		url: '/user-teams/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/user-teams.html',
				controller: 'UserTeamsCtrl'
			}
		}
	})

	.state('menu.user-tournaments', {
		url: '/user-tournaments/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/user-tournaments.html',
				controller: 'UserTournamentsCtrl'
			}
		}
	})

	.state('menu.user-events', {
		url: '/user-events/:userId',
		views: {
			'menuContent': {
				templateUrl: 'templates/user-events.html',
				controller: 'UserEventsCtrl'
			}
		}
	})

	.state('menu.memes', {
		url: '/memes',
		views: {
			'menuContent': {
				templateUrl: 'templates/memes.html'
			}
		}
	})

	.state('menu.my-memes', {
		url: '/my-memes',
		views: {
			'menuContent': {
				templateUrl: 'templates/my-memes.html'
			}
		}
	})

	.state('menu.news-main', {
		cache: false,
		url: '/news-main',
		views: {
			'menuContent': {
				templateUrl: 'templates/news-main.html',
				controller: 'NewsMainCtrl'
			}
		}
	})

	.state('menu.news-friends', {
		cache: false,
		url: '/news-friends',
		views: {
			'menuContent': {
				templateUrl: 'templates/news-friends.html',
				controller: 'NewsFriendsCtrl'
			}
		}
	})

	.state('menu.news-global', {
		cache: false,
		url: '/news-global',
		views: {
			'menuContent': {
				templateUrl: 'templates/news-global.html',
				controller: 'NewsGlobalCtrl'
			}
		}
	})

	.state('menu.news-main-detail', {
		cache: false,
		url: '/news-main-detail/:newsId',
		views: {
			'menuContent': {
				templateUrl: 'templates/news-main-detail.html',
				controller: 'NewsViewCtrl'
			}
		}
	})

	.state('menu.games', {
		cache: false,
		url: '/games',
		views: {
			'menuContent': {
				templateUrl: 'templates/games.html',
				controller: 'GamesCtrl'
			}
		}
	})

	.state('menu.game-view', {
		cache: false,
		url: '/game-view/:gameId',
		views: {
			'menuContent': {
				templateUrl: 'templates/game-view.html',
				controller: 'GameViewCtrl'
			}
		}
	})

	.state('menu.add-game', {
		cache: false,
		url: '/add-game',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-game.html',
				controller: 'GameAddCtrl'
			}
		}
	})

	.state('menu.communities', {
		cache: false,
		url: '/communities',
		views: {
			'menuContent': {
				templateUrl: 'templates/communities.html',
				controller: 'CommunitiesCtrl'
			}
		}
	})

	.state('menu.add-community', {
		cache: false,
		url: '/add-community',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-community.html',
				controller: 'CommunityAddCtrl'
			}
		}
	})

	.state('menu.community-view', {
		cache: false,
		url: '/community-view/:communityId',
		views: {
			'menuContent': {
				templateUrl: 'templates/community-view.html',
				controller: 'CommunityViewCtrl'
			}
		}
	})

	.state('menu.teams', {
		cache: false,
		url: '/teams',
		views: {
			'menuContent': {
				templateUrl: 'templates/teams.html',
				controller: 'TeamsCtrl'
			}
		}
	})

	.state('menu.team-view', {
		cache: false,
		url: '/team-view/:teamId',
		views: {
			'menuContent': {
				templateUrl: 'templates/team-view.html',
				controller: 'TeamViewCtrl'
			}
		}
	})

	.state('menu.add-team', {
		cache: false,
		url: '/add-team',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-team.html',
				controller: 'TeamAddCtrl'
			}
		}
	})

	.state('menu.events', {
		cache: false,
		url: '/events',
		views: {
			'menuContent': {
				templateUrl: 'templates/events.html',
				controller: 'EventsCtrl'
			}
		}
	})

	.state('menu.add-event', {
		cache: false,
		url: '/add-event',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-event.html',
				controller: 'AddEventCtrl'
			}
		}
	})

	.state('menu.event-view', {
		cache: false,
		url: '/event-view/:eventId',
		views: {
			'menuContent': {
				templateUrl: 'templates/event-view.html',
				controller: 'EventCtrl'
			}
		}
	})

	.state('menu.tournaments', {
		cache: false,
		url: '/tournaments',
		views: {
			'menuContent': {
				templateUrl: 'templates/tournaments.html',
				controller: 'TournamentsCtrl'
			}
		}
	})

	.state('menu.add-tournament', {
		cache: false,
		url: '/add-tournament',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-tournament.html',
				controller: 'TournamentAddCtrl'
			}
		}
	})

	.state('menu.tournament-view', {
		cache: false,
		url: '/tournament-view/:tournamentId',
		views: {
			'menuContent': {
				templateUrl: 'templates/tournament-view.html',
				controller: 'TournamentViewCtrl'
			}
		}
	})

	.state('menu.tournament-brackets', {
		cache: false,
		url: '/tournament-brackets',
		views: {
			'menuContent': {
				templateUrl: 'templates/tournament-brackets.html'
			}
		}
	})

	.state('menu.shop-products', {
		cache: false,
		url: '/shop-products',
		views: {
			'menuContent': {
				templateUrl: 'templates/shop-products.html',
				controller: 'ProductsCtrl'
			}
		}
	})

	.state('menu.shop-product-auction', {
		cache: false,
		url: '/shop-product-auction',
		views: {
			'menuContent': {
				templateUrl: 'templates/shop-product-auction.html'
			}
		}
	})

	.state('menu.shop-product-view', {
		cache: false,
		url: '/shop-product-view/:productId',
		views: {
			'menuContent': {
				templateUrl: 'templates/shop-product-view.html',
				controller: 'ProductViewCtrl'
			}
		}
	})

	.state('menu.shop-product-cart', {
		cache: false,
		url: '/shop-product-cart',
		views: {
			'menuContent': {
				templateUrl: 'templates/shop-product-cart.html'
			}
		}
	})

	.state('menu.shop-product-checkout', {
		cache: false,
		url: '/shop-product-checkout',
		views: {
			'menuContent': {
				templateUrl: 'templates/shop-product-checkout.html'
			}
		}
	})

	.state('menu.shop-product-order-success', {
		cache: false,
		url: '/shop-product-order-success',
		views: {
			'menuContent': {
				templateUrl: 'templates/shop-product-order-success.html'
			}
		}
	})

	.state('menu.streams-videos', {
		cache: false,
		url: '/streams-videos',
		views: {
			'menuContent': {
				templateUrl: 'templates/streams-videos.html',
				controller: 'StreamsVideosCtrl'
			}
		}
	})

	.state('menu.leader-boards', {
		cache: false,
		url: '/leader-boards',
		views: {
			'menuContent': {
				templateUrl: 'templates/leader-boards.html'
			}
		}
	})

	.state('menu.cafe-locator', {
		cache: false,
		url: '/cafe-locator',
		views: {
			'menuContent': {
				templateUrl: 'templates/cafe-locator.html',
				controller: 'CafeLocatorCtrl'
			}
		}
	})

	.state('menu.cafe-locator-details', {
		cache: false,
		url: '/cafe-locator-details/:cafeId',
		views: {
			'menuContent': {
				templateUrl: 'templates/cafe-locator-details.html',
				controller: 'CafeViewCtrl'
			}
		}
	})

	.state('menu.add-cafe-user', {
		cache: false,
		url: '/add-cafe-user',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-cafe-user.html'
			}
		}
	})

	.state('menu.add-cafe-owner', {
		cache: false,
		url: '/add-cafe-owner',
		views: {
			'menuContent': {
				templateUrl: 'templates/add-cafe-owner.html'
			}
		}
	})

	.state('menu.explore', {
		cache: false,
		url: '/explore',
		views: {
			'menuContent': {
				templateUrl: 'templates/explore.html',
				controller: 'ExploreCtrl'
			}
		}
  })

  .state('menu.more', {
		cache: false,
		url: '/more',
		views: {
			'menuContent': {
				templateUrl: 'templates/more.html'
			}
		}
	})

	.state('menu.create-and-add', {
		cache: false,
		url: '/create-and-add',
		views: {
			'menuContent': {
				templateUrl: 'templates/create-and-add.html'
			}
		}
	})

	.state('menu.chats', {
		cache: false,
		url: '/chats',
		views: {
			'menuContent': {
				templateUrl: 'templates/chats.html'
			}
		}
	})

	.state('menu.terms-conditions', {
		cache: false,
		url: '/terms-conditions',
		views: {
			'menuContent': {
				templateUrl: 'templates/terms-conditions.html'
			}
		}
	})

	.state('menu.notifications', {
		cache: false,
		url: '/notifications',
		views: {
			'menuContent': {
				templateUrl: 'templates/notifications.html',
				controller: 'NotificationsCtrl'
			}
		}
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/intro');
});
