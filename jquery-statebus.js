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
      remove: function (name) {
        delete globalBus.state[name]
        delete globalBus.action[name]
        delete globalBus.prevState[name]

        emitter.trigger(name + '.remove')
        emitter.off(name)
      }
    }
  )

  // constructor
  function statebus (name, def, override) {
    if (typeof name !== 'string') {
      throw new TypeError('[jquery-statebus] "name" is required.')
    }

    var localBus = objectCreate(def)
    localBus.state = localBus.state || {}

    // create actions
    localBus.action = {}
    $.each(def.action || {}, function (actName, func) {
      localBus.action[actName] = function () {
        var args = $.makeArray(arguments)
        var prevState = localBus.state
        var willState = func.apply(localBus, args)

        if ($.isPlainObject(willState)) {
          globalBus.state[name] = localBus.state = extend({}, localBus.state, willState)
          globalBus.prevState[name] = localBus.prevState = prevState
        }

        emitter.trigger(name + '.' + actName, [actName, args])
        emitter.trigger(name + '.all', [actName, args])

        return willState
      }
    })

    if (override) {
      emitter.off(name)
    } else {
      globalBus.prevState[name] = null
      extend(localBus.state, globalBus.state[name])
      extend(localBus.action, globalBus.action[name])
    }

    globalBus.state[name] = localBus.state
    globalBus.action[name] = localBus.action

    return extend(localBus, {on: $.proxy(on, null, localBus, name)})
  }

  function objectCreate (proto) {
    var Func = function () {}
    Func.prototype = proto
    return new Func()
  }

  function on (bus, name, evtName, listener, immediately) {
    if (immediately) listener(bus, {immediately: true})

    if (name) {
      evtName = $.map(evtName.split ? evtName.split(/\s+/) : evtName, function (evtName) {
        return name + '.' + evtName
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
