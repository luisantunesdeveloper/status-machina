'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StateMachine = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var StateMachine =
/*#__PURE__*/
function () {
  function StateMachine() {
    _classCallCheck(this, StateMachine);

    _defineProperty(this, "currentState", void 0);

    _defineProperty(this, "initialState", void 0);

    _defineProperty(this, "observers", {});

    _defineProperty(this, "states", void 0);
  }

  _createClass(StateMachine, [{
    key: "attach",
    value: function attach(state, observerId, callback) {
      if (!this.observers[state]) {
        this.observers[state] = {};
      }

      this.observers[state][observerId] = callback;
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
      delete this.observers[state][observerId];
      return this;
    }
  }, {
    key: "dettachState",
    value: function dettachState(state) {
      for (var observerId in this.observers[state]) {
        delete this.observers[state][observerId];
      }

      return this;
    }
  }, {
    key: "_executeActionsByActionType",
    value: function _executeActionsByActionType(fromState, toState, actionType) {
      if (this.states[fromState][toState] && this.states[fromState][toState][actionType] && this.states[fromState][toState][actionType].length > 0) {
        // TODO: if async need to await for it
        // parallel or sequential
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.states[fromState][toState][actionType][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _actionType = _step.value;

            if (_actionType.on) {
              _actionType.on();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.currentState;
    }
  }, {
    key: "init",
    value: function init() {
      this._transition(undefined, this.initialState, {});

      return this;
    }
  }, {
    key: "_notifyStateListeners",
    value: function _notifyStateListeners(state) {
      if (this.observers[state] && Object.keys(this.observers[state]).length > 0) {
        for (var observerId in this.observers[state]) {
          this.observers[state][observerId]();
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
    key: "transition",
    value: function transition(toState) {
      this._transition(this.currentState, toState);
    }
  }, {
    key: "_transition",
    value: function _transition(fromState, toState) {
      if (!this.states[toState]) {
        throw new Error("".concat(toState, " does not exist!"));
      } // before actions to execute


      if (this.states[fromState]) {
        this._executeActionsByActionType(fromState, toState, 'before');
      } // execute action on state


      if (this.states[toState].on) {
        this.states[toState].on();
      } // set the new current state


      this.currentState = toState;

      this._notifyStateListeners(toState); // after actions to execute


      if (this.states[fromState]) {
        this._executeActionsByActionType(fromState, toState, 'after');
      }

      return this;
    }
  }]);

  return StateMachine;
}();

exports.StateMachine = StateMachine;