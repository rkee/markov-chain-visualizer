var initialized = 0; // Edit console input objects
var initialized2 = 0; // Add state input object
var initialized3 = 0; // Edges input objects
var inputValue;
var edgeAddInput;
var edgeAddPInput;
var stateAddInput;

var edgeValueInput = [];

var tSize = 15;

function editConsole(x, y, w, h, m) {
  if (initialized2 === 0) {
    stateAddInput = new textInput();
    initialized2 = 1;
  }
  fill(200, 200, 200);
  noStroke();
  rect(x, y, w, h);
  fill(230);
  rect(x, y, w, 25);
  textFormat(color(0, 0, 0), tSize, LEFT);
  text("Edit Console", x + w/15, y + 15);

  fill(230);
  rect(x + w/24, y + 35, w - w/12, 30);

  if (!m.selected) {
    textFormat(color(0, 0, 0), tSize, LEFT);
    text("No state selected", x + w/15, y + 50);

    fill(230);
    rect(x + w/24, y + 80, w - w/12, 60);
    textFormat(color(0, 0, 0), tSize, LEFT);
    text("Add state", x + w/15, y + 95);
    stateAddInput.position(x + w/15, y + 110);
    stateAddInput.width(50);
    stateAddInput.changed(function() {
      m.addState(stateAddInput.text, windowWidth/2, windowHeight/2);
    });
    stateAddInput.render();

    initialized3 = 0;
    edgeValueInput = [];
  } else {
    if (initialized === 0) {
      inputValue = new textInput();
      edgeAddInput = new textInput();
      edgeAddPInput = new textInput();      
      initialized = 1;
    }

    rectMode(CENTER);
    fill(0, 0, 0);
    text("State " + m.selected, x + w/15, y + 50);

    if (button(x + w/2, y + 50, w/4, 20, "remove", 14, color(200, 0, 0), color(150, 0, 0), color(255, 255, 255))) {
      m.removeState(m.selected);
      return;
    }

    rectMode(CENTER);
    fill(230);
    rect(x + w/2, y + 100, w - w/12, 50);
    fill(0, 0, 0);
    textFormat(color(0, 0, 0), tSize, LEFT);
    text("Value", x + w/15, y + 88);
    
    inputValue.position(x + w/15, y + 98);
    inputValue.width(50);
    inputValue.changed(function() { 
      m.updateValue(m.selected, inputValue.text); 
    });
    inputValue.render();
    if (button(x + w/3 + 5, y + 108, 30, 20, "update", 9, color(100), color(50), color(255)) && inputValue.text.length > 0) {
      m.updateValue(m.selected, inputValue.text); 
    }

    rectMode(CORNER);
    fill(230);
    rect(x + w/24, y + 195, w - w/12, 30 + 30 * m.p_matrix.length);
    rectMode(CENTER);
    textFormat(color(0, 0, 0), tSize, LEFT);
    text("Edge to", x + w/15, y + 210);

    rectMode(CORNER);
    fill(230);
    rect(x + w/24, y + 135, w - w/12, 50);
    fill(0, 0, 0);
    textFormat(color(0, 0, 0), tSize, LEFT);
    text("Add Edge", x + w/15, y + 148);
    
    textFormat(color(0, 0, 0), tSize/1.2, LEFT);
    text("to", x + 16, y + 168);
    text("p", x + 90, y + 168);
    
    edgeAddInput.position(x + 35, y + 158);
    edgeAddInput.width(40);
    edgeAddInput.render();

    edgeAddPInput.position(x + 105, y + 158);
    edgeAddPInput.width(40);
    edgeAddPInput.render();

    if (button(x + 7*w/10, y + 168, 20, 20, "+", 15, color(0, 0, 200), color(0, 150, 0), color(255, 255, 255)) && edgeAddInput.text.length > 0) {
      m.addEdge(m.selected, edgeAddInput.text, parseFloat(edgeAddPInput.text));
      initialized3 = 0;
    }

    if (initialized3 === 0) {
      for (let i = 0; i < Object.keys(m.stateSpace[m.selected].edges).length; i++) {
        edgeValueInput.push(new textInput());
      }
      initialized3 = 1;
    }

    let i = 0;
    for (let edge in m.stateSpace[m.selected].edges) {
      textFormat(color(0, 0, 0), tSize, LEFT);
      text(edge, x + w/15, y + 235 + i*30);

      edgeValueInput[i].position(x + w/6, y + 225 + i*30);
      edgeValueInput[i].width(50);
      edgeValueInput[i].changed(function() { 
        m.stateSpace[m.selected].edges[edge] = edgeValueInput[i].text; 
        m.update_p_matrix();
      });
      edgeValueInput[i].render();

      if (button(x + w/2.1, y + 235 + i*30, 30, 20, "update", 9, color(100), color(50), color(255)) && edgeValueInput[i].text.length > 0) {
        m.stateSpace[m.selected].edges[edge] = edgeValueInput[i].text; 
        m.update_p_matrix();
      }

      if (button(x + w/1.6, y + 235 + i*30, 20, 20, "X", 12, color(200, 0, 0), color(150, 0, 0), color(255))) {
        m.removeEdge(m.selected, edge);
      }
      i++;
    }
  }
}

var buttonState = "▶";
// (x, y) is centered in middle of rect
function simulationConsole(x, y) {
  if (button(x - 20, y + 40, 30, 30, buttonState, 15, color(0, 0, 200, 150), color(0, 0, 150, 150), color(255, 255, 255, 150))) {
    if (buttonState === "▶") {
      buttonState = "| |";
      m.runSimulation();
    }
    else {
      buttonState = "▶";
      m.pauseSimulation();
    }
  }

  if (button(x + 20, y + 40, 30, 30, "■", 25, color(200, 0, 0, 150), color(150, 0, 0, 150), color(255, 255, 255, 150))) {
    m.stopSimulation();
    if (buttonState === "| |") buttonState = "▶";
  }

  textFormat(color(0, 0, 0), 22, CENTER);
  text("π0 = [" + m.p_0Fraction() + "]", x, y - 10);
  text("n = " + m.n, x, y + 15);
  rectMode(CORNER);
}

function statsConsole(x, y, w, h) {
  fill(200, 200, 200);
  noStroke();
  rect(x, y, w, h);
  fill(230);
  rect(x, y, w, 25);
  textFormat(color(0, 0, 0), tSize, LEFT);
  text("Info Console", x + w/15, y + 15);

  fill(230);
  rect(x + w/24, y + 40, w - w/12, 100);
  textFormat(color(0, 0, 0), tSize, LEFT); 
  text("X = {" + Object.keys(m.stateSpace) + "}", x + w/14, y + 55);
  text("Complete: " + m.isComplete(), x + w/14, y + 80);
  text("Irreducible: " + m.irreducible(), x + w/14, y + 105);
  text("Period = " + m.period(), x + w/14, y + 130);

  fill(230);
  rect(x + w/24, y + 40 + 115, w - w/12, 30 + m.p_matrix.length * 35);
  textFormat(color(0, 0, 0), tSize, CENTER);
  text("Stochastic Matrix", x + w/3.2, y + 55 + 115);
  textAlign(LEFT, LEFT);
  text("P = ", x + w/12, y + 115 + 115);
  m.printP(x + w/4, y + 80 + 115);

}