// CEF browser.
let menu;
// Configs.
let vehicles = JSON.parse(require('./freeroam/configs/vehicles.js'));
let skins = JSON.parse(require('./freeroam/configs/skins.js')).Skins;
let weapon = JSON.parse(require('./freeroam/configs/weapon.js'));
// Initialization functions.
let vehiclesInit = require('./freeroam/menu_initialization/vehicles.js');
let skinsinit = require('./freeroam/menu_initialization/skins.js');
let weaponInit = require('./freeroam/menu_initialization/weapon.js');
let playersInit = require('./freeroam/menu_initialization/players.js');

// Get the local player entity
const player = mp.players.local;

// Initialize variable for zone
let zone = undefined;

// Initialize variables for getting the location information, storing the street name & crossing road
let getStreet = undefined;
let streetName = undefined;
let crossingRoad = undefined;

// Initialize ping message variables
let pingMessage;
let policePingMessageVar;

// Initialize wait timer variables
let waitTimer;
let minutes = 60000; // milliseconds for the timer
let timerBool = false;
let logLocation;

// Creating browser.
mp.events.add('guiReady', () => {
    if (!menu) {
        // Creating CEF browser.
        menu = mp.browsers.new('package://freeroam/browser/index.html');
        // Init menus and events, when browser ready.
        mp.events.add('browserDomReady', (browser) => {
            if (browser == menu) {
                // Init events.
                require('freeroam/events.js')(menu);
                // Init menus.
                vehiclesInit(menu, vehicles);
                skinsinit(menu, skins);
                weaponInit(menu, weapon);
                playersInit(menu);

                mp.gui.execute(`insertMessageToChat('<div style="background-color: rgba(0, 0, 0, 0.75); font-size: 1.0vw; padding: 6px; color: #ff0000; font-weight: 600;">Press F2 for open freeroam menu.</div>', 'true');`);
            }
        });
    }
});

// Function called when timer ends
function setTimerBool() {
    mp.gui.chat.push("The timer has ended");
    timerBool = false;
    clearTimeout(waitTimer);
}

// Function to start the timer
function startTheTimer() {
	waitTimer = setTimeout(function(){setTimerBool();}, minutes);
}

// Log the last location function
function logLastLocation(){
	logLocation = pingMessage;
}

// Call function for sending the location and status of area of shots fired
let sendZoneToServer = () => {
    // Pull the zone information for the player
    zone = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
    if (zone != null) {
        mp.events.callRemote("zoneFiredIn", (player, zone));
    } else {
        mp.gui.chat.push("Zone doesn't exist.");
    }
};

let returnStreetInfo = (richOrPoorStr) => {
    getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
    streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
    crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad);
    pingMessage = (richOrPoorStr + streetName + ' - ' + crossingRoad);
	if (timerBool == false && pingMessage != null){
		startTheTimer();
		sendMessageToServer();
		logLastLocation();
		timerBool = true;
		mp.gui.chat.push("Timer has activated");
	} else if (pingMessage != logLocation && timerBool == true){
		logLastLocation();
		clearTimeout(waitTimer);
		startTheTimer();
		sendMessageToServer();
		timerBool = true;
		mp.gui.chat.push("Timer has reset");
	} else if (pingMessage != logLastLocation && timerBool == false){
		startTheTimer();
		sendMessageToServer();
		logLastLocation();
		timerBool = true;
		mp.gui.chat.push("Time has started");
	}
};
mp.events.add('returnAreaZone', returnStreetInfo);

// Call function for sending the location and status of area of shots fired
let sendMessageToServer = () => {
	policePingMessageVar = pingMessage;
    mp.events.callRemote("pdMessageGot", (player, policePingMessageVar));
};

// Check for the event of a shot fired by a player
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    sendZoneToServer();
});