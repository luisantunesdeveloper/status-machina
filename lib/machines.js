'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _Promise = require('bluebird');

var StateMachine =
/*#__PURE__*/
function () {
  function StateMachine(states, initialState) {
    _classCallCheck(this, StateMachine);

    this.states = states;

    this._setInitialState(initialState);
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
                _context.next = 2;
                return this._transition(this.currentState, toState);

              case 2:
                return _context.abrupt("return", _context.sent);

              case 3:
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
      var _this = this;

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
                  return action(_this.data);

                case 3:
                  _this.data = _context2.sent;

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
    key: "_inputSanitization",
    value: function _inputSanitization(fromState, toState, input) {
      if (!this.states[fromState][toState] || !this.states[fromState][toState].on || !this.states[fromState][toState].on[input]) {
        throw new Error("Transition from ".concat(fromState, " to ").concat(toState, " does not have matching inputs!"));
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
    key: "_transition",
    value: function () {
      var _transition3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(fromState, toState) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this._basicSanitization(fromState, toState); // actions to execute before the transaction


                if (!this.states[fromState]) {
                  _context3.next = 4;
                  break;
                }

                _context3.next = 4;
                return this._executeActionsByActionType(fromState, toState, 'before');

              case 4:
                _context3.next = 6;
                return this._executeTransition(toState, this.states[toState].on && this.states[toState].on.actions);

              case 6:
                if (!this.states[fromState]) {
                  _context3.next = 9;
                  break;
                }

                _context3.next = 9;
                return this._executeActionsByActionType(fromState, toState, 'after');

              case 9:
                // notify every state listener
                this._notifyStateListeners(toState);

                return _context3.abrupt("return", _Promise.resolve({
                  currentState: this.currentState,
                  data: this.data
                }));

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _transition(_x3, _x4) {
        return _transition3.apply(this, arguments);
      }

      return _transition;
    }()
  }]);

  return StateMachine;
}();

var MealyStateMachine =
/*#__PURE__*/
function (_StateMachine) {
  _inherits(MealyStateMachine, _StateMachine);

  function MealyStateMachine(states, initialState) {
    _classCallCheck(this, MealyStateMachine);

    return _possibleConstructorReturn(this, _getPrototypeOf(MealyStateMachine).call(this, states, initialState));
  }

  _createClass(MealyStateMachine, [{
    key: "transition",
    value: function () {
      var _transition4 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(toState, input) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this._transitionMealy(this.currentState, toState, input);

              case 2:
                return _context4.abrupt("return", _context4.sent);

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function transition(_x5, _x6) {
        return _transition4.apply(this, arguments);
      }

      return transition;
    }()
  }, {
    key: "_transitionMealy",
    value: function () {
      var _transitionMealy2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(fromState, toState, input) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this._basicSanitization(fromState, toState);

                this._inputSanitization(fromState, toState, input); // execute the transaction


                _context5.next = 4;
                return this._executeTransition(toState, [this.states[fromState][toState].on[input]]);

              case 4:
                return _context5.abrupt("return", _Promise.resolve({
                  currentState: this.currentState,
                  data: this.data
                }));

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _transitionMealy(_x7, _x8, _x9) {
        return _transitionMealy2.apply(this, arguments);
      }

      return _transitionMealy;
    }()
  }]);

  return MealyStateMachine;
}(StateMachine);

var MooreStateMachine =
/*#__PURE__*/
function (_StateMachine2) {
  _inherits(MooreStateMachine, _StateMachine2);

  function MooreStateMachine(states, initialState) {
    _classCallCheck(this, MooreStateMachine);

    return _possibleConstructorReturn(this, _getPrototypeOf(MooreStateMachine).call(this, states, initialState));
  }

  _createClass(MooreStateMachine, [{
    key: "transition",
    value: function () {
      var _transition5 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(toState) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this._transitionMoore(this.currentState, toState);

              case 2:
                return _context6.abrupt("return", _context6.sent);

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function transition(_x10) {
        return _transition5.apply(this, arguments);
      }

      return transition;
    }()
  }, {
    key: "_transitionMoore",
    value: function () {
      var _transitionMoore2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(fromState, toState) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                this._basicSanitization(fromState, toState);

                this._outputSanitization(toState, this.states[toState]); // execute the transaction


                _context7.next = 4;
                return this._executeTransition(toState, [this.states[toState].on.outputs]);

              case 4:
                return _context7.abrupt("return", _Promise.resolve({
                  currentState: this.currentState,
                  data: this.data
                }));

              case 5:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function _transitionMoore(_x11, _x12) {
        return _transitionMoore2.apply(this, arguments);
      }

      return _transitionMoore;
    }()
  }, {
    key: "_outputSanitization",
    value: function _outputSanitization(toState, config) {
      if (!config.on || !config.on.outputs) {
        throw new Error("".concat(toState, " does should have outputs property defined!"));
      }
    }
  }]);

  return MooreStateMachine;
}(StateMachine);

module.exports = {
  StateMachine: StateMachine,
  MealyStateMachine: MealyStateMachine,
  MooreStateMachine: MooreStateMachine
};