var reader = require("readline-sync")
/**
 * 
 * 
 */

// var opcodes = ["HLT", "ADD", "SUB", "STA", "LDA", "BRA", "BRZ", "BRP", "INP", "OUT", "DAT"]



// const simulate = (code: string) => {
//     var memory = parse(code)
//     console.log(memory)
// }

// simulate(testInp)


var getUserInput = (text: string) => {
    return reader.question(`${text}: `)
}

// getUserInput("please", console.log)

class Machine {
    memory: string[]
    output: string[]
    end: boolean
    onInput: Function
    onOutput: Function

    registers = {
        alu: {
            add: () => {
                this.registers.acc.set(this.registers.acc.value+Number(this.registers.mdr.value))
            },
            sub: () => {
                this.registers.acc.set(this.registers.acc.value-Number(this.registers.mdr.value))
            }
        },
        acc: {
            value: 0,
            set: (inp: number) => {
                this.registers.acc.value = inp
            }
        },
        pc: {
            value: 0,
            set: (inp: number) => {
                this.registers.pc.value = inp
            },
            incrememnt: () => {
                this.registers.pc.value = this.registers.pc.value+1
            }
        },
        mar: {
            value: 0,
            getFromRAM: () => {
                // Store the data at value in mdr
                // this.registers.mdr.set(this.memory[this.registers.mar.value])
                return this.memory[this.registers.mar.value]
            },  
            storeInRAM: () => {
                // store the value of the mdr in the memory at values location
                this.memory[this.registers.mar.value] = this.registers.mdr.value
            },
            set: (inp: number) => {
                this.registers.mar.value = inp
            }
        },
        mdr: {
            value: "",
            set: (inp: string) => {
                this.registers.mdr.value = inp
            }
        }, 
        cir: {
            value: "",
            set: (inp: string) => {
                this.registers.cir.value = inp
            },
            decoded: {
                opcode: 0,
                mode: 0,
                operand: 0
            }
        }
    }

    opcodes = ["HLT", "ADD", "SUB", "STA", "LDA", "BRA", "BRZ", "BRP", "INP", "OUT", "DAT"]
    
    constructor(options?: {onInput?: Function, onOutput?: Function}) {
        this.memory = ["000"]
        this.output = []
        this.end = false
        this.onInput = getUserInput
        this.onOutput = console.log
        if (options?.onInput) {
            this.onInput = options.onInput
        } 
        if (options?.onOutput) {
            this.onOutput = options.onOutput
        }
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
                if (this.opcodes.indexOf(part.toUpperCase()) !== -1) {
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
        // b = addressing mode (0 for direct, 1 for immediate)
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
                return  this.opcodes.indexOf(instruction).toString() + mode.toString() + data.toString() 
            }

        })
        console.log(output)
        this.memory = output
    }

    fetch() {
        // Copy PC value to MAR
        this.registers.mar.set(this.registers.pc.value)
        
        // Load data in memory to MDR
        this.registers.mdr.set(this.registers.mar.getFromRAM())

        // Copy MDR to CIR
        this.registers.cir.set(this.registers.mdr.value)

        // Inrement PC
        this.registers.pc.incrememnt()
    }

    decode() {
        // Get CIR value
        var instruction = this.registers.cir.value

        // split into its parts
        this.registers.cir.decoded.opcode = Number(instruction[0])
        this.registers.cir.decoded.mode = Number(instruction[1])
        this.registers.cir.decoded.operand = Number(instruction.substring(2))

    }
    
    execute() {

        // Get decoded values
        var {opcode, mode, operand} = this.registers.cir.decoded
        // console.log(this.registers.cir.decoded)
        // Decide what to do
     
        switch (opcode) {
            case 0: 
                this.end = true
                break
            case 1:
                // Add data to ACC

                // Decide based on addressing mode
                if (mode === 0) {
                    // Load value from memory using operand as address

                    // Set mar to address
                    this.registers.mar.set(operand)
                    // Get data in memory
                    this.registers.mdr.set(this.registers.mar.getFromRAM())

                } else {
                    // Set mdr to value to use
                    this.registers.mdr.set(operand.toString())
                }

                this.registers.alu.add()
                break;
            case 2:
                // Sub data from ACC
                
                // Decide based on addressing mode
                if (mode === 0) {
                    // Load value from memory using operand as address

                    // Set mar to address
                    this.registers.mar.set(operand)
                    // Get data in memory
                    this.registers.mdr.set(this.registers.mar.getFromRAM())

                } else {
                    // Set mdr to value to use
                    this.registers.mdr.set(operand.toString())
                }

                this.registers.alu.sub()

                break;
            case 3:
                // Store ACC in Memory at address given
                var acc = this.registers.acc.value
                
                // Set MDR to data to store
                this.registers.mdr.set(acc.toString())

                // Set MAR to operand
                this.registers.mar.set(operand)

                // Store
                this.registers.mar.storeInRAM()

                // console.log(this.memory)
                break;   
            case 4:
                // Load data into acc

                // Decide based on mode
                if (mode === 0) {
                    // Load value from memory using operand as address

                    // Set mar to address
                    this.registers.mar.set(operand)
                    // Get data in memory
                    this.registers.mdr.set(this.registers.mar.getFromRAM())

                    // Copy mdr to acc
                    this.registers.acc.set(Number(this.registers.mdr.value))

                } else {
                    // Set acc to value to use
                    this.registers.acc.set(operand)
                }

                break;
            case 5:
                // Set PC to operand
                this.registers.pc.set(operand)
                break;
            case 6: 
                // Set PC to operand if ACC is 0
                if (this.registers.acc.value === 0) {
                    this.registers.pc.set(operand)
                }
                break;
            case 7: 
                // Set PC to operand if ACC is > 0
                if (this.registers.acc.value > 0) {
                    this.registers.pc.set(operand)
                }
                break;
            case 8: 
                // Get user input and store in ACC
                // TODO add checks to if it is a number or not
                var input = this.onInput("Input a number")
                this.registers.acc.set(input)
                break;
            case 9: 
                // output acc
                this.onOutput(this.registers.acc.value)
                break;
            
            default:
                break;
        }
        
        
    }
}

var testInp = `
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

// TODO: when parsing if using immediate check if operand is a valid number

var a = new Machine()
a.loadToRAM(testInp)
while (!a.end) {
    a.fetch()
    a.decode()
    a.execute()
}
console.log("finished")
// a.execute()