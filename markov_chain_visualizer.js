/**
 * Works Cited:
 * - Finding closest point on circle to point outside of circle: https://math.stackexchange.com/questions/127613/closest-point-on-circle-edge-from-point-outside-inside-the-circle
 * - Sort an object's keys/properties: https://gist.github.com/CFJSGeek/5550678
*/

const STATE_RADIUS = 40;
var EDGE_COLOR;
const EDGE_THICKNESS = 2;
const LABEL_SIZE = STATE_RADIUS / 3;
const TIME_STEP = 60; // number of frames per time step in simulation
var EDIT_CONSOLE, STATS_CONSOLE;
var MODULES;

var m = new MarkovChain();

function renderObjects(m) {
    m.draw();
    m.handleSelect();
}

var testTarget;
var testInput;
function setup() {
  createCanvas(windowWidth, windowHeight);
  EDGE_COLOR = color(150, 150, 150);
  EDIT_CONSOLE = {
    x: 6*windowWidth/7 - 50,
    y: 20,
    w: 250,
    h: 240 + m.p_matrix.length*30
  };
  STATS_CONSOLE = {
    x: 6*windowWidth/7 - 50,
    y: 20,
    w: 250,
    h: 200
  };
  MODULES = [EDIT_CONSOLE, STATS_CONSOLE];
  angleMode(DEGREES);

  m.addState('A', windowWidth / 2, windowHeight / 4);
  m.addState('B', windowWidth / 3, 2*windowHeight / 3);
  m.addState('C', 2*windowWidth / 3, 2*windowHeight / 3);

  m.addEdge('A', 'A', 0.5);
  m.addEdge('A', 'B', 0.25);
  m.addEdge('A', 'C', 0.25);
  m.addEdge('B', 'A', 0.025);
  m.addEdge('B', 'B', 0.9);
  m.addEdge('B', 'C', 0.075);
  m.addEdge('C', 'A', 0.05);
  m.addEdge('C', 'B', 0.15);
  m.addEdge('C', 'C', 0.8);

  m.setInitialDistribution([1/3, 1/3, 1/3]);
}

function draw() {
  EDIT_CONSOLE.x = 6*windowWidth/7 - 50;
  EDIT_CONSOLE.h = 240 + m.p_matrix.length*30;
  STATS_CONSOLE.x = 25;
  STATS_CONSOLE.h = 190 + m.p_matrix.length*40;
  background(255, 255, 255);
  renderObjects(m);
  editConsole(EDIT_CONSOLE.x, EDIT_CONSOLE.y, EDIT_CONSOLE.w, EDIT_CONSOLE.h, m);
  simulationConsole(windowWidth/2, 25);
  statsConsole(STATS_CONSOLE.x, STATS_CONSOLE.y, STATS_CONSOLE.w, STATS_CONSOLE.h);
}
