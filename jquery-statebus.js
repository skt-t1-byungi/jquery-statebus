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

    // if already, remove event listeners
    emitter.off(namespace)

    // bus instance
    var localState = globalState[namespace] = {}
    var localAction = globalAction[namespace] = {}
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
        emitter.trigger(namespace + '.' + actName, [prevState])
      }
    })

    // returns with `on()`, `render()`
    return $.extend({ on: $.proxy(on, null, localBus, namespace) }, localBus)
  }

  function clone (state) {
    return state && typeof state === 'object' ? JSON.parse(JSON.stringify(state)) : {}
  }

  function on (bus, namespace, evtName, listener, immediately) {
    if (immediately) listener(bus.state, null, bus.action)

    if (namespace) {
      evtName = $.map(evtName.split ? evtName.split(/\s+/) : evtName, function (name) {
        return namespace + '.' + name
      }).join(' ')
    }

    emitter.on(evtName, function (_, prevState) {
      listener(bus.state, prevState, bus.action)
    })
  }
}))
