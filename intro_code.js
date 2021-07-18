// Introductory code for yare.io that will create new units and defend your base
// Works with any unit type

// Function to find distance between 2 positions, returns the square of the distance
function find_dist(pos1, pos2) {
    return (pos1[0]-pos2[0])**2+(pos1[1]-pos2[1])**2
}

// Function to find the closest enemy to your unit
function get_closest_enemy(enemies, pos) {
    let min_dist = find_dist(spirits[enemies[0]].position, pos);
    let closest_enemy = spirits[enemies[0]];
    for(enemy of enemies) {
        let enemy_dist = find_dist(spirits[enemy].position, pos);
        if(enemy_dist < min_dist) {
            min_dist = enemy_dist;
            closest_enemy = spirits[enemy];
        }
    }
    return closest_enemy;
}

{

// Finds the distance from your base to the 2 base stars in order to determine which star is near your base
let star_zxq_dist = find_dist(base.position, star_zxq.position);
let star_a1c_dist = find_dist(base.position, star_a1c.position);

if(star_zxq_dist < star_a1c_dist) {
    memory['base_star'] = star_zxq;
}
else {
    memory['base_star'] = star_a1c;
}

// Gets all of the spirits
all_spirits = [];
for(x of Object.keys(spirits)) {
    all_spirits.push(spirits[x]);
}

// Gets all spirits that are alive, and belong to the enemy
enemy_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id != 'YOUR_NAME_HERE');
// Gets all spirits that are alive, and belong to you
friendly_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id == 'YOUR_NAME_HERE');

// Logs how many spirits you currently have
let number_units = friendly_spirits.length;
console.log(friendly_spirits.length);

// Loops through all of ypur units
for(unit of friendly_spirits) {
    // Determine unit state
    if((memory[unit.id] == "base_defender" && unit.energy > 0 && base.sight.enemies.length > 0) || (base.sight.enemies.length > 0 && unit.energy == unit.energy_capacity)) {
        memory[unit.id] = "base_defender";
    }
    else if(unit.energy == unit.energy_capacity) {
        memory[unit.id] = "base_charging";
    } 
    else if(unit.energy == 0 || (memory[unit.id] == "base_defender" && unit.energy < unit.energy_capacity)) {
        memory[unit.id] = "base_harvesting";
    }

    // Act based on unit state
    if(memory[unit.id] == "base_defender") {
        unit.shout("Defend Base!");
        let base_invader = get_closest_enemy(base.sight.enemies, unit.position);
        let distance = find_dist(unit.position, base_invader.position);
        if(distance > 40000) {
            unit.move(base_invader.position);
            continue;
        }
        unit.energize(base_invader);
    } 
    if(memory[unit.id] == "base_charging") {
        unit.shout("Charging Base!");
        if(40000 < find_dist(unit.position, base.position)) {
            unit.move(base.position);
            continue;
        }
        unit.energize(base);
    } 
    else if(memory[unit.id] == "base_harvesting") {
        unit.shout("Harvesting Star!");
        if(40000 < find_dist(unit.position, memory['base_star'].position)) {
            unit.move(memory['base_star'].position);
            continue;
        }
        unit.energize(unit);
    }
}

}