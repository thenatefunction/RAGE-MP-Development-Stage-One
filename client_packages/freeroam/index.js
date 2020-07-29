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
// Initialize variables to pull the city zone, street name and crossing road
let zone = undefined;
let getStreet = undefined;
let streetName = undefined;
let crossingRoad = undefined;
// Create arrays of zone names
let richAreas = ['Vinewood Hills', 'Galileo Observatory'];
let poorAreas = ['Sandy Shores'];
// Get the length of these arrays
let richArrayLength = richAreas.length;
let poorArrayLength = poorAreas.length;
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

function waitTimer() {
    startTime = startTime + 1;
    timeVar = setTimeout(waitTimer, 1000);
    mp.gui.chat.push(startTime.toString());
    if (startTime == 600) {
        stopTimer();
        resetTimer();
        timeBool = false;
        functionCounter = 0;
    }
}

function startTimer() {
    if (!timerActive) {
        timerActive = 1;
        waitTimer();
    }
}

function stopTimer() {
    clearTimeout(timeVar);
    timerActive = 0;
}

function resetTimer() {
    startTime = 0;
}

function checkAreaStatus() {
    zone = mp.game.gxt.get(mp.game.zone.getNameOfZone(player.position.x, player.position.y, player.position.z));
    for (var i = 0; i < richArrayLength; i++) {
        for (var j = 0; j < poorArrayLength; j++) {
            if (zone == richAreas[i] && chanceOfPD < 0.60) {
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                notificationObj = ('Rich Area' + 'shots fired at: ' + streetName + ' / ' + crossingRoad);
            } else if (zone == poorAreas[j] && chanceOfPD < 0.15) {
                getStreet = mp.game.pathfind.getStreetNameAtCoord(player.position.x, player.position.y, player.position.z, 0, 0);
                streetName = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName); // Return string, if exist
                crossingRoad = mp.game.ui.getStreetNameFromHashKey(getStreet.crossingRoad); // Return string, if exist
                notificationObj = ('Poor Area' + 'shots fired at: ' + streetName + ' / ' + crossingRoad);
            }
        }
    }
}

function sendNotification() {
    logNotification = notificationObj;
    mp.gui.chat.push(notificationObj);
}

// Checks for the event of shots fired
mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    checkAreaStatus();
    if (notificationObj != null && functionCounter != 1 && timeBool == false) {
        sendNotification();
        timeBool = true;
        startTimer();
        functionCounter = 1;
    } else if (timeBool == true && functionCounter == 1 && logNotification == notificationObj) {

    } else if (notificationObj != logNotification) {
        stopTimer();
        resetTimer();
        startTimer();
        sendNotification();
    }
});
