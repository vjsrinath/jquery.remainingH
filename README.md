jquery.remainingH
=================

A jQuery plugin to dynamically calculate the remaing height of container assign it to last element


#####Usage:
```javascript
$('.container').remainingH();
```

and with options
```javascript
$('.container').remainingH({
//how long to wait before calculating height of elements
delay: 250, 
//if set to false all the layout operation would be run during call stack itself
asyncCalc: true, 
//jQuery selector to pick the elements which one height to be calculated based on its parent and previous siblings
sel: '.remaining-height' 
    });
```
