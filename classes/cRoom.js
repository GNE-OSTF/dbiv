//*****************************************************************************
//********************************* R O O M ***********************************
//*****************************************************************************

function Room(id)
{
  var id_ = id;
  // 8 colors and 8 players - filled with nulls
  var playing_ = [null, null, null, null, null, null, null, null];
  var riskCards_ = null;
  var jobCards_ = null;
  var nrPlayers_ = 0;
  var closed_ = false;
  var currentPlayerNr_ = 1;
  var board_ = null;
  var activePlayer_ = [];
  var currentState_ = "waiting";

  this.addPlayer = function(player)
  {
    var index = player.getPlayerNr() - 1;
    playing_[index] = player;
    nrPlayers_ = nrPlayers_ + 1;
  }

  this.removePlayer = function(player)
  {
    nrPlayers_ = nrPlayers_ - 1;
    console.log("after removal : " + nrPlayers_ + ' players');
    playing_[player.getPlayerNr() - 1] = null;
    //check if player is current player and act accordingly
  }

  this.generatePlayerNr = function(name)
  {
    for(var i = 0; i < playing_.length; i++)
    {
      if(playing_[i] === null)
      {
        playing_[i] = name;
        return i + 1;
      }
    }
    return null;
  }

  this.isReady = function()
  {
    if(nrPlayers_ > 1)
      return true;
    else
      return false;
  }

  this.findPlayerByPlayerNr = function(pNr)
  {
    var index = pNr - 1;
    
    if(index < 0 || index > 7) {
      console.log("hey! what the fuck!?!? requesting player Nr: " + pNr + "!!!!");
      return null;
    }

    var result = playing_[index];
    
    if(typeof result === 'string')
      return null;

    return result;
  }

  this.nextPlayer = function()
  {
    //TODO: adjust to correct behaviour
    currentPlayerNr_ = currentPlayerNr_ + 1;
    if(currentPlayerNr_ > playing_.length)
      currentPlayerNr_ = 1;
  }

  this.setRiskCards = function(cards)
  {
    riskCards_ = cards;
  }

  this.setJobCards = function(cards)
  {
    jobCards_ = cards;
  }

  this.setNrPlayers = function(nr)
  {
    nrPlayers_ = nr;
  }

  this.setClosed = function(bool)
  {
    closed_ = bool;
  }

  this.setBoard = function(board)
  {
    board_ = board;
  }

  this.setCurrentPlayerNr = function(nr)
  {
    currentPlayerNr_ = nr;
  }

  this.getID = function()
  {
    return id_;
  }

  this.getPlayers = function()
  {
    return playing_;
  }

  this.getRiskCards = function()
  {
    return riskCards_;
  }

  this.getJobCards = function()
  {
    return jobCards_;
  }

  this.getNrPlayers = function()
  {
    return playing_.length;
  }

  this.getBoard = function()
  {
    return board_;
  }

  this.isClosed = function()
  {
    return closed_;
  }

  this.getCurrentPlayerNr = function()
  {
    return currentPlayerNr_;
  }

  this.getCurrentPlayer = function()
  {
    return playing_[currentPlayerNr_ - 1];
  }

  this.getGameState = function() {
    var gameState = {};

    gameState.state = currentState_;
    gameState.roomNr = id_ + 1;
    gameState.currentPlayerNr = currentPlayerNr_;
    gameState.allPlayers = [];
    
    for(var i = 0; i < playing_.length; i++) {
      
      gameState.allPlayers[i] = null;
      
      if(playing_[i] !== null) {
        var pName = "";
        var pNr = i + 1;
        var pField = 0;
        var pCharID = 0;
        var pOwns = 0;

        if(typeof playing_[i] === 'string' ) {
          pName = playing_[i];
        } else {
          pName = playing_[i].getName();   
          
          if(playing_[i].getCharID() !== '') {
            pField = playing_[i].getField();
            pCharID = playing_[i].getCharID() + 1;
            pOwns = playing_[i].getOwnedFields();  
          } 
        }

        gameState.allPlayers[i] = {
            name: pName,
            nr: pNr, 
            field: pField,
            charID: pCharID,
            owns: pOwns
        };

      }

    }

    return gameState;
  }

}

module.exports = Room;