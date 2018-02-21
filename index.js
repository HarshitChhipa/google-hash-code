var fs = require('fs');
var createInterface = require('readline').createInterface;
var createReadStream = fs.createReadStream;
var EOL = require('os').EOL;

var files = [
  'example',
  'small',
  'medium',
  'big',
];

var file = files[process.argv.length > 2 ? parseInt(process.argv[2]) : 3];

var lineReader = createInterface({
  input: createReadStream('in/' + file + '.in'),
});

class Pizza {
  constructor() {
    this.rows = 0;
    this.cols = 0;
    this.l = 0;
    this.max = 0;
    this.cells = [];
    this.all = [];
    this.slices = [];
  }

  log() {
    console.log(EOL);
    for (var y = 0; y < this.rows; y += 1) {
      for (var x = 0; x < this.cols; x += 1) {
        process.stdout.write(this.getCell(x, y).busy ? 'X' : 'O');
      }
      console.log(EOL);
    }
  }

  getCell(x, y) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return null;
    return this.cells[y][x];
  }

  takeSlice(cell, w, h) {
    const cells = [];
    const ingredients = { M: 0, T: 0 };
    for (var x = cell.x; x < cell.x + w; x += 1) {
      for (var y = cell.y; y < cell.y + h; y += 1) {
        const cell = this.getCell(x, y);
        if (!cell || cell.busy) return null;
        ingredients[cell.t] += 1;
        cells.push(cell);
      }
    }
    if (ingredients.M < this.l || ingredients.T < this.l) return null;
    cells.forEach((c) => { c.busy = true; });
    this.slices.push({
      cells,
      out: [cell.y, cell.x, cell.y + h - 1, cell.x + w - 1],
    });
  }
}

var pizza = new Pizza();

var count = 0;

function readDescLine(line) {
  var values = line.split(' ');
  pizza.rows = parseInt(values[0], 10);
  pizza.cols = parseInt(values[1], 10);
  pizza.l = parseInt(values[2], 10);
  pizza.max = parseInt(values[3], 10);
}

class Cell {
  constructor(x, y, t) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.busy = false;
  }
}

function readPizzaLine(line) {
  var pieces = line.split('');
  pizza.cells.push(pieces.map((piece, x) => {
    const cell = new Cell(x, pizza.cells.length, piece);
    pizza.all.push(cell);
    return cell;
  }));
}

function divisors(n) {
  var c = [];
  var map = {};
  for (var i = 1; i < n; i++) {
    if (n%i === 0) {
      var f = i;
      var s = n/i;
      if (!map[`${f}-${s}`]) {
        map[`${f}-${s}`] = true;
        c.push([f, s]);
      }
      if (!map[`${s}-${f}`]) {
        map[`${s}-${f}`] = true;
        c.push([s, f]);
      }
    }
  }
  return c;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function start() {

  var mushrooms = pizza.all.filter(c => c.t === 'M').length;
  var tomatoes = pizza.all.length - mushrooms;
  console.log('mushrooms/tomatoes', mushrooms, tomatoes);
  var divs = [];
  for (var i = pizza.max; i >= pizza.l*2; i--) {
    divs = divs.concat(divisors(i));
  }

  pizza.all.forEach((cell) => {
    divs.forEach((d) => {
      var w = d[0];
      var h = d[1];
      pizza.takeSlice(cell, w, h);
    })
  });

  points();
  write();
}

function points() {
  console.log('points', pizza.all.filter(c => c.busy).length, pizza.all.length);
}

function write() {
  var out = `${pizza.slices.length}`;
  pizza.slices.forEach(slice => {
    out = `${out}
${slice.out.join(' ')}`;
  });
  fs.writeFile(`out/${file}.out`, out, () => {});
}

lineReader.on('line', function (line) {
  if (count === 0) readDescLine(line);
  else readPizzaLine(line);
  count++;
  if (count === 1 + pizza.rows) start();
});