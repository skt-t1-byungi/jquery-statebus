const test = require('ava')
const $ = require('jquery');
require('./jquery-statebus');

const $$ = $.statebus

const testBus = name => $$(name,{
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

test('action to update state', t =>{
  const bus = testBus('test1')

  t.is(bus.state.value, 1)
  t.is($$.state.test1.value, 1) //global

  bus.action.increment(2)
  t.is(bus.state.value, 3)
  t.is($$.state.test1.value, 3) //global

  bus.action.incrementOne()
  t.is(bus.state.value, 4)
  t.is($$.state.test1.value, 4) //global
})

test('subscribe on act', t =>{
  const bus = testBus('test2')
  
  const triggers = {};
  const hit = name => {
    if(!triggers[name]) triggers[name] = 0
    triggers[name]++
  }

  bus.on('increment', _ => hit('increment'))
  $$.on('test2.increment', _ => hit('globalIncrement'))
  bus.action.increment(1)
  t.deepEqual(triggers, { increment: 1, globalIncrement: 1 })

  bus.on('incrementOne', _ => hit('incrementOne'))
  $$.on('test2.incrementOne', _ => hit('globalIncrementOne'))
  bus.action.incrementOne()
  t.deepEqual(triggers, { increment: 2, incrementOne: 1, globalIncrement: 2, globalIncrementOne: 1 })
})

test('listener parameters (state, prevState, action)', t =>{
  const bus = testBus('test3')

  let captured
  bus.on('increment', (state, prevState) => (captured = {state, prevState}))
  bus.action.increment(1)

  t.deepEqual(captured, { state: {value:2}, prevState: {value:1} })

  // scenario : act.incOne -> act.inc -> on.inc(1) -> on.incOne -> act.inc -> on.inc(2)
  let hits = 0
  bus.on('increment', _ => hits++)
  bus.on('incrementOne', (_, __, action) => action.increment(1))
  bus.action.incrementOne() 

  t.is(hits, 2)
})