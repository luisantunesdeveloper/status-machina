'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var bluebird = require('bluebird');

var map = bluebird.map;

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
    /**
     * TODO: should we keep the data inside or build a new
     * store in order to diff the data from previousState
     * @param {*} actions
     */

  }, {
    key: "_executeActions",
    value: function _executeActions(actions) {
      var _this2 = this;

      return map(actions,
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

      return Promise.all([]);
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
    key: "_setCurrentState",
    value: function _setCurrentState(toState) {
      this.currentState = toState;

      if (this.states[toState] && this.states[toState].on && this.states[toState].on.actions) {
        return this._executeActions(this.states[toState].on.actions);
      }

      return Promise.all([]);
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
    key: "_transition",
    value: function () {
      var _transition3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(fromState, toState) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.states[toState]) {
                  _context3.next = 2;
                  break;
                }

                throw new Error("".concat(toState, " does not exist!"));

              case 2:
                if (!(fromState && toState && !this.states[fromState][toState])) {
                  _context3.next = 4;
                  break;
                }

                throw new Error("".concat(toState, " does not exist as a possible transition!"));

              case 4:
                if (!this.states[fromState]) {
                  _context3.next = 7;
                  break;
                }

                _context3.next = 7;
                return this._executeActionsByActionType(fromState, toState, 'before');

              case 7:
                _context3.next = 9;
                return this._setCurrentState(toState);

              case 9:
                if (!this.states[fromState]) {
                  _context3.next = 12;
                  break;
                }

                _context3.next = 12;
                return this._executeActionsByActionType(fromState, toState, 'after');

              case 12:
                // notify every state listener
                this._notifyStateListeners(toState);

                return _context3.abrupt("return", Promise.resolve({
                  currentState: this.currentState,
                  data: this.data
                }));

              case 14:
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

module.exports = StateMachine;