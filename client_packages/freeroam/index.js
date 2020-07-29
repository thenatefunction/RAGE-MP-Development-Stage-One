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
let poorAreas = ['Alamo Sea', 'Braddock Pass', 'Braddock Tunnel',  'Calafia Bridge', 'Raton Canyon', 'Cassidy Creek', 'Chiliad Mountain State Wilderness', 'Cypress Flats', 'Grand Senora Desert', 'El Burro Heights', 'El Gordo Lighthouse', 'Elysian Island', 'Galilee', 'Grapeseed', 'Great Chaparral', ' Harmony', 'Land Act Reservoir', 'Lago Zancudo', 'Land Act Dam', 'Morningwood', 'Mount Chiliad', 'Mount Gordo', 'Mount Josiah', 'Pacific Ocean', 'Paleto Cove', 'Paleto Bay', 'Paleto Forest', 'Palomino Highlands', 'Palmer-Taylor Power Station', 'Procopio Beach', 'Redwood Lights Track', 'San Andreas', 'San Chianski Mountain Range', 'Sandy Shores', 'Stab City', 'Strawberry', 'Tataviam Mountains', 'Terminal', 'Textile City', 'Tongva Hills', 'Tongva Valley', 'Vespucci Canals', 'Ron Alternates Wind Farm', 'Zancudo River', 'Port of South Los Santos', 'Davis Quartz'];
// Get the length of these arrays
let richArrayLength = richAreas.length;
let poorArrayLength = poorAreas.length;
// Create variables for PD alerts, a counter, a timer & a random number variable
let notificationObj;
let functionCounter = 0;
let logNotification;
let timeBool = false;
let startTime = 0;
let timerVar;
let timerActive = 0;
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

// 10 minutes cooldown timer
function waitTimer() {
    startTime = startTime + 1;
    timeVar = setTimeout(waitTimer, 1000);
	// 600 seconds i.e. 10 minutes
    if (startTime == 600) {
		// Stop and reset the timer when 10 minutes is reached
        stopTimer();
        resetTimer();
        timeBool = false;
        functionCounter = 0;
    }
}

// Start the cooldown timer
function startTimer() {
    if (!timerActive) {
        timerActive = 1;
        waitTimer();
    }
}

// Stop the cooldown timer
function stopTimer() {
    clearTimeout(timeVar);
    timerActive = 0;
}

// Reset the cooldown timer
function resetTimer() {
    startTime = 0;
}

// A function which pulls information about the zone, streetname & crossing road
// Assign this information to a variable based on whether the area is poor or rich
function checkAreaStatus() {
    zone = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
    for (var i = 0; i < richArrayLength; i++) {
        for (var j = 0; j < poorArrayLength; j++) {
			// If the area is a rich zone then chance of PD being pinged is 60%
            if (zone == richAreas[i] && chanceOfPD < 0.60) {
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                notificationObj = ('Shots fired in a rich area at: ' + streetName + ' - ' + crossingRoad);
			// If the area is a rich zone then chance of PD being pinged is 15%
            } else if (zone == poorAreas[j] && chanceOfPD < 0.15) {
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                notificationObj = ('Shots fired in a poor area at: ' + streetName + ' - ' + crossingRoad);
            }
        }
    }
}

// A function to send a ping to PD
function sendNotification() {
	// First variable logs the last ping sent
    logNotification = notificationObj;
    mp.gui.chat.push(notificationObj);
}

// Checks for the event of a shot fired
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    checkAreaStatus();
	// If there has been no ping and no timer is currently running
    if (notificationObj != null && functionCounter != 1 && timeBool == false) {
		// Send a ping & start the timer
        sendNotification();
        timeBool = true;
        startTimer();
        functionCounter = 1;
	// If there is a timer running and the logged ping is the same as the ping sent
    } else if (timeBool == true && functionCounter == 1 && logNotification == notificationObj) {
		// Do nothing
	// If the ping sent is not the same as the logged ping
    } else if (notificationObj != logNotification) {
		// Reset the timer & send a ping
        stopTimer();
        resetTimer();
        startTimer();
        sendNotification();
    }
});