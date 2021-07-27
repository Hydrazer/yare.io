// Function to find distance between 2 positions, returns the square of the distance
function find_dist(pos1, pos2) {
  return (pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2;
}

// Function to find the closest enemy to your unit
function get_closest_enemy(enemies, pos) {
  let min_dist = find_dist(spirits[enemies[0]].position, pos);
  let closest_enemy = spirits[enemies[0]];
  for (enemy of enemies) {
    let enemy_dist = find_dist(spirits[enemy].position, pos);
    if (enemy_dist < min_dist) {
      min_dist = enemy_dist;
      closest_enemy = spirits[enemy];
    }
  }
  return closest_enemy;
}

export { find_dist, get_closest_enemy };
