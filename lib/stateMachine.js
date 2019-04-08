'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _Promise = require('bluebird');

var types = {
  mealy: 'mealy',
  moore: 'moore'
};

var StateMachine =
/*#__PURE__*/
function () {
  function StateMachine() {
    _classCallCheck(this, StateMachine);
  }

  _createClass(StateMachine, [{
    key: "attach",
    value: function attach(state, observerId, callback) {
      if (!this.states[state].on) {
        this.states[state].on = {};
      }

      if (!this.states[state].on.observers) {
        this.states[state].on.observers = {};
      }

      this.states[state].on.observers[observerId] = callback;
      return this;
    }
  }, {
    key: "configMealy",
    value: function configMealy(states) {
      this.type = types.mealy;
      return this.config(states);
    }
  }, {
    key: "configMoore",
    value: function configMoore(states) {
      this.type = types.moore;
      return this.config(states);
    }
  }, {
    key: "config",
    value: function config(states) {
      var _this = this;

      this._setStates(states);

      return function (initialState) {
        return _this._setInitialState(initialState);
      };
    }
  }, {
    key: "dettach",
    value: function dettach(state, observerId) {
      delete this.states[state].on.observers[observerId];
      return this;
    }
  }, {
    key: "dettachState",
    value: function dettachState(state) {
      for (var observerId in this.states[state].on.observers) {
        delete this.states[state].on.observers[observerId];
      }

      return this;
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.currentState;
    }
    /**
     * TODO: should we keep the data inside or build a new
     * store in order to diff the data from previousState
     * @param {*} initData
     */

  }, {
    key: "init",
    value: function init(initData) {
      this.data = initData;

      this._transition(undefined, this.initialState);

      return this;
    }
  }, {
    key: "transition",
    value: function () {
      var _transition2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(toState) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.type && this.type === types.moore)) {
                  _context.next = 4;
                  break;
                }

                _context.next = 3;
                return this._transitionMoore(this.currentState, toState);

              case 3:
                return _context.abrupt("return", _context.sent);

              case 4:
                if (!(this.type && this.type === types.mealy)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 7;
                return this._transitionMealy(this.currentState, toState);

              case 7:
                return _context.abrupt("return", _context.sent);

              case 8:
                _context.next = 10;
                return this._transition(this.currentState, toState);

              case 10:
                return _context.abrupt("return", _context.sent);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function transition(_x) {
        return _transition2.apply(this, arguments);
      }

      return transition;
    }()
  }, {
    key: "_basicSanitization",
    value: function _basicSanitization(fromState, toState) {
      if (!this.states[toState]) {
        throw new Error("".concat(toState, " does not exist!"));
      }

      if (fromState && toState && !this.states[fromState][toState]) {
        throw new Error("".concat(toState, " does not exist as a possible transition!"));
      }
    }
    /**
     * TODO: should we keep the data inside or build a new
     * store in order to diff the data from previousState
     * @param {*} actions
     */

  }, {
    key: "_executeActions",
    value: function _executeActions(actions) {
      var _this2 = this;

      return _Promise.map(actions,
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2(action) {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!action) {
                    _context2.next = 4;
                    break;
                  }

                  _context2.next = 3;
                  return action(_this2.data);

                case 3:
                  _this2.data = _context2.sent;

                case 4:
                  return _context2.abrupt("return", action);

                case 5:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        return function (_x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "_executeActionsByActionType",
    value: function _executeActionsByActionType(fromState, toState, actionType) {
      if (this.states[fromState][toState] && this.states[fromState][toState][actionType] && this.states[fromState][toState][actionType].length > 0) {
        return this._executeActions(this.states[fromState][toState][actionType]);
      }

      return _Promise.all([]);
    }
  }, {
    key: "_executeTransition",
    value: function _executeTransition(toState) {
      var actions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      this.currentState = toState;

      if (actions.length > 0) {
        return this._executeActions(actions);
      }

      return _Promise.all([]);
    }
  }, {
    key: "_outputSanitization",
    value: function _outputSanitization(toState, config) {
      if (!config.on || !config.on.outputs) {
        throw new Error("".concat(toState, " does should have outputs property defined!"));
      }
    }
  }, {
    key: "_notifyStateListeners",
    value: function _notifyStateListeners(state) {
      if (this.states[state] && this.states[state].on && this.states[state].on.observers && Object.keys(this.states[state].on.observers).length > 0) {
        for (var observerId in this.states[state].on.observers) {
          this.states[state].on.observers[observerId](this.data);
        }
      }

      return this;
    }
  }, {
    key: "_setInitialState",
    value: function _setInitialState(initialState) {
      this.initialState = initialState;
      return this;
    }
  }, {
    key: "_setStates",
    value: function _setStates(states) {
      this.states = states;
      return this;
    }
  }, {
    key: "_transitionMoore",
    value: function () {
      var _transitionMoore2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(fromState, toState) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this._basicSanitization(fromState, toState);

                this._outputSanitization(toState, this.states[toState]); // execute the transaction


                _context3.next = 4;
                return this._executeTransition(toState, [this.states[toState].on.outputs]);

              case 4:
                return _context3.abrupt("return", _Promise.resolve({
                  currentState: this.currentState,
                  data: this.data
                }));

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _transitionMoore(_x3, _x4) {
        return _transitionMoore2.apply(this, arguments);
      }

      return _transitionMoore;
    }()
  }, {
    key: "_transitionMealy",
    value: function () {
      var _transitionMealy2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(fromState, toState) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this._basicSanitization(fromState, toState);

                this._outputSanitization(toState, this.states[fromState][toState]); // execute the transaction


                _context4.next = 4;
                return this._executeTransition(toState, [this.states[fromState][toState].on.outputs]);

              case 4:
                return _context4.abrupt("return", _Promise.resolve({
                  currentState: this.currentState,
                  data: this.data
                }));

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _transitionMealy(_x5, _x6) {
        return _transitionMealy2.apply(this, arguments);
      }

      return _transitionMealy;
    }()
  }, {
    key: "_transition",
    value: function () {
      var _transition3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(fromState, toState) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this._basicSanitization(fromState, toState); // actions to execute before the transaction


                if (!this.states[fromState]) {
                  _context5.next = 4;
                  break;
                }

                _context5.next = 4;
                return this._executeActionsByActionType(fromState, toState, 'before');

              case 4:
                _context5.next = 6;
                return this._executeTransition(toState, this.states[toState].on && this.states[toState].on.actions);

              case 6:
                if (!this.states[fromState]) {
                  _context5.next = 9;
                  break;
                }

                _context5.next = 9;
                return this._executeActionsByActionType(fromState, toState, 'after');

              case 9:
                // notify every state listener
                this._notifyStateListeners(toState);

                return _context5.abrupt("return", _Promise.resolve({
                  currentState: this.currentState,
                  data: this.data
                }));

              case 11:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _transition(_x7, _x8) {
        return _transition3.apply(this, arguments);
      }

      return _transition;
    }()
  }]);

  return StateMachine;
}();

module.exports = StateMachine;