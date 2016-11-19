//__________________________________________________________________________________________________________
//static definitions
// sexesses
const FEMALE = 0;
const MALE = 1;

// education
const NONE = 0;
const POOR = 1;
const HIGH = 2;

// majority
const MAJORITY = true;
const MINORITY = false;

// field types
const START = 0;
const IMMO = 1;
const RISK = 2;
const JOB = 3;
const FELONY = 4;
const TRAINING = 5;
const JAIL = 6;

// ghettos
const REDLIGHT = 0;
const OLD_TOWN = 1;
const INNER_CITY = 2;
const FIN_DISTRICT = 3;
const HOTSPOT = 4;
const UNI = 5;
const INDUSTRY = 6;
const MANSIONS = 7;

const LOW = 1;
const HI = 2;
const AVG = 3;

//__________________________________________________________________________________________________________
//configuration variables
var port  = (Number(process.env.PORT) || 3000);
var numberOfRooms = 20;

//__________________________________________________________________________________________________________
// requiring modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Game = require('./classes/Game.js');
var Player = require('./classes/Player.js');
var Dice = require('./classes/Dice.js');

//__________________________________________________________________________________________________________
//  initialize app
io.set('log level', 1);

app.use("/", express.static(__dirname + '/static'));

var myGame = new Game();
myGame.initialise();
var myDice = new Dice();

//__________________________________________________________________________________________________________
// functionality
//Replaces HTML special chars in user input by their escape strings
function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

var sockcount = 0;
//__________________________________________________________________________________________________________
//socket communication
io.sockets.on('connection', function(socket) 
{
  sockcount++;
  console.log("" + sockcount + " sockets connected!");
  socket.emit("clear");
  

  socket.on('disconnect', function()
  {
    sockcount--;
    if(socket.name === undefined)
    {
      console.log("player without playername left");
      return;
    }
    console.log("" + sockcount + " players remain!");



    var roomID = socket.room;
    var current_room = myGame.getRoomByID(roomID);
    var leaving_player = current_room.findPlayerByPlayerNr(socket.playerNr);
    
    console.log('player ' + socket.name + '(' + socket.playerNr + ') left room ' + (roomID + 1));

    
    current_room.removePlayer(leaving_player);
   
    if(current_room.getNrPlayers() == 0) {
      //TODO: clean Room
      //current_room.clean();
      return;
    }
    if(current_room.getNrPlayers() == 1) {
      //TODO: create winner function
      //current_room.letLastPlayerWin();
    }

    io.sockets.to("room" + socket.room).emit('provideGameState', current_room.getGameState());

  });

  //called when trying to join a room - - - - - - - - - - - - - - - - - -
  socket.on('requestRoom', function(roomID, name)
  { 
    console.log("on requestRoom(" + roomID + "," + name + ")");

    var current_room = myGame.getRoomByID(roomID);
    var playerNr = current_room.generatePlayerNr(name);
    
    if(playerNr) { //player found a place in the room
      
      current_room.addPlayer(new Player(name, playerNr));

      socket.name = name;
      socket.room = roomID;
      socket.playerNr = playerNr;

      //update for all sockets
      socket.join('room' + socket.room);
      io.sockets.to('room' + socket.room).emit('provideGameState', current_room.getGameState());

      //TODOmaybe? update all sockets in Lobby, to notice if room is full...

      //push character Data
      var characters = myGame.getCharacters();
      var charNames = [];
      for(var iter in characters)
      {
        charNames.push(characters[iter].getName());
      }
      socket.emit('provideChars', charNames);

      var j = roomID + 1;
    
      console.log('Player ' + name + ' joined roomID ' + j + ' with playerNr ' + playerNr);
      console.log("now the Player should choose a character.");

    } else {
      socket.emit("requestedRoomfailed");
      console.log("there was no place in room " + roomID);
    }

    myGame.printPlayers();
  });

  //player chose character, assign it with all the new status info
  socket.on('assignCharacter', function(charID)
  {
    console.log('on assignCharacter(' + charID + ")");

    socket.charID = charID;
    var myChar = myGame.getCharacters()[charID];
    var room = myGame.getRoomByID(socket.room);
    var player = room.findPlayerByPlayerNr(socket.playerNr);

    //set the player information
    player.setCharID(charID);
    player.setCharacter(myChar);
    player.setCharName(myChar.getName());
    player.setSex(myChar.getSex());
    player.setEuCitizen(myChar.isEU()); // setzt du nostrifikation auch für EU bürger? wichtig!
    player.setMajority(myChar.isMajority());
    player.setBaseStatus(myChar.getStatus());
    player.setAge(myChar.getAge());
    player.setState("notReady");


    io.sockets.to('room' + socket.room).emit('provideGameState', room.getGameState());    
    socket.emit('provideSpecificPlayerinfo', player.getSpecificPlayerInfo());    

    console.log("The Player " + socket.name + "(" + socket.playerNr + ") just chose character: " + myChar.getName());
  });

  //provide player info when clicked on player in room
  socket.on('requestPlayerinfo', function(pNr)
  {
    console.log("on requestPlayerinfo(" + pNr + ")");

    var info = {};
    var current_room = myGame.getRoomByID(socket.room);
    var player = current_room.findPlayerByPlayerNr(pNr);
    
    if(player) {
      info = player.getPlayerInfo();      
    } else {
      console.log("strangly the player " + pNr + " was " + player);
      info['pNr'] = pNr;
      info['charID'] = 0;
      info['name'] = '';
      info['charName'] = '';
      info['status'] = '';
      info['income'] = '';
      info['moneysack'] = '';
      info['dept'] = '';
      info['inPrison'] = '';
            
    }

    socket.emit('providePlayerinfo', info);
  });

  //provide field info when clicked on field on board
  socket.on('requestFieldinfo', function(fieldNr)
  {
    var infos = {};
    var field = myGame.getBoard()[fieldNr - 1];
    var priceModel = field.getPriceModel();

    infos['fieldNr'] = fieldNr;
    infos['name'] = field.getName();
    infos['ghetto'] = field.getGhettoName();
    infos['rent'] = priceModel.getRent();
    infos['house1'] = priceModel.getHouse1Rent();
    infos['house2'] = priceModel.getHouse2Rent();
    infos['house3'] = priceModel.getHouse3Rent();
    infos['house4'] = priceModel.getHouse4Rent();
    infos['hotel'] = priceModel.getHotelRent();
    infos['price'] = priceModel.getPrice();
    infos['priceHouse'] = priceModel.getPriceHouse();
    infos['priceHotel'] = priceModel.getPriceHotel();
    if(field.getOwner() == null)
    {
      infos['owner'] = 'frei';
    }
    else
    {
      infos['owner'] = field.getOwner().getName();
    }

    socket.emit('provideFieldinfo', infos);
  });

  //probably unnecessary for real use
  socket.on('requestStatus', function()
  {
    //Prevent crash if user is not yet in room
    if(socket.room == null || socket.uid == null)
      return 0; // TODO: check if makes sense and whereelse...
      
    var current_room = myGame.getRoomByID(socket.room);
    var player = current_room.findPlayerByUID(socket.uid)
    
    socket.emit('provideStatus', player.getStatusInfo());
  });



//------------------------ unreviewed code -----------------------------------

  socket.on('is ready', function(uid, room)
  {
    var current_room = myGame.getRoomByID(room);
    var player = current_room.findPlayerByUID(uid);
    player.setReady(true);
    socket.ready = true;
    console.log('[' + room + '] : ' + player.getName() + ' is ready');

    if(current_room.getNrPlayers() < 2)
    {
      console.log('only one player - can\'t play alone');
      return;
    }

    // check if everybody ready
    for(var iter in current_room.getPlayers())
    {
      if(!current_room.getPlayers()[iter].isReady())
      {
        console.log('[' + room + '] : room not ready');
        return;
      }
    }

    console.log('[' + room + '] : everbody ready!');
    var curr_player = current_room.getCurrentPlayer();
    io.sockets.in(socket.room).emit('active player', current_room.getCurrentPlayerIndex(), curr_player.getUniqueID());
    console.log("Active Player: " + current_room.getCurrentPlayerIndex() + " with ID: " + curr_player.getUniqueID());
  });

  socket.on('leave game', function(playerName, roomID)
  {
    console.log('-------- NOT IMPLEMENTED --------');
    console.log('on "leave game": ' + playerName + ' from room ' + roomID);
    console.log('---------------------------------');
  });




// - --- -- - - -- - - - -- - - -- -- -- - - - - - - - -- -- - -
  socket.on('throw dices', function(uid, roomID)
  {
    var current_room = myGame.getRoomByID(roomID);
    var currentBoard = current_room.getBoard();
    var player = current_room.findPlayerByUID(uid);

    var roll1 = myDice.roll();
    var roll2 = myDice.roll();

    player.makeMove(roll1 + roll2);
    var currentFieldNr = player.getField();
    console.log(player.getName() + ' moves to currField ' + currentFieldNr + ' [' + roll1 + '+' + roll2 + ']');

    var currField = currentBoard[currentFieldNr - 1];
    var fieldType = currField.getType();

    if(fieldType == RISK)
    {
      console.log('apply risk card');
      var card_id = current_room.getRiskCards().draw();
      socket.emit('receive riskcard', card_id);
      current_room.getRiskCards().getCardById(card_id).apply(player);
    }
    else if(fieldType == JOB)
    {
      console.log('apply job card');
      var card_id = current_room.getJobCards().draw();
      socket.emit('receive jobcard', card_id);
      current_room.getJobCards().getCardById(card_id).apply(player);
    }
    else if(fieldType == FELONY)
    {
      socket.emit('popup', 'Du musst ins Gefängis!');
      player.setField(31);
      player.throwInPrison(3);
    }
    else if(fieldType == IMMO)
    {
      console.log('immo currField');
      var owner = currField.getOwner();

      // currField not owned -- works like a charm!
      if(owner == null)
      {
        console.log('field ' + currField.getName() + 'available to buy');
        var immoPrice = currField.getPriceModel().getPrice();
        if(player.getMoney() >= immoPrice)
        {
          console.log('\tbuy field ' + currField.getName() + ' ?');
          socket.emit('buy field?', currentFieldNr);
        }
        else
        {
          console.log('\t' + currField.getName() + ' too expensive for ' + player.getName());
          socket.emit('field too expensive');
        }
      }
      // currField owned by yourself - buy house?
      else if(owner.getUniqueID() == uid)
      {
        console.log('YOU da owner!!! [' + player.getName() + ']');
        var housePrice = currField.getPriceModel().getPriceHouse();
        if(player.getMoney() >= housePrice)
        {
          console.log('\tbuy house on ' + currField.getName() + ' ?');
          socket.emit('buy house?', currentFieldNr);
        }
        else
        {
          console.log('\thouse too expensive for ' + player.getName());
          socket.emit('house too expensive');
        }
      }
      // currField owned by somebody else - pay rent!
      else
      {
        console.log('field owned by ' + owner.getName() + ' -> pay rent!');
        var rent = currField.getRent();

        player.pay(rent);
        owner.receive(rent);

        console.log('\t' + player.getName() + ' payed ' + owner.getName() + ' ' + rent);
        socket.emit('pay rent!', rent);
      }
    }
    console.log('----------------------------');

    io.sockets.in(socket.room).emit('show figures', player.getPlayerNr() - 1, player.getField());
    socket.emit('dice results', roll1, roll2);

    current_room.nextPlayer();
    while(current_room.getCurrentPlayer().isInPrison() != 0)
    {
      var p = current_room.getCurrentPlayer();
      var rounds = p.isInPrison();
      p.throwInPrison(rounds - 1);
      var msg = 'Du bist noch ' + p.isInPrison() + ' Runden im Gefängis.';
      io.sockets.in(socket.room).emit('private popup', p.getUniqueID(), msg);
      current_room.nextPlayer();
    }

    var current_player = current_room.getCurrentPlayer();
    io.sockets.in(socket.room).emit('active player', current_player.getPlayerNr(), current_player.getUniqueID());
    console.log("Active Player: " + current_player.getPlayerNr() + " with ID: " + current_player.getUniqueID());
  });

  socket.on('send message', function(data)
  {
    if(data == '')
    {
      return;
    }
	
    var chat = {};
    chat['name'] = socket.name;
    chat['msg'] = escapeHtml(data);

    io.sockets.in(socket.room).emit('new chat message', JSON.stringify(chat));
  });

  socket.on('buy field!', function(uid, roomID, currentField)
  {
    var current_room = myGame.getRoomByID(roomID);
    var board = current_room.getBoard();
    var player = current_room.findPlayerByUID(uid);

    var immoPrice = board[currentField - 1].getPriceModel().getPrice();
    board[currentField - 1].setOwner(player);
    player.buyField(currentField - 1);
    player.pay(immoPrice);

    console.log(player.getOwnedFields());
    io.sockets.in(socket.room).emit('field owner', currentField, player.getPlayerNr());
  });

  socket.on('buy house!', function(uid, roomID, currentField)
  {
    var current_room = myGame.getRoomByID(roomID);
    var board = current_room.getBoard();
    var player = current_room.findPlayerByUID(uid);

    var housePrice = board[currentField - 1].getPriceModel().getPriceHouse();
    board[currentField - 1].buyHouse();
    console.log('player ' + player.getName() + ' buys house [' + board[currentField - 1].getHouses() + '] on ' + currentField)
    player.pay(housePrice);
  });

});


//__________________________________________________________________________________________________________
// finalize startup - starting to listen
function finished () {
  console.log("finished to initialize");
  console.log("listening on port: " + port);
}
//always start to listen when completely finished to initialize!
server.listen(port, finished);