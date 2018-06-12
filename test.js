const test = require('ava')
const $ = require('jquery');
require('./jquery-statebus');

const $$ = $.statebus

const testBus = (name, extend = false) => $$(name,{
  state: {
    value: 1
  },
  action: {
    increment(v){ 
      return {value: this.state.value + v} 
    },
    incrementOne(){
      this.action.increment(1)
    },
    delayIncrement(v, sec){
      return new Promise((resolve, reject)=>{
        setTimeout(()=> (this.action.increment(v), resolve()), sec * 1000);
      })
    }
  }
}, extend)

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
  bus.on('incrementOne', () => bus.action.increment(1))
  bus.action.incrementOne() 

  t.is(hits, 2)
})

test('multiple(array) subscribe', t =>{
  const bus = testBus('test4')

  let hits = 0
  bus.on(['increment', 'incrementOne'], _ => hits++)
  bus.action.incrementOne() 

  t.is(hits, 2)
})

test('multiple(array) subscribe at global', t =>{
  const bus1 = testBus('test5')
  const bus2 = testBus('test6')
  
  let hits = 0
  $.statebus.on(['test5.increment', 'test6.increment'], _ => hits++)
  
  bus1.action.increment(1)
  t.is(hits, 1)

  bus2.action.increment(1)
  t.is(hits, 2)
})

test('even if not exists, can subscribe', t =>{
  let hits = 0
  $.statebus.on(['test7.increment'], _ => hits++)

  const bus = testBus('test7')
  bus.action.increment(1)
  
  t.is(hits, 1)
})

test('override', t =>{
  let bus = $.statebus('extend', {
    state: {
      val1 : 1
    },
    action:{
      m1(){},
      m2(){}
    }
  })
  
  let hits1 = 0
  bus.on('m2', _ => hits1++)
  
  bus.action.m2()
  t.is(hits1, 1)

  bus = $.statebus('extend', {
    state: {
      val2 : 2
    },
    action:{
      m2(){}
    }
  }, true)
  
  let hits2 = 0
  bus.on('m2', _ => hits2++)

  t.deepEqual(bus.state, {val2: 2})
  t.falsy(bus.action.m1)
  t.truthy(bus.action.m2)

  bus.action.m2()
  t.is(hits1, 1)
  t.is(hits2, 1)

  bus = $.statebus('extend', {
    state: {
      val3 : 3
    },
    action:{
      m3(){}
    }
  })
  
  t.deepEqual(bus.state, {val2: 2, val3: 3})
  t.truthy(bus.action.m2)
  t.truthy(bus.action.m3)

  bus.action.m2()
  t.is(hits1, 1)
  t.is(hits2, 2)
})

test('in listener, get arguments', t =>{
  const bus = testBus('test9')
  let capture

  bus.on('increment', (_, __, [v])=> (capture = v))
  bus.action.increment(123)

  t.is(capture, 123)
})

test('action returns value', async t =>{
  const bus = testBus('test10')

  const p = bus.action.delayIncrement(2)
  t.is(bus.state.value, 1)

  await p
  t.is(bus.state.value, 3)
})