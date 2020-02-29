function checkContainer(x, index, step){
    if(x[index] > x[index+step]){
        let y = checkContainer(x, index, step+1)
        return x[index] - x[index+step] + y;
    } else if(x[index] < x[index+step]){
        checkContainer(x, index+step, index+step+1)
    }        
}

//x = [0,1,0,2,1,0,1,3,2,1,2,1]
//
//x = [0,1,0,2,1,0,1,3,2,1,2,1]
x = [10,3,5,5,8,5,6,9,3,5]
let boundries = findBounds(x)
console.log(boundries)
let waterAmount = 0;
for(let elem of boundries){
    
    let min = Math.min(x[elem[0]], x[elem[1]])
    for(let i=elem[0]; i<elem[1];i++){
        waterAmount += min - x[i]
    }
}

console.log(waterAmount)

function findBounds(x){
    let i = 0;
    let step = 1;
    let boundries = []
    let isContainer = false;
    while(i<x.length){
        while(x[i]>x[i+step]){
            if(i+step+1<x.length){
                isContainer = true;
                step++
            } else {    
                isContainer = false;            
                break;
            }            
        }
        if(isContainer){
            boundries.push([i, i+step])
            i = i+step;
        } else {
            i++;
        }
        
        step=1;
        
    }
    
    return boundries;
}
