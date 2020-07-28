// CEF browser.
let menu;
// Configs.
let vehicles     = JSON.parse(require('./freeroam/configs/vehicles.js'));
let skins        = JSON.parse(require('./freeroam/configs/skins.js')).Skins;
let weapon       = JSON.parse(require('./freeroam/configs/weapon.js'));
// Initialization functions.
let vehiclesInit = require('./freeroam/menu_initialization/vehicles.js');
let skinsinit    = require('./freeroam/menu_initialization/skins.js');
let weaponInit   = require('./freeroam/menu_initialization/weapon.js');
let playersInit  = require('./freeroam/menu_initialization/players.js');

// Get the local player object
const player = mp.players.local;
// Initialize variables to pull the city zone, street name and crossing road
let zone = undefined;
let getStreet = undefined;
let streetName = undefined;
let crossingRoad = undefined;
// Initialize shot counter
let shotCounter = 0;
// Create arrays of zone names
let richAreas = ['Vinewood Hills'];
let poorAreas = ['Sandy Shores'];
// Get the length of these arrays
let richArrayLength = richAreas.length;
let poorArrayLength = poorAreas.length;
let notificationObj = null;
let functionCounter = 0;

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

function sendNotification(){
	mp.gui.chat.push(notificationObj);
}

// Checks for the event of shots fired
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
	shotCounter +=1;
	// If shots are fired get the zone name
	zone = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
	for(var i = 0; i < richArrayLength; i++){
		for(var j = 0; j < poorArrayLength; j++){
			if (zone == richAreas[i] && shotCounter >= 2){
				getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
				streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
				crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
				notificationObj = ('Rich Area' + shotCounter + 'shots fired at: ' + streetName + ' / ' + crossingRoad);
			} else if (zone == poorAreas[j] && shotCounter >= 4){
				getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
				streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
				crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
				notificationObj = ('Poor Area' + shotCounter + 'shots fired at: ' + streetName + ' / ' + crossingRoad);
			}
		}
	}
	if(notificationObj != null && functionCounter != 1){
		sendNotification();
		functionCounter = 1;
		shotCounter = 0;
	} else {
		
	}
});
