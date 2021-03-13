/**
 * 
 * 
 */

var opcodes = ["HLT", "ADD", "SUB", "STA", "LDA", "BRA", "BRZ", "BRP", "INP", "OUT", "DAT"]

// Remove lines of no significance and replace tabs and spaces with a single space
// const clean = () => {

// }

// const parse = (code: string) => {

//     // Convert code to an array
//     var codeA = code.split("\n")

//     // Cleaning code
//     var cleaned = []
//     for (var line of codeA) {
//         // Remove comments
//         line = line.split(";")[0]

//         // Replace /t with single space
//         // line = line.replace(/\t+/g, " ")

//         // Replace each block of spaces with a single one
//         line = line.replace(/\s\s+/g, " ")

//         // Remove spaces from start of line
//         line = line.trim()

//         // If line not blank add to cleaned code
//         if (line !== "") {
//             cleaned.push(line)
//         }

//     }

//     // console.log(cleaned)

//     // Find location of each label
//     var labels: {[key: string]: number} = {}
//     cleaned = cleaned.map((line, lineLocation) => {
//         var parts = line.split(" ")
//         console.log(parts)
//         var index = null
//         for (let i = 0; i < parts.length; i++) {
//             const part = parts[i];
//             if (opcodes.indexOf(part.toUpperCase()) !== -1) {
//                 index = i
//                 break
//             }
//         }
//         console.log(index)
//         if (index === 1) {
//             // Includes a label
//             var label = parts[0]
//             labels[label] = lineLocation
//             parts.splice(0, 1)
//         }

//         return parts
        
//     })

//     console.log({labels, cleaned})

//     // Now each instruction has the opcode at [0] and operand at [1] or [2] (depending on addressing mode) so just need to combine
//     // Instruction is abcc
//     // a = opcode
//     // b = addressing mode (0 for indirect, 1 for direct)
//     // c = location / data to use

//     var output = cleaned.map(item => {
//         var instruction = item[0].toUpperCase()
//         var mode = 0
//         var data: string | number = item[1]

//         // Determine addressing mode
//         if (item[1] === "#") {
//             mode = 1
//             data = item[2]
//         }

//         // Determine if data references a label or not
//         if (isNaN(Number(data))) {
//             if (labels[data] !== undefined) {
//                 data = labels[data]
//             } else {
//                 data = 0
//             }
//         }
        
//         var out
//         if (instruction === "DAT") {
//             return data.toString()
//         } else {
//             return  opcodes.indexOf(instruction).toString() + mode.toString() + data.toString() 
//         }

//     })

//     return output

// }

const execute = (memory: Array<string>) => {
    
}

var testInp = `
        INP
loop    OUT   
        STA count
        SUB # one
	    STA count
        BRP loop ; This is a comment
        HLT
one     DAT 1
count   DAT   
`


// const simulate = (code: string) => {
//     var memory = parse(code)
//     console.log(memory)
// }

// simulate(testInp)

class Machine {
    memory: string[]
    registers: {
        acc: number,
        pc: number,
        mar: number,
        mdr: number,
        cir: string,
    }
    output: string[]
    end: boolean
    constructor() {
        this.memory = ["000"]
        this.registers = {
            acc: 0,
            pc: 0, 
            mar: 0, 
            mdr: 0,
            cir: "",
        }
        this.output = []
        this.end = false
    }

    loadToRAM(code: string) {
        this.end = false

        // Convert code to an array
        var codeA = code.split("\n")

        // Cleaning code
        var cleaned = []
        for (var line of codeA) {
            // Remove comments
            line = line.split(";")[0]

            // Replace /t with single space
            // line = line.replace(/\t+/g, " ")

            // Replace each block of spaces with a single one
            line = line.replace(/\s\s+/g, " ")

            // Remove spaces from start of line
            line = line.trim()

            // If line not blank add to cleaned code
            if (line !== "") {
                cleaned.push(line)
            }

        }

        // console.log(cleaned)

        // Find location of each label
        var labels: {[key: string]: number} = {}
        cleaned = cleaned.map((line, lineLocation) => {
            var parts = line.split(" ")
            console.log(parts)
            var index = null
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (opcodes.indexOf(part.toUpperCase()) !== -1) {
                    index = i
                    break
                }
            }
            console.log(index)
            if (index === 1) {
                // Includes a label
                var label = parts[0]
                labels[label] = lineLocation
                parts.splice(0, 1)
            }

            return parts
            
        })

        console.log({labels, cleaned})

        // Now each instruction has the opcode at [0] and operand at [1] or [2] (depending on addressing mode) so just need to combine
        // Instruction is abcc
        // a = opcode
        // b = addressing mode (0 for indirect, 1 for direct)
        // c = location / data to use

        var output = cleaned.map(item => {
            var instruction = item[0].toUpperCase()
            var mode = 0
            var data: string | number = item[1]

            // Determine addressing mode
            if (item[1] === "#") {
                mode = 1
                data = item[2]
            }

            // Determine if data references a label or not
            if (isNaN(Number(data))) {
                if (labels[data] !== undefined) {
                    data = labels[data]
                } else {
                    data = 0
                }
            }
            
            var out
            if (instruction === "DAT") {
                return data.toString()
            } else {
                return  opcodes.indexOf(instruction).toString() + mode.toString() + data.toString() 
            }

        })
        console.log(output)
        this.memory = output
    }

    executeOne() {
        // TODO: make it like how vonn neumann cpu handles clock cycles and implement instructions
        if (!this.end ) {
            var instruction = this.memory[this.registers.pc]
            var opcode = instruction[0]
            var mode = instruction[1]
            instruction.substring(1)
            var data = instruction
            console.log({opcode, mode, data})
            this.registers.pc += 1
            if (opcode === "0") {
                this.end = true
            }
        }
    }

    execute() {
        setInterval(() => {
            this.executeOne()
        }, 1000);
    }
}

var a = new Machine()
a.loadToRAM(testInp)
a.execute()