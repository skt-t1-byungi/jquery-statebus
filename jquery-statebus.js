(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory)
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
          jQuery = require('jquery')
        } else {
          jQuery = require('jquery')(root)
        }
      }
      factory(jQuery)
      return jQuery
    }
  } else {
    factory(jQuery)
  }
}(function ($) {
  var globalState = {}
  var globalAction = {}
  var emitter = $({})

  $.statebus = $.extend(statebus, {
    state: globalState,
    action: globalAction,
    on: $.proxy(on, null, {state: globalState, action: globalAction}),
    render: render
  })

  // Create a bus.
  function statebus (namespace, definition) {
    if (typeof namespace !== 'string') {
      throw new TypeError('Expected type of "string", but "' + typeof namespace + '".')
    }

    var localState = globalState[namespace] || (globalState[namespace] = {})
    var localAction = globalAction[namespace] || (globalAction[namespace] = {})

    // bus instance
    var instance = {
      state: localState,
      action: localAction
    }

    // Register state.
    $.extend(localState, clone(definition.state))

    // Create actions.
    $.each(definition.action || {}, function (actName, func) {
      localAction[actName] = function () {
        $.extend(localState, clone(func.apply(instance, arguments)))
        render(namespace, actName)
      }
    })

    // returns with `on()`
    return $.extend({
      on: $.proxy(on, null, instance, namespace),
      render: $.proxy(render, null, namespace)
    }, instance)
  }

  function clone (state) {
    return state ? JSON.parse(JSON.stringify(state)) : {}
  }

  function on (bus, namespace, evtName, listener) {
    if (typeof evtName === 'function') {
      listener = evtName
      evtName = namespace
      namespace = null
    }

    emitter.on((namespace ? namespace + '.' : '') + evtName, function () {
      listener(bus.state, bus.action)
    })
  }

  function render (namespace, actName) {
    emitter.trigger(namespace ? namespace + '.' + actName : namespace)
  }
}))
