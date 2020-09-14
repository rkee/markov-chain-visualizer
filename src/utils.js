/** Utility functions */

// Sample an indice from DISTRIBUTION and return that indice
// DISTRIBUTION is an array of probabilities that sum to 1 (PDF)
function sample(distribution) {
  var sample = random();
  var cumulativeSum = 0;
  var cdf = []; // cumulative distribution function
  for (let i = 0; i < distribution.length; i++) {
    cumulativeSum += distribution[i];
    cdf.push(cumulativeSum);
  }
  for (let i = 0; i < cdf.length; i++) {
    if (sample < cdf[i]) {
      return i;
    }
  }
}

// Return the midpoint {x, y} between two points
function midpoint(x1, y1, x2, y2) {
    return {
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2
    };
}

// "Normalizes" a state's cartesian coordinates as the closest point to target on the state's edge (scale = 1)
// {x, y}: center of circle
// target: point outside of circle
function normalize(x, y, targetX, targetY, scale) {
    var distance = dist(x, y, targetX, targetY);
    return {
        x: x + STATE_RADIUS * scale * ((targetX - x)/distance),
        y: y + STATE_RADIUS * scale * ((targetY - y)/distance)
    };
}

// Return a sorted copy of obj (sorted by keys)
function sortObjKeys(obj) {
    var ordered = {};
    Object.keys(obj).sort().forEach(function(key) {
        ordered[key] = obj[key];
    });
    return ordered;
    
}

// indicates color, textSize, and textAlign for text()
function textFormat(color, size, align) {
  fill(color);
  noStroke();
  textSize(size);
  textFont("Arial");
  textAlign(align, align);
}

var clickState = 0;
function button(x, y, w, h, label, tSize, color, hoverColor, textColor) {
  rectMode(CENTER);
  
  if (mouseX >= x - w/2 && mouseX <= x + w/2 && 
      mouseY >= y - h/2 && mouseY <= y + h/2) {
        fill(hoverColor)
  }
  else {
    fill(color);
  }
  rect(x, y, w, h, 10);
  rectMode(CORNER);

  textFormat(textColor, tSize, CENTER);
  text(label, x, y);
  if (clickState === 0 && mouseIsPressed && mouseX >= x - w/2 && mouseX <= x + w/2 && mouseY >= y - h/2 && mouseY <= y + h/2) {
      clickState = 1;
      return true;
  }
}

// Safeguard against deleting accidental edges
function mouseReleased() {
  if (clickState === 1) {
    clickState = 0;
  }
}

// Popup an alert window displaying msg
function error(msg) {
  textFormat(color(0, 0, 100), 50, CENTER);
  alert(msg);
}

// Return true iff a GUI module is being clicked
function moduleClicked() {
  for (let i = 0; i < MODULES.length; i++) {
    let x = MODULES[i].x;
    let y = MODULES[i].y;
    let w = MODULES[i].w;
    let h = MODULES[i].h;
    if (mouseIsPressed && mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h) {
      return true;
    }
  }
  return false;
}

// Lightweight substitute for createInput() using p5js funtions
function textInput() {
  this.x = 0;
  this.y = 0;
  this.size = 160;
  this.text = "";
  this.selected = false;
  this.t = 0;
  this.key = "";
  this.changedFunc = function() { return; };
}

textInput.prototype.position = function(x, y) {
  this.x = x;
  this.y = y;
};

textInput.prototype.width = function(width) {
  this.size = width;
};

textInput.prototype.changed = function(func) {
  this.changedFunc = func;
};

textInput.prototype.render = function() {
  this.handleSelect();
  this.handleInput();
  if (!this.selected) {
    stroke(80, 80, 80);
    strokeWeight(1);
  } else {
    stroke(0, 0, 0);
    strokeWeight(2);
  }
  fill(255, 255, 255);
  rectMode(CORNER);
  rect(this.x, this.y, this.size, 20, 2);

  if (this.selected && frameCount % 60 < 30) {
    stroke(0, 0, 0);
    strokeWeight(1);
    line(this.x + textWidth(this.text) + 5, this.y + 3, this.x + textWidth(this.text) + 5, this.y + 17);
  }

  fill(0, 0, 0);
  noStroke();
  textSize(39/3);
  textAlign(LEFT, CENTER);
  text(this.text, this.x + 4, this.y + 10);
}

textInput.prototype.handleSelect = function() {
  if (mouseIsPressed) {
    if (mouseIsPressed && mouseX >= this.x && mouseX <= this.x + this.size &&
        mouseY >= this.y && mouseY <= this.y + 20) {
      this.selected = true;
    } else {
      this.selected = false;
    }
  }
  if (mouseX >= this.x && mouseX <= this.x + this.size &&
      mouseY >= this.y && mouseY <= this.y + 20) {
    cursor(TEXT);
  } else {
    cursor(ARROW);
  }
};

textInput.prototype.handleInput = function() {
    if (this.selected && keyIsPressed && this.t === 0 && keyCode > 40 && keyCode <= 126 && keyCode !== 91 && textWidth(this.text) < this.size - 10) {
      this.text += key;
      this.key = key;
    }
    else if (this.selected && keyIsPressed && this.t === 0 && (keyCode < 32 || keyCode > 126)) {
      this.handleSpecial();
    }
    else if (this.t >= 30 && this.key === key && keyIsPressed && this.t % 2 === 0 && keyCode >= 32 && keyCode <= 126 && keyCode !== 91 && textWidth(this.text) < this.size - 10) {
      this.text += this.key;
    }
    else if (this.t >= 30 && this.key === key && this.t % 2 === 0 && (keyCode < 32 || keyCode > 126)) {
      this.handleSpecial();
    }
    
    if (keyIsPressed && this.selected) {
      this.t++;
    }
    if (!keyIsPressed || this.key !== key) {
      this.key = "";
      this.t = 0;
    }
}

textInput.prototype.handleSpecial = function() {
  if (keyIsDown(190) && textWidth(this.text) < this.size - 10) {
    this.text += '.';
  }
  else if (keyIsDown(189) && textWidth(this.text) < this.size - 10) {
    this.text += '-';
  }
  else if (keyIsDown(191) && textWidth(this.text) < this.size - 10) {
    this.text += '/';
  }
  else if (keyIsDown(BACKSPACE)) {
    this.text = this.text.substring(0, this.text.length - 1);
  }
  if (keyIsDown(ENTER) && this.text.length > 0) {
    this.changedFunc();
    this.text = "";
  }
  this.key = key;
};

// Credit
// https://github.com/peterolson/BigRational.js
function rationalize(rational, epsilon) {
  var denominator = 0;
  var numerator;
  var error;

  do {
      denominator++;
      numerator = Math.round((rational.numerator * denominator) / rational.denominator);
      error = Math.abs(rational.minus(numerator / denominator));
  } while (error > epsilon);
  return bigRat(numerator, denominator);
}

// Euclidean algorithm
function gcd(a, b) {
  if (b === 0) return a;
  return gcd(b, a % b);
}