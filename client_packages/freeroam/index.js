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
let pingMessage;
// Initialize wait timer
let waitTimer;
let minutes;
let timerBool = false;
let timeVar;

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
function setTimerBool(){
	timerBool = false;
	mp.events.callRemote("clearPingSent", (player));
}
function startTheTimer(){
	timeVar = minutes;
	if (timerBool == false){
		waitTimer = setTimeout(setTimerBool(), timeVar);
		timerBool = true;
	} else if (timerBool == true){
		clearTimeout(waitTimer);
		waitTimer = setTimeout(setTimerBool(), timeVar);
		timerBool = true;
	}
}

// Call function for sending the location and status of area of shots fired
let sendZoneToServer = () => {
    // Pull the zone information for the player
    zone = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
    if (zone != null) {
        mp.events.callRemote("zoneFiredIn", (player, zone));
    } else {
        mp.gui.chat.push("Zone doesn't exist");
    }
};

let sendPingMessage = () => {
    if (pingMessage != null) {
        mp.events.callRemote("pingMessageReceived", (player, pingMessage));
    }
};

// Check for the event of a shot fired by a player
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    sendZoneToServer();
});

let returnStreetInfo = (richOrPoorStr) => {
    getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
    streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName);
    crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad);
    pingMessage = (richOrPoorStr + streetName + ' - ' + crossingRoad);
    sendPingMessage();
};
mp.events.add('returnAreaZone', returnStreetInfo);

let startTimerFunc = (minutesForTheTimer) => {
	if (waitTimer == null && timerBool == false){
		minutes = minutesForTheTimer;
		mp.gui.chat.push("Timer is activated.");
		startTheTimer();
	}
};
mp.events.add('startTimer', startTimerFunc);

let startTimerFuncTwo = (minutesForTheTimerTwo) => {
	if (waitTimer != null && timerBool == true){
		minutes = minutesForTheTimerTwo;
		mp.gui.chat.push("Timer is reset.");
		startTheTimer();
	}
};
mp.events.add('startTimerTwo', startTimerFuncTwo);