// Get the local player entity
const player = mp.players.local;

// Initialize variables for getting the zone, the street name & crossing road
let zone = undefined;
let getStreet = undefined;
let streetName = undefined;
let crossingRoad = undefined;

// Initialize variables for holding information about the location of shots fired
let pingMessage;
let policePingMessageVar;

// Initialize wait timer & timer logic variables
let waitTimer;
let minutes = 60000; // Milliseconds for timer // currently set to 1 minute for testing purposes
let timerBool = false;

// Initialize variable to log the last pinged location
let logLocation;

// This function is called when the timer ends & will clear the timer and reset the timer boolean value to false
function setTimerBool() {
    mp.gui.chat.push("The timer has ended"); // Testing notification to tell the player the timer has ended
    timerBool = false;
    clearTimeout(waitTimer);
}

// This will start the wait timer when called
function startTheTimer() {
    waitTimer = setTimeout(function() { setTimerBool(); }, minutes);
}

// This function logs the last location pinged from this player
function logLastLocation() {
    logLocation = pingMessage;
}

// Calls a function to send the zone information of the player to the server for further processing
let sendZoneToServer = () => {
    zone = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
    if (zone != null) {
        mp.events.callRemote("zoneFiredIn", (player, zone));
    } else {
        mp.gui.chat.push("Zone doesn't exist"); // If the zone doesn't exist where the player is a debug message will appear in the chat window
    }
};

// This function is called from the server and retrieves whether the location shots were fired in is a rich or a poor area
let returnStreetInfo = (richOrPoorStr) => {
    // Get street name and crossing road information
    getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
    streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
    crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad);
    // Get the message ready to ping PD
    pingMessage = (richOrPoorStr + streetName + ' - ' + crossingRoad);
    // If the timer has not yet started and the ping message isn't empty
    if (timerBool == false && pingMessage != null) {
        startTheTimer();
        sendMessageToServer();
        logLastLocation();
        timerBool = true;
        mp.gui.chat.push("Timer has activated"); // Testing notification to tell the player the timer has started
        // If the timer is running started and the player has moved location
    } else if (pingMessage != logLocation && timerBool == true) {
        logLastLocation();
        clearTimeout(waitTimer);
        startTheTimer();
        sendMessageToServer();
        timerBool = true;
        mp.gui.chat.push("Timer has reset"); // Testing notification to tell the player the timer has been reset
    }
};
// Name of event function to be called by server
mp.events.add('returnAreaZone', returnStreetInfo);

// Sends the ping message to PD
let sendMessageToServer = () => {
    policePingMessageVar = pingMessage;
    mp.events.callRemote("pdMessageGot", (player, policePingMessageVar));
};

// Check for the event of a shot fired by a player
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    // Sends this player's zone information to the server
    sendZoneToServer();
});