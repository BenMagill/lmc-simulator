# lmc-simulator 
![npm bundle size](https://img.shields.io/bundlephobia/min/lmc-simulator)

Lmc-simulator is a library that allows LMC (Little Man Computer) code to be assembled and executed.

## Installation
```bash
npm install lmc-simulator
```

## Usage
```javascript
var Machine = require("lmc-simulator")

var code = `
        INP
loop    OUT   
        STA count
        SUB # 2
	    STA count
        BRP loop ; This is a comment
        HLT
one     DAT 1
count   DAT  
`

var lmc = new Machine()

lmc.loadToRAM(code)

lmc.run()
```
