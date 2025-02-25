let particles = [];
let textPoints = [];
let font;
let message = "Akshansh";
let fontSize = 72; // Much larger font size
let repelRadius = 120;
let repelStrength = 12;
let sampleFactor = 0.15; // Lower for more points/detail

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
  
  // Extract points from the text
  createTextPoints();
}

function createTextPoints() {
  // Clear previous particles
  particles = [];
  
  // Get the points that make up the text
  let options = {
    sampleFactor: sampleFactor, // More detailed points
    simplifyThreshold: 0.0
  };
  
  // Center the text
  let bounds = font.textBounds(message, 0, 0, fontSize);
  let x = width/2 - bounds.w/2;
  let y = height/2 + bounds.h/4; // Adjust for baseline
  
  // Get the points from the text
  textPoints = font.textToPoints(message, x, y, fontSize, options);
  
  // Create a particle for each point in the text
  for (let i = 0; i < textPoints.length; i++) {
    let pt = textPoints[i];
    let particle = new Particle(pt.x, pt.y);
    particles.push(particle);
  }
  
  // Log the number of particles to confirm density
  console.log("Number of particles:", particles.length);
}

function draw() {
  background(15, 15, 26, 10); // Slight transparency for trails effect
  
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
  createTextPoints(); // Recalculate text points
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(random(width), random(height));
    this.target = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    this.acc = createVector();
    this.r = random(3, 6); // Slightly larger particles
    this.maxSpeed = random(2, 4);
    this.maxForce = random(0.2, 0.6);
    this.color = color(100, 150, 255, 200); // Blue color for all particles
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
  }
}
