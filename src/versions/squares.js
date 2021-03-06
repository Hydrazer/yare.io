// yare.io code for square units
// energy pipe is BAD here

// Function Definitions
import { find_dist, find_point_within_energize, harasser_run, get_closest_enemy, get_total_energy } from "../tools";

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
  let all_spirits = [];
  for(x of Object.keys(spirits)) {
      all_spirits.push(spirits[x]);
  }
  

  // Gets a list of enemy / friendly spirits that are alive
  let enemy_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id != 'saltAxAtlas');
  let friendly_spirits = all_spirits.filter(x => x.hp == 1).filter(x => x.player_id == 'saltAxAtlas');
  
  // Gets number of friendly spirits
  let number_units = friendly_spirits.length;
  // console.log(number_units);

  // Gets controller of outpost
  let outpost_controller = outpost.control;

  // Gets location for outpost units
  let outpost_unit_position = find_point_within_energize(outpost.position, star_p89.position);
  let base_unit_position = find_point_within_energize(memory['base_star'].position, base.position);
  let base_pipe_unit_position_1 = find_point_within_energize(memory['base_star'].position, base_unit_position);
  let base_pipe_unit_position_2 = find_point_within_energize(memory['base_star'].position, base_pipe_unit_position_1);
  let harasser_unit_position = find_point_within_energize(star_p89.position, enemy_base.position);
  
  let current_mode = 0; // 0 -> Normal Operation, 1 -> Attack Enemy Base
  
  if(current_mode == 0) {
      let harasser_count = 1;
      let outpost_count  = Math.floor(number_units/3);
      let base_count = number_units - outpost_count - harasser_count;
      let pipe_count = 0;
      if(outpost.control != 'saltAxAtlas' && outpost.control != '') {
          harasser_count = 0;
          outpost_count  = 0;
          base_count = number_units;
      }
      if(base_count > 2) {
          pipe_count = 3;
      }
      for(unit of friendly_spirits) {
          if(harasser_count) {
              if(memory[unit.id] == "outpost_harvesting" && unit.energy != unit.energy_capacity) {
                  memory[unit.id] = "outpost_harvesting";
              }
              else if(unit.energy > 30) {
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
  
                  if(unit.energy > 0 && outpost.energy < 1000) {
                      memory[unit.id] = "outpost_charging";
                  } 
                  else if((unit.energy < 80) || (unit.energy < unit.energy_capacity && outpost.energy == outpost.energy_capacity)) {
                      memory[unit.id] = "outpost_harvesting";
                  }
                  else if(unit.energy == unit.energy_capacity) {
                      memory[unit.id] = "outpost_do_nothing";
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
                  if(memory[unit.id] == "base_defender" || memory[unit.id] == "base_pipe_1" || memory[unit.id] == "base_pipe_2" || memory[unit.id] == "base_pipe_3") {
                      memory[unit.id] = "base_harvesting";
                  }
  
                  if(pipe_count) {
                      pipe_count -= 1;
                      switch(pipe_count) {
                            case 2:
                                memory[unit.id] = "base_pipe_3";
                                break;
                            case 1:
                                memory[unit.id] = "base_pipe_2";
                                memory['pipe_2']  = unit;
                                break;
                            case 0:
                                memory[unit.id] = "base_pipe_1";
                                memory['pipe_1']  = unit;
                                break;
                      }
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
                      unit.move(harasser_run(unit.position, closest_enemy_harasser.position));
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
              unit.shout("Charge Outpost!");
              unit.move(outpost_unit_position);
              unit.energize(outpost);
              outpost.energy += unit.size;
          } 
          else if(memory[unit.id] == "outpost_harvesting") {
              unit.shout("Harvest Outpost!");
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
          else if(memory[unit.id] == "base_charging") {
              unit.shout("Charge Base!");
              unit.move(base_unit_position);
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
          else if(memory[unit.id] == "base_pipe_1") {
              unit.shout("PIPE!");
              unit.move(base_unit_position);
              if(unit.energy > 80) {
                  unit.energize(base);
              }
          }
          else if(memory[unit.id] == "base_pipe_2") {
            unit.shout("PIPE!");
            unit.move(base_pipe_unit_position_1);
            if(unit.energy > 80) {
                unit.energize(memory['pipe_1']);
            }
          }
          else if(memory[unit.id] == "base_pipe_3") {
            unit.shout("PIPE!");
            unit.move(base_pipe_unit_position_2);
            if(unit.energy > 80) {
                unit.energize(memory['pipe_2']);
            }
            else {
                unit.energize(unit)
            }
          }
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
