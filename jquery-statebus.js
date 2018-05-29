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
  function statebus (namespace, definition) {
    if (typeof namespace !== 'string') {
      throw new TypeError('Expected type of "string", but "' + typeof namespace + '".')
    }

    // bus instance
    var localState = globalState[namespace] || (globalState[namespace] = {})
    var localAction = globalAction[namespace] || (globalAction[namespace] = {})
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
        $.extend(localState, clone(func.apply(localBus, arguments)))
        emit(actName, prevState, namespace)
      }
    })

    // returns with `on()`, `render()`
    return $.extend({ on: $.proxy(on, null, localBus, namespace) }, localBus)
  }

  function clone (state) {
    return state && typeof state === 'object' ? JSON.parse(JSON.stringify(state)) : {}
  }

  function on (bus, namespace, evtName, listener, immediately) {
    if (immediately) listener(bus.state, bus.state, bus.action)

    emitter.on(resolveNamespace(evtName, namespace), function (_, prevState) {
      listener(bus.state, prevState, bus.action)
    })
  }

  function emit (evtName, prevState, namespace) {
    emitter.trigger(resolveNamespace(evtName, namespace), [prevState])
  }

  function resolveNamespace (evtName, namespace) {
    if (!namespace) return evtName

    var mapper = function (name) {
      return namespace + '.' + name
    }

    return $.map(evtName.split(/\s+/), mapper).join(' ')
  }
}))
