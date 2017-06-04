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
      forms: [],
      blocks: [],
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
          .render()
          .renderInput()
          .addListeners();
  build();
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
    value = parseInt(rule[1], 10);
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
  this.type = data.type;
  this.name = data.type.charAt(0).toUpperCase() + data.type.slice(1)+ ' ' +newId;
  this.rules = [];
  this.events = [];
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
    'min:0:%name% must be bigger or equal to %min%',
    'max:99:%name% must be smaller or equal to %min%'
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

Block.prototype.render = function() {
  var rootForBlocks = document.getElementById('activeInputs'),
      newInputBlock = document.createElement('li');
  newInputBlock.setAttribute('id', this.id);
  newInputBlock.setAttribute('class', 'inputBlock open');
  var markup = generateMarkupFor(this, 'BLOCK');
  newInputBlock.innerHTML = markup;
  rootForBlocks.insertBefore(newInputBlock, rootForBlocks.firstChild);
  return this;
}

Block.prototype.renderInput = function(rerender) {
  var rootForInputs = document.getElementById('fv-form');
  if (rerender) {
    var oldBlock = document.getElementById(this.formId),
        inputContainer = oldBlock.parentElement;
        errorContainer = inputContainer.querySelector('.errorContainer');
    inputContainer.innerHTML = '';
    oldBlock.placeholder = this.name;
    inputContainer.appendChild(oldBlock);
    inputContainer.appendChild(errorContainer);
  } else {
    inputContainer = document.createElement('div');
    inputContainer.setAttribute('class', 'inputContainer');
    rootForInputs.removeAttribute('class');
    var markup = generateMarkupFor(this, 'INPUT');
    inputContainer.innerHTML = markup;
  }
  rootForInputs.insertBefore(inputContainer, rootForInputs.firstChild);
  return this;
}

Block.prototype.getRuleValue = function(ruleName) {
  var value;
  for (var i = 0; i < this.rules.length; i++) {
    this.rules[i].name === ruleName ? value = this.rules[i].value : value = value;
  }
  return value;
}

Block.prototype.getRuleError = function(ruleName) {
  var error;
  for (var i = 0; i < this.rules.length; i++) {
    this.rules[i].name === ruleName ? error = this.rules[i].error : error = error;
  }
  return error;
}

Block.prototype.addListeners = function() {
  var block = document.getElementById(this.id),
      editables = block.querySelectorAll('input, textarea'),
      event;
  for (var i = 0; i < editables.length; i++) {
    event = new Event({
      type: 'keyup',
      handler: function(e) {
        var blockId = e.target.id.split('-'),
            field = blockId[2],
            blockId = blockId[0] + '-' + blockId[1],
            block = null;
        for (var i = 0; i < store.blocks.length; i++) {
          store.blocks[i].id === blockId ? block = store.blocks[i] : '';
        }
        if (block !== null && block instanceof Block) {
          block.update(field, e.target.value)
               .renderInput(true);
          build();
        }
      }
    });
    event.save(this);
    editables[i].addEventListener(event.type, event.handler, false);
  }
  return this;
}

Block.prototype.update = function(field, value) {
  var block = this;
  if (field === 'name') {
    this.name = value;
  } else {
    for (var i = 0; i < block.rules.length; i++) {
      if (block.rules[i].name !== field) {
        if (block.rules[i].name === field.split('.')[0]) {
          block.rules[i].error = value;
        }
      } else {
        switch (field) {
          case 'format':
          case 'match':
          case 'repeat':
            block.rules[i].error = value;
            break;
          default:
            block.rules[i].value = parseInt(value, 10);
        }
      }
    }
  }
  return block;
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

function Event(data) {
  this.type = data.type;
  this.handler = data.handler;
}

Event.prototype.save = function(block) {
  block.events.push(this);
}

function parseErrorVars(block) {
  var newRules = [];
  for (var i = 0; i < block.rules.length; i++) {
    var oldRule = block.rules[i],
    newRule = clone(oldRule);
    function clone(rule) {
      if (rule instanceof Object) {
        var ruleCopy = {};
        for (var attribute in rule) {
          if (rule.hasOwnProperty(attribute)) {
            ruleCopy[attribute] = rule[attribute];
          }
        }
        return ruleCopy;
      }
    }
    switch (true) {
      case oldRule.error.indexOf('%name%') !== -1:
        newRule.error = newRule.error.replace('%name%', block.name);
      case oldRule.error.indexOf('%min%') !== -1:
        newRule.error = newRule.error.replace('%min%', newRule.value);
      case oldRule.error.indexOf('%max%') !== -1:
        newRule.error = newRule.error.replace('%max%', newRule.value);
    }
    newRules.push(newRule);
  }
  return newRules;
}

function generateMarkupFor(block, elementType) {
  var markup = '';
  switch (elementType) {
    case 'BLOCK':
      var name   =  '<h3>'+block.name+'</h3>\n'
                 +  '<div class="inputSettings">\n'
                 +  '<div class="item">\n'
                 +  '<label for="'+block.id+"-name"+'">Input name</label>\n'
                 +  '<div class="itemContent">\n'
                 +  '<input id="'+block.id+"-name"+'" type="text" value="'+block.name+'"/>\n'
                 +  '</div>\n'
                 +  '</div>\n';

      var min    =  '<div class="item">\n'
                 +  '<label for="'+block.id+"-min"+'">Minimum value</label>\n'
                 +  '<div class="itemContent">\n'
                 +  '<input id="'+block.id+"-min"+'" type="number" value="'+block.getRuleValue('min')+'"/>\n'
                 +  '<label for="'+block.id+"-min.Error"+'">Error message:</label>\n'
                 +  '<textarea id="'+block.id+"-min.Error"+'" type="text">'+block.getRuleError('min')+'</textarea>\n'
                 +  '</div>\n'
                 +  '</div>\n';

      var max    =  '<div class="item">\n'
                 +  '<label for="'+block.id+"-max"+'">Maximum value</label>\n'
                 +  '<div class="itemContent">\n'
                 +  '<input id="'+block.id+"-max"+'" type="number" value="'+block.getRuleValue('max')+'"/>\n'
                 +  '<label for="'+block.id+"-max.Error"+'">Error message:</label>\n'
                 +  '<textarea id="'+block.id+"-max.Error"+'" type="text">'+block.getRuleError('max')+'</textarea>\n'
                 +  '</div>\n'
                 +  '</div>\n';

      var bl     =  '<div class="item">\n'
                 +  '<label for="'+block.id+"-bl"+'">Blacklist</label>\n'
                 +  '<div class="itemContent">\n'
                 +  '<span class="itemComment">Separated by comma. Characters are case sensitive.</span>\n'
                 +  '<input id="'+block.id+"-bl"+'" type="text" value="'+block.getRuleValue('bl')+'"/>\n'
                 +  '<label for="'+block.id+"-bl.Error"+'">Error message:</label>\n'
                 +  '<textarea id="'+block.id+"-bl.Error"+'">'+block.getRuleError('bl')+'</textarea>\n'
                 +  '</div>\n'
                 +  '</div>\n';

      var wl     =  '<div class="item">\n'
                 +  '<label for="'+block.id+"-wl"+'">Whitelist</label>\n'
                 +  '<div class="itemContent">\n'
                 +  '<span class="itemComment">Separated by comma. Characters are case sensitive.</span>\n'
                 +  '<input id="'+block.id+"-wl"+'" type="text" value="'+block.getRuleValue('wl')+'"/>\n'
                 +  '<label for="'+block.id+"-wl.Error"+'">Error message:</label>\n'
                 +  '<textarea id="'+block.id+"-wl.Error"+'">'+block.getRuleError('wl')+'</textarea>\n'
                 +  '</div>\n'
                 +  '</div>\n';

      var format =  '<div class="item">\n'
                 +  '<span>Errors</span>\n'
                 +  '<div class="itemContent">\n'
                 +  '<label for="'+block.id+"-format"+'">Error message:</label>\n'
                 +  '<textarea id="'+block.id+"-format"+'">'+block.getRuleError('format')+'</textarea>\n'
                 +  '</div>\n'
                 +  '</div>\n';

      var psw    =  '<div class="item">\n'
                 +  '<span>Errors</span>\n'
                 +  '<div class="itemContent">\n'
                 +  '<label for="'+block.id+"-match"+'">Error message:</label>\n'
                 +  '<textarea id="'+block.id+"-match"+'">'+block.getRuleError('match')+'</textarea>\n'
                 +  '<label for="'+block.id+"-repeat"+'">Error message:</label>\n'
                 +  '<textarea id="'+block.id+"-repeat"+'">'+block.getRuleError('repeat')+'</textarea>\n'
                 +  '</div>\n'
                 +  '</div>\n';
      switch (block.type) {
        case 'text':
          markup = markup.concat(name, min, max, bl, wl);
          break;
        case 'number':
          markup = markup.concat(name, min, max);
          break;
        case 'phone':
          markup = markup.concat(name, min, max, wl);
          break;
        case 'email':
          markup = markup.concat(name, format);
          break;
        case 'password':
          markup = markup.concat(name, min, max, bl, wl, psw);
          break;
      }
      break;
    case 'INPUT':
      var input,
          errorContainer =  '<ul class="errorContainer"></ul>';
      switch (block.type) {
        case 'text':
        case 'phone':
          input = '<input id="fv-'+block.id+'" class="fv-input" type="text" value="" placeholder="'+block.name+'"/>\n';
          break;
        case 'number':
          input = '<input id="fv-'+block.id+'" class="fv-input" type="number" value="" placeholder="'+block.name+'"/>\n';
          break;
        case 'email':
          input = '<input id="fv-'+block.id+'" class="fv-input" type="text" value="" placeholder="'+block.name+'"/>\n';
          break;
        case 'password':
          input = '<input id="fv-'+block.id+'" class="fv-input" type="password" value="" placeholder="'+block.name+'"/>\n'
                + '<input id="fv-'+block.id+'-repeat" class="fv-input" type="password" value="" placeholder="Repeat '+block.name+'"/>\n';
          break;
      }
      markup = markup.concat(input, errorContainer);
      break;
  }
  return markup;
}

function validateInput(e) {
  var input = e.target,
      errors = input.errors,
      blank = false,
      errorContainer = input.parentElement.querySelector('.errorContainer');
  function removeError(error) {
    for (var i = 0; i < errors.length; i++) {
      if (errors[i] === error) {
        errors.splice(i, 1);
      }
    }
  }
  if (input.value.length === 0) {
    errors = [];
    blank = true;
  } else {
    for (var i = 0; i < input.rules.length; i++) {
      var rule = input.rules[i];
      switch (rule.name) {
        case 'min':
          if (input.value < rule.value) {
            if (errors.indexOf(input.id + '-err-min.' + rule.error) === -1) {
              input.errors.push(input.id + '-err-min.' + rule.error);
            }
          } else {
            removeError(input.id+'-err-min.' + rule.error);
          }
        break;
        case 'max':
          if (input.value > rule.value) {
            if (errors.indexOf(input.id + '-err-max.' + rule.error) === -1) {
              input.errors.push(input.id + '-err-max.' + rule.error);
            }
          } else {
            removeError(input.id+'-err-max.' + rule.error);
          }
          break;
      }
    }
  }
  if (errors.length) {
    input.setAttribute('class', 'fv-input error');
    for (var i = 0; i < input.errors.length; i++) {
      errorContainer.innerHTML = '';
      var message = document.createElement('li');
      message.setAttribute('class', 'error');
      message.innerHTML = input.errors[i].split('.')[1];
      errorContainer.appendChild(message);
    }
  } else if (errors.length === 0 && blank === true) {
    input.setAttribute('class', 'fv-input');
    errorContainer.innerHTML = '';
  } else {
    input.setAttribute('class', 'fv-input passed');
    errorContainer.innerHTML = '';
  }
  return;
}

function build() {
  if (typeof form === 'undefined') {
    var form = document.getElementById('fv-form'),
    form = window.form = form;
  }
  form.inputs = form.querySelectorAll('.fv-input,.fv-number.error,.fv-number.passed');
  for (var i = 0; i < form.inputs.length; i++) {
    if (typeof form.inputs[i].hasEvent === 'undefined' || form.inputs[i].hasEvent === false) {
      form.inputs[i].addEventListener('keyup', validateInput, false);
      form.inputs[i].hasEvent = true;
    }
    form.inputs[i].errors = [];
    form.inputs[i].rules = [];
    for (var idx = 0; idx < store.blocks.length; idx++) {
      if (store.blocks[idx].formId === form.inputs[i].id) {
        form.inputs[i].rules = parseErrorVars(store.blocks[idx]);
      }
    }
  }
  return form;
}

window.onload = function() {
  createStore();
}
