# jquery-statebus
🚍 Small State Management library for jQuery

## Example
```js
var counter = $.statebus('counter', {
  state: {
    value: 0
  },
  action: {
    increment: function(number){
      return {value: this.state.value + number}
    },
    decrement: function(number){
      return {value: this.state.value - number}
    }
  }
})

var $el = $('.counter')
$el.on('click', '[data-counter="increment"]', function(counter){
  counter.action.increment(1)
})
$el.on('click', '[data-counter="decrement"]', function(counter){
  counter.action.decrement(1)
})

counter.on('increment decrement', function(counter){
  $el.find('.txt').text(counter.state.value)
})
```

## What?
jquery-statebus는 **View**(jquery로 작성된)에서 상태를 분리하는 아주 간단한 패턴을 제공합니다. 
- 디자인이 바뀔 때 자바스크립트가 망가지는 것을 최소화합니다.
- 확장이 편합니다.
- backbone 보다 더 쉽습니다.
- 작고 가볍습니다.

## Install
```sh
yarn install jquery-statebus
```
```js
// index.js
require('jquery-statebus');
```
### browser
```html
<script src="https://unpkg.com/jquery-statebus"></script>
```

## How to use
### State
네임스페이스로 **state**를 정의합니다.
```js
var counter = $.statebus('counter', {  // namespace는 'counter'가 됩니다.
  state: { value: 1 }
})

// counter.state.value  == 1
// $.statebus.state.counter.value  == 1
```
`$.statebus.state[namespace]`로 다른 지역state를 가져올 수 있습니다.

### Action
```js
var counter = $.statebus('counter', { 
  state: { value: 1 },
  action:{
    increment: function(number){
      return {value: this.state.value + number} 
    }
  }
})

counter.action.increment(1) // "counter.state.value" to be 2
$.statebus.action.counter.increment(2) // "counter.state.value" to be 4
```
action의 반환결과로 상태를 바꿉니다. (`$.extend` 함수를 사용합니다.) 
action 함수에서 `this`는  statebus 객체와 동일합니다.

#### Action in action
```js
$.statebus('counter', { 
  state: { value: 1 },
  action:{
    increment: function(number){
      return {value: this.state.value + number} 
    },
    delayIncrement: function(number, sec){
      setTimeout(this.action.increment, sec * 1000, number)
    }
  }
})

counter.action.delayIncrement(1, 3)
console.log( counter.state.value ) // 1

// ..after 3sec.
console.log( counter.state.value ) // 2
```

### On(action, render [, immediately])
```js
counter.on('increment', function(counter){
  if(counter.state.value !== counter.prevState.value){
    $display.text(counter.state.value)
  }
})
```
jquery.statebus는 마법이 없습니다. 
직접 **View**와 연관된 **Action**을 구독하고 이전 상태와 비교해야 합니다.

#### Arguments
```js
counter.on('increment', function(counter, ctx){
  var amount = ctx.args[0]
  ...
})
```
필요하다면 액션의 인자를 얻을 수도 있습니다.

#### Multiple subscription
```js
// using space
counter.on('increment decrement', view)

// using array
counter.on(['increment', 'decrement'], view)
```
같은 **View** 변경을 공유하는 **Action**들은 언제나 존재합니다. 
`space`, 또는 `array`로 한번에 여러 **Action**에 대해서 구독할 수 있습니다.

#### Global subscription
```js
$.statebus.on(['counter.increment', 'other.update'], view)
```
네임스페이스를 사용해서 서로 다른 지역 상태에 대한 변경을 같은 리스너로 구독할 수 있습니다.

#### Immediately
```js
counter.on('increment', function (counter, ctx){
  if(ctx.immediately) initView()
  $display.text(counter.state.value)
}, true)
```
3번째 인자가 true면 함수를 즉시 실행합니다. 
**ctx.immediately**로 초기실행인지 판단할 수 있습니다.

### Override
```js
$.statebus('test', {
  state: { v1: 1 }
})
var re = $.statebus('test', {
  state: { v2: 2 }
})

console.log( re.state ) // {v1: 1, v2: 2}
```
다시 재정의되면 이전 정의를 유지하며 확장합니다.

```js
$.statebus('test', {
  state: { v1: 1 }
})
var re = $.statebus('test', {
  state: { v2: 2 }
}, true) // Look here.

console.log( re.state ) // {v2: 2}
```
오버라이드 옵션이 true면, 이전 정의(상태, 액션, 이벤트 리스너) 모두를 지우고 새로 정의합니다.

## Why?
jquery-statebus는 **View**와 **State**를 분리하는 게 목적입니다. 
아래는 **View**와 **State**가 강하게 결합된 코드입니다.

```js
$('#counter > button.increment').click(function(){
  var $display = $('#counter span.display')
  var number = parseInt($display.text())
  $display.text(number + 1)
})
```
**View**에서 **State**를 얻습니다. 

<p align="center"><img src="./assets/1.png"></p>

이것을 도형화한 것입니다.

<p align="center"><img src="./assets/2.png"></p>

기능이 늘어날수록 복잡한 네트워크를 만듭니다. 디자인변경, 기능추가가 힘들어집니다.

<p align="center"><img src="./assets/3.png"></p>

jquery-statebus로 **State**와 **View**를 분리하면 이러한 복잡성을 개선할 수 있습니다.

<p align="center"><img src="./assets/4.png"></p>

**State**를 메모리에 있는 독립된 객체에서 얻기 때문에 디자인 변경으로 다른 자바스크립트 코드가 망가지는 일을 최소화할 수 있습니다. 
새로운 기능을 추가할 때도 **View** 역할까지 파악해야 하는 부담이 줄어듭니다.

## Tip
### Use data attribute.
```js
// bad
$el.find('button.increment').click(function(){
  var amount = $(this).data('amount');
  counter.action.increment(amount)
})

counter.on('increment', function(counter){
  $el.find('span.display').text(counter.state.value)
})

//good
$el.on('click', '[data-counter="counter"]', function(counter){
  var amount = $(this).data('params');
  counter.action.increment(amount)
})

counter.on('increment', function(counter){
  $el.find('[data-counter="value"]').text(counter.state.value)
})
```
데이터 속성은 **View** 구조에 구속되지 않습니다. 
**View** 변경에 비교적 자유로운 속성입니다.
또 html 코드만으로 이벤트가 바인딩됨을 알려주는 역할도 합니다.

### jquery-statebusking
[jquery-statebusking](https://github.com/skt-t1-byungi/jquery-statebusking) - statebus를 backbone처럼 사용할 수 있습니다.

## License
MIT