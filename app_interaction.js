// document.ontouchmove = function(e){
//     e.preventDefault();
//     e.stopPropagation(); 
//     e.stopImmediatePropagation(); 
// }

// prevent browser's context menu from showing on double tap and right click
document.addEventListener('contextmenu', function(ev){
    ev.preventDefault();
    return false;
})

app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointerdown', function(ev){
    let activeDesignPlan = app.activeProject.activeDesignPlan;
    activeDesignPlan.touchStartPointers[ev.pointerId] = ev;    
    //activeDesignPlan.touchCurrentPointers[ev.pointerId] = ev;    
    
    if(Object.keys(activeDesignPlan.touchStartPointers).length == 1){
        activeDesignPlan.activeTransformAction = 'translate';
        console.log('xtouch,ytouch = ' + parseInt(ev.clientX), parseInt(ev.clientY))

        // var designPlanRect = activeDesignPlan.DOM.getBoundingClientRect();
        // let originX = (ev.clientX-designPlanRect.x)/ (activeDesignPlan.transformValues.scale)// - this.transformValues.x//(x - designPlanRect.x)/(this.transformValues.scale);
        // let originY = (ev.clientY-designPlanRect.y)/ (activeDesignPlan.transformValues.scale)// - this.transformValues.y//(y - designPlanRect.y)/(this.transformValues.scale);
        // insertTestPoint(activeDesignPlan.DOM,originX,originY,'rgba(100,0,0,1)');


    } else if(Object.keys(activeDesignPlan.touchStartPointers).length == 2){
        console.log('two pointers started')
        activeDesignPlan.activeTransformAction = 'scale';
        let x = [];
        let y = [];
        for(k in activeDesignPlan.touchStartPointers){ // get touch 1 coord x[0], y[0] and touch 2 (current) coord x[1], y[1]
            x.push(activeDesignPlan.touchStartPointers[k].clientX);
            y.push(activeDesignPlan.touchStartPointers[k].clientY);

            activeDesignPlan.touchPointersInProgress[k] = activeDesignPlan.touchStartPointers[k]; // initialize both touchPointersInProgress with first touch values
        }
        let originX = (x[0]+x[1])/2;
        let originY = (y[0]+y[1])/2;
        activeDesignPlan.transformOrigin(originX, originY)
        activeDesignPlan.touch2PointersInitialDistance = Math.sqrt(Math.pow(x[0] - x[1],2) + Math.pow(y[0] - y[1], 2));         
        console.log(activeDesignPlan.DOM.getBoundingClientRect())
    }
})

app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointermove', function(ev){
    let activeDesignPlan = app.activeProject.activeDesignPlan;
    activeDesignPlan.touchPointersInProgress[ev.pointerId] = ev; // update this pointer in progress to reference it when other touches event comes in

    let clientX = parseInt(ev.clientX)
    let clientY = parseInt(ev.clientY)

    if (activeDesignPlan.activeTransformAction == 'translate'){
        console.log('moving')
        activeDesignPlan.moveOnTouch(clientX - activeDesignPlan.touchStartPointers[ev.pointerId].clientX,
                                    clientY - activeDesignPlan.touchStartPointers[ev.pointerId].clientY);
    } else if(activeDesignPlan.activeTransformAction == 'scale'){
        //console.log('zooming')
        //select other touch values
       

       
        activeDesignPlan.changeZoomOnPinch(clientX, clientY, ev.pointerId);
        //console.log('clientX, clientY: ' + ev.clientX, ev.clientY)
        //console.log('Delta: ' + delta);
    }
})


// pointer ending events
app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointerup', function(ev){
    pointerEndHandler(ev);
    //console.log('pointer up')
})

app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointercancel', function(ev){
    //console.log('pointer cancelled')
    pointerEndHandler(ev);
})

app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointerout', function(ev){
    pointerEndHandler(ev);
    //console.log('pointer out')
})

app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointerleave', function(ev){
    pointerEndHandler(ev);
    //console.log('pointer leave')
})

function pointerEndHandler(ev){
    let activeDesignPlan = app.activeProject.activeDesignPlan;
    //console.dir(activeDesignPlan.touchStartPointers)
    if(activeDesignPlan.activeTransformAction == 'translate'){ // one finger on map moving it
        activeDesignPlan.saveTransformValues(activeDesignPlan.transformValues.x + ev.clientX - activeDesignPlan.touchStartPointers[ev.pointerId].clientX,
                                             activeDesignPlan.transformValues.y + ev.clientY - activeDesignPlan.touchStartPointers[ev.pointerId].clientY,
                                             '');
    } else if(activeDesignPlan.activeTransformAction == 'scale'){ // two fingers zooming
        activeDesignPlan.saveTransformValues(activeDesignPlan.moveXValueInProgress,
                                             activeDesignPlan.moveYValueInProgress,
                                             activeDesignPlan.scaleInProgress); // set end scale to the design plan object
    }
    delete activeDesignPlan.touchStartPointers[ev.pointerId]; // empty a touch event args array
    activeDesignPlan.activeTransformAction == '' // at least one finger was let go, cancel all transforms
}