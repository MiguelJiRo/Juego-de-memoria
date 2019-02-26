/**
 * MemoryGame es la clase que representa nuestro juego. Contiene un array con la cartas del juego,
 * el número de cartas encontradas (para saber cuándo hemos terminado el juego) y un texto con el mensaje
 * que indica en qué estado se encuentra el juego
 */
var MemoryGame = MemoryGame || {};

this.ESTADO = 
	{
		ENCONTRADA: 1,
		ARRIBA: 2,
		ABAJO: 3,
		properties: 
		{
			1: {name: "encontrada", value: 0, code: "F"},
			2: {name: "boca arriba", value: 1, code: "U"},
			3: {name: "boca abajo", value: 2, code: "B"},
		}
	};
/**
 * Constructora de MemoryGame
 */
MemoryGame = function(gs) {
	/*
		La constructora recibe como parámetro el servidor gráfico, 
		usado posteriormente para dibujar.
	*/
	this.gs = gs;
	this.arrayCartas = new Array(16);
	this.mensajeEstadoActual = 'Memory Game';
	this.cartaElegida = -1;
	this.contadorCartas = 0;
	this.auxiliar;
	/*
		Inicializa el juego creando las cartas (recuerda que son 
		2 decada tipo de carta), desordenándolas y comenzando 
		el bucle de juego.
	*/
	this.initGame = function() {
		//inicializa
		this.arrayCartas = [new MemoryGameCard('zeppelin'),new MemoryGameCard('zeppelin'),
							new MemoryGameCard('guy'),new MemoryGameCard('guy'),
							new MemoryGameCard('unicorn'),new MemoryGameCard('unicorn'),
							new MemoryGameCard('rocket'),new MemoryGameCard('rocket'),
							new MemoryGameCard('kronos'),new MemoryGameCard('kronos'),
							new MemoryGameCard('dinosaur'),new MemoryGameCard('dinosaur'),
							new MemoryGameCard('potato'),new MemoryGameCard('potato'),
							new MemoryGameCard('8-ball'),new MemoryGameCard('8-ball')];
		//desordenar
		this.arrayCartas = this.arrayCartas.sort(function() {
			return Math.random() - 0.5});
		//bucle del juego
		this.loop();
	}

	/*
		Dibuja el juego, esto es: (1) escribe el mensaje con el 
		estado actual del juego y (2) pide a cada una de las 
		cartas del tablero que se dibuje.
	*/
	this.draw = function(){
		// escribe el mensaje con el estado actual del juego
		gs.drawMessage(this.mensajeEstadoActual);
		// pide a cada una de las cartas del tablero que se dibuje
		for(var i = 0; i < 16; ++i){
			// draw(tile, boardPos)
			this.arrayCartas[i].draw(this.gs,i);
		}
	}

	/*
		Es el bucle del juego. En este caso es muy sencillo: 
		llamamos al método draw cada 16ms (equivalente a unos 60fps). 
		Esto se realizará con la función setInterval de Javascript.
	*/
	this.loop = function(){
		console.log("&&& LOOP");
		this.auxiliar = setInterval(this.draw.bind(this),16);
	}

	/*
		Este método se llama cada vez que el jugador pulsa sobre 
		alguna de las cartas (identificada por el número que 
		ocupan en el array de cartas del juego). Es el responsable 
		de voltear la carta y, si hay dos volteadas, comprobar si 
		son la misma (en cuyo caso las marcará como encontradas). 
		En caso de no ser la misma las volverá a poner boca abajo.
	*/
	/*
		Para realizar la animación que aparece en el vídeo se puede 
		utilizar la función setTimeout,haciendo que pasados unos 
		cuantos milisegundos las cartas se pongan boca abajo. 
		¡Cuidado!:para evitar comportamientos extraños tendrás 
		que ignorar los eventos de ratón mientras que la carta está 
		siendo volteada.
	*/
	this.onClick = function(cardId){		
		
		//gs.drawMessage("Se ha tocado la carta: " + cardId);

		if(// si la carta no es null
			this.arrayCartas[cardId] != null
			//si la carta se ha encontrado
			&& !this.arrayCartas[cardId].getFound() 
			// si la carta está en la posición ABAJO
			&& !this.arrayCartas[cardId].getArriba()
			// para evitar que se pulse sobre la misma carta
			&& this.cartaElegida != cardId)
		{
			console.log("### FLIP");
			this.arrayCartas[cardId].flip();
		}
		
		if(this.cartaElegida != -1 
			&& !this.arrayCartas[cardId].getFound()
			&& this.cartaElegida != cardId){
			//comprobar con la carta anterior elegida si son iguales
			//console.log("### cardId : " + cardId 
			//	+ " ### cartaElegida : " + this.cartaElegida);
			console.log("&&& cardId : " + this.arrayCartas[cardId].nombreCarta 
				+ " &&& cartaElegida : " + this.arrayCartas[this.cartaElegida].nombreCarta);
			if(this.arrayCartas[cardId]
				.compareTo(this.arrayCartas[this.cartaElegida]))
			{
				console.log("### pareja SI encontrada");
				this.contadorCartas += 2;

				this.arrayCartas[cardId].found();
				this.arrayCartas[this.cartaElegida].found();

				this.mensajeEstadoActual = "Pareja encontrada";
				this.cartaElegida = -1;
				if(this.contadorCartas == 16){
					console.log("### VICTORIA");
					this.mensajeEstadoActual = "Victoria";
					clearInterval(this.auxiliar);
					this.draw();
				}
			}
			else{
				console.log("### pareja NO encontrada");
				this.mensajeEstadoActual = "Fallo. Vuelve a intentarlo";
				var that = this;
				setTimeout(function(){
					console.log("### FLIP pareja NO encontrada");
					that.arrayCartas[cardId].flip();
					that.arrayCartas[that.cartaElegida].flip();
					that.cartaElegida = -1;
				},300);
			}
		}
		else{
			console.log("### primera carta elegida");
			if(!this.arrayCartas[cardId].getFound())
				this.cartaElegida = cardId;
		}
	}
};



/**
 * Constructora de las cartas del juego. Recibe como parámetro el nombre del sprite que representa la carta.
 * Dos cartas serán iguales si tienen el mismo sprite.
 * La carta puede guardar la posición que ocupa dentro del tablero para luego poder dibujarse
 * @param {string} id Nombre del sprite que representa la carta
 */
MemoryGameCard = function(id) {
	/*
		Constructora que recibe el nombre del sprite que representa 
		la carta. Las cartas han de crearse boca abajo
	*/
	this.nombreCarta = id;
	this.estadoCarta = ESTADO.ABAJO;
	/*
		Da la vuelta a la carta, cambiando el estado de la misma
	*/
	this.flip = function(){
		console.log("%%%% Time to FLIP");
		if(this.estadoCarta == ESTADO.ABAJO){
			console.log("%%%% Hice FLIP ARRIBA");
			this.estadoCarta = ESTADO.ARRIBA;
		}
		else if(this.estadoCarta == ESTADO.ARRIBA){
			console.log("%%%% Hice FLIP ABAJO");
			this.estadoCarta = ESTADO.ABAJO;
		}
	}

	/*
		Marca una carta como encontrada, cambiando el estado de 
		la misma.
	*/
	this.found = function(){
		this.estadoActual = ESTADO.ENCONTRADA;
	}

	this.getFound = function(){
		return (this.estadoActual == ESTADO.ENCONTRADA);
	}

	this.getArriba = function(){
		return (this.estadoActual == ESTADO.ARRIBA);
	}

	/*
		Compara dos cartas, devolviendo true si ambas representan 
		la misma carta.
	*/
	this.compareTo = function(otherCard){
		return (this.nombreCarta == otherCard.nombreCarta);
	}

	/*
		Dibuja la carta de acuerdo al estado en el que se encuentra.
		Recibe como parámetros el servidor gráfico y la posición en 
		a que se encuentra en el array de cartas del juego (necesario 
		para dibujar una carta).
	*/
	this.draw = function(gs,pos){
		if(this.estadoCarta == ESTADO.ABAJO) 
			// back representa al sprite de la carta boca abajo
			gs.draw('back', pos);
		else 
			// nombreCarta representa el id que se pasa a esta clase
			gs.draw(this.nombreCarta, pos);
	}
};
