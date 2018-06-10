(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var extend = $.extend
  var emitter = $({})

  var globalBus = {state: {}, action: {}, prevState: {}}
  // var globalState = globalBus.state = {}
  // var globalAction = globalBus.action = {}
  // var globalPrevState = globalBus.prevState = {}

  $.statebus = extend(statebus, globalBus, {on: $.proxy(on, null, globalBus, null)})

  // Create a bus.
  function statebus (namespace, definition, override) {
    // bus instance
    var localBus = {state: {}, action: {}, prevState: null}

    if (override) {
      emitter.off(namespace)
    } else {
      extend(localBus.state, globalBus.state[namespace])
      extend(localBus.action, globalBus.action[namespace])
    }

    // Register state.
    extend(localBus.state, safeCopy(definition.state))

    // Create actions.
    $.each(definition.action || {}, function (actName, func) {
      localBus.action[actName] = function () {
        var args = [].slice.call(arguments)
        var prevState = localBus.state
        var willState = safeCopy(func.apply({state: localBus.state, action: localBus.action}, args))

        globalBus.state[namespace] = localBus.state = extend({}, localBus.state, willState)
        globalBus.prevState[namespace] = localBus.prevState = prevState

        emitter.trigger(namespace + '.' + actName, [args])
      }
    })

    globalBus.state[namespace] = localBus.state
    globalBus.action[namespace] = localBus.action

    return extend(localBus, {on: $.proxy(on, null, localBus, namespace)})
  }

  function safeCopy (state) {
    return state && typeof state === 'object' ? JSON.parse(JSON.stringify(state)) : {}
  }

  function on (bus, namespace, evtName, listener, immediately) {
    if (immediately) listener(bus.state, null, [])

    if (namespace) {
      evtName = $.map(evtName.split ? evtName.split(/\s+/) : evtName, function (name) {
        return namespace + '.' + name
      })
    }

    emitter.on(evtName.join ? evtName.join(' ') : evtName, function (_, args) {
      listener(bus.state, bus.prevState, args)
    })
  }
}))
