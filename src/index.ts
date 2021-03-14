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


// var getUserInput = (text: string) => {
//     return require("readline-sync").question(`${text}: `)
// }

// getUserInput("please", console.log)

class Machine {
    memory: string[]
    output: string[]
    end: boolean
    onInput: Function
    onOutput: Function
    timeout: number
    log: Function

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
    
    constructor(options: {onInput: Function, onOutput?: Function, timeout?: number, logOutput?: Function}) {
        this.memory = ["000"]
        this.output = []
        this.end = false
        this.onInput = options.onInput
        this.onOutput = console.log
        this.timeout = 500
        this.log = ()=>{}
        if (options?.timeout) this.timeout = options.timeout
        if (options?.onOutput) this.onOutput = options.onOutput
        if (options?.logOutput) this.log = options.logOutput
    }

    loadToRAM(code: string) {
        this.end = false

        this.log("Compiling code")

        // Convert code to an array
        var codeA = code.split("\n")

        // Cleaning code
        this.log("Removing unneeded text")
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

        // Find location of each label
        var labels: {[key: string]: number} = {}

        this.log("Finding labels")

        cleaned = cleaned.map((line, lineLocation) => {
            var parts = line.split(" ")
            // console.log(parts)
            var index = null
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (this.opcodes.indexOf(part.toUpperCase()) !== -1) {
                    index = i
                    break
                }
            }
            // console.log(index)
            if (index === 1) {
                // Includes a label
                var label = parts[0]
                labels[label] = lineLocation
                parts.splice(0, 1)
            }

            return parts
            
        })

        // console.log({labels, cleaned})

        // Now each instruction has the opcode at [0] and operand at [1] or [2] (depending on addressing mode) so just need to combine
        // Instruction is abcc
        // a = opcode
        // b = addressing mode (0 for direct, 1 for immediate)
        // c = location / data to use

        this.log("Converting to instructions")
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
            
            if (instruction === "DAT") {
                return data.toString()
            } else {
                return  this.opcodes.indexOf(instruction).toString() + mode.toString() + data.toString() 
            }

        })
        // console.log(output)

        this.memory = output

        this.log("Loaded to memory")
    }

    fetch() {
        this.log("\n------Fetching------")

        // Copy PC value to MAR
        this.registers.mar.set(this.registers.pc.value)
        this.log("Copying PC to MAR")

        // Load data in memory to MDR
        this.registers.mdr.set(this.registers.mar.getFromRAM())
        this.log("Copy memory at MAR address to MDR")

        // Copy MDR to CIR
        this.registers.cir.set(this.registers.mdr.value)
        this.log("Copy MDR to CIR")

        // Inrement PC
        this.registers.pc.incrememnt()
        this.log("Incrememnt PC")

    }

    decode() {
        this.log("\n------Decoding------")
        // Get CIR value
        var instruction = this.registers.cir.value
        this.log("Splitting CIR into opcode, mode and operand")

        // split into its parts
        
        var opcode = Number(instruction[0])
        var mode = Number(instruction[1])
        var operand = Number(instruction.substring(2))
        this.registers.cir.decoded.opcode = opcode
        this.registers.cir.decoded.mode = mode
        this.registers.cir.decoded.operand = operand
        this.log(`Opcode: ${opcode}, Mode: ${mode}, Operand: ${operand}`)

    }
    
    execute() {
        this.log("\n------Executing------")

        // Get decoded values
        var {opcode, mode, operand} = this.registers.cir.decoded
        // console.log(this.registers.cir.decoded)
        // Decide what to do
     
        this.log("Determing command")
        switch (opcode) {
            case 0: 
                this.log("Halting program")
                this.end = true
                break
            case 1:
                // Add data to ACC
                this.log("Command: Add")
                // Decide based on addressing mode
                if (mode === 0) {
                    this.log("Using direct address mode")
                    // Load value from memory using operand as address

                    // Set mar to address
                    this.registers.mar.set(operand)
                    this.log(`Settings MAR to address ${operand}`)

                    // Get data in memory
                    this.registers.mdr.set(this.registers.mar.getFromRAM())
                    this.log("Copying value at MAR address to MDR")

                } else {
                    this.log("Using immediate address mode")
                    // Set mdr to value to use
                    this.registers.mdr.set(operand.toString())
                    this.log("Setting MDR to operand value")
                }

                this.log("Adding MDR to ACC")
                this.registers.alu.add()
                break;
            case 2:
                // Sub data from ACC
                this.log("Command: Subtract")
                
                // Decide based on addressing mode
                if (mode === 0) {
                    // Load value from memory using operand as address
                    this.log("Using direct address mode")

                    // Set mar to address
                    this.registers.mar.set(operand)
                    this.log(`Settings MAR to address ${operand}`)

                    // Get data in memory
                    this.registers.mdr.set(this.registers.mar.getFromRAM())
                    this.log("Copying value at MAR address to MDR")

                } else {
                    this.log("Using immediate address mode")
                    
                    // Set mdr to value to use
                    this.registers.mdr.set(operand.toString())
                }

                this.log("Subtracting MDR from ACC")
                this.registers.alu.sub()

                break;
            case 3:
                this.log("Command: Store")
                // Store ACC in Memory at address given
                
                var acc = this.registers.acc.value
                
                // Set MDR to data to store
                this.registers.mdr.set(acc.toString())
                this.log("Settings MDR to data to store")

                // Set MAR to operand
                this.registers.mar.set(operand)
                this.log(`Setting MAR to ${operand}`)

                // Store
                this.registers.mar.storeInRAM()
                this.log("Copying MDR into Memory")

                // console.log(this.memory)
                break;   
            case 4:
                this.log("Command: Load")
                // Load data into acc

                // Decide based on mode
                if (mode === 0) {
                    this.log("Using direct address mode")
                    // Load value from memory using operand as address

                    // Set mar to address
                    this.registers.mar.set(operand)
                    this.log(`Setting MAR to ${operand}`)

                    // Get data in memory
                    this.registers.mdr.set(this.registers.mar.getFromRAM())
                    this.log("Copying memory at MAR address to MDR")

                    // Copy mdr to acc
                    this.registers.acc.set(Number(this.registers.mdr.value))
                    this.log("Copying MDR to ACC")

                } else {
                    this.log("Using immediate address mode")
                    // Set acc to value to use
                    this.registers.acc.set(operand)
                    this.log("Copying operand to ACC")

                }

                break;
            case 5:
                this.log("Command: Branch always")
                // Set PC to operand
                this.registers.pc.set(operand)
                this.log("Setting PC to operand")
                break;
            case 6: 
                this.log("Command: Branch if 0")
                // Set PC to operand if ACC is 0
                if (this.registers.acc.value === 0) {
                    this.registers.pc.set(operand)
                    this.log("Setting PC to operand")
                } 
                break;
            case 7: 
                this.log("Command: Branch if positive")
                // Set PC to operand if ACC is > 0
                if (this.registers.acc.value > 0) {
                    this.log("Settings PC to operand")
                    this.registers.pc.set(operand)
                }
                break;
            case 8: 
                this.log("Command: Input")
                // Get user input and store in ACC
                // TODO add checks to if it is a number or not
                var input = this.onInput("Input a number")
                this.registers.acc.set(input)
                this.log(`Settings ACC to ${input}`)
                break;
            case 9: 
                this.log("Command: Output")
                // output acc
                this.onOutput(this.registers.acc.value)
                this.log("Outputting ACC")
                break;
            
            default:
                break;
        }
        
        
    }

    async run () {
        while (!this.end) {
            this.fetch()
            await new Promise(resolve => setTimeout(resolve, this.timeout));
            this.decode()
            await new Promise(resolve => setTimeout(resolve, this.timeout));
            this.execute()
            await new Promise(resolve => setTimeout(resolve, this.timeout));
        }
    }
}

module.exports = Machine
// TODO: when parsing if using immediate check if operand is a valid number

