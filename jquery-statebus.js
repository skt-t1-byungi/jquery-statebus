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
    {
      on: $.proxy(on, null, globalBus, null),
      remove: function (namespace) {
        delete globalBus.state[namespace]
        delete globalBus.action[namespace]
        delete globalBus.prevState[namespace]
        emitter.off(namespace)
      }
    }
  )

  // constructor
  function statebus (namespace, definition, override) {
    if (!namespace) throw new TypeError('[jquery-statebus] "namespace" is required.')

    var localBus = extend({}, definition)
    localBus.action = extend({}, localBus.action)

    // create actions
    $.each(localBus.action, function (actName, func) {
      localBus.action[actName] = function () {
        var args = $.makeArray(arguments)
        var prevState = localBus.state
        var willState = func.apply(localBus, args)

        if ($.isPlainObject(willState)) {
          globalBus.state[namespace] = localBus.state = extend({}, localBus.state, willState)
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
      globalBus.prevState[namespace] = null
      extend(localBus.state, globalBus.state[namespace])
      extend(localBus.action, globalBus.action[namespace])
    }

    globalBus.state[namespace] = localBus.state
    globalBus.action[namespace] = localBus.action

    return extend(localBus, {on: $.proxy(on, null, localBus, namespace)})
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
