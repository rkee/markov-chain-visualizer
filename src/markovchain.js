/** MarkovChain class
 * Data and logic for a single finite Markov Chain 
 * @author Ryan Kee
 */
function MarkovChain() {
  this.stateSpace = {};
  this.p_matrix = [];
  this.selected = null;
  this.current = null;
  this.p_0 = null; // initial distribution
  this.running = false;
  this.t = 0;
  this.t_2 = 0;
  this.n = 0;
}

// Add state value to state object map in stateSpace
MarkovChain.prototype.addState = function(state, x, y) {
  if (this.stateSpace.hasOwnProperty(state)) {
    error("State " + state + " already exists.");
    return;
  }
  this.stateSpace[state] = new State(state, x, y);
  this.update_p_matrix();
  if (this.p_0) {
    this.p_0.push(1 / this.p_matrix.length);
    this.p_0.forEach((name, index) => this.p_0[index] = 1 / this.p_matrix.length);
  }
};

// Array of strings representing initial distribution where each element is displayed as a fraction
MarkovChain.prototype.p_0Fraction = function() {
  if (!this.p_0 || this.p_0.length == 0) return null;
  return this.p_0.map(element => rationalize(bigRat(element), 0.001).toString());
}

// Add a directed edge from parent to neighbor with weight p
MarkovChain.prototype.addEdge = function(parent, child, p) {
  if (!this.stateSpace.hasOwnProperty(parent) ||
      !this.stateSpace.hasOwnProperty(child)) {
        var nonexistent_state = !this.stateSpace.hasOwnProperty(parent) ? parent : child;
        error("State " + nonexistent_state + " does not exist");
        return;
  }
  else if (this.stateSpace[parent].edges.hasOwnProperty(child)) {
    error("Edge from " + parent + " to " + child + " already exists.");
    return;
  }
  else if (p <= 0 || p > 1) {
    error("Edge weights must be in the range [0, 1)");
    return;
  }
  this.stateSpace[parent].addEdge(child, p);
  this.update_p_matrix();
};

// Remove state from Markov chain and all edges associated with it
MarkovChain.prototype.removeState = function(state) {
  if (!this.stateSpace.hasOwnProperty(state)) {
    error("State " + state + " does not exist");
    return;
  }
  for (var i = 0; i < Object.keys(this.stateSpace).length; i++) {
    var otherState = this.stateSpace[this.indexStateMap()[i]];
    if (otherState.value !== state && 
      otherState.edges.hasOwnProperty(state)) {
      otherState.removeEdge(state);
    }
  }
  
  if (this.current === state) {
    this.current = null;
  }
  if (this.selected === state) {
    this.selected = null;
  }

  delete this.stateSpace[state];
  this.update_p_matrix();
};

// Remove edge from parent node to child node
MarkovChain.prototype.removeEdge = function(parent, child) {
  if (this.stateSpace.hasOwnProperty(parent) &&
    this.stateSpace[parent].edges.hasOwnProperty(child)) {
    this.stateSpace[parent].removeEdge(child);
    this.update_p_matrix();
  }
  else {
    error("Edge from " + parent + " to " + child + " does not exist");
  }
};

// Mapping from state to index (with respect to row indice in p_matrix)
MarkovChain.prototype.stateIndexMap = function() {
  var result = {}; 
  /** I think by default the keys are already ordered but will need further testing */
  var sortedSpace = sortObjKeys(this.stateSpace);
  var s_i = 0;
  for (let state in sortedSpace) {
      result[state] = s_i;
      s_i++;
  }
  return result;
};

// Mapping from index to state
// NOTE: the state to index map is a bijection; 
// thus, we can simply invert the index to state map to get an index to state map
MarkovChain.prototype.indexStateMap = function() {
  var result = {};
  for(var state in this.stateIndexMap()){
    result[this.stateIndexMap()[state]] = state;
  }
  return result;
};

/** NOTE: transition matrix indices are ordered lexographically */
// Update transition matrix
MarkovChain.prototype.update_p_matrix = function() {
  var stateIndexMap = this.stateIndexMap();
  
  var n = Object.keys(this.stateSpace).length;
  this.p_matrix = Array(n);
  for (let state = 0; state < n; state++) {
    this.p_matrix[state] = Array(n).fill(0);
  }
  var stateIndex = 0;
  for (let state in this.stateSpace) {
    for (var pIndex = 0; pIndex < n; pIndex++) {
      for (var i in this.stateSpace[state].edges) {
        if (pIndex === stateIndexMap[i]) {
          this.p_matrix[stateIndex][pIndex] = this.stateSpace[state].edges[i];
        }
      }
    }
    stateIndex += 1;
  }
};

// Return True iff from any given state, all other states are reachable
// equivalently: irreducible iff every state has at least one inward edge (non-self loop) and outward edge to some other state
// => can analyze stochastic matrix instead of performing a BFS
MarkovChain.prototype.irreducible = function() {
  let hasInward = Array(Object.keys(this.stateSpace).length).fill(0); // bit array tracking existence of inward edge for each state
  let hasOutward = Array(Object.keys(this.stateSpace).length).fill(0);  // bit array tracking existence of outward edge for each state

  for (let i = 0; i < this.p_matrix.length; i++) {
    for (let j = 0; j < this.p_matrix[i].length; j++) {
      if (this.p_matrix[i][j] != 0 && hasInward[j] === 0 && i != j) hasInward[j] = 1;
      if (this.p_matrix[i][j] != 0 && i != j) hasOutward[i] = 1;
    }
  }
  return !(hasInward.includes(0) || hasOutward.includes(0));
}


// Return the period of the Markov chain or NULL if period is undefined (i.e. Markov chain is reducible)
MarkovChain.prototype.period = function() {
  if (!this.irreducible()) return "UNDEFINED";
  
  let queue = [];
  let visited = {};
  let level = {};
  for (let state in this.stateSpace) visited[state] = false;

  // begin BFS on an arbitrary state
  let state = Object.keys(this.stateSpace)[Math.floor(Math.random() * this.p_matrix.length)];

  // initialize set of nonTreeEdges as set of all edges in Markov chains
  // As we proceed with BFS, we will remove tree edges from this set
  let nonTreeEdges = new Set();
  for (let s in this.stateSpace) {
    for (let edge in this.stateSpace[s].edges) {
      nonTreeEdges.add({from: s, to: edge});
    }
  }

  queue.push(state);
  visited[state] = true;
  level[state] = 0;
  while (queue.length != 0) {
    state = queue.shift();

    for (let neighbor in this.stateSpace[state].edges) {
      if (!visited[neighbor] && neighbor !== state) {
        queue.push(neighbor);
        visited[neighbor] = true;
        level[neighbor] = level[state] + 1;
        nonTreeEdges.forEach(edge => { if (edge.from == state && edge.to == neighbor) nonTreeEdges.delete(edge); });
      }
    }
  }

  let g = null;
  nonTreeEdges.forEach(edge => {
    if (!g) g = level[edge.from] - level[edge.to] + 1;
    else {
      g = gcd(g, level[edge.from] - level[edge.to] + 1);
      if (g == 1) return g;
    }
  });
  return g;
}

// Update value of state oldValue as well as keys of edge objects for all states
MarkovChain.prototype.updateValue = function(oldValue, newValue) {
  if (oldValue == newValue) return;
  if (this.stateSpace.hasOwnProperty(newValue)) {
    error("State " + newValue + " already exists");
    return;
  }
  this.stateSpace[newValue] = this.stateSpace[oldValue];
  this.stateSpace[newValue].value = newValue;

  this.selected = this.selected == oldValue ? newValue : this.selected;
  this.current = this.current == oldValue ? newValue : this.current;

  for (let state in this.stateSpace) {
    if (this.stateSpace[state].edges.hasOwnProperty(oldValue)) {
      let p = this.stateSpace[state].edges[oldValue];
      this.stateSpace[state].edges[newValue] = p;
      delete this.stateSpace[state].edges[oldValue];
    }
  }
  delete this.stateSpace[oldValue];
  this.update_p_matrix();
  print(this.stateSpace);
};

// Set/Update initial distribution
MarkovChain.prototype.setInitialDistribution = function(p_0) {
  if (!p_0 || p_0.length !== this.p_matrix.length) {
    error("Invalid input");
    return;
  }
  this.p_0 = p_0;
};

// Run simulation iff initial distribution is valid and Markov chain is complete
MarkovChain.prototype.runSimulation = function() {
  if (this.p_0 == null) {
    error("Specify an initial distribution");
    return;
  }
  let sum = 0;
  for (let i = 0; i < this.p_0.length; i++) {
    sum += this.p_0[i];
  }
  if (sum !== 1) {
    error("Initial distribution is invalid\nElements must sum to 1");
    return;
  }
  if (!this.isComplete()) {
    error("Markov Chain must be complete\nSum of all outward edge weights for each state must sum to 1");
    return;
  }
  if (!this.running) {
    this.running = true;
  }
};

// Pause simulation
MarkovChain.prototype.pauseSimulation = function() {
  if (this.running) {
    this.running = false;  
  }
}

// Stop simulation
MarkovChain.prototype.stopSimulation = function() {
  if (this.running) {
    this.running = false;  
    this.n = 0;
    this.t = 0;
  }
};

// Display transition matrix
MarkovChain.prototype.printP = function(x, y) {
  textSize(12);
  fill(0, 0, 0);
  textAlign(LEFT, CENTER);
  for (let row = 0; row < this.p_matrix.length; row++) {
    for (let col = 0; col < this.p_matrix[row].length; col++) {
      let scaleFactor = 35;
      text(this.p_matrix[row][col] + ", ", x + scaleFactor*col, y + row*scaleFactor);
    }
  }
};

// Return center of mass {x, y}
MarkovChain.prototype.centerOfMass = function() {
  var sum = [0, 0];
  var n = Object.keys(this.stateSpace).length;
  for (var state in this.stateSpace) {
    sum[0] += this.stateSpace[state].x;
    sum[1] += this.stateSpace[state].y;
  }
  return {
    x: sum[0] / n,
    y: sum[1] / n
  };
};

// Draw all states and edges of markov chain and handle simulation
MarkovChain.prototype.draw = function() {
  strokeWeight(3);
  stroke(0, 0, 0);
  for (let state in this.stateSpace) {
    var from = this.stateSpace[state];
    for (var edge in from.edges) {
      var to = this.stateSpace[edge];
      if (from.value === to.value) {
        drawSelfLoop(from.x, from.y, this.centerOfMass(), from.edges[edge]);    
      }
      else if (from.edges.hasOwnProperty(to.value) &&
               to.edges.hasOwnProperty(from.value)) {
                 drawCurvedArrow(from.x, from.y, to.x, to.y, this.centerOfMass(),from.edges[edge]);
      }
      else {
        drawArrow(from.x, from.y, to.x, to.y, this.centerOfMass(), from.edges[edge]); 
      }
    }
  }
  for (let state in this.stateSpace) {
    this.stateSpace[state].draw();  
  }
  
  if (!this.isComplete()) { this.stopSimulation(); }

  if (this.running && Object.keys(this.stateSpace).length > 0) {
    if (this.t === 0 && this.n === 0) {
      this.current = this.indexStateMap()[sample(this.p_0)];
    }
    this.t++;
    
    noStroke();
    fill(100, 100, 200, 150);
    ellipse(this.stateSpace[this.current].x, this.stateSpace[this.current].y, STATE_RADIUS*2, STATE_RADIUS*2);
    
    if (this.t % TIME_STEP === 0) {
      this.n++;
      this.current = this.indexStateMap()[sample(this.p_matrix[this.stateIndexMap()[this.current]])];
    }
  }
};

// Return true iff all outward edge weights of each state sum to exactly 1 """
MarkovChain.prototype.isComplete = function() {
  for (var state in this.stateSpace) {
    if (!(this.stateSpace[state].isComplete())) {
      return false;
    }
  }
  return true;
};

// Handle select and drag events
MarkovChain.prototype.handleSelect = function() {
  if (mouseIsPressed && this.selected === null) {
    let state;
    for (state in this.stateSpace) {
      if (this.stateSpace[state].isClicked()) {
        this.selected = state;
        this.stateSpace[state].selected = true;
      break;
      }
    }
  }
  if (this.selected !== null && this.stateSpace[this.selected].isClicked()) {
    this.stateSpace[this.selected].dragging = true;
    this.t_2 = 1;
  }
  
  if (!mouseIsPressed && this.t_2 !== 0) {
    this.stateSpace[this.selected].dragging = false;
    this.t_2 = 0;
  }
  if (this.selected !== null && this.stateSpace[this.selected].dragging) {
    this.stateSpace[this.selected].handleDrag();
  }
  else if (mouseIsPressed && this.selected !== null && !this.stateSpace[this.selected].isClicked() && !moduleClicked()) {
    this.stateSpace[this.selected].selected = false;
    this.selected = null;  
  }
};
