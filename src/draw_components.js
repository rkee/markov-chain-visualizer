function drawArrow(x1, y1, x2, y2, com, p) {
    stroke(EDGE_COLOR);
    strokeWeight(EDGE_THICKNESS);
    
    var parent = normalize(x1, y1, x2, y2, 1);
    var distance = dist(x1, y1, x2, y2);
    var child = normalize(x2, y2, x1, y1, 1);
    var arrowPivot = normalize(x2, y2, x1, y1, 1.2);
    line(parent.x, parent.y, child.x, child.y);
    
    var mp = midpoint(x1, y1, x2, y2);
    var angle = atan2(mp.x - com.x, com.y - mp.y);

    push();
        translate(mp.x, mp.y);
        rotate(angle + 180);
        push();
            translate(0, STATE_RADIUS/1.5);
            rotate(-angle - 180);
            textFormat(EDGE_COLOR, LABEL_SIZE, CENTER);
            text(p, 0, 0);
        pop();
    pop();
    
    angle = atan2(arrowPivot.x - parent.x, parent.y - arrowPivot.y);
    push();
        translate(arrowPivot.x, arrowPivot.y);
        rotate(angle);
        fill(EDGE_COLOR);
        noStroke();
        triangle(-STATE_RADIUS/6, STATE_RADIUS/5, STATE_RADIUS/6, STATE_RADIUS/5, 0, -STATE_RADIUS/6);
    pop();
}

/** IDEA: to draw self loops on opposite side of other edges, compute angle from state to center of mass*/
function drawSelfLoop(x, y, com, p) {
    // angle from {x, y} to the center of mass
    var angle = atan2(x - com.x, com.y - y);
    
    push();
        translate(x, y);
        rotate(angle + 180);
        
        push();
            translate(-STATE_RADIUS/2, STATE_RADIUS *2.5);
            rotate(-angle - 180);
            textFormat(EDGE_COLOR, LABEL_SIZE, CENTER);
            text(p, 0, 0);
        pop();
        
        noFill();
        strokeWeight(EDGE_THICKNESS);
        stroke(EDGE_COLOR);
        ellipse(0, STATE_RADIUS*1.5, STATE_RADIUS*1.5, STATE_RADIUS*1.5);
        
        noStroke();
        fill(EDGE_COLOR);
        push();
            translate(STATE_RADIUS-12, STATE_RADIUS+9);
            rotate(145);
            triangle(-8, 0, 8, 0, 0, 15);
        pop();
    pop();
}

function drawCurvedArrow(x1, y1, x2, y2, com, p) {
    var mp = midpoint(x1, y1, x2, y2);
    // "Normalize" our state x and y values to be on the edges of their surface
    var angle = atan2(x1 - mp.x , mp.y - y1);
    noFill();
    stroke(EDGE_COLOR);
    strokeWeight(EDGE_THICKNESS);
    
    var d1 = dist(mp.x, mp.y, x1, y1);
    var d2 = dist(mp.x, mp.y, x2, y2);

    push();
        translate(mp.x, mp.y);
        rotate(angle + 90);
        var cp1 = { x: -d1/2, y: STATE_RADIUS };
        var cp2 = { x: d2/2, y: STATE_RADIUS };
        
        bezier(-d1, 0, cp1.x, cp1.y, cp2.x, cp2.y, d2, 0);

        var x = bezierPoint(-d1, cp1.x, cp2.x, d2, 1/2);
        var y = bezierPoint(0, cp1.y, cp2.y, 0, 1/2);
        
        var arrowAngle = atan2(-d1 - x, y);
        push();
            translate(x, y);
            rotate(arrowAngle);
            fill(EDGE_COLOR);
            noStroke();
            triangle(STATE_RADIUS/12,  STATE_RADIUS/4, -STATE_RADIUS/4, -STATE_RADIUS/8, STATE_RADIUS/8, -STATE_RADIUS/4);
        pop();
        
        push();
            translate(0, STATE_RADIUS/3);
            rotate(-angle-90);
            fill(EDGE_COLOR);
            textFormat(EDGE_COLOR, LABEL_SIZE, CENTER);
            text(p, 0, 0);
        pop();
    pop();
}
