var app = angular.module('financeApp.controllers', ['ngCordova']);

app.controller("MainController", function ($scope, aService, $ionicLoading, $ionicPopup, $state, mainFactory) {

    var indiceGlobal = 0;
    var fn = {};
    fn.functions = [];

    var callback = function (indice) {
        var indiceLista = -1;
        angular.forEach(fn.functions, function (objetoFuncion, index) {
            if (objetoFuncion.indice === indice) {
                objetoFuncion.funcion(indice);
                indiceLista = index;
                if (fn.functions.length === 1) {
                    $scope.hide();
                }
            }
        });
        fn.functions.splice(indiceLista, 1);
    };

    var llamarWebService = function (nombreFuncion, metodoWS, params, funcionCallback) {

        $scope.show();
        aService.callDAO(nombreFuncion, metodoWS, params, indiceGlobal);
        aService.registerObserverCallback(callback, indiceGlobal);
        fn.functions.push({indice: indiceGlobal, funcion: funcionCallback});
        indiceGlobal++;

    };

    $scope.show = function () {
        $ionicLoading.show({
            template: 'Cargando...'
        });
    };
    $scope.hide = function () {
        $ionicLoading.hide();
    };

    //FUNCIONES PARA POPUPS
    $scope.showAlert = function (title, mensaje) {
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: mensaje
        });
        alertPopup.then(function (res) {
            console.log('Thank you for not eating my delicious ice cream cone');
        });
    };
    $scope.showConfirm = function (title, mensaje, funcionSi, funcionNo) {
        var confirmPopup = $ionicPopup.confirm({
            title: title,
            template: mensaje
        });
        confirmPopup.then(function (res) {
            if (res) {
                funcionSi();
            } else {
                funcionNo();
            }
        });
    };
    $scope.showPopUpForm = function (title, subtitle, html, funcionOnTapGuardar) {
        // An elaborate, custom popup
        $scope.data = {};

        var myPopup = $ionicPopup.show({
            template: html,
            title: title,
            subTitle: subtitle,
            scope: $scope,
            buttons: [
                {text: 'Cancel'},
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        funcionOnTapGuardar();
                    }
                }
            ]
        });
        myPopup.then(function (res) {
        });
    };

    //FUNCIONES GENERICAS
    $scope.llamarWebService = function (url, metodo, params, funcionCallback) {
        llamarWebService(url, metodo, params, function (indice) {
            $scope.resultado = aService.getResultado(indice);
            if ($scope.resultado === -1) {
                $scope.showAlert('Error', 'Ha habido un problema de comunicación con el servidor.');
            }
            else {
                funcionCallback();
            }
        });
    }

    //LLAMADAS DESDE VISTA

    $scope.crearUsuario = function (usuario, clave) {
        $scope.llamarWebService('persona/' + usuario, 'get', {}, function () {
            var lstUsuarios = $scope.resultado;
            if (lstUsuarios.length === 0) {
                $scope.showConfirm('Cuenta nueva', 'El usuario es nuevo y se va a crear en el sistema. ¿Está seguro?', function () {
                    $scope.llamarWebService('persona', 'post', {nombre: usuario, apellido: clave}, function () {
                        $scope.usuario = $scope.resultado[0].user;
                        mainFactory.setUsuario($scope.usuario);
                        $scope.showPopUpForm('Usuario nuevo', 'Introduzca su capital actual total', '<input type="number" ng-model="data.capital">', function () {
                            var capital = $scope.data.capital;
                            $scope.llamarWebService('cuenta', 'post', {usuarioId: $scope.usuario, capital: capital}, function () {
                                $scope.capital = capital;
                                $state.go("tabs.finanzas");
                            });
                        });
                    });
                }, function () {
                });
            } else if (lstUsuarios.length > 0) {
                $scope.llamarWebService('persona/' + usuario + '/' + clave, 'get', {}, function () {
                    var lstUsuarios = $scope.resultado;
                    if (lstUsuarios.length > 0) {
                        //Usuario existente
                        $scope.llamarWebService('cuenta/' + usuario, 'get', {}, function () {
                            $scope.capital = $scope.resultado[0].dinero;
                            mainFactory.setDinero($scope.capital);
                            mainFactory.setUsuario(usuario);
                            $state.go('tabs.finanzas');
                        });
                    } else {
                        $scope.showAlert('Error', 'La contraseña es incorrecta.');
                    }
                });
            }
        });
    };

    $scope.abrirSeccionSecundaria = function () {
        $('.seccionInicial').fadeOut();
        $('.seccionInicial').transition({top: '-1000px'});
        $('.seccionSecundaria').fadeIn();
        $('.seccionSecundaria').transition({top: '0px'});
        cerrarProductoReserva('.productoReservaInicial');
        abrirProductoReserva('.productoReservaSecundario');
    };
    function abrirProductoReserva(elemento) {
        $(elemento).transition({top: '-100px'});
        $(elemento).fadeIn();
        $(elemento).transition({top: '50px'});
    }
    ;
    function cerrarProductoReserva(elemento) {
        $(elemento).fadeOut();
        $(elemento).transition({top: '-1000px'});
    }
    ;
    $scope.abrirSeccionInicial = function () {
        $('.seccionSecundaria').fadeOut();
        $('.seccionSecundaria').transition({top: '-1000px'});
        $('.seccionInicial').fadeIn();
        $('.seccionInicial').transition({top: '0px'});
        abrirProductoReserva('.productoReservaInicial');
        cerrarProductoReserva('.productoReservaSecundario');

    };
    $scope.getNombreProducto = function (producto) {
        var resultado = "";
        if (producto) {
            if (producto.nombre && producto.tipoProducto && producto.tiempoDefinido && producto.prioridad && producto.granuloTiempo && producto.prediccion) {
                resultado = "El producto \"" + producto.nombre + "\"";
                var frecuencia = "";
                if (producto.tipoProducto.tipo === 'AMORT') {
                    resultado += " conseguirá amortizar ";
                    frecuencia = "a los";
                } else if (producto.tipoProducto.tipo === 'AHORRO') {
                    resultado += " conseguirá ahorrar ";
                    frecuencia = "a los";
                } else if (producto.tipoProducto.tipo === 'GASTO') {
                    resultado += " requiere ";
                    frecuencia = "cada";
                }
                resultado += producto.prediccion + " € ";
                //Formateo del granulo de tiempo
                var tiempo = producto.tiempoDefinido + " " + producto.granuloTiempo.descripcion;
                if (producto.tiempoDefinido === 1 && producto.granuloTiempo.granulo === 'MES') {
                    tiempo = "mes";
                } else if (producto.tiempoDefinido === 1 && producto.granuloTiempo.granulo === 'DIA') {
                    tiempo = "dia";
                } else if (producto.tiempoDefinido === 1 && producto.granuloTiempo.granulo === 'ANYO') {
                    tiempo = "año";
                }
                resultado += " " + frecuencia + " " + tiempo;
                resultado += " con prioridad " + producto.prioridad.descripcion;
            } else if (!producto.tipoProducto && producto.nombre) {
                resultado = "Reserva";
            } else {
                resultado = "";
            }
        }
        return resultado;
    }

    $scope.crearProductoReserva = function (lstProductos) {
        //Creacion del producto por defecto RESERVA
        var reserva = {};
        reserva.acumulacion = actualizarCapital(lstProductos);
        reserva.nombre = mainFactory.getNombreReserva();
        return reserva;
    };
    var capital = mainFactory.getDinero();
    capital = 10000;
    function actualizarCapital(lstProductos) {
        var acumulacionProductos = 0;
        angular.forEach(lstProductos, function (element, index) {
            if (element.nombre !== mainFactory.getNombreReserva()) {
                acumulacionProductos += element.acumulacion;
            }
        });
        return capital - acumulacionProductos;
    }
    ;

    $scope.getProductoBD = function (producto) {
        var productoBD = {};
        productoBD.nombre = producto.nombre;
        productoBD.cuenta = producto.cuenta;
        productoBD.granuloTiempo = producto.granuloTiempo;
        productoBD.prediccion = producto.prediccion;
        productoBD.acumulacion = producto.acumulacion;
        productoBD.tiempoDefinido = producto.tiempoDefinido;
        productoBD.prioridad = producto.prioridad;
        productoBD.tipoProducto = producto.tipoProducto;
        return productoBD;
    };

});


app.controller("ProductosController", function ($scope, mainFactory, aService, $filter) {

    $scope.producto = {};
    var usuarioLogado = mainFactory.getUsuario();
    usuarioLogado = "alvaro";

    var capital = mainFactory.getDinero();
    capital = 10000;

    $scope.cargarProductos = function () {
        $scope.llamarWebService('producto/' + usuarioLogado, 'get', {}, function () {
            $scope.lstProductos = $scope.resultado;
            $scope.productoDestino = [];
            $scope.acumulacionFinal = [];

            var reserva = $scope.crearProductoReserva($scope.lstProductos);
            $scope.lstProductos.push(reserva);
            angular.forEach($scope.lstProductos, function (element, index) {
                $scope.productoDestino[index] = reserva;
            });

            $scope.lstProductosAux = [];
            angular.copy($scope.resultado, $scope.lstProductosAux);
            $scope.fraseMovimiento = [];
        });
    };

    $scope.cargarTiposProducto = function () {
        $scope.llamarWebService('tipoProducto', 'get', {}, function () {
            $scope.lstTiposProducto = $scope.resultado;
            $scope.producto.tipoProducto = $scope.lstTiposProducto[0];
        });
    };

    $scope.cargarGranulosTiempo = function () {
        $scope.llamarWebService('granuloTiempo', 'get', {}, function () {
            $scope.lstGranulosTiempo = $scope.resultado;
            $scope.producto.granuloTiempo = $scope.lstGranulosTiempo[0];
        });
    };

    $scope.cargarPrioridades = function () {
        $scope.llamarWebService('prioridad', 'get', {}, function () {
            $scope.lstPrioridades = $scope.resultado;
            $scope.producto.prioridad = $scope.lstPrioridades[2];
        });
    };

    $scope.cargarProductos();
    $scope.cargarTiposProducto();
    $scope.cargarGranulosTiempo();
    $scope.cargarPrioridades();

    $scope.crearProducto = function (producto) {
        producto.user = usuarioLogado;
        producto.fecha = $filter('date')(new Date(), 'dd/MM/yyyy');
        producto.tipoProducto = aService.serializeObject(producto.tipoProducto, 'tipoProducto');
        $scope.llamarWebService('producto', 'post', {producto: producto}, function () {
            $scope.lstProductos = $scope.resultado;
        });
    };

    $scope.checkFraseMovimiento = function (indiceProducto) {
        var fraseMovimiento = "";
        var dineroAhora = $scope.lstProductos[indiceProducto].acumulacion;
        var dineroAntes = $scope.lstProductosAux[indiceProducto].acumulacion;
        if (dineroAhora < dineroAntes) {
            fraseMovimiento = "¿A dónde quieres mover estos " + (dineroAntes - dineroAhora) + " €";
        } else if (dineroAhora > dineroAntes) {
            fraseMovimiento = "¿De dónde quieres coger estos " + (dineroAhora - dineroAntes) + " €";
        }
        $scope.fraseMovimiento[indiceProducto] = fraseMovimiento;
        $scope.lstProductos[$scope.lstProductos.length - 1].acumulacion = actualizarCapital($scope.lstProductos);
    };
    $scope.calcularAcumulacionesProductos = function (indiceProducto) {
        var dineroAhoraProductoActual = $scope.lstProductos[indiceProducto].acumulacion;
        var dineroAntesProductoActual = $scope.lstProductosAux[indiceProducto].acumulacion;
        //Actualizar acumulacion del producto destino
        var productoDestino = $scope.productoDestino[indiceProducto];
        if (productoDestino.nombre !== mainFactory.getNombreReserva() && productoDestino.nombre !== $scope.lstProductos[indiceProducto].nombre) {
            angular.forEach($scope.lstProductos, function (producto, index) {
                if (producto.nombre === productoDestino.nombre) {
                    if (dineroAhoraProductoActual > dineroAntesProductoActual) {
                        $scope.lstProductos[index].acumulacion = $scope.lstProductos[index].acumulacion - (dineroAhoraProductoActual - dineroAntesProductoActual);
                    } else if (dineroAhoraProductoActual < dineroAntesProductoActual) {
                        $scope.lstProductos[index].acumulacion = $scope.lstProductos[index].acumulacion + (dineroAhoraProductoActual - dineroAntesProductoActual);
                    }
                    $scope.fraseMovimiento[index] = undefined;
                    $scope.fraseMovimiento[indiceProducto] = undefined;
                }
            });
        }
        $scope.lstProductos[$scope.lstProductos.length - 1].acumulacion = actualizarCapital($scope.lstProductos);
        angular.copy($scope.lstProductos, $scope.lstProductosAux);
    };


    $scope.guardarCambiosProductos = function () {
        var numeroProductos = $scope.lstProductos.length;
        var count = 1;
        angular.forEach($scope.lstProductos, function (producto) {
            if (producto.nombre !== mainFactory.getNombreReserva()) {
                $scope.llamarWebService('productoActualizar', 'post', {producto: producto}, function () {
                    count++;
                    if (count === numeroProductos) {
                        $scope.showAlert("Confirmación", "Los productos se han actualizado correctamente");
                    }
                });
            }
        });
    };

    $scope.cambioCampos = function () {
        $scope.resultadoProducto = "";
        $scope.resultadoProducto = $scope.getNombreProducto($scope.producto);
    };
});

app.controller("GastosController", function ($scope, mainFactory, $filter) {

    var usuarioLogado = mainFactory.getUsuario();
    usuarioLogado = "alvaro";

    $scope.gasto = {};

    $scope.opcionesGasto = [
        {text: "Cargar gasto en reserva", value: "cgr", selected: true},
        {text: "Cargar gasto en producto", value: "cgp", selected: false}
    ];

    $scope.gasto.opcion = 'cgr';
    $scope.crearGasto = function (gasto) {
        $scope.llamarWebService('gasto', 'post', {nombreProducto: gasto.opcionListaProducto, gasto: gasto, usuarioLogado: usuarioLogado}, function () {
            $scope.showAlert("Confirmación", "El gasto se ha creado correctamente");
            $scope.gasto = {};
        });
    };

    $scope.cargarProductos = function () {
        $scope.llamarWebService('producto/' + usuarioLogado, 'get', {}, function () {
            $scope.lstProductos = $scope.resultado;
        });
    };
    $scope.cargarProductos();

    $scope.fillDescripcionGasto = function (cantidad) {
        if (cantidad) {
            var date = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
            $scope.gasto.nombre = "Gasto " + date + " - " + cantidad;
        } else {
            $scope.gasto.nombre = "";
        }
    };
});

app.controller("IngresosController", function ($scope, mainFactory, $filter) {

    var usuarioLogado = mainFactory.getUsuario();
    usuarioLogado = "alvaro";

    $scope.ingreso = {};

    $scope.ingresoSeleccion = 0;
    $scope.capitalReferencia = 0;
    $scope.capitalReferenciaConIngresos = 0;

    $scope.opcionesIngreso = [
        {text: "Cargar el ingreso en reserva", value: "cir", selected: true},
        {text: "Repartir el ingreso entre los productos", value: "cism", selected: false}
    ];

    $scope.crearIngreso = function (ingreso) {
        $scope.llamarWebService('ingreso', 'post', {ingreso: ingreso, usuarioLogado: usuarioLogado}, function () {
            $scope.showAlert("Confirmación", "El ingreso se ha creado correctamente");
            $scope.ingreso = {};
        });
    };

    $scope.cargarProductos = function () {
        $scope.llamarWebService('producto/' + usuarioLogado, 'get', {}, function () {
            $scope.lstProductos = $scope.resultado;
            $scope.lstProductos.push($scope.crearProductoReserva($scope.lstProductos));
            angular.forEach($scope.lstProductos, function (producto) {
                producto.nuevoIngreso = 0;
                producto.sumaAcumulacion = 0;
            });
        });
    };
    $scope.cargarProductos();

    $scope.cargarTiposIngreso = function () {
        $scope.llamarWebService('tipoIngreso/', 'get', {}, function () {
            $scope.lstTiposIngreso = $scope.resultado;
        });
    };
    $scope.cargarTiposIngreso();
    $scope.ingreso.tiempoTipoIngreso = 1;

    $scope.fillDescripcionIngreso = function (cantidad) {
        if (!$scope.ingreso.nombre) {
            if (cantidad) {
                var date = $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss');
                $scope.ingreso.nombre = "Ingreso " + date + " - " + cantidad;
            } else {
                $scope.ingreso.nombre = "";
            }
        }
    };

    $scope.checkOpcionIngreso = function () {
        if ($scope.ingreso.opcion === 'cism') {
            $scope.ingreso.opcion = undefined;
            $scope.abrirSeccionSecundaria();
            $scope.capitalReferencia = $scope.lstProductos[$scope.lstProductos.length - 1].acumulacion;
            $scope.ingresoSeleccion = $scope.ingreso.cantidad;
            $scope.lstProductos[$scope.lstProductos.length - 1].sumaAcumulacion += $scope.lstProductos[$scope.lstProductos.length - 1].acumulacion + $scope.ingreso.cantidad;
            $scope.lstProductos[$scope.lstProductos.length - 1].nuevoIngreso += $scope.lstProductos[$scope.lstProductos.length - 1].sumaAcumulacion
                    - $scope.lstProductos[$scope.lstProductos.length - 1].acumulacion;
            $scope.capitalReferenciaConIngresos = $scope.lstProductos[$scope.lstProductos.length - 1].sumaAcumulacion;
        }
    };
    $scope.actualizarDatosIngresos = function () {
        var reserva = $scope.lstProductos[$scope.lstProductos.length - 1];
        reserva.sumaAcumulacion = $scope.capitalReferenciaConIngresos;
        $scope.ingreso.cantidad = $scope.ingresoSeleccion;
        angular.forEach($scope.lstProductos, function (producto) {
            if (producto.nuevoIngreso && producto.nombre !== mainFactory.getNombreReserva()) {
                $scope.ingreso.cantidad -= producto.nuevoIngreso;
                producto.sumaAcumulacion = producto.acumulacion + producto.nuevoIngreso;
                reserva.sumaAcumulacion -= producto.nuevoIngreso;
                reserva.nuevoIngreso = reserva.sumaAcumulacion - reserva.acumulacion;
            }
        });
    };
    $scope.doRepartoAutomatico = function () {
        var cantidadesAñadidas = 0;
        angular.forEach($scope.lstProductos, function (producto) {
            if (producto.nombre !== mainFactory.getNombreReserva()) {
                if (producto.acumulacion + producto.nuevoIngreso < producto.prediccion) {
                    var cantidadAñadida = 0;
                    if ($scope.ingreso.cantidad >= producto.prediccion - (producto.acumulacion + producto.nuevoIngreso)) {
                        cantidadAñadida = producto.prediccion - (producto.acumulacion + producto.nuevoIngreso);
                    } else {
                        cantidadAñadida = $scope.ingreso.cantidad;
                    }
                    producto.nuevoIngreso += cantidadAñadida;
                    $scope.ingreso.cantidad -= cantidadAñadida;
                    cantidadesAñadidas += cantidadAñadida;
                    producto.sumaAcumulacion = producto.acumulacion + producto.nuevoIngreso;
                }
            } else {
                producto.sumaAcumulacion -= cantidadesAñadidas;
                producto.nuevoIngreso = producto.sumaAcumulacion - producto.acumulacion;
            }
        });
    };
    $scope.cancelarReparto = function () {
        $scope.lstProductos[$scope.lstProductos.length - 1].acumulacion = $scope.capitalReferencia;
        $scope.abrirSeccionInicial();
    };

    $scope.guardarCambiosProductos = function () {
        var numeroProductos = $scope.lstProductos.length;
        var count = 1;
        angular.forEach($scope.lstProductos, function (producto) {
            var ingreso = {};
            ingreso.nombre = $scope.ingreso.nombre + " - Producto: " + producto.nombre;
            ingreso.cantidad = producto.nuevoIngreso;
            var productoEnviar = undefined;
            if (producto.nombre !== mainFactory.getNombreReserva()) {
                productoEnviar = $scope.getProductoBD(producto);
                productoEnviar.acumulacion = producto.sumaAcumulacion;
                ingreso.producto = productoEnviar;
            }
            if (ingreso.cantidad !== 0) {
                $scope.llamarWebService('ingreso', 'post', {ingreso: ingreso, usuarioLogado: usuarioLogado}, function () {
                    count++;
                    if (count === (numeroProductos * 2) - 1) {
                        $scope.showAlert("Confirmación", "Los productos se han actualizado correctamente");
                    }
                });
                if (producto.nombre !== mainFactory.getNombreReserva()) {
                    $scope.llamarWebService('productoActualizar', 'post', {producto: productoEnviar}, function () {
                        count++;
                        if (count === (numeroProductos * 2) - 1) {
                            $scope.showAlert("Confirmación", "Los productos se han actualizado correctamente");
                        }
                    });
                }
            } else {
                numeroProductos -= 2;
            }
        });
    };
});




