(function (global, factory) {
  typeof module === 'object' && module.exports ? factory(require('jquery'))
    : typeof define === 'function' && define.amd ? define(['jquery'], factory)
      : (factory(global.jQuery || global.$))
}(window || this, function ($) {
  var extend = $.extend
  var isPlainObject = $.isPlainObject

  var emitter = $({})
  var globalBus = {
    state: {},
    action: {},
    helper: {},
    prevState: {}
  }

  $.statebus = extend(
    statebus,
    globalBus,
    { on: $.proxy(on, null, globalBus, null) }
  )

  // Create a bus.
  function statebus (namespace, definition, override) {
    // bus instance
    var localBus = {
      state: {},
      action: {},
      helper: {},
      prevState: null
    }

    if (override) {
      emitter.off(namespace)
    } else {
      extend(localBus.state, globalBus.state[namespace])
      extend(localBus.action, globalBus.action[namespace])
      extend(localBus.helper, globalBus.helper[namespace])
    }

    // Register state.
    if (isPlainObject(definition.state)) {
      extend(localBus.state, copy(definition.state))
    }

    // create helpers
    $.each(definition.helper || {}, function (helperName, func) {
      localBus.helper[helperName] = function () {
        return func.apply(localBus.state, [localBus].concat($.makeArray(arguments)))
      }
    })

    // create actions
    $.each(definition.action || {}, function (actName, func) {
      localBus.action[actName] = function () {
        var args = $.makeArray(arguments)
        var prevState = localBus.state
        var willState = func.apply(localBus.state, [localBus].concat(args))

        if (isPlainObject(willState)) {
          globalBus.state[namespace] = localBus.state = extend({}, localBus.state, copy(willState))
          globalBus.prevState[namespace] = localBus.prevState = prevState
        }

        emitter.trigger(namespace + '.' + actName, [actName, args])
        emitter.trigger(namespace + '.all', [actName, args])
        return willState
      }
    })

    globalBus.state[namespace] = localBus.state
    globalBus.action[namespace] = localBus.action
    globalBus.helper[namespace] = localBus.helper

    return extend(localBus, {on: $.proxy(on, null, localBus, namespace)})
  }

  function copy (state) {
    return JSON.parse(JSON.stringify(state))
  }

  function on (bus, namespace, evtName, listener, immediately) {
    if (immediately) listener(bus.state, null, {helper: bus.helper})

    if (namespace) {
      evtName = $.map(evtName.split ? evtName.split(/\s+/) : evtName, function (name) {
        return namespace + '.' + name
      })
    }

    var wrapFunc = function (_, actName, args) {
      listener(bus.state, bus.prevState, {actionName: actName, args: args, helper: bus.helper})
    }

    emitter.on(evtName = evtName.join ? evtName.join(' ') : evtName, wrapFunc)

    // returns unsubscribe func
    return function () {
      emitter.off(evtName, wrapFunc)
    }
  }
}))
