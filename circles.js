// yare.io code for circle units

// Function Definitions
function find_dist(position_1, position_2) {
    return (position_1[0]-position_2[0])**2+(position_1[1]-position_2[1])**2
}

function get_closest_enemy(enemies, position) {
    let min_dist = find_dist(spirits[enemies[0]].position, position);
    let closest_enemy = spirits[enemies[0]];
    for(enemy of enemies) {
        let enemy_dist = find_dist(spirits[enemy].position, position);
        if(enemy_dist < min_dist) {
            min_dist = enemy_dist;
            closest_enemy = spirits[enemy];
        }
    }
    return closest_enemy;
}

// Main Loop
{

// Finds which star is near your base
if(find_dist(base.position, star_zxq.position) < find_dist(base.position, star_a1c.position)) {
    memory['base_star']  = star_zxq;
    memory['enemy_star'] = star_a1c;
}
else {
    memory['base_star']   = star_a1c;
    memory['enemy_star']  = star_zxq;
}

// Gets a list of all spirits
all_spirits = [];
for(x of Object.keys(spirits)) {
    all_spirits.push(spirits[x]);
}

// Gets a list of enemy / friendly spirits that are alive
enemy_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id != 'saltAxAtlas');
friendly_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id == 'saltAxAtlas');

// Gets number of friendly spirits
let number_units = friendly_spirits.length;
// console.log(number_units);

// Gets controller of outpost
let outpost_controller = outpost.control;

let current_mode = 0; // 0 -> Normal Operation, 1 -> Attack Enemy Base

if(current_mode == 0) {
    let harasser_count = 3;
    let outpost_count  = Math.floor(number_units/5);
    if(outpost.control != 'saltAxAtlas' && outpost.control != '') {
        harasser_count = 0;
        outpost_count  = 0;
    }
    for(unit of friendly_spirits) {
        if(harasser_count) {
            if(memory[unit.id] == "outpost_harvesting" && unit.energy != unit.energy_capacity) {
                memory[unit.id] = "outpost_harvesting";
            }
            else if(unit.energy > 0) {
                memory[unit.id] = "harasser";
            }
            else {
                memory[unit.id] = "outpost_harvesting";
            } 
            harasser_count -= 1;
        }
        else if(outpost_count) {
            if(memory[unit.id] == "base_defender" || memory[unit.id] == "base_charging" || memory[unit.id] == "base_harvesting") {
                memory[unit.id] = "outpost_harvesting";
            }

            if((outpost.sight.enemies.length > 0 && unit.energy == unit.energy_capacity && outpost.energy > 700) || (outpost.sight.enemies.length > 0 && memory[unit.id] == "outpost_defender")) {
                memory[unit.id] = "outpost_defender";
            }
            else {
                if(memory[unit.id] == "outpost_defender") {
                    memory[unit.id] = "outpost_harvesting";
                }

                if(unit.energy > 0) {
                    memory[unit.id] = "outpost_charging";
                } 
                else if(unit.energy == 0) {
                    memory[unit.id] = "outpost_harvesting";
                }
            }
            outpost_count -= 1;
        }
        else {
            if(memory[unit.id] == "outpost_defender" || memory[unit.id] == "outpost_charging" || memory[unit.id] == "outpost_harvesting" || memory[unit.id] == "harasser") {
                memory[unit.id] = "base_harvesting";
            }

            if((base.sight.enemies.length > 0 && unit.energy == unit.energy_capacity) || (base.sight.enemies.length > 0 && memory[unit.id] == "base_defender")) {
                memory[unit.id] = "base_defender";
            }
            else {
                if(memory[unit.id] == "base_defender") {
                    memory[unit.id] = "base_harvesting";
                }

                if(unit.energy == unit.energy_capacity) {
                    memory[unit.id] = "base_charging";
                } 
                else if(unit.energy == 0) {
                    memory[unit.id] = "base_harvesting";
                }
            }
        } 
        
        if(memory[unit.id] == "harasser") {
            let number_enemy_units_harasser = unit.sight.enemies.length;
            if(number_enemy_units_harasser > 0) {
                unit.shout("Enemy Spotted!");
                let closest_enemy_harasser = get_closest_enemy(unit.sight.enemies, unit.position)
                let distance_to_enemy = find_dist(unit.position, closest_enemy_harasser.position);
                if(number_enemy_units_harasser >= 2 && find_dist(unit.position, outpost.position) > 30000) {
                    unit.move(outpost.position);
                }
                else if(distance_to_enemy > 40000 && unit.energy > closest_enemy_harasser.energy) {
                    unit.move(closest_enemy_harasser.position);
                }
                else if(distance_to_enemy > 40000 && unit.energy < harass_invader.energy) {
                    unit.move(star_p89.position);
                }
                else if(distance_to_enemy < 40000) {
                    unit.energize(closest_enemy_harasser);
                }
                else {
                    unit.energize(unit);
                }
                
            }
            else if(100000 < find_dist(unit.position, enemy_base.position)) {
                unit.shout("Blocking Spawn!");
                unit.move(enemy_base.position);
            }
            else {
                unit.shout("Blocking Spawn!");
                unit.move(star_p89.position);
            }
        }
        else if(memory[unit.id] == "outpost_defender") {
            unit.shout("Defend Outpost!");
            let closest_enemy_outpost_defender = get_closest_enemy(outpost.sight.enemies, unit.position)
            let distance_to_enemy_at_outpost = find_dist(unit.position, closest_enemy_outpost_defender.position);
            if(distance_to_enemy_at_outpost > 40000) {
                unit.move(closest_enemy_outpost_defender.position);
                continue;
            }
            unit.energize(closest_enemy_outpost_defender);
        }
        else if(memory[unit.id] == "outpost_charging") {
            unit.shout("Charge Outpost!");
            if(find_dist(unit.position, outpost.position) > 40000) {
                unit.move(outpost.position);
                continue;
            }
            unit.energize(outpost);
        } 
        else if(memory[unit.id] == "outpost_harvesting") {
            unit.shout("Harvest Outpost!");
            if(find_dist(unit.position, star_p89.position) > 40000) {
                unit.move(star_p89.position);
                continue;
            }
            unit.energize(unit);
        }
        else if(memory[unit.id] == "base_defender") {
            unit.shout("Defend Base!");
            let closest_enemy_base = get_closest_enemy(base.sight.enemies, unit.position)
            let distance_to_enemy_at_base = find_dist(unit.position, closest_enemy_base.position);
            if(distance_to_enemy_at_base > 40000) {
                unit.move(closest_enemy_base.position);
                continue;
            }
            unit.energize(closest_enemy_base);
        }
        else if(memory[unit.id] == "base_charging") {
            unit.shout("Charge Base!");
            if(find_dist(unit.position, base.position) > 40000) {
                unit.move(base.position);
                continue;
            }
            unit.energize(base);
        } 
        else if(memory[unit.id] == "base_harvesting") {
            unit.shout("Harvest Base!");
            if(find_dist(unit.position, memory['base_star'].position) > 40000) {
                unit.move(memory['base_star'].position);
                continue;
            }
            unit.energize(unit);
        }
    }
}
else if(current_mode == 1) {
    // Loops through all friendly units
    for(unit of friendly_spirits) {
        // If fully charged -> Attack enemy base
        if(unit.energy == unit.energy_capacity) {
            memory[unit.id] = "attacking";
        } 
        // If not fully charged -> Charge to capacity
        else if(memory[unit.id] != "attacking") {
            memory[unit.id] = "harvesting";
        }

        if(memory[unit.id] == "attacking") {
            unit.shout("NUKE!");
            if(40000 < find_dist(unit.position, enemy_base.position)) {
                unit.move(enemy_base.position);
                continue;
            }
            unit.energize(enemy_base);
        } 
        else if(memory[unit.id] == "harvesting") {
            unit.shout("Charging!");
            if(outpost_controller == "saltAxAtlas" || outpost_controller == "") {
                if(40000 < find_dist(unit.position, star_p89.position)) {
                    unit.move(star_p89.position);
                    continue;
                }
            }
            else {
                if(40000 < find_dist(unit.position, memory['base_star'].position)) {
                    unit.move(memory['base_star'].position);
                    continue;
                }
            }
            unit.energize(unit);
        }
    }
}
else {
    for(unit of friendly_spirits) {
        unit.shout("WTF! 0 or 1!");
    }
}

}