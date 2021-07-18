// Refactoring code, this code kinda works but breaks on a bunch of edge cases
// Use with squares, it will mostly kinda sorta work, but not really

function find_dist(pos1, pos2) {
    return (pos1[0]-pos2[0])**2+(pos1[1]-pos2[1])**2
}

{

// TODO:
// Skirt around outpost if it is capped
// Harass needs a bunch of work
// Move / Energize at the start, and with harrasser @ outpost
// Charge on outpost only if outpost not enemy controlled, else charge at base
// Attack unit that is the closest to the spirit
// Remove outpost defenders

// ISSUES:
// If battling for outpost, as soon as enemy takes it my units will give up and drive to base
// When new unit is created, new unit becomes outpost unit, and a outpost unit becomes a base unit
// Going from outpost mode to normal, units must be at 0 or 100 energy or they get stuck

// UNTESTED but should be good:


// Not fully implemented but should be, need to replace star_zxq below with memory['base_star']
let dist1 = find_dist(base.position, star_zxq.position);
let dist2 = find_dist(base.position, star_a1c.position);

if(dist1 < dist2) {
    memory['base_star'] = star_zxq;
}
else {
    memory['base_star'] = star_a1c;
}

all_spirits = [];
for(x of Object.keys(spirits)) {
    all_spirits.push(spirits[x]);
}

enemy_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id != 'saltAxAtlas');
friendly_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id == 'saltAxAtlas');

let current_mode = 0; // 0 -> Normal, 1 -> Attack Outpost, 2 -> Attack Enemy Base
let number_units = friendly_spirits.length;
// console.log(friendly_spirits.length);

if(current_mode == 0) {
    if(number_units == 2) {
        for(unit of friendly_spirits) {
            unit.shout("Only 2!");
            if(memory[unit.id] == "outpost_harvesting" || memory[unit.id] == "outpost_charging" || memory[unit.id] == "harass") {
                    memory[unit.id] = "base_harvesting";
            }
            if(unit.energy == unit.energy_capacity) {
                memory[unit.id] = "base_charging";
            } 
            else if(unit.energy == 0) {
                memory[unit.id] = "base_harvesting";
            }

            if(memory[unit.id] == "base_charging") {
                if(40000 < find_dist(unit.position, base.position)) {
                    unit.move(base.position);
                    continue;
                }
                unit.energize(base);
            } 
            else if(memory[unit.id] == "base_harvesting") {
                if(40000 < find_dist(unit.position, star_zxq.position)) {
                    unit.move(star_zxq.position);
                    continue;
                }
                unit.energize(unit);
            }
            else if(memory[unit.id] == "outpost_charging") {
                if(40000 < find_dist(unit.position, outpost.position)) {
                    unit.move(outpost.position);
                    continue;
                }
                unit.energize(outpost);
            } 
            else if(memory[unit.id] == "outpost_harvesting") {
                if(40000 < find_dist(unit.position, star_p89.position)) {
                    unit.move(star_p89.position);
                    continue;
                }
                unit.energize(unit);
            }
        }
    }
    else if(number_units > 2) {
        let index = 0;
        let base_defenders = Math.floor(number_units/2);
        if(outpost.control != 'saltAxAtlas' && outpost.control != '') {
            base_defenders = number_units - 1;
        }
        for(unit of friendly_spirits) {
            if(index == 0) {
                if(memory[unit.id] != "kill_enemy_base") {
                    if(memory[unit.id] == "outpost_harvesting" && unit.energy != unit.energy_capacity) {
                        memory[unit.id] = "outpost_harvesting";
                    }
                    else if(unit.energy > 0) {
                        memory[unit.id] = "harass";
                    }
                    else {
                        memory[unit.id] = "outpost_harvesting";
                    } 
                }
                index = 1;
            }
            else if(index != 0 && base_defenders > 0) {

                if(memory[unit.id] == "outpost_defender" || memory[unit.id] == "outpost_charging" || memory[unit.id] == "outpost_harvesting") {
                    memory[unit.id] = "base_harvesting";
                }
                
                if(base.sight.enemies.length > 0 && unit.energy > 0) {
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
                
                base_defenders -= 1;
            }
            else {
                
                if(memory[unit.id] == "outpost_defender" || memory[unit.id] == "base_defender" || memory[unit.id] == "base_charging" || memory[unit.id] == "base_harvesting") {
                    memory[unit.id] = "outpost_harvesting";
                }
                if(unit.energy > 0) {
                    memory[unit.id] = "outpost_charging";
                } 
                else if(unit.energy == 0) {
                    memory[unit.id] = "outpost_harvesting";
                }
            } 
                
            
            if(memory[unit.id] == "kill_enemy_base") {
                if(enemy_base.energy > unit.energy) {
                    memory[unit.id] = "harass";
                }
                else {
                    unit.shout("Juicy Base!");
                    let distance = find_dist(unit.position, enemy_base.position);
                    if(40000 < distance) {
                        unit.move(enemy_base.position);
                        continue;
                    }
                    unit.energize(enemy_base);
                }
            }

            if(memory[unit.id] == "harass") {
                let number_enemy_units_harass = unit.sight.enemies.length;
                // if(enemy_base.energy < unit.energy/2) {
                //     memory[unit.id] = "kill_enemy_base";
                //     unit.shout("Juicy Base!");
                //     let distance = find_dist(unit.position, enemy_base.position);
                //     if(40000 < distance) {
                //         unit.move(enemy_base.position);
                //         continue;
                //     }
                //     unit.energize(enemy_base);
                   
                // }
                if(number_enemy_units_harass > 0) {
                    unit.shout("I C U!");
                    let harass_invader = spirits[unit.sight.enemies[0]];
                    let distance = find_dist(unit.position, harass_invader.position);
                    
                    if(number_enemy_units_harass >=5) {
                        unit.move(outpost.position);
                        continue;
                    }
                    else if(40000 < distance && unit.energy > harass_invader.energy) {
                        unit.move(harass_invader.position);
                        unit.energize(harass_invader);
                        continue;
                    }
                    else if(40000 < distance && unit.energy < harass_invader.energy) {
                        unit.move(star_p89.position);
                        unit.energize(unit);
                        continue;
                    }
                    else if(distance < 40000) {
                        unit.energize(harass_invader);
                        continue;
                    }
                    else {
                        unit.move(star_p89.position);
                        unit.energize(unit);
                        continue;
                    }
                   
                }
                //if(number_enemy_units_harass > 0) {
                //    var harass_invader = spirits[unit.sight.enemies[0]];
                //    let distance = find_dist(unit.position, harass_invader.position);
                //    if(distance < 63000) {
                //        unit.shout("close one");
                //        unit.move(outpost.position);
                //    }
                //    else if(100000 < find_dist(unit.position, enemy_base.position)) {
                //        unit.shout("hehe");
                //        unit.move(enemy_base.position);
                //    }
                //    else {
                //        unit.shout("hehe");
                //        unit.move(outpost.position);
                //    }
                //}
                else if(100000 < find_dist(unit.position, enemy_base.position)) {
                    unit.shout("hehe");
                    unit.move(enemy_base.position);
                }
                else {
                    unit.shout("hehe");
                    unit.move(outpost.position);
                }
            }
            else if(memory[unit.id] == "outpost_charging") {
                unit.shout("Charge Outpost");
                if(40000 < find_dist(unit.position, outpost.position)) {
                    unit.move(outpost.position);
                    continue;
                }
                unit.energize(outpost);
            } 
            else if(memory[unit.id] == "outpost_harvesting") {
                unit.shout("Harvest Outpost");
                if(40000 < find_dist(unit.position, star_p89.position)) {
                    unit.move(star_p89.position);
                    continue;
                }
                unit.energize(unit);
            }
            else if(memory[unit.id] == "base_defender") {
                unit.shout("Defend Base");
                let base_invader = spirits[base.sight.enemies[0]];
                let distance = find_dist(unit.position, base_invader.position);
                if(40000 < distance) {
                    unit.move(base_invader.position);
                    continue;
                }
                unit.energize(base_invader);
            }
            else if(memory[unit.id] == "base_charging") {
                unit.shout("Charge Base");
                if(40000 < find_dist(unit.position, base.position)) {
                    unit.move(base.position);
                    continue;
                }
                unit.energize(base);
            } 
            else if(memory[unit.id] == "base_harvesting") {
                unit.shout("Harvest Base");
                if(40000 < find_dist(unit.position, star_zxq.position)) {
                    unit.move(star_zxq.position);
                    continue;
                }
                unit.energize(unit);
            }
        }
    }
    else {
        for(unit of friendly_spirits) {
            unit.shout("We LOST!");
            if(unit.energy == unit.energy_capacity) {
                memory[unit.id] = "base_charging";
            } 
            else if(unit.energy == 0) {
                memory[unit.id] = "base_harvesting";
            }

            if(memory[unit.id] == "base_charging") {
                if(40000 < find_dist(unit.position, base.position)) {
                    unit.move(base.position);
                    continue;
                }
                unit.energize(base);
            } 
            else if(memory[unit.id] == "base_harvesting") {
                if(40000 < find_dist(unit.position, star_zxq.position)) {
                    unit.move(star_zxq.position);
                    continue;
                }
                unit.energize(unit);
            }
        }
    }
}
else if(current_mode == 1) {
    for(unit of friendly_spirits) {
        if(unit.energy == unit.energy_capacity) {
            memory[unit.id] = "killing";
        } 
        else if(memory[unit.id] != "killing") {
            memory[unit.id] = "harvesting";
        }

        if(memory[unit.id] == "killing") {
            unit.shout("CHARGE!");
            if(40000 < find_dist(unit.position, outpost.position)) {
                unit.move(outpost.position);
                continue;
            }
            unit.energize(outpost);
        } 
        else if(memory[unit.id] == "harvesting") {
            unit.shout("Charging!");
            if(40000 < find_dist(unit.position, star_zxq.position)) {
                unit.move(star_zxq.position);
                continue;
            }
            unit.energize(unit);
        }
    }
}
else if(current_mode == 2) {
    for(unit of friendly_spirits) {
        if(unit.energy == unit.energy_capacity) {
            memory[unit.id] = "killing";
        } 
        else if(memory[unit.id] != "killing") {
            memory[unit.id] = "harvesting";
        }

        if(memory[unit.id] == "killing") {
            unit.shout("Nuke Incoming!");
            if(40000 < find_dist(unit.position, enemy_base.position)) {
                unit.move(enemy_base.position);
                continue;
            }
            unit.energize(enemy_base);
        } 
        else if(memory[unit.id] == "harvesting") {
            unit.shout("Chargin UP!");
            if(40000 < find_dist(unit.position, star_p89.position)) {
                if(find_dist(base.position, star_zxq.position) < find_dist(base.position, star_a1c.position)) {
                    unit.move(star_zxq.position);
                }
                else {
                    unit.move(star_p89.position);
                }
                continue;
            }
            unit.energize(unit);
        }
    }
}
else {
    for(unit of friendly_spirits) {
        unit.shout("WTF! 0 or 1 or 2");
    }
}

}