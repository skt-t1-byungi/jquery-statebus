(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var globalState = {}
  var globalAction = {}
  var globalBus = {state: globalState, action: globalAction}
  var emitter = $({})

  $.statebus = $.extend(statebus, globalBus, { on: $.proxy(on, null, globalBus, null) })

  // Create a bus.
  function statebus (namespace, definition, override) {
    if (override) emitter.off(namespace)

    // bus instance
    var localState = !override && globalState[namespace] ? globalState[namespace] : (globalState[namespace] = {})
    var localAction = !override && globalAction[namespace] ? globalAction[namespace] : (globalAction[namespace] = {})

    var localBus = {
      state: localState,
      action: localAction
    }

    // Register state.
    $.extend(localState, clone(definition.state))

    // Create actions.
    $.each(definition.action || {}, function (actName, func) {
      localAction[actName] = function () {
        var prevState = clone(localState)
        var args = toArray(arguments)
        $.extend(localState, clone(func.apply(localBus, args)))
        emitter.trigger(namespace + '.' + actName, [prevState, args])
      }
    })

    // returns with `on()`
    return $.extend({ on: $.proxy(on, null, localBus, namespace) }, localBus)
  }

  function clone (state) {
    return state && typeof state === 'object' ? JSON.parse(JSON.stringify(state)) : {}
  }

  function toArray (args) {
    return Array.prototype.slice.call(args)
  }

  function on (bus, namespace, evtName, listener, immediately) {
    if (immediately) listener(bus.state, null, [])

    if (namespace) {
      evtName = $.map(evtName.split ? evtName.split(/\s+/) : evtName, function (name) {
        return namespace + '.' + name
      })
    }

    emitter.on(evtName.join ? evtName.join(' ') : evtName, function (_, prevState, args) {
      listener(bus.state, prevState, args)
    })
  }
}))
