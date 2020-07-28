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
// Initialize variables to pull street name and crossing road
let getStreet = undefined;
let streetName = undefined;
let crossingRoad = undefined;
// Initialize shot counter
let shotCounter = 0;
let richBool = false;
let poorBool = false;
let notKnownBool = false;

let richStreets = ['Abe Milton Parkway', 'Boulevard Del Perro', 'Carcer Way', 
                   'Caesar Place', 'Dorset Drive', 'Dorset Place', 
				   'Dunstable Drive', 'Dunstable Lane', 'Eastbourne Way',
				   'Edwood Way', 'Greenwich Way', 'Heritage Way',
				   'Mad Wayne Thunder Drive', 'Marathon Avenue', 'Movie Star Way',
				   'Portola Drive', 'Rockford Drive', 'San Vitus Boulevard',
				   'South Boulevard Del Perro', 'South Mo Milton Drive', 'South Rockford Drive',
				   'Spanish Avenue', 'West Eclipse Boulevard'];
				   
let poorStreets = ['Adam\'s Apple Boulevard', 'Alta Street', 'Capital Boulevard',
                    'Carson Avenue', 'Crusade Road', 'Forum Drive', 'Innocence Boulevard',
					'Little Bighorn Avenue', 'Power Street', 'Strawberry Avenue'];

let richArrayLength = richStreets.length;
let poorArrayLength = poorStreets.length;
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

// Checks for the event of shots fired
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
	shotCounter +=1;
	for(var i = 0; i < richArrayLength; i++){
		for(var j = 0; j < poorArrayLength; j++){
			if (streetName == richStreets[i]){
				richBool = true;
			} else if (streetName == poorStreets[j]){
				poorBool = true;
			} else {
				notKnownBool = true;
			}
		}
	}
	if (richBool == true){
		getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
		streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
		crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
		mp.gui.chat.push('(Rich Area)' + shotCounter + 'shots fired at: ' + streetName + ' - ' + crossingRoad);
	} else if (poorBool == true){
		getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
		streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
		crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
		mp.gui.chat.push('(Poor Area)' + shotCounter + 'shots fired at: ' + streetName + ' - ' + crossingRoad);
	} else {
		getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
		streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
		crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
		mp.gui.chat.push('(Unknown Area)' + shotCounter + 'shots fired at: ' + streetName + ' - ' + crossingRoad);
	}
});
