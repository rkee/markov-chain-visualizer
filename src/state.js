/** State class
 *  Data for a node in the Markov Chain 
 * @author Ryan Kee
 */
function State(value, x, y) {
    this.value = value;
    this.edges = {};  // mapping from neighbor state value to weight p
    this.x = x; 
    this.y = y;
    this.selected = false;
    this.dragging = false;
}

// Add directed edge from this to neighbor with weight p to edge mapping
State.prototype.addEdge = function(neighbor, p) {
    this.edges[neighbor] = p;
};
// Remove directed edge from this to neighbor from edge map
State.prototype.removeEdge = function(neighbor) {
    if (!this.edges.hasOwnProperty(neighbor)) {
        error("Edge from " + this.value + " to " + neighbor + " does not exist");
        return;
    }
    delete this.edges[neighbor];
};

// Return true iff weights of all edges from this state sum to exactly 1
State.prototype.isComplete = function() {
    var sum = 0;
    for (var i in this.edges) {
        sum += eval(this.edges[i]);
    }
    return Math.abs(1 - sum) < 0.001;
};

// Draw the state
State.prototype.draw = function() {
    fill(255, 255, 255);
    strokeWeight(2);
    if (this.selected) {
      stroke(255, 0, 0);  
    }
    else {
      stroke(0, 0, 0);
    }
    ellipse(this.x, this.y, STATE_RADIUS*2, STATE_RADIUS*2);
    textFormat(color(0, 0, 0), STATE_RADIUS, CENTER);
    stroke(0, 0, 0);
    text(this.value, this.x, this.y);
};

// Update x and y properties
State.prototype.handleDrag = function() {
  this.x = mouseX;
  this.y = mouseY;
};

// Return true if clicking on this state, otherwise return false
State.prototype.isClicked = function() {
  return mouseIsPressed && dist(mouseX, mouseY, this.x, this.y) <= STATE_RADIUS;
};
