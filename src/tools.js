// Function to find distance between 2 positions, returns the square of the distance
function find_dist(position_1, position_2) {
  return (position_1[0] - position_2[0])**2 + (position_1[1] - position_2[1])**2
}

// Function to subtract two positions
function subtract_positions(position_1, position_2) {
  return [position_1[0] - position_2[0], position_1[1] - position_2[1]];
}

// Function to normalize a vector
function normalize_vector(vector, magnitude) {
  return [vector[0] / magnitude, vector[1] / magnitude];
}

// Function to find the exact point within 200 unit radius
function find_point_within_energize(position_1, position_2) {
  let vector = subtract_positions(position_1, position_2);
  let magnitude = Math.sqrt(vector[0]**2 + vector[1]**2);
  let direction = normalize_vector(vector, magnitude);
  let offset = [Math.floor(direction[0] * 199), Math.floor(direction[1] * 199)];
  return [offset[0] + position_2[0], offset[1] + position_2[1]];
}

// Function to find the exact point for the harasser to run away to
function harasser_run(position_1, position_2) {
  let vector = subtract_positions(position_1, position_2);
  let magnitude = Math.sqrt(vector[0]**2 + vector[1]**2);
  let direction = normalize_vector(vector, magnitude);
  let offset = [Math.floor(direction[0] * 199), Math.floor(direction[1] * 199)];
  return [offset[0] + position_1[0], offset[1] + position_1[1]];
}

// Function to get the closest enemy to the given position
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

// Function to get the total energy of all enemies passed in
function get_total_energy(enemies) {
  let total_energy = 0;
  for(enemy of enemies) {
      total_energy += spirits[enemy].energy
  }
  return total_energy;
}

export { find_dist, find_point_within_energize, harasser_run, get_closest_enemy, get_total_energy };