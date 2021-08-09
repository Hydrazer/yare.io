// yare.io code for triangle units

// Function Definitions
import { find_dist, find_point_radius, get_closest_enemy, get_closest_enemy_id, get_lowest_energy, get_total_energy } from "../tools";

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
    
    // Gets exact positions
    let outpost_unit_position       = find_point_radius(outpost.position, star_p89.position, 199);
    let base_pipe_unit_position_1   = find_point_radius(memory['base_star'].position, base.position, 190);
    let base_pipe_unit_position_2   = find_point_radius(memory['base_star'].position, base_pipe_unit_position_1, 180);
    let base_pipe_unit_position_3   = find_point_radius(memory['base_star'].position, base_pipe_unit_position_2, 150);
    let base_def_idle_position      = find_point_radius(outpost.position, base.position, 70);
    let harasser_unit_position      = find_point_radius(star_p89.position, enemy_base.position, 300);

    let current_mode = 0; // 0 -> Normal Operation, 1 -> Attack Enemy Base

    // If there are no enemy spirits, attack enemy base
    if(enemy_spirits.length == 0) {
        current_mode = 1;
    }
    
    if(current_mode == 0) {
        let harasser_count = 1;
        let outpost_count  = 2;
        let pipe_count     = 9;
        let base_def_count = 5;
        if(outpost_controller != 'saltAxAtlas' && outpost_controller != '') {
            harasser_count = 0;
            outpost_count  = 0;
        }
        let num_per_pipe   = Math.floor((number_units - harasser_count - outpost_count)/3);
        if(num_per_pipe > 3) {
            num_per_pipe = 3;
        }
        let pipe_count_1    = num_per_pipe;
        let pipe_count_2    = num_per_pipe;
        let pipe_count_3    = num_per_pipe;
        // Assign State for Each Unit
        for(let unit of friendly_spirits) {
            if(harasser_count) {
                if(memory[unit.id] == "outpost_harvesting" && unit.energy != unit.energy_capacity) {
                    memory[unit.id] = "outpost_harvesting";
                }
                else if(unit.energy > 10) {
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
    
                    if(unit.energy >= 20 && outpost.energy < 1000) {
                        memory[unit.id] = "outpost_charging";
                    } 
                    else if((unit.energy < 20) || (unit.energy < unit.energy_capacity && outpost.energy == outpost.energy_capacity)) {
                        memory[unit.id] = "outpost_harvesting";
                    }
                    else if(unit.energy == unit.energy_capacity) {
                        memory[unit.id] = "outpost_do_nothing";
                    }
                }
                outpost_count -= 1;
            }
            else if(pipe_count) {    
                if(base.sight.enemies.length > 0) {
                    memory[unit.id] = "base_defender";
                }
                else {
                    if(pipe_count_1) {
                        memory[unit.id] = "base_pipe_1";
                        pipe_count_1 -= 1;
                    }
                    else if(pipe_count_2) {
                        memory[unit.id] = "base_pipe_2";
                        pipe_count_2 -= 1;
                    }
                    else if(pipe_count_3) {
                        memory[unit.id] = "base_pipe_3";
                        pipe_count_3 -= 1;
                    }
                }
                pipe_count -= 1;
            } 
            else if(base_def_count) {
                if(base.sight.enemies.length > 0) {
                    memory[unit.id] = "base_defender";
                }
                else {
                    memory[unit.id] = "base_def";
                }
                base_def_count -= 1;
            }
            else {
                memory[unit.id] = "attacker";
            }
        }
            
        // THIS IS DUMB - NEEDS TO BE FIXED
        let spirits_pipe_1 = my_spirits.filter(x => x.hp == 1).filter(x => memory[x.id] == "base_pipe_1");
        let spirits_pipe_2 = my_spirits.filter(x => x.hp == 1).filter(x => memory[x.id] == "base_pipe_2");
        console.log(spirits_pipe_1.length)
        console.log(spirits_pipe_2.length)

        // Process State for Each Unit
        for(let unit of friendly_spirits) {
            if(memory[unit.id] == "harasser") {
                let number_enemy_units_harasser = unit.sight.enemies.length;
                let run = false;
                if(number_enemy_units_harasser > 0) {
                    let enemy_units_harasser_total_energy = get_total_energy(unit.sight.enemies);
                    let closest_enemy_harasser = get_closest_enemy(unit.sight.enemies, unit.position);
                    let distance_to_enemy = find_dist(unit.position, closest_enemy_harasser.position);
                    if(distance_to_enemy <= 41000) {
                        unit.move(closest_enemy_harasser.position);
                        unit.energize(closest_enemy_harasser);
                    }
                    else if(enemy_units_harasser_total_energy >= unit.energy / 2 && distance_to_enemy < 90000) {
                        run = true;
                    }
                    else if(distance_to_enemy > 40000 && unit.energy > closest_enemy_harasser.energy) {
                        unit.move(closest_enemy_harasser.position);
                        unit.energize(closest_enemy_harasser);
                    }
                    else if(distance_to_enemy > 41000 && unit.energy <= closest_enemy_harasser.energy) {
                        run = true;
                    }
                    if(run) {
                        unit.shout("RUN!");
                        unit.move(find_point_radius(unit.position, closest_enemy_harasser.position, 400));
                        run = false;
                    } 
                }
                else {
                    unit.shout("Blocking Spawn!");
                    unit.move(harasser_unit_position);
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
                unit.shout("Outpost!");
                unit.move(outpost_unit_position);
                unit.energize(outpost);
                outpost.energy += unit.size;
            } 
            else if(memory[unit.id] == "outpost_harvesting") {
                unit.shout("Outpost!");
                unit.move(outpost_unit_position);
                unit.energize(unit);
            }
            else if(memory[unit.id] == "outpost_do_nothing") {
                unit.shout("I'm Bored!");
                unit.move(outpost_unit_position);
            }
            else if(memory[unit.id] == "base_defender") {
                unit.shout("Defend Base!");
                let closest_enemy_base = get_closest_enemy(base.sight.enemies, unit.position);
                let distance_to_enemy_at_base = find_dist(unit.position, closest_enemy_base.position);
                if(distance_to_enemy_at_base > 40000) {
                    unit.move(closest_enemy_base.position);
                    continue;
                }
                unit.energize(closest_enemy_base);
            }
            else if(memory[unit.id] == "base_def") {
                unit.shout("Idle!");
                unit.move(base_def_idle_position);
            }
            else if(memory[unit.id] == "base_pipe_1") {
                unit.shout("Pipe 1!");
                unit.move(base_pipe_unit_position_1);
                if(unit.energy > 20) {
                    unit.energize(base);
                }
            } 
            else if(memory[unit.id] == "base_pipe_2") {
                unit.shout("Pipe 2!");
                unit.move(base_pipe_unit_position_2);
                if(unit.energy > 20) {
                    let target = get_lowest_energy(spirits_pipe_1, "base_pipe_1");
                    unit.energize(target);
                    target.energy += unit.size;
                }
            } 
            else if(memory[unit.id] == "base_pipe_3") {
                unit.shout("Pipe 3!");
                unit.move(base_pipe_unit_position_3);
                if(unit.energy > 20) {
                    let target = get_lowest_energy(spirits_pipe_2, "base_pipe_2");
                    unit.energize(target);
                    target.energy += unit.size;
                }
                else {
                    unit.energize(unit)
                }
            }
            else if(memory[unit.id] == "attacker") {
                if(outpost_controller != 'saltAxAtlas' && outpost_controller != '') {
                    unit.move(outpost.position);
                    let closest_enemy_attacker = get_closest_enemy_id(enemy_spirits, unit.position);
                    let distance_to_enemy_at_attacker = find_dist(unit.position, closest_enemy_attacker.position);
                    if(distance_to_enemy_at_attacker < 40000) {
                        unit.energize(closest_enemy_attacker);
                    }
                    else if(find_dist(unit.position, outpost.position) < 40000) {
                        unit.energize(outpost);
                    }
                }
                else {
                    unit.move(enemy_base.position);
                    let closest_enemy_attacker = get_closest_enemy_id(enemy_spirits, unit.position);
                    let distance_to_enemy_at_attacker = find_dist(unit.position, closest_enemy_attacker.position);
                    if(distance_to_enemy_at_attacker < 40000) {
                        unit.energize(closest_enemy_attacker);
                    }
                    else if(find_dist(unit.position, enemy_base.position) < 40000) {
                        unit.energize(enemy_base);
                    }
                }
            }
            console.log(unit.last_energized)
        }
    }
    else if(current_mode == 1) {
        ready_spirits = friendly_spirits.filter(x => x.energy == x.energy_capacity).length;
        // Loops through all friendly units
        for(unit of friendly_spirits) {
            // If fully charged -> Attack enemy base
            if(unit.energy == unit.energy_capacity && ready_spirits == number_units) {
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
                    unit.move(outpost_unit_position);
                }
                else {
                    if(40000 < find_dist(unit.position, memory['base_star'].position)) {
                        unit.move(memory['base_star'].position);
                        continue;
                    }
                }
                if(unit.energy == unit.energy_capacity) {
                    continue;
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
