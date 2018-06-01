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



## License
MIT