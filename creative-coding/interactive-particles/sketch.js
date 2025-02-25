let particles = [];
let textPoints = [];
let font;
let message = "Learn. Share. Repeat.";
let fontSize = 32;
let repelRadius = 100;
let repelStrength = 10;

function preload() {
  // Load a bold font for better text point extraction
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Bold.otf');
}

function setup() {
  // Create a full-window canvas
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  textSize(fontSize);
  textAlign(CENTER, CENTER);
  
  // Get the points that make up the text
  let textWidth = width * 0.8; // Limit text width to 80% of canvas
  let options = {
    sampleFactor: 0.3, // Increase for more detailed points
    simplifyThreshold: 0.0
  };
  
  // Get the points from the text
  textPoints = font.textToPoints(message, width/2 - textWidth/2, height/2, fontSize, options);
  
  // Create a particle for each point in the text
  for (let i = 0; i < textPoints.length; i++) {
    let pt = textPoints[i];
    let particle = new Particle(pt.x, pt.y);
    particles.push(particle);
  }
  
  // Add some extra particles to fill the space
  for (let i = 0; i < 200; i++) {
    let particle = new Particle(random(width), random(height));
    particles.push(particle);
  }
}

function draw() {
  background(15, 15, 26, 10); // Slight transparency for trails effect
  
  // Draw the text as a reference (slightly visible under particles)
  fill(30, 30, 50, 50);
  noStroke();
  text(message, width/2, height/2);
  
  // Update and display particles
  for (let particle of particles) {
    // Check if mouse is close to repel particles
    if (mouseIsPressed || (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)) {
      let d = dist(mouseX, mouseY, particle.pos.x, particle.pos.y);
      if (d < repelRadius) {
        let force = p5.Vector.sub(particle.pos, createVector(mouseX, mouseY));
        force.normalize();
        force.mult(repelStrength * (1 - d/repelRadius));
        particle.applyForce(force);
      }
    }
    
    particle.update();
    particle.display();
  }
}

// Resize the canvas when the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Recalculate text points
  let textWidth = width * 0.8;
  let options = {
    sampleFactor: 0.3,
    simplifyThreshold: 0.0
  };
  
  textPoints = font.textToPoints(message, width/2 - textWidth/2, height/2, fontSize, options);
  
  // Update particle target positions
  for (let i = 0; i < textPoints.length && i < particles.length; i++) {
    particles[i].target.x = textPoints[i].x;
    particles[i].target.y = textPoints[i].y;
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.target = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    this.acc = createVector();
    this.r = random(2, 5);
    this.maxSpeed = random(1, 3);
    this.maxForce = random(0.1, 0.5);
    this.isTextParticle = textPoints.some(pt => pt.x === x && pt.y === y);
    
    // Different colors for text particles vs. background particles
    if (this.isTextParticle) {
      this.color = color(100, 150, 255, 200); // Blue for text particles
    } else {
      this.color = color(255, 100, 100, 150); // Red for background particles
    }
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  update() {
    // Steering behavior to return to original position
    let desired = p5.Vector.sub(this.target, this.pos);
    let d = desired.mag();
    let speed = this.maxSpeed;
    
    if (d < 100) {
      // Slow down as we approach the target
      speed = map(d, 0, 100, 0, this.maxSpeed);
    }
    
    desired.setMag(speed);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    
    // Apply steering force
    this.applyForce(steer);
    
    // Update position
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Bounce off edges
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
  }
  
  display() {
    noStroke();
    
    // Change appearance based on distance from target
    let d = dist(this.pos.x, this.pos.y, this.target.x, this.target.y);
    let alpha = map(d, 0, 100, 255, 50);
    let size = map(d, 0, 100, this.r * 1.5, this.r * 0.5);
    
    // Draw particle
    fill(red(this.color), green(this.color), blue(this.color), alpha);
    ellipse(this.pos.x, this.pos.y, size, size);
    
    // Optional: draw a subtle connection line to the target for text particles
    if (this.isTextParticle && d < 50) {
      stroke(red(this.color), green(this.color), blue(this.color), 20);
      line(this.pos.x, this.pos.y, this.target.x, this.target.y);
    }
  }
}
