const test = require('ava')
const $ = require('jquery');
require('./jquery-statebus')();

test(t =>{
  const $$ = $.statebus
  const bus = $$('test', {
    state: {
      value: 1
    },
    action: {
      increment(v){ 
        return {value: this.state.value + v} 
      },
      incrementOne(){
        this.action.increment(1)
      }
    }
  })
  
  const triggers = {};
  const addTriggers = name => {
    if(!triggers[name]) triggers[name] = 0
    triggers[name]++
  }

  // local test
  t.is(bus.state.value, 1)
  bus.on('increment', _ => addTriggers('increment'))
  bus.action.increment(2)
  t.is(bus.state.value, 3)
  bus.on('incrementOne', _ => addTriggers('incrementOne'))
  bus.action.incrementOne()
  t.is(bus.state.value, 4)

  t.deepEqual(triggers, {
    increment: 2,
    incrementOne: 1
  })

  // global test
  t.is($$.state.test.value, 4)
  $$.on('test.increment', _ => addTriggers('gobalIncrement'))
  $$.action.test.increment(2)
  t.is(bus.state.value, 6)
  bus.on('test.incrementOne', _ => addTriggers('gobalIncrementOne'))
  $$.action.test.incrementOne()
  t.is($$.state.test.value, 7)

  t.deepEqual(triggers, {
    increment: 4,
    incrementOne: 2,
    gobalIncrement: 2,
    gobalIncrementOne: 1
  })
})