# hi-rez-api
Hi-rez API for paladins and smite

## Installation

```
$ npm install https://github.com/rogap/hi-rez-api
```

## Quick Example

We take the name of the methods [here](https://docs.google.com/document/d/1OFS-3ocSx-1Rvg4afAnEHlT3917MAK_6eJTR6rzr-BM/edit#heading=h.fakdyhcc6v9q)

```js
const { Hirez } = require('hi-rez-api')
const hi = new Hirez(devId, authKey) // for paladins

/**
 * where mutu is name to search
 */
hi.ex('searchplayers', 'mutu')
.then(response => {
    console.log(response) // [{..}, {..}]
})

/**
 * where 3368378 is the player's id
 * 1 is lang
 */
hi.ex('getplayerloadouts', '3368378', 1)
.then(response => {
    console.log(response) // [{..}, {..}]
})

hi.ex('getdataused')
.then(response => {
    console.log(response) // [{..}]
})
```
