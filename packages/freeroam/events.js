let skins = require('./configs/skins.json').Skins;
let spawnPoints = require('./configs/spawn_points.json').SpawnPoints;

// Create & populate rich and poor area arrays
let richAreas = ['Richman', 'GWC and Golfing Society', 'Rockford Hills', 'Morningwood', 'Richards Majestic', 'Del Perro', 'Pacific Bluffs', 'Los Santos International Airport', 'Vinewood', 'Downtown', 'Chumash', 'Tongva Hills', 'Pillbox Hill', 'Vespucci Beach', 'Vinewood Hills', 'Maze Bank Arena', 'Downtown Vinewood', 'West Vinewood', 'Burton', 'Richman Glen', 'Galileo Observatory', 'Galileo Park', 'Baytree Canyon', 'Puerto Del Sol', 'Alta', 'Fort Zancudo', 'Port of South Los Santos', 'Del Perro Beach', 'Vinewood Racetrack', 'Humane Labs and Research', 'N.O.O.S.E', 'Legion Square'];
let poorAreas = ['Little Seoul', 'La Puerta', 'Mirror Park', 'East Vinewood', 'Tataviam Mountains', 'Murrieta Heights', 'La Mesa', 'Strawberry', 'Rancho', 'Chamberlain Hills', 'Davis', 'Lago Zancudo', 'Banham Canyon', 'North Chumash', 'Raton Canyon', 'Chiliad Mountain State Wilderness', 'Paleto Forest', 'Paleto Bay', 'Mount Chiliad', 'Mount Gordo', 'Braddock Pass', 'San Chianski Mountain Range', 'Grand Senora Desert', 'Ron Alternates Wind Farm', 'Palomino Highlands', 'Textile City', 'Mission Row', 'Bolingbroke Penitentiary', 'Terminal', 'Banning', 'Elysian Island', 'Vespucci Canals', 'Braddock Tunnel', 'Grapeseed', 'Sandy Shores', 'Alamo Sea', 'Stab City', 'El Burro Heights', 'Cypress Flats', 'Harmony', 'Great Chaparral', 'Vespucci', 'Hawick', 'Zancudo River', 'Mount Josiah', 'Davis Quartz', 'Pacific Ocean', 'Procopio Beach', 'El Gordo Lighthouse', 'Palmer-Taylor Power Station', 'Calafia Bridge', 'Galilee', 'Cassidy Creek', 'Lago Zancudo', 'Banham Canyon', 'Tongva Valley', 'Land Act Reservoir', 'Land Act Dam', 'Paleto Cove', 'Redwood Lights Track'];

// Get the lengths of these areas and store them in variables
let richArrayLength = richAreas.length;
let poorArrayLength = poorAreas.length;

// Get a random number variable for working out chance of PD being alerted
let chanceOfPD = Math.random();

// Initialize variable to hold online players
let currentOnlinePlayers;

// Variable to hold the length of current online players array for iterating
let onlinePlayersLength;

// Initialize ping message variable
let pingMessageVar;

// Initialize rich or poor area string variable
let richOrPoorStr;

/* !!! REMOVE AFTER FIX (TRIGGERED FROM SERVER) !!! */
mp.events.add('playerEnteredVehicle', (player) => {
    if (player.vehicle && player.seat === 0 || player.seat === 255)
        player.call('playerEnteredVehicle');
});
/* */

mp.events.add('playerExitVehicle', (player) => {
    player.call('playerExitVehicle');
});

mp.events.add('playerJoin', (player) => {
    player.customData = {};

    mp.players.forEach(_player => {
        if (_player != player)
            _player.call('playerJoinedServer', [player.id, player.name]);
    });

    player.spawn(spawnPoints[Math.floor(Math.random() * spawnPoints.length)]);

    player.model = skins[Math.floor(Math.random() * skins.length)];
    player.health = 100;
    player.armour = 100;
});

mp.events.add('playerQuit', (player) => {
    if (player.customData.vehicle)
        player.customData.vehicle.destroy();

    mp.players.forEach(_player => {
        if (_player != player)
            _player.call('playerLeavedServer', [player.id, player.name]);
    });
});

mp.events.add('playerDeath', (player) => {
    player.spawn(spawnPoints[Math.floor(Math.random() * spawnPoints.length)]);

    // player.model = skins[Math.floor(Math.random() * skins.length)];
    player.health = 100;
    player.armour = 100;
});

mp.events.add('playerChat', (player, message) => {
    mp.players.broadcast(`<b>${player.name}[${player.id}]:</b> ${message}`);
});

// Getting data from client.
mp.events.add('clientData', function() {
    let player = arguments[0];
    /*
        @@ args[0] - data name.
        @@ args[n] - data value (if it is needed).
    */
    let args = JSON.parse(arguments[1]);

    switch (args[0]) {
        // Suicide.
        case 'kill':
            player.health = 0;

            break;
            // Change skin.
        case 'skin':
            player.model = args[1];

            break;
            // Creating new vehicle for player.
        case 'vehicle':
            // If player has vehicle - change model.
            if (player.customData.vehicle) {
                let pos = player.position;
                pos.x += 2;
                player.customData.vehicle.position = pos;
                player.customData.vehicle.model = mp.joaat(args[1]);
                // Else - create new vehicle.
            } else {
                let pos = player.position;
                pos.x += 2;
                player.customData.vehicle = mp.vehicles.new(mp.joaat(args[1]), pos);
            }
            // Hide vehicle buttons (bugfix).
            player.call('hideVehicleButtons');

            break;
            // Weapon.
        case 'weapon':
            player.giveWeapon(mp.joaat(args[1]), 1000);

            break;
            // Repair the vehicle.
        case 'fix':
            if (player.vehicle)
                player.vehicle.repair();

            break;
            // Flip the vehicle.
        case 'flip':
            if (player.vehicle) {
                let rotation = player.vehicle.rotation;
                rotation.y = 0;
                player.vehicle.rotation = rotation;
            }

            break;
            // Vehicle color or neon.
        case 'server_color':
            if (player.vehicle) {
                if (args[1] == 'color') {
                    let colorPrimary = JSON.parse(args[2]);
                    let colorSecondary = JSON.parse(args[3]);
                    player.vehicle.setColourRGB(colorPrimary.r, colorPrimary.g, colorPrimary.b, colorSecondary.r, colorSecondary.g, colorSecondary.b);
                }

                if (args[1] == 'neon') {
                    let color = JSON.parse(args[2]);
                    player.vehicle.setNeonColour(color.r, color.g, color.b);
                }
            }

            break;
    }
});

// Send the final ping to PD (to console for now)
function pingPD() {
    console.log(pingMessageVar);
}

// Get all current online players and push them all to an array
let getCurrentOnlinePlayers = () => {
    currentOnlinePlayers = [];
    mp.players.forEach((player) => {
        currentOnlinePlayers.push(player.id);
    });
    onlinePlayersLength = currentOnlinePlayers.length;
};

// Function that activates when shots are fired
let eventOfGunFired = (player, zone) => {
    // Get all the current online players
    getCurrentOnlinePlayers();
    // Iterate through the online players array
    for (i = 0; i < onlinePlayersLength; i++) {
        // Check to see if the current player is online
        if ([player.id] == currentOnlinePlayers[i] && zone != null) {
            // Iterate through the rich and poor areas
            for (var i = 0; i < richArrayLength; i++) {
                for (var j = 0; j < poorArrayLength; j++) {
                    // If the area is a rich zone then the chance of PD being pinged is 60%
                    if (zone == richAreas[i] && chanceOfPD < 0.60) {
                        richOrPoorStr = "Shots fired in a rich area: ";
                        player.call(`returnAreaZone`, [richOrPoorStr]);
                    } else {
						
					}
                    // If the area is a poor zone then the chance of PD being pinged is 15%
                    if (zone == poorAreas[j] && chanceOfPD < 0.15) {
                        richOrPoorStr = "Shots fired in a poor area: ";
                        player.call(`returnAreaZone`, [richOrPoorStr]);
                    } else {
						
					}
                }
            }
        }
    }
};
// Name of event function to be called by the client
mp.events.add("zoneFiredIn", eventOfGunFired);

// Function to get the location information and send the final ping to PD
let retrieveMessage = (player, policePingMessageVar) => {
    pingMessageVar = policePingMessageVar;
    pingPD();
};
// Name of event function to be called by the client
mp.events.add("pdMessageGot", retrieveMessage);