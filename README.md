# Dependencias
## Ganache (blockchain local)

    Ganache ayuda a montar una testnet local con la cual probar los smartcontracts

## Truffle (Smartcontracts tool)

    Los smartcontract son compilados usando truffle. Difieren del modo en el que son compilados por
    el compilador de solidity (solc, solcjs) en que generan un .json en lugar del .bin y .abi


# Ethereum API

    Servidor que funciona con un Servidor NodeJS Express.
    Se comunica directamente con la blockchain y los smartcontracts.

# Backend Server API

    El servidor de SmarTicket propiamente dicho. Funciona con un Servidor NodeJS Express y
    MongoDB. En su base de dato se guarda la informacion de los usuarios y los eventos registrados
    en el sistema, junto con sus respectivos ID de transacciones en la blockchain.

    Esta API funciona igualmente como puente entre la applicacion del cliente y la API de Ethereum.

## Notas

    - No posee interfaz grafica. Se deben consumir toda la informacion a traves de la Web API
    Ejemplo: Crear los usuarios Event Promoter o Admin

# Frontend

    Se simula la pagina web de un cliente. Esta pagina web se conforma de un servidor para el front
    y otro para el back.

## Back

    Servidor que utiliza Flask y MongoDB para guardar los datos que le propios del cliente.

## Front

    Servidor de Angular 5.



# Encedor todos los servidores

## Ethereum API

    Para migrar los smartcontracts se corre el comando, el cual al finalizar inicializa el servidor
``` bash
    $ node ./Backend/app.js migrate
```
    Si solo se necesita inicializar el servidor
``` bash
    $ node ./Backend/app.js
```

## Server API

``` bash
    $ node ./Backend/app.js server
```

## Front Backend

``` bash
    $ python3 ./Front/pyserver/main.py
```

## Frontend

``` bash
    $ ng serve
```
