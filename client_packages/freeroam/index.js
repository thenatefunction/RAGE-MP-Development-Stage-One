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

// Initialize variables for getting / holding the zone, street name & crossing road
let zone = undefined;
let getStreet = undefined;
let streetName = undefined;
let crossingRoad = undefined;

// Create / populate arrays for the rich and poor areas
let richAreas = ['Richman', 'GWC and Golfing Society', 'Rockford Hills', 'Morningwood', 'Richards Majestic', 'Del Perro', 'Pacific Bluffs', 'Los Santos International Airport', 'Vinewood', 'Downtown', 'Chumash', 'Tongva Hills', 'Pillbox Hill', 'Vespucci Beach', 'Vinewood Hills', 'Maze Bank Arena', 'Downtown Vinewood', 'West Vinewood', 'Burton', 'Richman Glen', 'Galileo Observatory', 'Galileo Park', 'Baytree Canyon', 'Puerto Del Sol', 'Alta', 'Fort Zancudo', 'Port of South Los Santos', 'Del Perro Beach', 'Vinewood Racetrack', 'Humane Labs and Research', 'N.O.O.S.E', 'Legion Square'];
let poorAreas = ['Little Seoul', 'La Puerta', 'Mirror Park', 'East Vinewood', 'Tataviam Mountains', 'Murrieta Heights', 'La Mesa', 'Strawberry', 'Rancho', 'Chamberlain Hills', 'Davis', 'Lago Zancudo', 'Banham Canyon', 'North Chumash', 'Raton Canyon', 'Chiliad Mountain State Wilderness', 'Paleto Forest', 'Paleto Bay', 'Mount Chiliad', 'Mount Gordo', 'Braddock Pass', 'San Chianski Mountain Range', 'Grand Senora Desert', 'Ron Alternates Wind Farm', 'Palomino Highlands', 'Textile City', 'Mission Row', 'Bolingbroke Penitentiary', 'Terminal', 'Banning', 'Elysian Island', 'Vespucci Canals', 'Braddock Tunnel', 'Grapeseed', 'Sandy Shores', 'Alamo Sea', 'Stab City', 'El Burro Heights', 'Cypress Flats', 'Harmony', 'Great Chaparral', 'Vespucci', 'Hawick', 'Zancudo River', 'Mount Josiah', 'Davis Quartz', 'Pacific Ocean', 'Procopio Beach', 'El Gordo Lighthouse', 'Palmer-Taylor Power Station', 'Calafia Bridge', 'Galilee', 'Cassidy Creek', 'Lago Zancudo', 'Banham Canyon', 'Tongva Valley', 'Land Act Reservoir', 'Land Act Dam', 'Paleto Cove', 'Redwood Lights Track'];
// Get the length of these arrays
let richArrayLength = richAreas.length;
let poorArrayLength = poorAreas.length;

// Create variables for holding location / string information
let locationObj;
let locationStringObj = null;

// Get a random number variable for working out chance of PD being alerted
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
            // If the area is a rich zone then the chance of PD being pinged is 60%
            if (zone == richAreas[i] && chanceOfPD < 0.60) {
                // If so retrieve the street name / crossing road information
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                // Store the location information in a variable
                locationObj = ('Shots fired in a rich area at: ' + streetName + ' - ' + crossingRoad);
                // Convert the location variable to a string variable
                locationStringObj = JSON.stringify(locationObj);
                // If the area is a poor zone then the chance of PD being pinged is 15%
            } else if (zone == poorAreas[j] && chanceOfPD < 0.15) {
                // If so retrieve the street name / crossing road information
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                // Store the location information in a variable
                locationObj = ('Shots fired in a poor area at: ' + streetName + ' - ' + crossingRoad);
                // Convert the location variable to a string variable
                locationStringObj = JSON.stringify(locationObj);
            }
        }
    }
    // If there is a location call the remote function "shotsFired" and pass in current player data and the location string variable
    if (locationStringObj != null) {
		mp.events.callRemote("shotsFired", (player, locationStringObj));
    }
});