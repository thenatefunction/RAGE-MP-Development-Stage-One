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

// Send the final ping to PD (to console for now) || ping to main game chat for testing purposes
function pingPD() {
    console.log(pingMessageVar);
	mp.players.broadcast(JSON.stringify(pingMessageVar));
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