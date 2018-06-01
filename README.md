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
디자인이 변경되어도 자바스크립트가 깨지지 않습니다. 또 새로운 모델의 확장이 용이합니다.
backbone 보다 더 쉽습니다.


## License
MIT