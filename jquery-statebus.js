(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var extend = $.extend

  var emitter = $({})
  var globalBus = {
    state: {},
    action: {},
    prevState: {}
  }

  $.statebus = extend(
    statebus,
    globalBus,
    { on: $.proxy(on, null, globalBus, null) }
  )

  // constructor
  function statebus (namespace, definition, override) {
    var localBus = extend({ state: {}, action: {}, prevState: null }, definition)
    localBus.state = copy(localBus.state)

    // create actions
    $.each(localBus.action, function (actName, func) {
      localBus.action[actName] = function () {
        var args = $.makeArray(arguments)
        var prevState = localBus.state
        var willState = func.apply(localBus, args)

        if ($.isPlainObject(willState)) {
          globalBus.state[namespace] = localBus.state = extend({}, localBus.state, copy(willState))
          globalBus.prevState[namespace] = localBus.prevState = prevState
        }

        emitter.trigger(namespace + '.' + actName, [actName, args])
        emitter.trigger(namespace + '.all', [actName, args])

        return willState
      }
    })

    if (override) {
      emitter.off(namespace)
    } else {
      extend(localBus.state, globalBus.state[namespace])
      extend(localBus.action, globalBus.action[namespace])
    }

    globalBus.state[namespace] = localBus.state
    globalBus.action[namespace] = localBus.action

    return extend(localBus, {on: $.proxy(on, null, localBus, namespace)})
  }

  function copy (state) {
    return JSON.parse(JSON.stringify(state))
  }

  function on (bus, namespace, evtName, listener, immediately) {
    if (immediately) listener(bus, {immediately: true})

    if (namespace) {
      evtName = $.map(evtName.split ? evtName.split(/\s+/) : evtName, function (name) {
        return namespace + '.' + name
      })
    }

    var wrapFunc = function (_, actName, args) {
      listener(bus, {actionName: actName, args: args, immediately: false})
    }

    emitter.on(evtName = evtName.join ? evtName.join(' ') : evtName, wrapFunc)

    // returns unsubscribe func
    return function () {
      emitter.off(evtName, wrapFunc)
    }
  }
}))
