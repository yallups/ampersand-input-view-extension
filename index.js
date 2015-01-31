'use strict';

var AmpInputView = require('ampersand-input-view');
var State = require('ampersand-state');
var extend = require('extend');

var InputView = AmpInputView.extend({
  constructor: function (opts) {
    opts = opts || {};

    if (opts.clean) this.clean = opts.clean;

    opts.tests || (opts.tests = []);
    opts.tests.push(function (val) {
      if (!val || this.maxlength == null) return;
      if (val.length > this.maxlength) return this.maxlengthExceededMessage.replace(':num', this.maxlength);
    });

    AmpInputView.apply(this, arguments);
  },

  props: {
    tests     : ['array', true],
    pattern   : 'string',
    maxlength : 'number',
    inputClass: 'string',
    disabled  : 'boolean',
    maxlengthExceededMessage: ['string', false, 'Value must be less than :num characters']
  },

  derived: {
    valid: {
      deps: ['value', 'tests'],
      fn  : function () {
        return !this.runTests();
      }
    }
  },

  children: {
    attrs: State.extend({extraProperties: 'allow'})
  },

  bindings: extend({}, AmpInputView.prototype.bindings, {
    'validityClass': {
      type: 'class'
    },
    'inputClass'   : {
      type    : 'class',
      selector: 'input, textarea'
    },
    'disabled'     : {
      type    : 'booleanAttribute',
      selector: 'input',
      name    : 'disabled'
    }
  }),

  render          : function () {
    AmpInputView.prototype.render.apply(this, arguments);

    this.listenToAndRun(this, 'change:attrs', function () {
      for (var attr in this.attrs.all) {
        this.input.setAttribute(attr, this.attrs[attr]);
      }
    });

    this.on('all', function (event) {
      var attr, value;
      if (/^change:required/i.test(event)) {
        this.runTests();
      }
      if (/^change:attrs\./) {
        attr = event.split('.')[1];
        value = arguments[2];
        if (value != null) {
          this.input.setAttribute(attr, value);
        } else {
          this.input.removeAttribute(attr);
        }
      }
    });

    return this;
  },
  addTest         : function (testFunc) {
    if (typeof testFunc === 'function') {
      this.tests = this.tests.concat([testFunc]);
    } else if (typeof  testFunc === 'array') {
      for (var i in testFunc) {
        this.addTest(testFunc[i]);
      }
    }
  },
  handleTypeChange: function () {
    try {
      AmpInputView.prototype.handleTypeChange.apply(this, arguments);
    } catch (ex) { // IE isn't happy about using input types `date`, `month`, etc.

    }
  },
  disable         : function () {
    this.disabled = true;
  }
});

module.exports = InputView;