import { Stage } from 'boardgame.io/core';
import { TurnOrder } from 'boardgame.io/core';

//-----------//--------------------------------------------//---------------//
//----------//---MOVIMIENTOS TRUCO ARGENTINO BOARGAME.IO---//--------------//
//---------//--------------------------------------------//-------MTMS----//

const noact = ({ G, ctx, events, playerID }) => {
  events.setActivePlayers ({
    value: {},
  });
}

const quiero = ({ G, ctx, events, playerID }) => {
let teamActual1 = chkTeams(G.teams[0].players, G.teams[1].players, playerID);
let teamActual = Number(teamActual1);
let teamOther = (teamActual === 0) ? 1 : 0;
let cantado = chkLast(G.teams[teamActual].cantado);
const indice_waiting = Object.keys(ctx.activePlayers).find(key => ctx.activePlayers[key] === "waiting");
const indice_estado_natural = Object.keys(ctx.activePlayers).find(key => ctx.activePlayers[key] === "estadoNatural");

if (indice_waiting) {// Verificar si se encontró "waiting" en el objeto
  console.log(`Se encontró 'waiting' en el índice ${indice_waiting}`);
  if (cantado === "truco" ||cantado === "retruco" || cantado === "vale4" ) {
  console.log("Quiso el truco/retruco/envido");
  G.stTruco += 1;    
  chkTurn({G, ctx, events, playerID});//chkTurn seria como un endturn.
  }   
}

if (indice_estado_natural) {// Verificar si se encontró "estadoNatural" en el objeto
  console.log(`Se encontró 'estadoNatural' en el índice ${indice_estado_natural}`);
  if (cantado === "truco" || cantado === "retruco" ||cantado ===  "vale4"  )  {
  console.log("Quiso el truco");
  G.stTruco += 1;
  events.endStage(); //termino el stge de respuesta, porke respondio

  let newStage = chkStage(G.teams[0].players, G.teams[1].players,
    G.teams[0].cantado, G.teams[1].cantado,
    G.stTruco, G.stEnvido, ctx.currentPlayer, G.handCount
     );
  events.setActivePlayers({ //saco al usuario de estado natural (donde su carta no termina el stage) 
    value: {
      [indice_estado_natural]: newStage,
    }});
  }
}
if (cantado === "envido" || cantado === "realenvido" || cantado === "faltaenvido") { 
  G.stEnvido = "envido";

//sacamos los stages especiales (waiting, rta)

//DE ACA EN ADELANTE YA SE ESTA CAL´CULANDO EL ENVIDO.
let hands = [G.players[0].hand, G.players[1].hand,G.players[2].hand,G.players[3].hand,G.players[4].hand,G.players[5].hand];
let winnerEnvido = chkEnvido(G.teams[0].players, G.teams[1].players, hands, G.numPlayers);

if (winnerEnvido === 0 ){
  G.teams[0].ptsGeneral +=2;
}
if (winnerEnvido === 1 ){  
  G.teams[1].ptsGeneral +=2;
}
if (winnerEnvido === "parda" ){
let manoTeam = chkTeamMano(G.roundCount);
G.teams[manoTeam].ptsGeneral +=2
}
 //se acaba de querer el envido, el jugdor actual sale de su stage, porke ya "respondio"
  //stage rtaenvidoX
  G.players[playerID].stage = G.teams[teamActual].stage;
  events.endStage(); //o esta opc?
  //el jugador que canto el ultimo envido, estaba en waiting, ese jugador sale tambien de su stage
if (indice_waiting) {
    console.log(`Se encontró 'waiting' en el índice ${indice_waiting}`);
    G.players[indice_waiting].stage = G.teams[teamOther].stage;
    }   
}
return G;
}  

const noQuiero = ({ G, ctx, events, playerID }) => {
    let teamActual1 = chkTeams(G.teams[0].players, G.teams[1].players, playerID);
    let teamActual = Number(teamActual1);
    let cantado = chkLast(G.teams[teamActual].cantado); 
      if (cantado === "truco" ||cantado === "retruco" ||cantado ===  "vale4" ) {
      console.log("NO Quiso el truco/retruco/vale4");
      //se termina la ronda y gana ese los puntos
      }   else if (cantado === "envido" ||"realenvido" || "faltaenvido" ) {
        console.log("NO Quiso el falta/real/envido");
        //se termina la mano se le dan los puntos por no querer la mierda esta
        }   
} 

const alMazo = ({ G, ctx, events }) => {
console.log("al mazo");  //etc
}

const cantarTruco = ({ G, ctx, events, playerID }) => {
//logica de setstages
//////////////////////////////////////////////////SETUP
let teamActual = chkTeams(G.teams[0].players, G.teams[1].players, playerID);
let teamOther = teamActual === 0 ? 1 : 0;
let stages = [];
let PID = Number(playerID);
let pie = chkPie(ctx.numPlayers, G.roundCount, G.teams[0].players, G.teams[1].players);
let pieOther = pie[teamOther];

if (G.stTruco === 0) { // estan cantando truco
  G.teams[teamOther].cantado.push("truco");
if (G.stEnvido !== "") { //si se jugoenvido
  stages[pieOther] = "rtaTrucSenv"; 
  } else if (G.stEnvido === ""){ //si no se jugo envido
  stages[pieOther] = "rtaTrucEnv";
  }
} 
else if (G.stTruco === 1) {//estan catando retruco
  // El otro equipo canta "retruco"
  // Eliminar "truco" del array de cantados del equipo actual
  const indexTruco = G.teams[teamActual].cantado.indexOf("truco");
  if (indexTruco !== -1) {
    G.teams[teamActual].cantado.splice(indexTruco, 1);
}
// Agrego al pie a su stage
stages[pieOther] = "rtaRtruc";
// Agregar "retruco" al array de cantados del otro equipo
  G.teams[teamOther].cantado.push("retruco");
}
else if (G.stTruco === 2) {//estan cantando vale 4
  // El otro equipo canta "vale cuatro"
  // Eliminar "retruco" del array de cantados del equipo actual
  const indexRetruco = G.teams[teamActual].cantado.indexOf("retruco");
  if (indexRetruco !== -1) {
    G.teams[teamActual].cantado.splice(indexRetruco, 1);
  }
  // Agregar "vale cuatro" al array de cantados del otro equipo
  G.teams[teamOther].cantado.push("vale4");
// Agrego al pie a su stage
stages[pieOther] = "rtaValec";
}
// Agrego al actual a su stage
stages[PID] = "estadoNatural";
////////////////////////////AHORA APLICO LO PROCFSADo
events.setActivePlayers({
    value: {
    [pieOther]: stages[pieOther],
    [PID]: stages[PID],
    },
    });
};

const cantarEnvido =   ({G, ctx, events,playerID }) => {
  G.teams[teamOther].cantado.push("envido"); //ojo uqe capaz no se refleja y hay que hacer una variable testigo  
  //////////////////////////////////////////////////SETUP
  //logica de setstages
    let teamActual = chkTeams(G.teams[0].players, G.teams[1].players, playerID);
    let teamOther = teamActual === 0 ? 1 : 0;
    let stages = [];
    let PID = Number(playerID);
    let pie = chkPie(ctx.numPlayers, G.roundCount, G.teams[0].players, G.teams[1].players);
    let pieOther = pie[teamOther];        
    let cantados = G.teams[0].cantado.concat(G.teams[1].cantado);

//////////////////////////////PROCESO ESTADO DEL JUEGO
    if (G.teams[teamActual].cantado.some(item => item === "truco")  && G.stTruco === 0) {  // si a est eekipo le cantaron truco y aun no se jugo
      console.log("canto el envido esta primero ");         
      G.teams[teamOther].cantado.push("envido");
      stages[pieOther] = "rtaEnv"; //ELPIE puede retruacr el envido y querer o no querer.
      stages[PID] = "waiting"; 
    }
      else   if (G.teams[teamActual].cantado === "") {// nada cantado A ESTE EKIPO y canta envido
        console.log("canta envido");
        G.teams[teamOther].cantado.push("envido");
        stages[pieOther] = "rtaEnv";   //ELPIE puede cantarle otro envido, real, falta quiero y no quiero, el contrario
        stages[PID] = "waiting";
      }
     else  if (G.teams[teamActual].cantado.some(item => item === "envido")) { //un envido ya cantado (A ESTE EKIPO) y canta envido
        console.log("Canta envido a un envido");
        G.teams[teamOther].cantado.push("envido");
        stages[pieOther] = "rtaEnvEnv";         // ELPIE No puede cantar más envidos aparte de este que seria el segundo(solo real, falta, quiero y no quiero    
          stages[PID] = "waiting";
        }
    events.setActivePlayers({
        value: {
        pieother: stages[pieOther], // pieoter a respuestawww   w
        PID: stages[PID], //jugador que canto a waiting? asi no juega carta y termina turno?
        },
        });
    }

    const cantarReal =   ({G, ctx, events,playerID }) => {
      G.teams[teamOther].cantado.push("envido"); //ojo uqe capaz no se refleja y hay que hacer una variable testigo 
      //////////////////////////////////////////////////SETUP
      //logica de setstages
        let teamActual = chkTeams(G.teams[0].players, G.teams[1].players, playerID);
        let teamOther = teamActual === 0 ? 1 : 0;
        let stages = [];
        let PID = Number(playerID);
        let pie = chkPie(ctx.numPlayers, G.roundCount, G.teams[0].players, G.teams[1].players);
        let pieOther = pie[teamOther];              
        let cantados = G.teams[0].cantado.concat(G.teams[1].cantado);
    
    //////////////////////////////PROCESO ESTADO DEL JUEGO
        if (G.teams[teamActual].cantado === "truco"  && G.stTruco === 0) {
          console.log("canto el realenvido esta primero ");         
          //puede cantarle ,falta quiero y no quiero el contrario
        }
    //no hago nada para cantado== retruc o vale4, porke si esta en ese estado el truco, nignun envido puede cantarse
        if (G.teams[teamActual].cantado === "") {// nada cantado y canta renvido
            console.log("canta real nvido");
            //puede cantarle la falta quiero y no quiero el contrario
          }
          if (G.teams[teamActual].cantado === "") {//  lo puede cantar frente a un envido, y a un envido envido 
            console.log("canta real nvido a un envido o envido envido");
            //puede cantarle la falta quiero y no quiero, el contrario
            // el que esta cantando envido queda en ... ? y el pie contrario queda en respuestaenvidoalgo
          }
        // Agrego al pie a su stage
        stages[pieOther] = "rtaTrucEnv";
        //el jugador actual debe ir a :
        stages[PID] = "estadoNatural";
        //set active
        events.setActivePlayers({
            value: {
            pieother: stages[pieOther], // pieoter a respuesta
            PID: stages[PID], //jugador que canto a waiting? asi no juega carta y termina turno?
            }, });    
        }


        const cantarFalta =   ({G, ctx, events,playerID }) => {
          G.teams[teamOther].cantado.push("envido"); //ojo uqe capaz no se refleja y hay que hacer una variable testigo  
          //////////////////////////////////////////////////SETUP
          //logica de setstages
            let teamActual = chkTeams(G.teams[0].players, G.teams[1].players, playerID);
            let teamOther = teamActual === 0 ? 1 : 0;
            let stages = [];
            let PID = Number(playerID);
            let pie = chkPie(ctx.numPlayers, G.roundCount, G.teams[0].players, G.teams[1].players);
            let pieOther = pie[teamOther];        
            let cantados = G.teams[0].cantado.concat(G.teams[1].cantado);
        
        //////////////////////////////PROCESO ESTADO DEL JUEGO
        
            if (G.teams[teamActual].cantado === "truco"  && G.stTruco === 0) {
              console.log("canto el la falta  esta primero ");         
         //  podes querer o no querer
            }
        
            if (G.teams[teamActual].cantado === "") {// nada cantado y canta renvido
                console.log("canta real nvido");
               //podes querer o no querer
              }
              if (G.teams[teamActual].cantado === "") {//  lo puede cantar frente a un envido, y a un envido envido 
                console.log("canta real nvido a un envido o envido envido");
               //podes querer o no querer
              }
            // Agrego al pie a su stage
            stages[pieOther] = "rtaTrucEnv";
            //el jugador actual debe ir a :
            stages[PID] = "estadoNatural";
   
            //set active
            events.setActivePlayers({
                value: {
                pieother: stages[pieOther], // pieoter a respuesta
                PID: stages[PID], //jugador que canto a waiting? asi no juega carta y termina turno?
                },
                });
            }

const cantarFlor =   ({G, ctx, events }) => {
}

const jugarCarta = ({ G, ctx, events, playerID }, asd) => {    
const cardToPlay = G.players[playerID].hand[asd];
console.log("Jugador" + playerID + "  jugo la carta  " + G.players[playerID].hand[asd].palo + "  " +  G.players[playerID].hand[asd].numero  )    
G.players[playerID].playedCards.push(cardToPlay);
G.players[playerID].hand.splice(asd, 1);
chkTurn({G, ctx, events, playerID});
return G;
}

const jugarCartaNEnd = ({ G, ctx, events, playerID }, asd) => {
//obtiene carta la agrega a played y la elimina de la mano
const cardToPlay = G.players[playerID].hand[asd];     
G.players[playerID].playedCards.push(cardToPlay);
G.players[playerID].hand.splice(asd, 1);
events.setStage("waiting");
}

const darCartasInicial = ({ G, ctx, playerID }) => {
let numPlayers = ctx.numPlayers;
const [cartasJugador1, cartasJugador2, cartasJugador3, cartasJugador4, cartasJugador5, cartasJugador6] = repartirCartas(G.cartasTruco, numPlayers);
G.handCount = 0;
G.stTruco = 0;
G.stEnvido = "";
G.teams[0].cantado = [];
G.teams[1].cantado = [];
G.teams[1].ptsRonda = 0;
G.teams[0].ptsRonda = 0;  
G.players[0].hand = cartasJugador1;
G.players[0].playedCards = [];
G.players[1].hand = cartasJugador2;
G.players[1].playedCards = [];
G.players[2].hand = cartasJugador3;
G.players[2].playedCards = [];
G.players[3].hand = cartasJugador4;
G.players[3].playedCards = [];
G.players[4].hand = cartasJugador5;
G.players[4].playedCards = [];
G.players[5].hand = cartasJugador6;
G.players[5].playedCards = [];
};

const darCartas = ({ G, ctx, playerID }) => {
let numPlayers = ctx.numPlayers;
const [cartasJugador1, cartasJugador2, cartasJugador3, cartasJugador4, cartasJugador5, cartasJugador6] = repartirCartas(G.cartasTruco, numPlayers);
G.handCount = 0;
G.roundCount +=1;
G.stTruco = 0;
G.stEnvido = "";
G.teams[0].cantado = [];
G.teams[1].cantado = [];
G.teams[0].ptsRonda = 0;  
G.teams[1].ptsRonda = 0;
G.players[0].hand = cartasJugador1;
G.players[0].playedCards = [];
G.players[1].hand = cartasJugador2;
G.players[1].playedCards = [];
G.players[2].hand = cartasJugador3;
G.players[2].playedCards = [];
G.players[3].hand = cartasJugador4;
G.players[3].playedCards = [];
G.players[4].hand = cartasJugador5;
G.players[4].playedCards = [];
G.players[5].hand = cartasJugador6;
G.players[5].playedCards = [];
};

const darCartasDebug = ({ G, ctx, playerID }) => {
const cartasEspecificasJugador1 = [12, 20, 8]; // Índices de las cartas para el jugador 1
const cartasEspecificasJugador2 = [12, 8, 20]; // Índices de las cartas para el jugador 2
const cartasEspecificasJugador3 = [12, 8, 20]; // Índices de las cartas para el jugador 3
const cartasEspecificasJugador4 = [12, 8, 20]; // Índices de las cartas para el jugador 4
const cartasEspecificasJugador5 = [12, 8, 20]; // Índices de las cartas para el jugador 3
const cartasEspecificasJugador6 = [12, 8, 20]; // Índices de las cartas para el jugador 4
G.handCount = 0; // Reiniciar la cuenta de mano
G.teams[0].ptsRonda = 0;
G.teams[1].ptsRonda = 0;
// Definir cartas específicas para el jugador 2
G.players[5].hand = cartasEspecificasJugador6.map(index => G.cartasTruco[index]);
G.players[5].playedCards = [];
G.players[4].hand = cartasEspecificasJugador5.map(index => G.cartasTruco[index]);
G.players[4].playedCards = [];
G.players[3].hand = cartasEspecificasJugador4.map(index => G.cartasTruco[index]);
G.players[3].playedCards = [];
G.players[2].hand = cartasEspecificasJugador3.map(index => G.cartasTruco[index]);
G.players[2].playedCards = [];
G.players[1].hand = cartasEspecificasJugador2.map(index => G.cartasTruco[index]);
G.players[1].playedCards = [];
G.players[0].hand = cartasEspecificasJugador1.map(index => G.cartasTruco[index]);
G.players[0].playedCards = [];
};

function repartirCartas(cartasTruco, numPlayers) {
const numCartasPorJugador = 3;
const cartasDadas = new Set();
const cartasPorJugador = Array.from({ length: numPlayers }, () => []);
for (let jugador = 0; jugador < numPlayers; jugador++) {
const cartasJugador = cartasPorJugador[jugador];
while (cartasJugador.length < numCartasPorJugador) {
let cartaAlAzar;
do {
cartaAlAzar = cartasTruco[Math.floor(Math.random() * cartasTruco.length)];
} while (cartasDadas.has(cartaAlAzar));
cartasJugador.push(cartaAlAzar);
cartasDadas.add(cartaAlAzar);
}
}
return cartasPorJugador; // Retorna un array de arrays, donde cada subarray contiene las cartas de cada jugador
}

//-----------//--------------------------------------------//---------------//
//----------//---FUNCIONES CHK TRUCO ARGENTINO BOARGAME.IO-//--------------//
//---------//--------------------------------------------//-------MTMS----//

const chkTurn = ({ G, ctx, events, playerID }) => {
  let handCount = G.handCount;
  let puntosEquipo0 = G.teams[0].ptsRonda;
  let puntosEquipo1 = G.teams[1].ptsRonda;
  let ind0 = G.teams[0].players;
  let ind1 = G.teams[1].players;
  let RndChk =[];
  let numPlayers = ctx.numPlayers;
  let cards = [];
  if (numPlayers === 2) {
  RndChk = [1, 3, 5];
  } else if (numPlayers === 4) {
  RndChk = [3, 7, 11];
  } else if (numPlayers === 6) {
  RndChk = [5, 11, 17];
  }
  //si es ronda para cheker puntajes,  
  if (handCount === RndChk[0]  || handCount === RndChk[1] || handCount === RndChk[2]) {
  console.log(`Termina la mano numero: ${handCount}---------------------------------------------`);
  let roundIndex; // conigo el index de playedCards para la ronda. 
  if (handCount === RndChk[0]) { roundIndex = 0;}
  if (handCount === RndChk[1]) { roundIndex = 1;}
  if (handCount === RndChk[2]) { roundIndex = 2;}
  cards = [G.players[0].playedCards[roundIndex],G.players[1].playedCards[roundIndex],G.players[2].playedCards[roundIndex],G.players[3].playedCards[roundIndex],G.players[4].playedCards[roundIndex],G.players[5].playedCards[roundIndex] ]
  var result = chkCarta(ind0, ind1, cards, numPlayers);    
  var ganoTeam = result[0];
  var gano = result[1];
  cards =[]; //vacio cards ,ya lo use
  //pongo los puntos segun corresponda
  if (ganoTeam === '0') {
  G.teams[0].ptsRonda += 1;        
  puntosEquipo0 += 1; 
  } else if (ganoTeam === '1') {
  G.teams[1].ptsRonda += 1;
  puntosEquipo1 += 1;
  } else {
  G.teams[0].ptsRonda += 1;  
  G.teams[1].ptsRonda += 1;
  puntosEquipo0 += 1;
  puntosEquipo1 += 1;
  } 
  //teniendo los puntos asignados chekeo la ronda, a ver que pasa
  let mind = chkRonda(G,ctx , puntosEquipo0, puntosEquipo1, gano);
  //chkRodna devuelve los objetos actualizados:
  G.teams[0].ptsGeneral = mind.puntosGralEquipo0;
  G.teams[1].ptsGeneral = mind.puntosGralEquipo1;
  G.teams[0].ptsRonda = mind.puntosEquipo0;
  G.teams[1].ptsRonda = mind.puntosEquipo1;
  G.handCount = mind.handCount;
  G.roundCount = mind.roundCount;
  //iteracion
  G.players[0].playedCards = mind.playedCardsPlayer0;
  G.players[0].hand = mind.handPlayer0;
  G.players[1].playedCards = mind.playedCardsPlayer1;
  G.players[1].hand = mind.handPlayer1;
  G.players[2].playedCards = mind.playedCardsPlayer2;
  G.players[2].hand = mind.handPlayer2;
  G.players[3].playedCards = mind.playedCardsPlayer3;
  G.players[3].hand = mind.handPlayer3;
  G.players[4].playedCards = mind.playedCardsPlayer4;
  G.players[4].hand = mind.handPlayer4;
  G.players[5].playedCards = mind.playedCardsPlayer5;
  G.players[5].hand = mind.handPlayer5;
  events.endTurn({ next: mind.next });

  console.log("Próximo jugador: " + mind.next);
  }
  else { 
  //rondas no check.
  console.log(`Termina la mano numero : ${handCount}-------------------------------`);
  G.handCount += 1;
  events.endTurn();
  }
  return G;                                             //ACTUALIZO G.
  }
  

function chkCarta(ind0, ind1,cards , numPlayers) {
let winner;
let winnerTeam;
let indexWinner;    
const cartasArray = cards;
let indicesJugadoresEquipo0 = ind0;
let indicesJugadoresEquipo1 = ind1;
const cartasTeam0 = [];
const cartasTeam1 = [];
// Sacar integrantes no usados del indice de team (que corresponde a 6 players.)
if (numPlayers === 2 && indicesJugadoresEquipo0.length > 1) {
  indicesJugadoresEquipo0.splice(-1);
  indicesJugadoresEquipo1.splice(-1);
} else if (numPlayers === 4 && indicesJugadoresEquipo0.length > 2) {
  indicesJugadoresEquipo0.splice(-1);
  indicesJugadoresEquipo1.splice(-1);
}
// Iterar sobre los índices del equipo 0
indicesJugadoresEquipo0.forEach((indice) => {
cartasTeam0.push(cartasArray[indice]);
});
// Iterar sobre los índices del equipo 1
indicesJugadoresEquipo1.forEach((indice) => {
cartasTeam1.push(cartasArray[indice]);
});
if (numPlayers === 2) { //2 players
if (cartasTeam0[0].valorTruco > cartasTeam1[0].valorTruco) {
winner = cartasTeam0[0];
winnerTeam = "0";
indexWinner = "0";
return [winnerTeam, indexWinner];
} else if (cartasTeam1[0].valorTruco > cartasTeam0[0].valorTruco) {
winner = cartasTeam1[0];
winnerTeam = "1";
indexWinner = "1";
return [winnerTeam, indexWinner];
} else {
return ["parda", "parda"];
}
}
else { //4 y 6 players2
// Función para encontrar el objeto con el valorTruco máximo en un array de cartas
function encontrarCartaConValorTrucoMaximo(cartas) {
return cartas.reduce((maximo, carta) => (carta.valorTruco > maximo.valorTruco ? carta : maximo), { valorTruco: -Infinity });
}
// Encontrar la carta con el valorTruco máximo en cada equipo
let cartaMaximaTeam0 = encontrarCartaConValorTrucoMaximo(cartasTeam0);
let cartaMaximaTeam1 = encontrarCartaConValorTrucoMaximo(cartasTeam1);
console.log("cartas equipo 0 (player 0): " +cartasTeam0[0].palo  + cartasTeam0[0].numero  + ".");
console.log("cartas equipo 0 (player 2): " +cartasTeam0[1].palo  + cartasTeam0[1].numero  + ".");
console.log("cartas equipo 0 (player 4): " +cartasTeam0[2].palo  + cartasTeam0[2].numero  + ".");
console.log("carta maxima team 0    " + cartaMaximaTeam0.palo + "  " + cartaMaximaTeam0.numero + "." );
console.log("cartas equipo 1 (player 1): " +cartasTeam1[0].palo  + cartasTeam1[0].numero  + ".");
console.log("cartas equipo 1 (player 3): " +cartasTeam1[1].palo  + cartasTeam1[1].numero  + ".");
console.log("cartas equipo 1 (player 5): " +cartasTeam1[2].palo  + cartasTeam1[2].numero  + ".");
console.log("carta maxima team 1     " + cartaMaximaTeam1.palo + "  " + cartaMaximaTeam1.numero + "." );
// Función para encontrar el índice de una carta en el array
function encontrarIndiceDeCartaMaxima(cartaMaxima, array) {
const indice = array.findIndex(carta => carta === cartaMaxima);
return indice !== -1 ? indice.toString() : ''; // Convertir a string o devolver un string vacío si no se encuentra
}
// Encontrar los índices de las cartas máximas en el array
let indiceWinnerTeam0 = encontrarIndiceDeCartaMaxima(cartaMaximaTeam0, cartasArray);
let indiceWinnerTeam1 = encontrarIndiceDeCartaMaxima(cartaMaximaTeam1, cartasArray);
// Comparar los valores de truco de ambas cartas
if (cartaMaximaTeam0.valorTruco > cartaMaximaTeam1.valorTruco) {
// Si el valor de truco de Team0 es mayor
console.log("*******Gano team 0");
winnerTeam = "0";
indexWinner = indiceWinnerTeam0;
return [winnerTeam, indexWinner];
} else if (cartaMaximaTeam0.valorTruco < cartaMaximaTeam1.valorTruco) {
// Si el valor de truco de Team1 es mayor
console.log("*******Gano Team 1");
winnerTeam = "1";
indexWinner = indiceWinnerTeam1;
return [winnerTeam, indexWinner];
} else {
// Si los valores de truco son iguales
console.log("*****Empataron");
return ["parda", "parda"];
}
}
}

function chkMano(numPlayers, roundCount) {
let manoIndex;
if (roundCount === 0) {
manoIndex = "0";
} else {
if (numPlayers === 2) {
manoIndex = (roundCount % 2).toString(); // Ciclo de índices: '0', '1' (jugadores '0', '1')
} else if (numPlayers === 4) {
manoIndex = (roundCount % 4).toString(); // Ciclo de índices: '0', '1', '2', '3' (jugadores '0', '1', '2', '3') 
} else if (numPlayers === 6) {
manoIndex = (roundCount % 6).toString(); // Ciclo de índices: '0', '1', '2', '3', '4' (jugadores '0', '1', '2', '3', '4')
}  
}
return manoIndex;
}


function chkTeamMano( roundCount) {
  let manoIndex;
  if (roundCount === 0) {
  manoIndex = "0";  }
manoIndex = (roundCount % 2).toString(); // Ciclo de índices: '0', '1' (teams '0', '1')
  return manoIndex;
  }


function chkNextMano(numPlayers, roundCount) {
let manoIndex;
if (roundCount === 0) {
manoIndex = "1";
} else {
roundCount += 1;
if (numPlayers === 2) {
manoIndex = (roundCount % 2).toString(); // Ciclo de índices: '0', '1' (jugadores '0', '1')
} else if (numPlayers === 4) {
manoIndex = (roundCount % 4).toString(); // Ciclo de índices: '0', '1', '2', '3' (jugadores '0', '1', '2', '3')
} else if (numPlayers === 6) {
manoIndex = (roundCount % 6).toString(); // Ciclo de índices: '0', '1', '2', '3', '4' (jugadores '0', '1', '2', '3', '4')
}  
console.log("Es mano:" + manoIndex + ".");
}
return manoIndex;
}
//FUNCTION chkPie
//identifica jugadores pie a partir del index del jugador mano, 
//y los devuelve en un array (pie equipo 0, pie equipo 1)

function chkPie(numPlayers, roundCount, ind0, ind1) {
let pieIndex;
if (numPlayers === 2) {
pieIndex = (roundCount % 2);
} else if (numPlayers === 4) {
roundCount += 2;
pieIndex = (roundCount % 4);
} else if (numPlayers === 6) {
roundCount += 4;
pieIndex = (roundCount % 6);
} 
let pieIndex2 = (parseInt(pieIndex) + 1) % numPlayers;
if (ind0.includes(pieIndex)) {
console.log("Pie equipo 0 :" + pieIndex + ".");
return [pieIndex, pieIndex2];
} else if (ind1.includes(pieIndex)) {
console.log("Pie equipo 0 : " + pieIndex2 + ".");
return [pieIndex2, pieIndex];
} 
}

//devuelve 1 o 0 segun el team del player que se le pase como arg.
function chkTeams(ind0, ind1, playerID) {
  let ind0Array = [];
  let ind1Array = [];
  // Recorrer ind0 y almacenar índices en ind0Array
  ind0.forEach(index => {
    ind0Array.push(index);
  });
  // Recorrer ind1 y almacenar índices en ind1Array
  ind1.forEach(index => {
    ind1Array.push(index);
  });

  let PID = Number(playerID);
  if (ind0Array.includes(PID)) {
  return 0;
  } else if (ind1Array.includes(PID)) {
  return 1;
  } else {return 3;}
 }

function chkRonda(G, ctx, puntosEquipo0, puntosEquipo1, gano) {
let nextValue = "0";
let puntosGralEquipo0 = G.teams[0].ptsGeneral;
let puntosGralEquipo1 = G.teams[1].ptsGeneral;
let playedCardsPlayer0 = G.players[0].playedCards;
let handPlayer0 = G.players[0].hand;
let playedCardsPlayer1 = G.players[1].playedCards;
let handPlayer1 = G.players[1].hand;
let playedCardsPlayer2 = G.players[2].playedCards;
let handPlayer2 = G.players[2].hand;
let playedCardsPlayer3 = G.players[3].playedCards;
let handPlayer3 = G.players[3].hand;
let playedCardsPlayer4 = G.players[4].playedCards;
let handPlayer4 = G.players[4].hand;
let playedCardsPlayer5 = G.players[5].playedCards;
let handPlayer5 = G.players[5].hand;
let handCount = G.handCount;
let cartasTruco = G.cartasTruco;
let roundCount = G.roundCount;
let numPlayers = ctx.numPlayers;
let manoAhora = chkMano(numPlayers, roundCount);
let manoDespues = chkNextMano(numPlayers, roundCount);
let rndChk = [];
if (numPlayers === 2) {
   rndChk = [2, 5];
  } else if (numPlayers === 4) {
  rndChk = [4,  11];
  } else if (numPlayers === 6) {
  rndChk = [6, 16];
  }


//si esta 2 a 2 (2-2/2-2)
if (puntosEquipo0 === 2 && puntosEquipo1 === 2) {

  console.log("caso 2 a 2 ");
  if (handCount >=  rndChk[1]) {//modificar segun numplayers
if (manoAhora === 0 ) //cambiar
{
puntosGralEquipo0 += 3;
}else{
puntosGralEquipo1 += 3;
}
roundCount += 1;
puntosEquipo1 = 0;
puntosEquipo0 = 0;
handCount = 0;
handPlayer0 = [];
playedCardsPlayer0 = [];
handPlayer1 = [];
playedCardsPlayer1 = [];
handPlayer2 = [];
playedCardsPlayer2 = [];
handPlayer3 = [];
playedCardsPlayer3 = [];
handPlayer4 = [];
playedCardsPlayer4 = [];
handPlayer5 = [];
playedCardsPlayer5 = [];
[handPlayer0, handPlayer1, handPlayer2, handPlayer3, handPlayer4, handPlayer5] = repartirCartas(cartasTruco, numPlayers);
nextValue = manoDespues;
} 
else {
console.log('Ambos jugadores tienen 2 puntos en la segunda ronda.');
puntosEquipo1 = 1;
puntosEquipo0 = 1;
nextValue = manoAhora; // El próximo sería el que es mano
handCount += 1;
}
}

//si esta1 a 1 (1-1 / 1-1)
else if (puntosEquipo0 === 1 && puntosEquipo1 === 1) {
  
  console.log("caso 1 a 1 ");


  if (handCount === 6) { //cambiar esto
nextValue = manoAhora;
handCount += 1; // Es empate en la primera ronda, sigue el que es mano
console.log("a ver q pasa");
} else {


if (gano === "parda") { 
nextValue = manoAhora; 
handCount += 1;// En la segunda ronda, sigue el que ganó
console.log("gano parda?");
}

else { 
nextValue = gano; 
console.log("lo normal");
handCount += 1;// En la segunda ronda, sigue el que ganó
}

}
} 

//si solo 1 de los 2 tiene 2 puntos (2-0 / 2-1 / 1-2 /0-2)
else if (puntosEquipo0 === 2 || puntosEquipo1 === 2) {
  console.log("caso 2 a x ");
if (puntosEquipo0 === 2 && puntosEquipo1 !== 2) {
puntosGralEquipo0 += 3;
nextValue = manoDespues; // El próximo sería el que no es mano ahora
} else if (puntosEquipo0 !== 2 && puntosEquipo1 === 2) {
puntosGralEquipo1 += 3;
nextValue = manoDespues; // El próximo sería el que no es mano ahora
}
roundCount += 1;
puntosEquipo1 = 0;
puntosEquipo0 = 0;
handCount = 0;
handPlayer0 = [];
playedCardsPlayer0 = [];
handPlayer1 = [];
playedCardsPlayer1 = [];
handPlayer2 = [];
playedCardsPlayer2 = [];
handPlayer3 = [];
playedCardsPlayer3 = [];
handPlayer4 = [];
playedCardsPlayer4 = [];
handPlayer5 = [];
playedCardsPlayer5 = [];
[handPlayer0, handPlayer1, handPlayer2, handPlayer3,handPlayer4, handPlayer5] = repartirCartas(cartasTruco, numPlayers);
} 
//si no va 2 a 2, ni 1 a 1 ,  (1-0/ 0-1/ 0-0)
  else  if ((puntosEquipo0 === 0 && puntosEquipo1 === 0)
  || (puntosEquipo0 === 1 && puntosEquipo1 === 0)
  || (puntosEquipo0 === 0 && puntosEquipo1 === 1)
  ) {
    
  console.log("caso 0 a 0 , 1 a 0 , 0 a 1 ");
  console.log("deberia seguir el ke gano, uqe es " +gano);
    nextValue = gano; // Define próximo jugador: el último en ganar
  handCount += 1;
  }
else 
{
  console.log("else de todo");
  console.log("deberia seguir el ke gano, uqe es " +gano);
nextValue = gano; // Define próximo jugador: el último en ganar
handCount += 1;}


return {
next: nextValue,
puntosGralEquipo0: puntosGralEquipo0,
puntosGralEquipo1: puntosGralEquipo1,
puntosEquipo0: puntosEquipo0,
puntosEquipo1: puntosEquipo1,
handCount: handCount,
roundCount: roundCount,
//agregar iteracion
playedCardsPlayer0: playedCardsPlayer0,
handPlayer0: handPlayer0,
playedCardsPlayer1: playedCardsPlayer1,
handPlayer1: handPlayer1,
playedCardsPlayer2: playedCardsPlayer2,
handPlayer2: handPlayer2,
playedCardsPlayer3: playedCardsPlayer3,
handPlayer3: handPlayer3,
playedCardsPlayer4: playedCardsPlayer4,
handPlayer4: handPlayer4,
playedCardsPlayer5: playedCardsPlayer5,
handPlayer5: handPlayer5,
//
};
}

function chkJuego(ptsGeneral1, ptsGeneral2) {
if (ptsGeneral1 >= 30 || ptsGeneral2 >= 30) {
console.log("Al menos un jugador tiene 30 puntos o más");
return true; // Devuelve verdadero si alguien ganó el juego
} else {
console.log("Ningún jugador tiene 30 puntos o más");
return false; // Devuelve falso si nadie ganó el juego todavía
}
} 

function chkTantos(cards) {
const palos = cards.map(card => card.palo.toLowerCase()); // Convertir los palos a minúsculas
// Verificar si hay al menos 2 cartas con el mismo palo
const sameSuit = palos.some((palo, index) => palos.indexOf(palo) !== index);
// Si no hay al menos 2 cartas con el mismo palo
if (!sameSuit) {
// Encontrar la carta con el mayor valorEnvido
const maxEnvidoCard = cards.reduce((maxCard, card) => (card.valorEnvido > maxCard.valorEnvido ? card : maxCard));
// Devolver el valorEnvido de la carta con el mayor valorEnvido
return maxEnvidoCard.valorEnvido;
}
// Filtrar las cartas con el palo más común (considerando minúsculas)
const paloComun = palos.reduce((acc, palo) => (acc[palo] = (acc[palo] || 0) + 1, acc), {});
const paloMasComun = Object.keys(paloComun).reduce((a, b) => paloComun[a] > paloComun[b] ? a : b);
const cartasPaloComun = cards.filter(card => card.palo.toLowerCase() === paloMasComun);
// Ordenar las cartas con el mismo palo por valorEnvido en orden descendente
const sortedByEnvido = cartasPaloComun.sort((a, b) => b.valorEnvido - a.valorEnvido);
// Sumar los dos valores de envido más altos y agregarles 20
let envidoSum = 0;
if (sortedByEnvido.length >= 2) {
envidoSum = sortedByEnvido.slice(0, 2).reduce((sum, card) => sum + card.valorEnvido, 0) + 20;
} else {
envidoSum = sortedByEnvido[0].valorEnvido;
}
return envidoSum;
}

function chkEnvido(ind0, ind1, hands, numPlayers) {
let indicesJugadoresEquipo0 = ind0;
let indicesJugadoresEquipo1 = ind1;
let tantosTeam0;
let tantosTeam1;
const tantosArray = hands;
// Sacar integrantes no usados del indice de team (que corresponde a 6 players.)
if (numPlayers === 2 && indicesJugadoresEquipo0.length > 1) {
  indicesJugadoresEquipo0.splice(-1);
  indicesJugadoresEquipo1.splice(-1);
} else if (numPlayers === 4 && indicesJugadoresEquipo0.length > 2) {
  indicesJugadoresEquipo0.splice(-1);
  indicesJugadoresEquipo1.splice(-1);
}
// Iterar sobre los índices del equipo 0
indicesJugadoresEquipo0.forEach((indice) => {
  tantosTeam0.push(chkTantos(hands[indice]));
});
// Iterar sobre los índices del equipo 1
indicesJugadoresEquipo1.forEach((indice) => {
  tantosTeam1.push(chkTantos(hands[indice]));
});
if (numPlayers === 2) { //2 players
if (tantosTeam0[0] > tantosTeam1[0]) {
//gano0
return 0;
} else if (tantosTeam0[0] > tantosTeam1[0]) {
//gano1
return 1;
} else {
return "parda";
}
}
else { //4 y 6 players2
    let maxTantosTeam0 = Math.max(...tantosTeam0);  
    let maxTantosTeam1 = Math.max(...tantosTeam1);  
if (maxTantosTeam0 > maxTantosTeam1) {
console.log("*******Gano team 0");
return 0;
} else if (maxTantosTeam0 < maxTantosTeam1) {
console.log("*******Gano Team 1");
return 1;
} else {
console.log("*****Empataron");
return "parda";
}}}

  function chkCantados(cantado0, cantado1) {
  // Unir los arrays
  const cantados = cantado0.concat(cantado1);
  // Eliminar objetos específicos
  const cantadosFiltrados = cantados.filter(objeto => {
    return objeto !== "truco" && objeto !== "retruco" && objeto !== "vale4";
  });
  // Verificar la presencia de objetos "realEnvido", "faltaEnvido" y "vale4"
  const tieneRealEnvido = cantadosFiltrados.includes("realEnvido");
  const tieneFaltaEnvido = cantadosFiltrados.includes("faltaEnvido");
  const tieneVale4 = cantadosFiltrados.includes("vale4");
  // Contar la cantidad de veces que hay envido, realEnvido y faltaEnvido
  const cantidadEnvido = cantadosFiltrados.filter(objeto => objeto === "envido").length;
  const cantidadRealEnvido = cantadosFiltrados.filter(objeto => objeto === "realEnvido").length;
  const cantidadFaltaEnvido = cantadosFiltrados.filter(objeto => objeto === "faltaEnvido").length;
  // Calcular "noQuiere" y "quiere"
  const noQuiere = cantidadEnvido * 1 + cantidadRealEnvido * 2 + cantidadFaltaEnvido * 1;
  const quiere = cantidadEnvido * 2 + cantidadRealEnvido * 3;
  return [
    cantidadEnvido >= 2 ? 1 : 0,
    tieneRealEnvido ? 1 : 0,
    tieneFaltaEnvido ? 1 : 0,
    tieneRealEnvido || tieneFaltaEnvido || tieneVale4 ? 1 : 0,
    noQuiere, //puntaje si no quiere para el que no se cago
    quiere //puntaje ganador para el q gana.
  ];
}

function chkOrdenTurnos(numPlayers) {
  let ordenTurnos = [];
  if (numPlayers === 2) {
    ordenTurnos = ["0", "1"];
  } else if (numPlayers === 4) {
    ordenTurnos = ["0", "1", "2", "3"];
  } else if (numPlayers === 6) {
    ordenTurnos = ["0", "1", "2", "3", "4", "5"];
  }
  return ordenTurnos;
}
function chkLast(arr) {
  // Verificar si el array no está vacío
  if (arr.length === 0) {
    return undefined; // o puedes devolver null, lanzar un error, etc., según tus necesidades
  }
  // Devolver el último valor del array
  return arr[arr.length - 1];
}

function chkStage(ind0, ind1, cant0, cant1, stTruco, stEnvido, playerID, handCount) {
let ctxPlayer =  playerID;
let newStage = "";
let puedeCantarEnvido;
let puedeCantarTruco;
let cantados = [cant0, cant1];
let teamActual = chkTeams(ind0, ind1, ctxPlayer);
console.log("Team actual es "+ teamActual + " ------------------------------------");
let teamOther = teamActual === 0 ? 1 : 0;
newStage= "gral";
let otherCantado = cantados[teamOther];
if (stTruco === 3  ||
  otherCantado.includes("truco") ||
  otherCantado.includes("retruco") || 
  otherCantado.includes("vale4")) {
puedeCantarTruco = 0;
} else {
puedeCantarTruco = 1;
}
//CAMBIAR HANDCOUNT A DYNAMIC 
if (handCount === 4 || handCount === 5 ){      //Los pies pueden cantar envido, handCount ==== 5/6, 3/4, 1/2  
if  (stTruco == 0 && stEnvido == "")
{ puedeCantarEnvido = 1;
} else {  puedeCantarEnvido = 0;}
} else { puedeCantarEnvido = 0; }
if (puedeCantarTruco === 1) {
newStage += "Truc";
} else if (puedeCantarTruco === 0) {
newStage += "Struc";
}
if (puedeCantarEnvido === 1) {
newStage += "Env";
} else if  (puedeCantarEnvido === 0){
newStage += "Senv";
}
return newStage;
}
//||------------------------------------------------||
//||------   OBJ. G. BOARDGAME.IO TRUCO ARGENTINO  -||
//||------------------------------------------------||
export const Truco = {
  name: 'Truco',
  setup: ({G, ctx }) => ({
    cartasTruco: [
      { palo: 'basto', numero: '1', valorTruco: 13, valorEnvido: 1 },//basto
      { palo: 'basto', numero: '2', valorTruco: 9, valorEnvido: 2 },
      { palo: 'basto', numero: '3', valorTruco: 10, valorEnvido: 3 },
      { palo: 'basto', numero: '4', valorTruco: 1, valorEnvido: 4 },
      { palo: 'basto', numero: '5', valorTruco: 2, valorEnvido: 5 },
      { palo: 'basto', numero: '6', valorTruco: 3, valorEnvido: 6 },
      { palo: 'basto', numero: '7', valorTruco: 4, valorEnvido: 7 },
      { palo: 'basto', numero: '10', valorTruco: 5, valorEnvido: 0 },
      { palo: 'basto', numero: '11', valorTruco: 6, valorEnvido: 0 },
      { palo: 'basto', numero: '12', valorTruco: 7, valorEnvido: 0 },
      { palo: 'espada', numero: '1', valorTruco: 14, valorEnvido: 1 },//espada
      { palo: 'espada', numero: '2', valorTruco: 9, valorEnvido: 2 },
      { palo: 'espada', numero: '3', valorTruco: 10, valorEnvido: 3 },
      { palo: 'espada', numero: '4', valorTruco: 1, valorEnvido: 4 },
      { palo: 'espada', numero: '5', valorTruco: 2, valorEnvido: 5 },
      { palo: 'espada', numero: '6', valorTruco: 3, valorEnvido: 6 },
      { palo: 'espada', numero: '7', valorTruco: 12, valorEnvido: 7 },
      { palo: 'espada', numero: '10', valorTruco: 5, valorEnvido: 0 },
      { palo: 'espada', numero: '11', valorTruco: 6, valorEnvido: 0 },
      { palo: 'espada', numero: '12', valorTruco: 7, valorEnvido: 0 },
      { palo: 'copa', numero: '1', valorTruco: 8, valorEnvido: 1 },//copa
      { palo: 'copa', numero: '2', valorTruco: 9, valorEnvido: 2 },
      { palo: 'copa', numero: '3', valorTruco: 10, valorEnvido: 3 },
      { palo: 'copa', numero: '4', valorTruco: 1, valorEnvido: 4 },
      { palo: 'copa', numero: '5', valorTruco: 2, valorEnvido: 5 },
      { palo: 'copa', numero: '6', valorTruco: 3, valorEnvido: 6 },
      { palo: 'copa', numero: '7', valorTruco: 4, valorEnvido: 7 },
      { palo: 'copa', numero: '10', valorTruco: 5, valorEnvido: 0 },
      { palo: 'copa', numero: '11', valorTruco: 6, valorEnvido: 0 },
      { palo: 'copa', numero: '12', valorTruco: 7, valorEnvido: 0 },
      { palo: 'oro', numero: '1', valorTruco: 8, valorEnvido: 1 },//oro
      { palo: 'oro', numero: '2', valorTruco: 9, valorEnvido: 2 },
      { palo: 'oro', numero: '3', valorTruco: 10, valorEnvido: 3 },
      { palo: 'oro', numero: '4', valorTruco: 1, valorEnvido: 4 },
      { palo: 'oro', numero: '5', valorTruco: 2, valorEnvido: 5 },
      { palo: 'oro', numero: '6', valorTruco: 3, valorEnvido: 6 },
      { palo: 'oro', numero: '7', valorTruco: 11, valorEnvido: 7 },
      { palo: 'oro', numero: '10', valorTruco: 5, valorEnvido: 0 },
      { palo: 'oro', numero: '11', valorTruco: 6, valorEnvido: 0 },
      { palo: 'oro', numero: '12', valorTruco: 7, valorEnvido: 0 },
    ],
    cartaVacia: { palo: 'ninguno', numero: '0', valorTruco: 0, valorEnvido: 0 },
    players: [
      {  //0
        hand: [], // Ejemplo de las cartas en la mano del jugador
        playedCards: [], // Ejemplo de las cartas jugadas del jugador
        stage: "", //stage correspondiente
      },
      { //1
        hand: [],
        playedCards: [],
        stage: "", //stage correspondiente
      },
      { //2
        hand: [],
        playedCards: [],
        stage: "", //stage correspondiente

      },
      { //3
        hand: [],
        playedCards: [],
        stage: "", //stage correspondiente  
    },
      { //4
        hand: [],
        playedCards: [],
        stage: "", //stage correspondiente
      },
      {//5
        hand: [],
        playedCards: [],
        stage: "", //stage correspondiente
      },
    ],
    teams: [
      {  //0
        players: [0, 2, 4],
        cantado: [],
        ptsRonda: 0,
        ptsGeneral: 0,
        stage: "",
      },
      { //1
        players: [1, 3, 5],
        cantado: [],
        ptsRonda: 0,
        ptsGeneral: 0,
        stage: "",
      },
    ],
    roundCount: 0,
    handCount: 0,
    ordenTurnos: chkOrdenTurnos(ctx.numPlayers),
    stEnvido: null, // Contiene estado del envido
    stTruco: 0, // Contiene estado del truco
    stParda: null, // Contiene estado de parda
  }),
  moves: { // movimientos iniciales cuando no esta en ningun stage.
    darCartasInicial: darCartasInicial,
    darCartasDebug: darCartasDebug,
    darCartas: darCartas,
    jugarCarta: jugarCarta,
    cantarTruco: cantarTruco,
    noact: noact,
   // habilitar si todos pueden cantar envido
   // cantarEnvido: cantarEnvido,
  },
  turn: {
    order: TurnOrder.CUSTOM_FROM('ordenTurnos'),
    onEnd: ({ G, ctx, playerID, events }) => {
      return G; // Devuelve el estado actualizado
    },
onBegin: ({ G, ctx, events}) => {   
        let newStage = chkStage(G.teams[0].players, G.teams[1].players,
                                G.teams[0].cantado, G.teams[1].cantado,
                                G.stTruco, G.stEnvido, ctx.currentPlayer, 
                                G.handCount);
        events.setActivePlayers({value:{[ctx.currentPlayer]: newStage}});
                                },
      stages: {
      estadoNatural: {
        moves: {
          jugarCarta: jugarCartaNEnd,
          noact: noact,
        },
      },
      waiting: {
        moves: {},
      },
      rtaTrucEnv: { //rta truco, cuando puede cantarle envido (no cantado, primer hand)
        moves: {
            quiero: quiero,
          noQuiero: noQuiero,
          cantarEnvido: cantarEnvido,
          cantarReal: cantarReal,
          cantarFalta: cantarFalta,
          cantarTruco: cantarTruco,
        },
      },
      
      rtaTrucSenv: { //rta truyco cuando no puede antarle envido ( ya cantaod, o +segunda hand)
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
          cantarTruco: cantarTruco,
        },
      },
      
      rtaRtruc: { //rta retruco
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
          cantarTruco: cantarTruco,
          cantarEnvido: cantarEnvido,
        },
      },
      
      rtaValec: {//rta vale4  same as reta fenv..
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
        },
      },
      
      rtaEnv: { //rta envido
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
          cantarEnvido: cantarEnvido,
          cantarReal: cantarReal,
          cantarFalta: cantarFalta,
        },
      },
      
      rtaRenv: { //rta renvido
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
          cantarFalta: cantarFalta,
        },
      },
      
      rtaFenv: { //reta fenvido
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
        },
      },
      
      rtaEnvTruc: { // rta  envido y truco
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
                    cantarEnvido: cantarEnvido,
          cantarReal: cantarReal,
          cantarFalta: cantarFalta,
        },
      },
      
      rtaRenvTruc: { //rta renvido y truco
        moves: {
          quero: quiero,
          noQuiero: noQuiero,
          cantarFalta: cantarFalta,
        },
      },
      
      rtaFenvTruc: { // rta fenv y truco national joke
        moves: {
          quiero: quiero,
          noQuiero: noQuiero,
        },
      },

      gralTrucSenv: { // general, puede cantar truco no puede cantar envido (ya fue cantado o ronda +2)
        moves: {
          jugarCarta: jugarCarta,
          cantarTruco: cantarTruco,
          darCartasInicial: darCartasInicial,
        },
      },
      
      gralTrucEnv: { //general, puede cantar truco y envido
        moves: {
          jugarCarta: jugarCarta,
          cantarTruco: cantarTruco,
          cantarEnvido: cantarEnvido,
          cantarReal: cantarReal,
          cantarFalta: cantarFalta,
        },
      },
      
      gralStrucEnv: { // general no puede cantar truco (ya termino o su ekipo lo canto) puede cant ENVIDO
        moves: {
          jugarCarta: jugarCarta,
          cantarEnvido: cantarEnvido,
          cantarReal: cantarReal,
          cantarFalta: cantarFalta,
        },
      },
      
      gralStrucSenv: { //general no puee cantar truc ni envo  ( ya terminaron o su ekipo los canto etc)
        moves: {
          jugarCarta: jugarCarta,
        },
      },
      
      rtaEnvEnv: { // rta fenv y truco national joke
        moves: {
          cantarReal: cantarReal,
          cantarFalta: cantarFalta,
          quiero: quiero,
          noQuiero: noQuiero,
        },
      },
    },
  },
};
