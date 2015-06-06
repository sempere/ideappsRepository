var menuItems = [
    {payload: '1', text: 'Never'},
    {payload: '2', text: 'Every Night'},
    {payload: '3', text: 'Weeknights'},
    {payload: '4', text: 'Weekends'},
    {payload: '5', text: 'Weekly'},
];

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('financeApp', ['ionic', 'financeApp.controllers', 'financeApp.services', 'ngCordova']);
app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accsssory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
});
app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
            .state('signin', {
                url: '/sign-in',
                templateUrl: 'templates/sign-in.html'
            })
            .state('tabs', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })
            .state('tabs.finanzas', {
                url: '/finanzas',
                views: {
                    'finanzas-tab': {
                        templateUrl: 'templates/finanzas.html'
                    }
                }
            })
            .state('tabs.gastos', {
                url: '/gastos',
                views: {
                    'gastos-tab': {
                        templateUrl: 'templates/gastos.html'
                    }
                }
            })
            .state('tabs.gastosRepartidos', {
                url: '/gastosRepartidos',
                views: {
                    'gastosRepartidos-tab': {
                        templateUrl: 'templates/gastosRepartidos.html'
                    }
                }
            })
            .state('tabs.ingresos', {
                url: '/ingresos',
                views: {
                    'ingresos-tab': {
                        templateUrl: 'templates/ingresos.html'
                    }
                }
            })
            .state('tabs.productos', {
                url: '/productos',
                views: {
                    'productos-tab': {
                        templateUrl: 'templates/productos.html'
                    }
                }
            });
    $urlRouterProvider.otherwise('/sign-in');
});



