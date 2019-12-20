var w = 300;
var h = 500;

var paddleW = 50;
var paddleH = 10;
var ballW = 10;
var ballH = 10;

var x1 = (w-paddleW)/2;
var y1 = 50;

var x2 = (w-paddleW)/2;
var y2 = 450;

var d = 10;
var x3 = (w-ballW)/2;
var y3 = y1+paddleH+1;
var dir = 0; //0 is down 1 is up
var slope = -1;
var magnitude = 1;
var speed = 3;
var minVal = 0.7;

var game = 0;
var name = '';
var textB;
var button;
var score = 0;
var reset;
var click = 0;
var highScores;

var database;

function setup()
{

  var firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  database = firebase.database();
  firebase.analytics();


  createCanvas(w, h);
  background('#444444');

  button = createButton('Submit Highscore');
  button.position(88,400);
  button.mousePressed(submitScore);

  textB = createInput();
  textB.position(60,375);

  reset = createButton('Reset');
  reset.position(125,20);
  reset.mousePressed(resetGame);

  highScores = createElement('ol');
  highScores.position(75,h/4);
  highScores.style('color','#FFF');
  highScores.style('font-family', 'sans-serif');

  button.hide();
  textB.hide();
  reset.hide();
  highScores.hide();

  noStroke();
  fill(255);
  rect(0, y1, w, paddleH);
  rect(x2, y2, paddleW, paddleH);
  rect(x3, y3, ballW, ballH);
}

function draw() {
  clear();
  background('#444444');

  if(game == 0 && click == 0)
  {
    button.hide();
    textB.hide();
    reset.hide();
    highScores.hide();

    x2 = (w-paddleW)/2;
    y2 = 450;
    x3 = (w-ballW)/2;
    y3 = y1+paddleH+1;

    noStroke();
    fill(255);
    rect(0, y1, w, paddleH);
    rect(x2, y2, paddleW, paddleH);
    rect(x3, y3, ballW, ballH);
    fill(0,0,0,100);
    rect(0,0,w,h);
    fill(255,255,255,255);
    text('Click to Begin', w/2, h/2);
    textSize(40);
    textAlign(CENTER);
  }
  else if(game == 1)
  {
    button.hide();
    textB.hide();
    reset.hide();

    if(keyIsDown(LEFT_ARROW))
    {
      x2 -= 5;
      x2 = max(x2, 0);
    }
    if(keyIsDown(RIGHT_ARROW))
    {
      x2 += 5;
      x2 = min(x2, w-paddleW);
    }

    detectCollision();
    ballMove();
    //rect(x1, y1, paddleW, paddleH);
    noStroke();
    fill(255);
    rect(0, y1, w, paddleH);
    rect(x2, y2, paddleW, paddleH);
    rect(x3, y3, ballW, ballH);

    text(str(score), w/2, h/3);
    textSize(40);
    textAlign(CENTER);
  }
  else if(game == -1)
  {
    noStroke();
    fill(255);
    rect(0, y1, w, paddleH);
    rect(x2, y2, paddleW, paddleH);
    rect(x3, y3, ballW, ballH);
    fill(0,0,0,100);
    rect(0,0,w,h);
    fill(255,255,255,255);
    text('You Lose!', w/2, h/2);
    textSize(40);
    textAlign(CENTER);

    text(str(score), w/2, h/3);
    textSize(40);
    textAlign(CENTER);

    button.show();
    textB.show();
    reset.show();
  }
  else if(game == -2)
  {
    noStroke();
    fill(255);
    rect(0, y1, w, paddleH);
    rect(x2, y2, paddleW, paddleH);
    rect(x3, y3, ballW, ballH);
    fill(0,0,0,100);
    rect(0,0,w,h);
    fill(255,255,255,255);


    button.hide();
    textB.hide();
    reset.show();
  }
  else
  {
    noStroke();
    fill(255);
    rect(0, y1, w, paddleH);
    rect(x2, y2, paddleW, paddleH);
    rect(x3, y3, ballW, ballH);
    fill(0,0,0,100);
    rect(0,0,w,h);
    fill(255,255,255,255);
    text('Unexpected Error', w/2, h/2);
    textSize(40);
    textAlign(CENTER);
  }
}

function resetGame()
{
  game = 0;
  click = 0;
  score = 0;
}

function gotData(data)
{
  var scoreListings = selectAll('.scoreListing');
  for(var i = 0; i < scoreListings.length; i++)
  {
    scoreListings[i].remove();
  }

  var scores = data.val();
  var keys = Object.keys(scores);

  var toSort = [];
  for (var i = 0; i < keys.length; i++)
  {
    var k = keys[i];
    var submittedScore = scores[k].score;
    var submittedName = scores[k].name;
    var temp = [submittedName, submittedScore];
    toSort.push(temp);
  }

  var sorted = toSort.sort(function(a,b){return b[1]-a[1]});

  for (var i = 0; i < min(sorted.length,5); i++)
  {
    var li = createElement('li', '    ' + sorted[i][1] + '  -  ' + sorted[i][0]);
    li.class('scoreListing');
    li.parent(highScores);
  }
}

function errData(err)
{
  console.log('Error!');
  console.log(err);
}

function submitScore()
{
  var data = {
  	name: textB.value(),
	score: score,
    order: 1000000-score
  }
  var ref = database.ref('scores');
  ref.push(data);
  score = 0;
  button.hide();
  textB.hide();

  highScores.show();
  var ref = database.ref("scores/");
  ref.on('value', gotData, errData);
  game = -2;
}

function mouseClicked()
{
  if(mouseX >= 0 && mouseX <= w)
  {
    if(mouseY >= 0 && mouseY <= h)
    {
      if(click == 0)
      {
        game = 1;
        click = 1;
      }
    }
  }
}

function detectCollision()
{
  if(y3 <= y1+paddleH)
  {
    dir = 0;
    slope *= -1;
    magnitude = (2*random()+minVal);
  }
  if(y3 >= y2-paddleH)
  {
    if((x3 >= x2-ballW+1) && (x3 <= x2+paddleW-1))
    {
      dir = 1;
      slope *= -1;
      score++;
    }
    else
    {
      game = -1;
    }
  }
  if(x3 <= 0)
  {
    slope *= -1;
  }
  if(x3 >= w-ballW)
  {
    slope *= -1;
  }
}


function ballMove()
{
  if(dir == 0)
  {
    if(slope<0)
    {
      x3 += speed;
      y3 -= speed*slope*magnitude;
    }
    else
    {
      x3 -= speed;
      y3 += speed*slope*magnitude;
    }
  }
  else
  {
    if(slope<0)
    {
      x3 -= speed;
      y3 += speed*slope*magnitude;
    }
    else
    {
      x3 += speed;
      y3 -= speed*slope*magnitude;
    }
  }
}
