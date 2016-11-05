"use strict";


var characters = null;
var popup_zustand = false;
var uniqueId = null;
var pNr = null;

var curr_tab = 1;

// _______________________________________________________________________________________________________
//html manipulation functions TODO: remove JQuery
function soundOn()
{
  $('#soundBackground').trigger('play');
  $('#optionsSoundOff').show();
  $('#optionsSoundOn').hide();
}

function soundOff()
{
  $('#soundBackground').trigger('pause');
  $('#optionsSoundOn').show();
  $('#optionsSoundOff').hide();
}

function showOptions()
{
  alert("To-Do");
}

function tab(tab_index)
{
  if(curr_tab != tab_index)
  {
    $('#reiterPlayer').removeClass('active');
    $('#reiterStreet').removeClass('active');
    $('#reiterStatus').removeClass('active');

    if(tab_index == 1)
    {
      $('#tabPlayer').show();
      $('#tabStreet').hide();
      $('#tabStatus').hide();
      $('#reiterPlayer').toggleClass('active');
      curr_tab = 1;
    }
    else if(tab_index == 2)
    {
      $('#tabPlayer').hide();
      $('#tabStreet').show();
      $('#tabStatus').hide();
      $('#reiterStreet').toggleClass('active');
      curr_tab = 2;
    }
    else if(tab_index == 3)
    {
	  socket.emit("request status");
      $('#tabPlayer').hide();
      $('#tabStreet').hide();
      $('#tabStatus').show();
      $('#reiterStatus').toggleClass('active');
      curr_tab = 3;
    }
    else
      console.log('Failure calling tab()');
  }
}

// - - - - - - - - - popup functions - - - - - - - - - - - 
function jobPopup(text)
{
  if(popup_zustand == false)
  {
    $("#popup").css("background", "url('graphics/popups/job_ohne.svg')");
    $("#popup-text").text(text).css("margin-left", "10px").css("background-color", "blue");
    $("#popup-button-ok-img").attr("src", "graphics/popups/button-job-ok.png");
    //$("#popup-button-cancel-img").attr("src", "media/button-job-cancel.png");
    $("#popup").fadeIn("normal");
    $("#hintergrund").css("opacity", "0.7").fadeIn("normal");
    popup_zustand = true;
  }
}
function riskPopup(text)
{
  if(popup_zustand == false)
  {
    $("#popup").css("background", "url('graphics/popups/risikopopup.svg')");
    //$("#popup-buttons").css("margin-left", "64px");
    $("#popup-text").text(text).css("margin-left", "10px").css("background-color", "orange");
    $("#popup-button-ok-img").attr("src", "graphics/popups/button-risk-ok.png");
    //$("#popup-button-cancel-img").attr("src", "media/button-risk-cancel.png");
    $("#popup").fadeIn("normal");
    $("#hintergrund").css("opacity", "0.7").fadeIn("normal");
    popup_zustand = true;
  }
}
function neutralDecisionPopup(fieldNr)
{
  if(popup_zustand == false)
  {
    $("#popup").css("background", "url('graphics/popups/neutral.svg')");
    //$("#popup-buttons").css("margin-left", "64px");
    $("#popup-text").text('Feld kaufen? [' + fieldNr + ']').css("margin-left", "10px");
    $("#popup-button-ok-img").attr("src", "graphics/popups/btn_neutral.svg");
    //$("#popup-button-cancel-img").attr("src", "media/button-risk-cancel.png");
    $("#popup").fadeIn("normal");
    $("#hintergrund").css("opacity", "0.7").fadeIn("normal");
    popup_zustand = true;
  }
}
function closePopup()
{
  if(popup_zustand == true)
  {
    $("#popup").fadeOut("normal");
    $("#hintergrund").fadeOut("normal");
    popup_zustand = false;
  }
}

// _______________________________________________________________________________________________________
// utility functions
function getHHMM()
{
  var date = new Date();
  var h = date.getHours();
  var m = date.getMinutes();

  return ((h < 10) ? ('0') : ('')) + h + ':' + ((m < 10) ? ('0') : ('')) + m;
}

function getRollString(int)
{ //should be done on server...
  switch(int)
  {
    case 1:
      return 'one';
      break;

    case 2:
      return 'two';
      break;

    case 3:
      return 'three';
      break;

    case 4:
      return 'four';
      break;

    case 5:
      return 'five';
      break;

    case 6:
      return 'six';
      break;

    default:
      break;
  }
}

function getPlayerName()
{
  var name = document.getElementById('name').innerHTML;
  console.log(name);
  return name;
  //return $('#name').text();
}

function getRoomIndex()
{
  var roomIndex = document.getElementById('room').innerHTML;
  console.log(roomIndex);
  return roomIndex;
  //return $('#room').text() - 1;
}

function setPlayerInfo(info) {
    
    if(!info)
      info = {charID:0, alt:'', name:'', charName:'', status:'', income:'', moneysack:''};

    document.getElementById('characterPic').innerHTML = '<img id="avatar" src="graphics/characters/' 
      + info['charID'] + '.jpg" alt="' + info['alt'] + '" />';
    
    document.getElementById('name').innerHTML = info['name'];
    document.getElementById('characterName').innerHTML = info['charName'];
    document.getElementById('statuspkts').innerHTML = info['status'];
    document.getElementById('income').innerHTML = info['income'];
    document.getElementById('moneysack').innerHTML = info['moneysack'];
}

function setPlayerStatusInfo(info) {
  //TODO: implement

}

function setPageToInitialState() {
  //remove playerlist of room
    for(var i = 0; i < 8; i++) {
      var nr = i+1;
      document.getElementById('charPic' + nr).src = '';
      document.getElementById('playerListName' + nr).innerHTML = '';
      document.getElementById('listedPlayer' + nr).style.display = 'none';
    }

    //show info in board to choose room
    document.getElementById("chooseRoom").classList.remove('hidden');
    
    //remove right and left character list
    var right = document.getElementById('chooseCharacterRight');
    if(right.hasChildNodes()) {
      var remove = right.firstChild; 
      right.removeChild(remove);     
    }
    var left = document.getElementById('chooseCharacterLeft');
    if(left.hasChildNodes()) {
      var remove = left.firstChild; 
      left.removeChild(remove);     
    }
    document.getElementById("chooseCharacter").classList.add('hidden');
    
    //disable chat
    var chatinput = document.getElementById("chatinput");
    chatinput.setAttribute('placeholder', 'Bitte einloggen, um zu chatten.');
    chatinput.disabled  =  true;

    //neutralize player info
    setPlayerInfo(null);
    setPlayerStatusInfo(null);

    //playernum and roomnum
    document.getElementById('playernumber').innerHTML = '';
    document.getElementById('room').innerHTML = '';

}





// under construction - removing all jQuery + make it smoth and nice :-)
jQuery(function($)
{
  var langfile = 0;
  $.getJSON("lang/ger.json", function(json)
  {
    langfile = json;
  });

  //the dice roll function should be evaluated on server...
  $('#dice1').toggleClass(getRollString(Math.floor((Math.random() * 6) + 1)));
  $('#dice2').toggleClass(getRollString(Math.floor((Math.random() * 6) + 1)));

  var socket = io.connect();

  $('#chatinput').keypress(function(e)
  {
    if(e.keyCode != 13) //wenn nicht Enter gedrückt wurde aus der funktion gehen
      return;

    var message = $('#chatinput').val();

    socket.emit('send message', message);
    $('#chatinput').val('');
  });


  //________________________________________________________________________________________________________
  //incoming 
  //clear Page on broken connection... or startup -------------------------------------
  socket.on('clear', function(){
    console.log("received clear event!");
    setPageToInitialState();
    //TODO: maybe tell user?
  });
  //Set back when we could not find a seat in a room -------------------------------------
  socket.on('requestedRoomfailed', function() {
    setPageToInitialState();
    //TODO: make better notice
    alert("room is already full!");
  });

  //give the player list of characters to choose -------------------------------------
  socket.on('provideChars', function(names)
  {
    //console.log(data);

    //get correct counters
    var num = 0;
    if(names) {
      num = names.length;
    } 
    var half = num/2;

    console.log("half is: " + half + " and num is " + num);
    
    // update left List
    var leftList = document.createElement('ul');
    leftList.classList.add("characterList");
    
    for(var i = 0; i < half; i++) {
      let h = i;
      var item = document.createElement('li');
      item.onclick = function(){selectCharacter(h);};
      item.innerHTML = names[i];
      leftList.appendChild(item);
    }

    document.getElementById('chooseCharacterLeft').appendChild(leftList);

    // update rigth List
    var rightList = document.createElement('ul');
    rightList.classList.add("characterList");
    
    for(var i = half; i < num; i++) {
      let h = i;
      var item = document.createElement('li');
      item.onclick = function(){selectCharacter(h);};
      item.innerHTML = names[i];
      rightList.appendChild(item);
    }

    document.getElementById('chooseCharacterRight').appendChild(rightList);
    document.getElementById("chooseCharacter").classList.remove('hidden');

  });
    
  //On every change of the gameState we receive here the update :-) -------------------------------------
  socket.on('provideGameState', function(gameState)
  { 
    //We are in game now so we may chat :)
    var chatinput = document.getElementById('chatinput');
    chatinput.setAttribute('placeholder', 'Tippen zum Chatten. Absenden mit Enter.');
    chatinput.disabled = false;


    //console.log(gameState);
    //TODO - update non playerSpecific stuff
    if(gameState.state === 'waiting') {
      //nothing to do here yet
    }
    if(gameState.state ==='waitingready?') {

    }


    var numPlayers = 0;
    //update all player
    for(var i = 0; i < 8; i++)
    {
      var pI = gameState.allPlayers[i];
      var nr = i+1;
      if(pI) {
        document.getElementById('charPic' + nr).src = 'graphics/characters/' + pI.charID + '.jpg';
        document.getElementById('playerListName' + nr).innerHTML = pI.name;
        document.getElementById('listedPlayer' + nr).style.display = 'block';
        numPlayers++;
      } else {
        document.getElementById('charPic' + nr).src = '';
        document.getElementById('playerListName' + nr).innerHTML = '';
        document.getElementById('listedPlayer' + nr).style.display = 'none';
      }
    }
    
    //update player number
    document.getElementById('playernumber').innerHTML = numPlayers;
    document.getElementById('room').innerHTML = gameState.roomNr;


  });

  //when game changed important player Info and or Status info we receive this Event
  socket.on('provideSpecificPlayerinfo', function(info)
  {
    console.log('on provideSpecificPlayerinfo...');
    //set player info
    var playerInfo = info['playerInfo'];
    
    playerInfo['alt'] = 'Portrait of Character ' + playerInfo['charName'] + ' played by ' 
                      + playerInfo['name'] + ' - player ' + playerInfo['pNr'];
    
    setPlayerInfo(playerInfo);

    //set player status info
    var statusInfoData = info['statusInfo'];

    var key;
    for (key in statusInfoData) {
      document.getElementById('statustab-' + key).innerHTML = statusInfoData[key];
    }

    //react on player state
    if(info['state'] == 'notReady') {
      var controlwrap = document.getElementById('controlwrap');
      var ready = document.getElementById('ready');
      var readyButton = document.getElementById('readyButton');
      if(controlwrap)
        controlwrap.style.display = 'block';
      else
        console.log('there is no #controlwrap element');

      if(ready)
        ready.style.display = 'block';
      else
        console.log('there is no #ready element');  

      if(readyButton)
        readyButton.focus();
      else
        console.log('there is no #readyButton element');    
  }

    tab(1);
  });

  //when clicking on player we receive here the player info -------------------------------------
  socket.on('providePlayerinfo', function(info)
  {
    console.log('on providePlayerinfo...');

    info['alt'] = 'Portrait of Character ' + info['charName'] + ' played by ' + info['name']
     + ' - player ' + info['pNr'];
    setPlayerInfo(info);
   
    tab(1);
  });

  //when clicking on field on board we receive here the field info
  socket.on('provideFieldinfo', function(info)
  {
    document.getElementById('fieldName').innerHTML = info['name'];
    document.getElementById('fieldViertel').innerHTML = info['ghetto'];
    document.getElementById('fieldRent').innerHTML = info['rent'];
    document.getElementById('field1House').innerHTML = info['house1'];
    document.getElementById('field2House').innerHTML = info['house2'];
    document.getElementById('field3House').innerHTML = info['house3'];
    document.getElementById('field4House').innerHTML = info['house4'];
    document.getElementById('fieldHotel').innerHTML = info['hotel'];
    document.getElementById('fieldPrice').innerHTML = info['price'];
    document.getElementById('fieldHousePrice').innerHTML = info['priceHouse'];
    document.getElementById('fieldHotelPrice').innerHTML = info['priceHotel'];
    document.getElementById('fieldOwner').innerHTML = info['owner'];

    document.getElementById('fieldNr').innerHTML = info['fieldNr'];
    
    //TODO: maybe hide loader screen 
    tab(2);

  });

    
//unrevisited Code----------------------------------------------------------------------------------------
  socket.on('receive riskcard', function(data)
  {
    riskPopup(langfile.actioncards[data].title + ': ' + langfile.actioncards[data].desc);
  });

  socket.on('receive jobcard', function(data)
  {
    jobPopup(langfile.jobcards[data].desc);
  });

  socket.on('dice results', function(dice1, dice2)
  { //TODO: completely rewrite
    $('#dice1').toggleClass(getRollString(dice1));
    $('#dice2').toggleClass(getRollString(dice2));
    //there is not update playerinfo anymore
    //socket.emit('update playerinfo', uniqueId, getRoomIndex());
  });

  socket.on('show figures', function(playerNr, currentField)
  {
    $("#figure-" + (playerNr + 1)).remove();
    $("#field" + currentField).append('<img id="figure-' + (playerNr + 1) + '" src="graphics/buttons/player' + (playerNr + 1) + '.svg" />');
  });

  socket.on('delete figure', function(fieldNr, playerNr)
  {
    $("#figure-" + (playerNr + 1)).remove();
  });

  socket.on('new chat message', function(data)
  {
    data = jQuery.parseJSON(data);
    $('#chattext').append('<small class="left">&nbsp;&nbsp;' + data.name + '(' + getHHMM() + ')</small> ' + data.msg + '<br/>');
    $('#chattext').scrollTop($('#chat')[0].scrollHeight); //chatfenster nach unten scrollen
  });

  socket.on('show dices', function()
  {
    $('#dices').show();
  });

  socket.on('start countdown', function()
  {
    $('#countdown').show();
  });

  socket.on('active player', function(playerNr, uid)
  {
    console.log('active player: ' + uid + ' [' + playerNr + ']');

    if(uniqueId == uid)
    {
      $('#button-dices').prop('disabled', false).focus();
      // TODO: your-turn-popup
      alert('Du bist dran!');
    }
    else
    {
      $('#button-dices').prop('disabled', true); //Disable
    }

    for(var i = 1; i <= 8; i++)
    {
      if(i == playerNr)
      {
        $('#charPic' + (i)).removeClass('playerlistPicGray');
      }
      else
      {
        $('#charPic' + (i)).addClass('playerlistPicGray');
      }
    }
  });

  socket.on('buy field?', function(currentField)
  {
    neutralDecisionPopup(currentField);
    //console.log('buy ' + currentField);
    //if(confirm('Feld kaufen? [' + currentField + ']'))
    //{
    //  console.log('Feld gekauft.');
    //  socket.emit('buy field!', uniqueId, getRoomIndex(), currentField);
    //}
    //else
    //  console.log('Kauf abgelehnt.');
  });

  socket.on('buy house?', function(currentField)
  {
    //if(confirm('Haus kaufen? [' + currentField + ']'))
    //{
    //  console.log('Haus gekauft.');
    //  socket.emit('buy house!', uniqueId, getRoomIndex(), currentField);
    //}
    //else
    //  console.log('Kauf abgelehnt.');
  });

  socket.on('pay rent!', function(data)
  {
    alert('Miete zahlen: ' + data);
  });

  socket.on('field owner', function(fieldNr, pNr)
  {
    //Fieldstatus als dritten Parameter hinzufügen, fehlt noch serverseitig
    if(fieldNr < 12)
    {
      cssclass = 'img-owner-top';
    }
    else if(fieldNr < 21)
    {
      cssclass = 'img-owner-right';
    }
    else if(fieldNr < 30)
    {
      cssclass = 'img-owner-right';
    }
    else
    {
      cssclass = 'img-owner-left';
    }

    $("#fieldowner" + (fieldNr)).append('<img id="owner-' + (fieldNr) + '" class="' + cssclass + '" src="graphics/fieldmarkers/player' + pNr + 'owns.svg" />');
  });

  socket.on('popup', function(text)
  {
    alert(text);
  });

  socket.on('private popup', function(uid, msg)
  {
    if(uniqueId != uid)
    {
      return;
    }
    alert(msg);
  });
});

var socket = io.connect();

// _______________________________________________________________________________________________________
// UI events to Server communication
function joinRoom(room)
{
  //TODO erase... Name must be known previously
  var name = '';
  while(name == '')
  {
    name = prompt("Wie heißt du?");
  }

  socket.emit('requestRoom', room, name);
  document.getElementById("chooseRoom").classList.add('hidden');
  
  //TODO: maybe show loading icon...
}

function selectCharacter(charID)
{ 
  socket.emit('assignCharacter', charID);
  
  document.getElementById('chooseCharacter').classList.add('hidden');

  //TODO: maybe show loading icon
}

function showPlayerInfo(pNr)
{ 
  console.log("emitting playerinfo request");
  socket.emit('requestPlayerinfo', pNr);
}

function getFieldInfo(fieldNr)
{ 
  socket.emit('requestFieldinfo', fieldNr); 
  //TODO: maybe show loading icon on tab 2
  //tab(2); 
}


//- - - - -- - - -  - - - - - -  - --  - -- -  -  - - - -------------------
function isReady()
{ //TODO: rewrite completely
  //socket.emit('is ready', getPlayerName(), getRoomIndex());
  socket.emit('is ready', uniqueId, getRoomIndex());
  $('#ready').hide();
  $('#dices').show();
}
function throwDices()
{ //TODO: rewrite completely
  //there is not update playerinfo anymore
  //socket.emit('update playerinfo', uniqueId, getRoomIndex());
  $('#dice1').attr('class', 'die');
  $('#dice2').attr('class', 'die');
  socket.emit('throw dices', uniqueId, getRoomIndex());
  $('#button-dices').prop('disabled', false);
}

function leaveGame()
{
  //TODO: review
  socket.emit('leave game', getPlayerName(), getRoomIndex());
  console.log('disconnect ' + getPlayerName() + ' from room ' + getRoomIndex());
  window.location.reload();
}

/*****************/
/*** COUNTDOWN ***/
/*****************/

var max_time = 20;
var cinterval;

function countdown_timer()
{
  // decrease timer
  max_time--;
  document.getElementById('countdown').innerHTML = max_time;
  if(max_time == 0)
  {
    clearInterval(cinterval);
  }
}
// 1,000 means 1 second.
cinterval = setInterval('countdown_timer()', 1250);