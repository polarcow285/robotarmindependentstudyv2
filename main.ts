let link1CurrPos = 0
let link2CurrPos = 180
let link3CurrPos = 0
// in centimeters
let link1 = 19
let link2 = 10.5
let link3 = 13
hummingbird.startHummingbird()
hummingbird.setPositionServo(FourPort.One, 0)
hummingbird.setPositionServo(FourPort.Two, 180)
hummingbird.setPositionServo(FourPort.Three, 0)
// moveTo(0, 0, 0)
// basic.pause(1000)
// moveTo(180, 0, 0)
// basic.pause(1000)
basic.forever(function on_forever() {
    console.log("Hellloooooo")
    circle6()
    basic.pause(500)
    extend()
    basic.pause(500)
    /** 
    moveToXYZ(-23.5,0,19)
    basic.pause(500)
    moveToXYZ(-10,0,39)
    basic.pause(500)
    moveToXYZ(-15, 0, 32.5)
    basic.pause(500)
    moveToXYZ(15, 0, 28)
    basic.pause(500)
    moveToXYZ(13, 13, 30)
    basic.pause(500)
    
 */
    // moveToXYZ(15,15,21) #needs candidate points
    /** 
    moveToXYZ(-13, -12, 28)
    basic.pause(500)
    moveToXYZ(-18, -18, 19)
    basic.pause(500)
    
 */
})
// thetas = inv_solve(23.5, 0, 19)
// thetas = inv_solve(21.5, 0, 19)
// x max: 23.5
// y max: 23.5
// z max: 19
// can = findPoint(15, 15, 17)
// can = moveToPos(23.5, 0, 19)
// findPoint(15, 15, 17)
// circle6()
// serial.write_line("done")
// thetas = inv_solve(15, 0, 12)
// moveTo(thetas[0][0], thetas[0][1], thetas[0][2])
function extend() {
    moveToXYZ(-13, -12, 28)
    basic.pause(500)
    moveToXYZ(-18, -18, 19)
    basic.pause(500)
}

function circle6() {
    let x: number;
    let y: number;
    let z: number;
    let resolution = [0, 90, 180, 270]
    for (let i = 0; i < resolution.length; i++) {
        resolution[i] = resolution[i] * (Math.PI / 180)
        serial.writeValue("res", resolution[i])
    }
    let radius = 2
    let h = -13
    let k = 28
    for (let t of resolution) {
        serial.writeNumber(t)
        x = Math.round(h + radius * Math.cos(t))
        y = -12
        z = Math.round(k + radius * -Math.sin(t))
        moveToXYZ(x, y, z)
        basic.pause(200)
    }
    // xyz (0, 23.5, 19)
    console.log("done")
}

function moveToXYZ(x: number, y: number, z: number) {
    console.log("doing moveToXYZ")
    let t = []
    t = findPoint(x, y, z)
    moveTo(t[0], t[1], t[2])
}

function moveTo(target1: number, target2: number, target3: number) {
    target2 = 180 - target2
    
    
    
    while (link1CurrPos != target1 || link2CurrPos != target2 || link3CurrPos != target3) {
        if (link1CurrPos > target1) {
            link1CurrPos -= 1
        } else if (link1CurrPos < target1) {
            link1CurrPos += 1
        }
        
        if (link2CurrPos > target2) {
            link2CurrPos -= 1
        } else if (link2CurrPos < target2) {
            link2CurrPos += 1
        }
        
        if (link3CurrPos > target3) {
            link3CurrPos -= 1
        } else if (link3CurrPos < target3) {
            link3CurrPos += 1
        }
        
        hummingbird.setPositionServo(FourPort.One, link1CurrPos)
        hummingbird.setPositionServo(FourPort.Two, link2CurrPos)
        hummingbird.setPositionServo(FourPort.Three, link3CurrPos)
        basic.pause(10)
    }
}

function findPoint(x: number, y: number, z: number): number[] {
    let thetas: number[][];
    let nearestPoint: number[];
    let x_candPoints = []
    let y_candPoints = []
    let z_candPoints = []
    let result = inv_solve(x, y, z)
    let tolerance = 5
    // if no possible configuration of thetas for xyz point,
    // then find the nearest point
    if (result.length == 0) {
        serial.writeLine("need to find candidate points")
        for (let a = 0; a < tolerance; a++) {
            for (let b = 0; b < tolerance; b++) {
                for (let c = 0; c < tolerance; c++) {
                    thetas = inv_solve(x + a, y + b, z + c)
                    if (thetas.length != 0) {
                        serial.writeLine("found a candidate point!")
                        x_candPoints.push(x + a)
                        y_candPoints.push(y + b)
                        z_candPoints.push(z + c)
                    }
                    
                    thetas = inv_solve(x - a, y - b, z - c)
                    if (thetas.length != 0) {
                        serial.writeLine("found a candidate point!")
                        x_candPoints.push(x - a)
                        y_candPoints.push(y - b)
                        z_candPoints.push(z - c)
                    }
                    
                }
            }
        }
        // for i in range(len(x_candPoints)):
        // distance = distance = Math.sqrt((x-x_candPoints[i])**2 + (y-y_candPoints[i])**2 + (z-z_candPoints[i]**2)
        nearestPoint = find_nearest_points([x, y, z], x_candPoints, y_candPoints, z_candPoints)
        console.log("nearest point!")
        console.log(nearestPoint)
        // do inverse kinematics on that point
        thetas = inv_solve(nearestPoint[0], nearestPoint[1], nearestPoint[2])
        if (thetas.length == 0) {
            console.log("theres no hope for this point, its null")
        }
        
        return thetas[0]
    } else {
        // if thetas exist, no need to find candidate points
        serial.writeLine("no need to find candidate points")
        return result[0]
    }
    
}

function find_nearest_points(point: number[], x_points: number[], y_points: number[], z_points: number[]): number[] {
    let distance: number;
    let nearest_point = null
    let min_distance = 100
    let xP = [0, 9, 8, 7]
    serial.writeNumbers(x_points)
    let length = x_points.length
    serial.writeLine("lsndfaksnfsadkjfans")
    // serial.write_numbers(y_points)
    // serial.write_numbers(z_points)
    let count = 0
    serial.writeNumber(count)
    // calculates distance, finds nearest point
    for (let i = 0; i < length; i++) {
        distance = Math.sqrt((point[0] - x_points[i]) ** 2 + (point[1] - y_points[i]) ** 2 + (point[2] - z_points[i]) ** 2)
        if (distance < min_distance) {
            nearest_point = [x_points[i], y_points[i], z_points[i]]
            min_distance = distance
        }
        
    }
    return nearest_point
}

// leng = len(xP)
// length = len(x_points)
// listC = cand_points[0]
// serial.write_number(listC[0])
function inv_solve(x: number, y: number, z: number): number[][] {
    let isValid: boolean;
    let AP = Math.sqrt(x ** 2 + y ** 2)
    let s = z - link1
    let theta3_1 = Math.acos((y ** 2 + x ** 2 + s ** 2 - link2 ** 2 - link3 ** 2) / (2 * link2 * link3))
    let theta3_2 = -theta3_1
    let theta2_1 = Math.atan2(s, AP) - Math.atan(link3 * Math.sin(theta3_1) / (link2 + link3 * Math.cos(theta3_1)))
    let theta2_2 = Math.atan2(s, AP) - Math.atan(link3 * Math.sin(theta3_2) / (link2 + link3 * Math.cos(theta3_2)))
    let theta2_3 = Math.atan2(s, -AP) - Math.atan(link3 * Math.sin(theta3_1) / (link2 + link3 * Math.cos(theta3_1)))
    let theta2_4 = Math.atan2(s, -AP) - Math.atan(link3 * Math.sin(theta3_2) / (link2 + link3 * Math.cos(theta3_2)))
    let theta1_1 = Math.atan2(y, x)
    let theta1_2 = theta1_1 + Math.PI
    // convert to degrees
    theta1_1 = convertToDegrees(theta1_1)
    theta1_2 = convertToDegrees(theta1_2)
    theta2_1 = convertToDegrees(theta2_1)
    theta2_2 = convertToDegrees(theta2_2)
    theta2_3 = convertToDegrees(theta2_3)
    theta2_4 = convertToDegrees(theta2_4)
    theta3_1 = convertToDegrees(theta3_1)
    theta3_2 = convertToDegrees(theta3_2)
    let set1 = [theta1_1, theta2_1, theta3_1]
    let set2 = [theta1_1, theta2_2, theta3_2]
    let set3 = [theta1_2, theta2_3, theta3_1]
    let set4 = [theta1_2, theta2_4, theta3_2]
    let p = [set1, set2, set3, set4]
    let res = []
    for (let _set of p) {
        isValid = true
        for (let theta of _set) {
            if (theta > 180 || theta < 0) {
                isValid = false
                break
            }
            
        }
        if (isValid == true) {
            res.push(_set)
        }
        
    }
    if (res.length == 0) {
        
    } else {
        // serial.write_line("no values work :(")
        serial.writeLine("there is a possible configuration!")
    }
    
    return res
}

function convertToDegrees(theta: number): number {
    // checking for nan, nan is not equal to itself
    if (theta == theta) {
        return Math.round(theta * (180 / Math.PI))
    } else {
        // print("Error: cannot perform operation with NaN value.")
        // returns -1 because later we get rid of sets that have negative thetas
        return -1
    }
    
}

