// yare.io code for circle units

// Function Definitions
function find_dist(pos1, pos2) {
    return (pos1[0]-pos2[0])**2+(pos1[1]-pos2[1])**2
}

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

}