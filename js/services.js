var services = angular.module('financeApp.services', ['ionic']);
var db = null;
services.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {

    });
});
services.service('aService', function ($http) {
    var observerCallbacks = [];
    var resultados = [];

    this.getResultado = function (indice) {
        var indiceLista = -1;
        var resultadoFinal = undefined;
        angular.forEach(resultados, function (resultado, index) {
            if (resultado.indice === indice) {
                resultadoFinal = angular.copy(resultado.datos);
            }
        });
        resultados.splice(indiceLista, 1);
        return resultadoFinal;
    };
    //register an observer
    this.registerObserverCallback = function (callback, indice) {
        observerCallbacks.push({indice: indice, funcion: callback});
    };
    //call this when you know 'foo' has been changed
    var notifyObservers = function (indice) {
        var indiceLista = -1;
        angular.forEach(observerCallbacks, function (objetoObserver, index) {
            if (objetoObserver.indice === indice) {
                objetoObserver.funcion(indice);
                indiceLista = index;
            }
        });
        observerCallbacks.splice(indiceLista, 1);
    };
    this.callDAO = function (nombreFuncion, metodoWS, params, indice) {
        if (metodoWS === 'post') {
            $http.post("http://192.168.1.10:8081/api/" + nombreFuncion, params).
                    success(function (data) {
                        resultados.push({datos: data, indice: indice});
                        notifyObservers(indice);
                    })
                    .error(function (error) {
                        console.log("Error : " + error);
                        resultados.push({datos: data, indice: indice});
                        notifyObservers(indice);
                    });
        } else if (metodoWS === 'get') {
            $http.get("http://192.168.1.10:8081/api/" + nombreFuncion).
                    success(function (data) {
                        resultados.push({datos: data, indice: indice});
                        notifyObservers(indice);
                    })
                    .error(function (error) {
                        console.log("Error : " + error);
                        resultados.push({datos: -1, indice: indice});
                        notifyObservers(indice);
                    });
        } else if (metodoWS === 'put') {
            $http.put("http://192.168.1.10:8081/api/" + nombreFuncion).
                    success(function (data) {
                        resultados.push({datos: data, indice: indice});
                        notifyObservers(indice);
                    })
                    .error(function (error) {
                        console.log("Error : " + error);
                        resultados.push({datos: -1, indice: indice});
                        notifyObservers(indice);
                    });
        }
    };

    //Servicio para serializar un objeto
    this.serializeObject = function (object, tipo) {
        var objetoNuevo = {};
        if (tipo === 'tipoProducto') {
            objetoNuevo.tipo = object.tipo;
            objetoNuevo.descripcion = object.descripcion;
        }

        return objetoNuevo;
    };
});

services.service("mainFactory", function ($ionicPopup) {
    var usuario = '';
    var dinero = 0;

    this.setUsuario = function (usuario2) {
        usuario = usuario2;
    };

    this.getUsuario = function () {
        return usuario;
    };

    this.setDinero = function (dinero2) {
        dinero = dinero2;
    };

    this.getDinero = function () {
        return dinero;
    };

    this.getNombreReserva = function () {
        return "Reserva";
    }
});