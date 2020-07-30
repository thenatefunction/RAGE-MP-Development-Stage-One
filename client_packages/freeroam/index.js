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

// Get the local player object
const player = mp.players.local;
// Initialize variables for holding the zone, street name & crossing road
let zone = undefined;
let getStreet = undefined;
let streetName = undefined;
let crossingRoad = undefined;
// Create arrays of zone names
let richAreas = ['Los Santos International Airport', 'Alamo Sea', 'Fort Zancudo', 'Banham Canyon Drive', 'Banning', 'Vespucci Beach', 'Banham Canyon', 'Burton', 'Chamberlain Hills', 'Davis', 'Vinewood Hills', 'Chumash', 'Del Perro Beach', 'Del Perro', 'La Puerta', 'Downtown', 'Downtown Vinewood', 'East Vinewood', 'GWC and Golfing Society', 'Hawick', 'Vinewood Racetrack', 'Humane Labs and Research', 'Bolingbroke Penitentiary', 'Little Seoul', 'Legion Square', 'La Mesa', 'La Puerta', 'Mirror Park', ' Richards Majestic', 'Murrieta Heights', 'North Chumash', 'N.O.O.S.E', 'Pacific Bluffs', 'Pillbox Hill', 'Rancho', 'Richman Glen', 'Richman', 'Rockford Hills', 'Mission Row', 'Maze Bank Arena', 'Vespucci', 'Vinewood', 'West Vinewood'];
let poorAreas = ['Alamo Sea', 'Braddock Pass', 'Braddock Tunnel', 'Calafia Bridge', 'Raton Canyon', 'Cassidy Creek', 'Chiliad Mountain State Wilderness', 'Cypress Flats', 'Grand Senora Desert', 'El Burro Heights', 'El Gordo Lighthouse', 'Elysian Island', 'Galilee', 'Grapeseed', 'Great Chaparral', ' Harmony', 'Land Act Reservoir', 'Lago Zancudo', 'Land Act Dam', 'Morningwood', 'Mount Chiliad', 'Mount Gordo', 'Mount Josiah', 'Pacific Ocean', 'Paleto Cove', 'Paleto Bay', 'Paleto Forest', 'Palomino Highlands', 'Palmer-Taylor Power Station', 'Procopio Beach', 'Redwood Lights Track', 'San Andreas', 'San Chianski Mountain Range', 'Sandy Shores', 'Stab City', 'Strawberry', 'Tataviam Mountains', 'Terminal', 'Textile City', 'Tongva Hills', 'Tongva Valley', 'Vespucci Canals', 'Ron Alternates Wind Farm', 'Zancudo River', 'Port of South Los Santos', 'Davis Quartz'];
// Get the length of these arrays
let richArrayLength = richAreas.length;
let poorArrayLength = poorAreas.length;
// Create variables for PD alerts, a counter, a timer & a random number variable
let notificationObj = null;
let notifObj;
let chanceOfPD = Math.random();

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

// Checks for the event of a shot fired
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    zone = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
    for (var i = 0; i < richArrayLength; i++) {
        for (var j = 0; j < poorArrayLength; j++) {
            // If the area is a rich zone then chance of PD being pinged is 60%
            if (zone == richAreas[i] && chanceOfPD < 0.60) {
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                notifObj = ('Shots fired in a rich area at: ' + streetName + ' - ' + crossingRoad);
				notificationObj = JSON.stringify(notifObj);
                // If the area is a rich zone then chance of PD being pinged is 15%
            } else if (zone == poorAreas[j] && chanceOfPD < 0.15) {
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                notifObj = ('Shots fired in a poor area at: ' + streetName + ' - ' + crossingRoad);
				notificationObj = JSON.stringify(notifObj);
            }
        }
    }
	if(notificationObj != null){
	mp.events.callRemote("shotsFired", (player, notificationObj));
	}
});