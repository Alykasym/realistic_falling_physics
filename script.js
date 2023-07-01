// setup matter.js
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

var engine;
var audioURL = './falling_sound.wav';

document.addEventListener('DOMContentLoaded', function() {
  var inputField = document.getElementById('inputField');

  engine = Engine.create();

  engine.world.gravity.y = 0.25;

  Engine.run(engine);

  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
  }


  inputField.addEventListener('keyup', function(event) {
    if (event.key === ' ') {
      var words = inputField.value.trim().split(" ");
      var word = words[words.length - 1];  // get the last word
      if (word) {
        var audio = new Audio(audioURL);
        audio.play();

        var spaceWidth = getTextWidth(" ", "22px Arial");  // adjust the font as needed
        var previousWordsWidth = getTextWidth(inputField.value.substring(0, inputField.value.lastIndexOf(" ")), "22px Arial") + spaceWidth * (words.length - 2);  // adjust the font as needed
        var lastWordWidth = getTextWidth(word, "22px Arial");  // adjust the font as needed
        var inputFieldWidth = inputField.getBoundingClientRect().width;
  
        // limit the starting x-coordinate to the width of the input field
        var startX = Math.min(previousWordsWidth + (lastWordWidth / 2), inputFieldWidth);
        var fallingWord = Bodies.rectangle(
          startX,  // start at the middle of the last word
          window.innerHeight / 24,  // start in the center of the screen vertically
          word.length * 20,  // adjust as needed
          30,  // adjust as needed
          { 
            angle: Math.PI * (Math.random() - 0.5),  // initial rotation
            torque: Math.random() - 0.5,  // initial angular velocity
          }
        );

        var fallingDot = Bodies.circle(
          startX - 20,  // start at the middle of the last word, but 20 pixels to the left
          window.innerHeight / 24,  // start in the center of the screen vertically
          10,  // radius of the dot
          {
            // angle: Math.PI * (Math.random() - 0.5),  // initial rotation
            // torque: Math.random() - 0.5,  // initial angular velocity
          }
        );
        
        var elementWord = document.createElement('div');
        elementWord.textContent = word;
        elementWord.className = 'falling';
        elementWord.style.position = 'absolute';
        elementWord.style.left = (window.innerWidth / 3.8) - (word.length * 10) + 'px';
        elementWord.style.top = (window.innerHeight / 3) - 15 + 'px';
        document.body.appendChild(elementWord);
      
        var elementDot = document.createElement('div');
        elementDot.textContent = ',';
        elementDot.className = 'falling';
        elementDot.style.position = 'absolute';
        elementDot.style.left = (window.innerWidth / 3.8) - (word.length * 10) - 20 + 'px';
        elementDot.style.top = (window.innerHeight / 3) - 15 + 'px';
        document.body.appendChild(elementDot);

        fallingWord.element = elementWord;
        fallingDot.element = elementDot;

        World.add(engine.world, [fallingWord, fallingDot]);
      }
    } else if (event.key === 'Enter') {
        inputField.value = '';
    }
  });

  function update() {
    // synchronize positions of HTML elements with bodies
    for (var i = 0; i < engine.world.bodies.length; i++) {
      var body = engine.world.bodies[i];
      var element = body.element;
      if (element) {
        // convert from physical units to pixels and from radians to degrees
        var x = body.position.x;
        var y = body.position.y;
        var angle = body.angle * (180 / Math.PI);
        element.style.transform = 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'deg)';

        // fade out and remove elements that have moved off screen
        if (y > window.innerHeight - 100) {
          element.style.opacity = (window.innerHeight - y) / 100;
          if (y > window.innerHeight) {
            document.body.removeChild(element);
            World.remove(engine.world, body);
          }
        }
      }
    }

    // schedule next update
    requestAnimationFrame(update);
  }

  update();  // start the update loop
});
