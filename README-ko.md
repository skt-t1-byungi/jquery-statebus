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

### what?
jquery-statebus는 뷰(jquery로 작성된)에서 상태를 분리하는 아주 간단한 패턴을 제공합니다. 
디자인이 바뀌어도 자바스크립트가 망가지지 않습니다. 기능확장이 편합니다. backbone 보다 더 쉽습니다.

### How to use
#### State
```js
var counter = $.statebus('counter', {  // namespace는 'counter'가 됩니다.
  state: { value: 1 }
})

console.log( counter.state.value ) // 1
console.log( $.statebus.state.counter.value ) // 1
```
`$.statebus.state[namespace]`를 통해 다른 지역상태를 가져올 수 있습니다.

#### Action
```js
var counter = $.statebus('counter', { 
  state: { value: 1 },
  action:{
    increment: function(number){
      return {value: this.state.value + number} 
    }
  }
})

console.log( counter.state.value ) // 1
counter.action.increment(1)
console.log( counter.state.value ) // 2
$.statebus.action.counter.increment(2)
console.log( counter.state.value ) // 4
```
action의 반환결과로 상태를 바꿉니다. (`$.extend` 함수를 사용합니다.) action 함수에서 this는  `state`, `action` 속성을 가진 객체입니다.

##### Action in action
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

#### On
#### Global

### 



## License
MIT