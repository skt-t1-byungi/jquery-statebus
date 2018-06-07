# jquery-statebus
🚍 0.5KB Small State + EventBus for jQuery

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
$el.on('click', '[data-do-counter-increment]', function(){
  counter.action.increment(1)
})
$el.on('click', '[data-do-counter-decrement]', function(){
  counter.action.decrement(1)
})

counter.on('increment decrement', function(state){
  $el.find('.txt').text(state.value)
})
```

## What?
jquery-statebus는 **view**(jquery로 작성된)에서 상태를 분리하는 아주 간단한 패턴을 제공합니다. 

- 디자인이 바뀔 때 자바스크립트가 망가지는 것을 최소화합니다.
- 기능확장이 편합니다.
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
namespace로 **state**를 정의합니다.
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
action의 반환결과로 상태를 바꿉니다. (`$.extend` 함수를 사용합니다.) action 함수에서 `this`는  `state`, `action` 속성을 가진 객체입니다.

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
counter.on('increment', function view(state, prevState){
  if(state.value !== prevState.value){
    $display.text(state.value)
  }
})
```
jquery.statebus는 마법이 없습니다. 직접 **view**와 연관된 **action**을 구독하고 이전 상태와 비교해야 합니다.

#### Arguments
```js
counter.on('increment', function view(state, prevState, args){
  var amount = args[0]
  ...
})
```
필요하다면, 액션의 인자를 얻을 수도 있습니다.

#### Multiple
```js
// space
counter.on('increment decrement', view)

// array
counter.on(['increment', 'decrement'], view)
```
같은 **view** 변경을 공유하는 **action**들은 언제나 존재합니다. `space`, 또는 `array`로 한번에 여러 **action**을 구독할 수 있습니다.

#### Global
```js
$.statebus.on(['counter.increment', 'other.update'], view)
```
서로 다른 지역 상태의 변경을 같은 **view** 함수를 사용해 렌더링할 수도 있습니다.

#### Immediately
```js
counter.on('increment', function (state, prevState){
  if(prevState === null) initView()
  $display.text(state.value)
}, true)
```
3번째 인자가 true면, render 함수를 즉시 실행합니다. **prevState**의 null여부로 함수 안에서 초기실행인지 판단할 수 있습니다.

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
다시 재정의되면 기존 정의를 유지하며 확장합니다.

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
jquery-statebus는 **view**와 **state**를 분리하는 게 목적입니다. 아래는 **view**와 **state**가 강하게 결합된 코드입니다.

```js
$('#counter > button.increment').click(function(){
  var $display = $('#counter span.display')
  var number = parseInt($display.text())
  $display.text(number + 1)
})
```
**view**에서 **state**를 얻습니다. 

<p align="center"><img src="./assets/1.png"></p>

이것을 도형화한 것입니다.

<p align="center"><img src="./assets/2.png"></p>

기능이 늘어날수록 복잡한 네트워크를 만듭니다. 디자인변경, 기능추가가 힘들어집니다.

<p align="center"><img src="./assets/3.png"></p>

jquery-statebus로 **state**와 **view**를 분리하면 이러한 복잡성을 개선할 수 있습니다.

<p align="center"><img src="./assets/4.png"></p>

**state**를 메모리에 있는 독립된 객체에서 얻기 때문에 디자인 변경으로 다른 자바스크립트 코드가 망가지는 일을 최소화할 수 있습니다. 새로운 기능을 추가할 때도 **view** 역할까지 파악해야 하는 부담이 줄어듭니다.

## Tip
### Use data attribute.
```js
// bad
$el.find('button.increment').click(function(){
  var amount = $(this).data('do-counter-increment');
  counter.action.increment(1)
})

counter.on('increment', function(state){
  $el.find('span.display').text(state.value)
})


//good
$el.on('click', '[data-do-counter-increment]', function(){
  var amount = $(this).data('do-counter-increment');
  counter.action.increment(amount)
})

counter.on('increment', function(state){
  $el.find('[data-counter="value"]').text(state.value)
})
```
데이터 속성은 **view** 구조에 구속되지 않습니다. 
**view** 변경에 비교적 자유로운 속성입니다.
또 html 코드만으로 이벤트가 바인딩되었음을 알려주는 역할도 합니다.

## License
MIT