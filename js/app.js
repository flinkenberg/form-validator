document.getElementById('builderNewMenu').onclick = function(e) {
  e.preventDefault();
  this.className !== 'open' ? this.className = 'open' : this.removeAttribute('class');
}
document.getElementById('builderNewText').onclick = function(e) {
  e.preventDefault();
  createBlock('text');
}
document.getElementById('builderNewNumber').onclick = function(e) {
  e.preventDefault();
  createBlock('number');
}
document.getElementById('builderNewTel').onclick = function(e) {
  e.preventDefault();
  createBlock('phone');
}
document.getElementById('builderNewEmail').onclick = function(e) {
  e.preventDefault();
  createBlock('email');
}
document.getElementById('builderNewPassword').onclick = function(e) {
  e.preventDefault();
  createBlock('password');
}

function createStore() {
  if (typeof window.store === 'undefined') {
    window.store = {
      getState: function() {return this},
      blocks: [],
      events: [],
      text: 0,
      number: 0,
      phone: 0,
      email: 0,
      password: 0
    }
  }
}

function createBlock(type) {
  var newBlock;
  switch (type) {
    case 'text':
      newBlock = new TextBlock;
      break;
    case 'number':
      newBlock = new NumberBlock;
      break;
    case 'phone':
      newBlock = new PhoneBlock;
      break;
    case 'email':
      newBlock = new EmailBlock;
      break;
    case 'password':
      newBlock = new PasswordBlock;
      break;
  }
  newBlock.save();
}

function makeRules(data) {
  var name,
      value,
      error,
      rule,
      rules = [];
  for (var i = 0; i < data.length; i++) {
    rule = data[i].split(':');
    name = rule[0];
    value = rule[1];
    error = rule[2];
    rule = new Rule(name, value, error);
    rules.push(rule);
  }
  return rules;
}

function Block(data) {
  var newId = store[data.type];
  newId++;
  store[data.type]++;
  this.id = data.type + '-' + newId;
  this.formId = 'fv-'+this.id;
  this.name = data.type.charAt(0).toUpperCase() + data.type.slice(1)+ ' ' +newId;
  this.rules = [];
}

function TextBlock(data) {
  Block.call(this, {
    type: 'text'
  });
  this.rules = makeRules([
    'min:0:%name% is too short.',
    'max:10:%name% is too long.',
    'bl: :%name% contains invalid characters.',
    'wl: :%name% contains invalid characters.'
  ]);
  this.blIsActive = false;
  this.wlIsActive = false;
}

function NumberBlock(data) {
  Block.call(this, {
    type: 'number'
  });
  this.rules = makeRules([
    'min:0:%name% must be bigger than %min%',
    'max:99:%name% must be bigger than %min%'
  ]);
}

function PhoneBlock(data) {
  Block.call(this, {
    type: 'phone'
  });
  this.rules = makeRules([
    'min:10:%name% must have %min% to %max% digits.',
    'max:11:%name% must have %min% to %max% digits.',
    'bl: :%name% contains invalid characters.',
    'wl:+,-,(,):%name% contains invalid characters.'
  ]);
  this.blIsActive = false;
  this.wlIsActive = true;
}
function EmailBlock(data) {
  Block.call(this, {
    type: 'email'
  });
  this.rules = makeRules([
    'format: :%name% is not in a valid format.'
  ]);
}
function PasswordBlock(data) {
  Block.call(this, {
    type: 'password'
  });
  this.rules = makeRules([
    'min:6:%name% is too short.',
    'max:20:%name% is too long.',
    'bl:1,!:%name% contains invalid characters.',
    'wl: :%name% contains invalid characters.',
    'match: :Passwords don\'t match.',
    'repeat: :Please repeat new password.'
  ]);
}

Block.prototype.save = function() {
  store.blocks.push(this);
  return this;
}

TextBlock.prototype = Object.create(Block.prototype);

NumberBlock.prototype = Object.create(Block.prototype);

PhoneBlock.prototype = Object.create(Block.prototype);

EmailBlock.prototype = Object.create(Block.prototype);

PasswordBlock.prototype = Object.create(Block.prototype);

function Rule(name, value, error) {
  this.name = name;
  this.value = value;
  this.error = error;
}

window.onload = function() {
  createStore();
}
