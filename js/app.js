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
  newBlock.save()
}

function Block(data) {
  var newId = store[data.type];
  newId++;
  store[data.type]++;
  this.id = data.type + '-' + newId;
  this.name = data.type.charAt(0).toUpperCase() + data.type.slice(1)+ ' ' +newId;
  this.formData = {
    id: 'fv-'+this.id
  }
}

function TextBlock(data) {
  Block.call(this, {
    type: 'text'
  });
  this.min = 0;
  this.minError = '%name% is too short.';
  this.max = 10;
  this.maxError = '%name% is too long.';
  this.bl = '';
  this.blIsActive = false;
  this.blError = '%name% contains invalid characters.';
  this.wl = '';
  this.wlIsActive = false;
  this.wlError = '%name% contains invalid characters.';
}

function NumberBlock(data) {
  Block.call(this, {
    type: 'number'
  });
  this.min = 0;
  this.minError = '%name% is too short.';
  this.max = 10;
  this.maxError = '%name% is too long.';
  this.bl = '';
  this.blIsActive = false;
  this.blError = '%name% contains invalid characters.';
  this.wl = '';
  this.wlIsActive = false;
  this.wlError = '%name% contains invalid characters.';
}

function PhoneBlock(data) {
  Block.call(this, {
    type: 'phone'
  });
  this.min = 0;
  this.minError = '%name% is too short.';
  this.max = 10;
  this.maxError = '%name% is too long.';
  this.bl = '';
  this.blIsActive = false;
  this.blError = '%name% contains invalid characters.';
  this.wl = '';
  this.wlIsActive = false;
  this.wlError = '%name% contains invalid characters.';
}
function EmailBlock(data) {
  Block.call(this, {
    type: 'email'
  });
  this.min = 0;
  this.minError = '%name% is too short.';
  this.max = 10;
  this.maxError = '%name% is too long.';
  this.bl = '';
  this.blIsActive = false;
  this.blError = '%name% contains invalid characters.';
  this.wl = '';
  this.wlIsActive = false;
  this.wlError = '%name% contains invalid characters.';
}
function PasswordBlock(data) {
  Block.call(this, {
    type: 'password'
  });
  this.min = 0;
  this.minError = '%name% is too short.';
  this.max = 10;
  this.maxError = '%name% is too long.';
  this.bl = '';
  this.blIsActive = false;
  this.blError = '%name% contains invalid characters.';
  this.wl = '';
  this.wlIsActive = false;
  this.wlError = '%name% contains invalid characters.';
}
Block.prototype.save = function() {
  store.blocks.push(this);
  console.log(this, 'saved to store');
  return this;
}

TextBlock.prototype = Object.create(Block.prototype);

NumberBlock.prototype = Object.create(Block.prototype);

PhoneBlock.prototype = Object.create(Block.prototype);

EmailBlock.prototype = Object.create(Block.prototype);

PasswordBlock.prototype = Object.create(Block.prototype);

window.onload = function() {
  createStore();
}
