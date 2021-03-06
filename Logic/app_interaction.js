// prevent browser's context menu from showing on double tap and right click
// document.addEventListener('contextmenu', function(ev){
//     ev.preventDefault();
//     return false;
// })

// var manager = new Hammer.Manager(document);

// Create a recognizer
// var singletap = new Hammer.Tap({
//   event: 'singletap',
//   taps: 1
// });

// Add the recognizer to the manager
//manager.add(singletap);

// Subscribe to desired event
// manager.on('singletap', function(e) {
//   console.log('hammer singletap')
// });

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    let options = {
        edge	            :	'right',
        draggable	        :	true,
        inDuration	        :	250,
        outDuration     	:	200,
        onOpenStart         :	null,
        onOpenEnd       	:	null,
        onCloseStart    	:	null,
        onCloseEnd      	:	null,
        preventScrolling	:	true
    }
    var instances = M.Sidenav.init(elems, options);
  });



document.addEventListener('singleTap', function(ev){
    //console.log('document - singleTap, ev: ' + ev);
    //console.log(ev);
    
    
})

document.addEventListener('doubleTap', function(ev){
    console.log('document - dualTap, ev: ' + ev);
}, true)


//manager.on('singletap', function(ev) {



let quickTapWaitFlag = false;
let tapsInterval = 300; // time for tap duration, or time gap between taps to determine single/ double tap
let tapDownWaitFunction = null;  // setTimeout function - used to cancel the timeout; if the function runs after the timeout the touch was held long enough for Tap and Held event
let tapUpWaitFunction = null; // setTimeout function - used to cancel the timeout; if runs marks expiration of the time wait for another tap
let tapCounter = 0;

let singleTapFunction = null; // used to setTimeout on singleTap function to execute it after tapsInterval in case second tap came, it's used to cancel single tap function
let doubleTapFunction = null;

app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointerdown', function(ev){
    console.log('app container touch')
    let activeDesignPlan = app.activeProject.activeDesignPlan;
    activeDesignPlan.touchStartPointers[ev.pointerId] = ev;    
    activeDesignPlan.touchStartPointers[ev.pointerId].starTime = new Date(); // to test for single, double tap

    clearTimeout(tapDownWaitFunction); // in case 2nd finger tuched or same finger touched again
    clearTimeout(tapUpWaitFunction);

    //activeDesignPlan.touchCurrentPointers[ev.pointerId] = ev;    
    quickTapWaitFlag = true; // set the flag that is set to false after tapsInterval, this flag status is checked in the touch end function
    tapDownWaitFunction = setTimeout(function(){tappedAndHeld(ev)}, tapsInterval); // set timeout to see if the finger touched and was held for at least tapsInterval
})

function tappedAndHeld(ev){ // finger was tapped and held for at least tapsInterval

    //check if there is an active mapObject and if has the popup opened, if so save it to after the action is finished (maybe map zoom or drag) show it again automatically
    if(general_validation(app.activeProject.activeDesignPlan.mapObjectPopupMenu)){ // if there is existing popup menu reference in the designPlan obejct
        app.activeProject.activeDesignPlan.reopenPopup = true;
        app.activeProject.activeDesignPlan.activeMapObject.popupMenuRemove();
    }


    let activeDesignPlan = app.activeProject.activeDesignPlan;
    quickTapWaitFlag = false;  // turn off the flag that 
    tapCounter = 0; // set tap counter to 0 - if any of the taps was held it means that it is not multi tap event
    console.log('tapped and held')
    if(Object.keys(activeDesignPlan.touchStartPointers).length == 1){
        activeDesignPlan.activeTransformAction = 'translate';
        console.log('xtouch,ytouch = ' + parseInt(ev.clientX), parseInt(ev.clientY))

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
}


app.activeProject.activeDesignPlan.parentDOM.addEventListener('pointermove', function(ev){
    if (!quickTapWaitFlag){
        clearTimeout(tapDownWaitFunction);
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
    //console.dir(ev)
    //on end pointer check if the just finished pointer action triggered the popup menu to hide if so reopen it
    if(app.activeProject.activeDesignPlan.reopenPopup){    
        // check if the element is withing the viewport
        if(isElementInViewport(app.activeProject.activeDesignPlan.activeMapObject.DOM)){
            app.activeProject.activeDesignPlan.activeMapObject.popupMenuShow(); // open popupmenu
        } else {// if the element was not in the viewport set the popupReopen to false to not to reopen it when the element comes back into the viewport
            app.activeProject.activeDesignPlan.reopenPopup = false; 
        }
        
    }

    if(activeDesignPlan.touchStartPointers[ev.pointerId]){
        console.log('pointer up')
        if (quickTapWaitFlag){ // check if the flag for single tap is still set (not set to false by notASingleTap)
            clearTimeout(tapDownWaitFunction);
            tapCounter++;
        } else {
            tapCounter = 0;
        }
    
        if (tapCounter == 1)
            singleTapFunction = setTimeout (function(){singleTap(ev)}, tapsInterval);
        else if (tapCounter == 2){
            clearTimeout(singleTapFunction)
            doubleTapFunction = setTimeout (function(){doubleTap(ev)}, tapsInterval);            
        } else if (tapCounter != 0){
            clearTimeout(doubleTapFunction)
            console.log('more than two tap');
        }

        tapUpWaitFunction = setTimeout(function(){ tapCounter = 0;}, tapsInterval); // set the tap count to 0 if no additional taps happened within tapsInterval
        
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
    }
    
    activeDesignPlan.activeTransformAction == '' // at least one finger was let go, cancel all transforms
}

let eventSingleTap = null;
function singleTap(ev){
    cancelTappingDetection();
    eventSingleTap = new CustomEvent('singleTap', {
        bubbles: true,
        detail:{
            eventData: ev
        }      
    })

   
    //console.log('single tap');    
    ev.target.dispatchEvent(eventSingleTap);

    // if (ev.target.classList.contains('map_object_icon') && app.activeProject.activeDesignPlan.mapObjects.keys.length > 0){
    //     for(k in app.activeProject.activeDesignPlan.mapObjects){
    //         let mapObject = app.activeProject.activeDesignPlan.mapObjects[k];
    //         mapObject.containerDOM.dispatchEvent(eventSingleTap)
    //     }
    // } else {
    //     document.dispatchEvent(eventSingleTap)
    //     app.activeProject.activeDesignPlan.parentDOM.dispatchEvent(eventSingleTap)
    //     app.activeProject.activeDesignPlan.DOM.dispatchEvent(eventSingleTap)
    //     app.customEvents['singleTap'] = eventSingleTap; 
    // }
    
    
}

let eventDoubleTap = null;
function doubleTap(ev){
    cancelTappingDetection();
    //console.log('double tap');
    eventDoubleTap = new CustomEvent('doubleTap', {
        bubbles: true,
        detail:{
            eventData: ev
        }
    })    

    ev.target.dispatchEvent(eventDoubleTap);
    // if (ev.target.classList.contains('map_object_icon') && app.activeProject.activeDesignPlan.mapObjects.keys.length > 0){
    //     for(k in app.activeProject.activeDesignPlan.mapObjects){
    //         let mapObject = app.activeProject.activeDesignPlan.mapObjects[k];
    //         mapObject.containerDOM.dispatchEvent(eventDoubleTap)
    //     }
    // } else {
    //     document.dispatchEvent(eventDoubleTap)
    //     app.activeProject.activeDesignPlan.parentDOM.dispatchEvent(eventDoubleTap)
    //     app.customEvents['doubleTap'] = eventDoubleTap;
    // }
    

   
    
}

function cancelTappingDetection(){
    tapCounter = 0;
    quickTapWaitFlag = false;
}