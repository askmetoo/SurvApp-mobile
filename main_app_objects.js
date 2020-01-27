function application(){
    this.users = {};
    this.projects = {};
    this.activeProject = null;
    this.currentUser = null;
    this.appMenus = {};
}

application.prototype.addUser = function(user){
    this.users[user.email] = user;
}

application.prototype.addProject = function(project){
    this.projects[project.name] = project;
}

application.prototype.setCurrentUser = function(user){
    this.currentUser = user;
}

application.prototype.addAppMenu = function(menu){
    this.appMenus[menu.name] = menu;
}

application.prototype.setActiveProject = function(project){
    this.activeProject = project;
}



function user(fName, lName, email, permissions) {
    this.fName = fName;
    this.lName = lName;
    this.email = email;
    this.permissions = permissions;
}

user.prototype.setPermissions = function(permissions){
    this.permissions = permissions;
}

function userPermissions(masterUser){
    this.masterUser = masterUser;
    if(masterUser){
        this.designPlanEdit = true;
        this.saveAsPdf = true;
        this.viewPrices = true;
        this.viewObjectsMenu = true;
    } else {
        this.designPlanEdit = false;
        this.saveAsPdf = false;
        this.viewPrices = false;
        this.viewObjectsMenu = false;
    }
    
}

user.prototype.setPermission = function(permission, value){
    this.permissions[permission] = value;
}

function project(name, createdBy = 'auto', cretedDate = new Date()){
    this.app = null;
    this.name = name;
    this.designPlans = {};
    this.activeDesignPlan = null;
    this.createdBy = createdBy;
    this.createdDate = cretedDate;
    this.customer = null;
}

project.prototype.addDesignPlan = function(designPlan){
    this.designPlans[designPlan.name] = designPlan;
    designPlan.setParentProject(this);
}

project.prototype.setActiveDesignPlan = function(designPlan){
    this.activeDesignPlanID = designPlan.name;
    this.activeDesignPlan = designPlan;
}

//it's like a map i.e 1st fl, basement etc
function designPlan(name, designPlanDOMID){
    this.name = name;
    this.DOM = document.getElementById(designPlanDOMID);
    this.parentDOM = this.DOM.parentElement;
    this.mapImageSrc = '';

    this.containerDOM = null;
    this.parentProject = null;
    this.mapObjects = {};
    this.activeMapObject = null; // object that was last clicked
    this.selectedMapObjects = {}; // objects that were clicked with ctrl button pressed (first object doesn't have to be clicked with ctrl)
    this.currentlyClickedMapObject = null; // currently clicked object - this is used for moving the object on mouse move
    
    this.zoomIntensity = 0.1;
    this.scrollSpeed = 10;
    
    
    this.selectionFrameDOMs = {};
    this.elementToTransform = null;
    this.mapObjectPopupMenu = null;

    this.activeTransformAction = '';
    this.moveXValueInProgress = 0;
    this.moveYValueInProgress = 0;
    this.transformValues = {x: parseInt(this.DOM.offsetLeft), y: parseInt(this.DOM.offsetTop), scale: 1, rotation: 0, originX: 0, originY: 0};

    this.touchStartPointers = {}; // pointers on first touch, each pointer is a touch point
    this.touchPointersInProgress = {};
    this.scaleInProgress = 1;
    this.touch2PointersInitialDistance = 0;   

    this.DOM.style.transformOrigin = 0 + 'px ' + 0 + 'px';

}

designPlan.prototype.loadMapImage = function(mapImage){
    this.mapImageSrc = mapImage;
    let query = '#'+this.DOM.id+'>img'
    let dom = document.querySelector(query)
    dom.src = this.mapImageSrc;
}

designPlan.prototype.setParentProject = function(project){
    this.parentProject = project;
}

designPlan.prototype.setDOM = function(DOM){
    this.DOM = DOM;
}

designPlan.prototype.saveTransformValues = function(x,y,scale){
    if(x != ''){
        this.transformValues.x = x;
    }

    if(y != ''){
        this.transformValues.y = y;
    }

    if(scale != ''){
        this.transformValues.scale = scale;
    }
}

designPlan.prototype.addMapObject = function(mapObject){
    this.mapObjects[mapObject.ID] = mapObject; 
    mapObject.addPopupMenu();
    mapObject.addPopupMenuItems(['info', 'chat', 'status', 'pic', 'test']);   
}

// insert element to the map objects list, render it on the page, remove it from the side bar
designPlan.prototype.insertElementToTheMap = function(mapObject, clientX, clientY){
        //var mapObject = this.parentProject.parent_app.app_panes;
        mapObject.parentDesignPlan = this;
        this.addMapObject(mapObject)
        var designPlanRect = this.DOM.getBoundingClientRect();
        var relative_left = (clientX - designPlanRect.x) / this.scale;
        var relative_top = (clientY - designPlanRect.y) / this.scale;
        this.setObjectLocation(mapObject, relative_left, relative_top);            
        
        this.parentProject.parent_app.app_panes['main-content__left-sidebar__map-objects'].remove_item(mapObject.ID); //order here is important 1. remove from side bar, 2.insert on the map
        this.RENDER_MapObject(mapObject.ID);
}

designPlan.prototype.getTransformedXY = function(){ // gets position of the designPlan after translation
    var xy = {
        x: 0,
        y: 0
    }
    var style = this.DOM.style.getPropertyValue('transform') //returns i.e. translate(99px, 146px) scale(1) rotate(0deg)
   
    if(general_validation(style)){
        var translate = style.match(/\(([^)]+)\)/); // regular expression that gets a value in 1st parenthesis - value of translate        
        xy.x += parseInt(translate[1].split(',')[0]);
        xy.y += parseInt(translate[1].split(',')[1])
    }
   return xy;
}

designPlan.prototype.setCurrentlyClickedObject = function(clickedObject){
    // add currently_clicked class
        this.currentlyClickedMapObject = clickedObject; 
        this.currentlyClickedMapObject.DOM.classList.add("map_object-" + this.activeMapObject.type + "_currently_clicked")     
}

designPlan.prototype.unsetCurrentlyClickedObject = function(){
    this.currentlyClickedMapObject.DOM.classList.remove("map_object-" + this.activeMapObject.type + "_currently_clicked")
    this.currentlyClickedMapObject = null;
}

designPlan.prototype.setActiveObject = function(mapObject){
    if(this.activeMapObject!=null){ // remove selected_active class from previous element
        //this.activeMapObject.DOM.classList.remove("map_object-" + this.activeMapObject.type + "_selected_active");         
        this.unsetActiveObject()
    }    
    
    if(mapObject != null){
        this.activeMapObject = mapObject;
        this.activeMapObject.DOM.classList.add("map_object-" + this.activeMapObject.type + "_selected_active");        
        this.selectionFrameDOMs = add_selection_frame_around_DOM(this.activeMapObject.DOM);        
    }
}

designPlan.prototype.unsetActiveObject = function(){
    if(general_validation(this.activeMapObject)){
        this.activeMapObject.DOM.classList.remove("map_object-" + this.activeMapObject.type + "_selected_active"); 
        this.activeMapObject = null;
        for(var k in this.selectionFrameDOMs){
            if(k== 'parent') continue;
            this.selectionFrameDOMs[k].remove();
        }
    }    
}

designPlan.prototype.addSelectedObject = function(selectedObject){
    this.selectedMapObjects[selectedObject.ID] = selectedObject;
    this.selectedMapObjects[selectedObject.ID].DOM.classList.add('map_object-' + selectedObject.type + '_selected');
}

designPlan.prototype.clearSelectedObjects = function(){
    for(var k in this.selectedMapObjects){
        this.removeSelectedObject(this.selectedMapObjects[k]);
    }
}

designPlan.prototype.removeSelectedObject = function(objectToRemove){
    this.selectedMapObjects[objectToRemove.ID].DOM.classList.remove('map_object-' + objectToRemove.type + '_selected');
    //console.log('removed: ' + delete this.selectedMapObjects[objectToRemove.ID]);
}

designPlan.prototype.changeZoomOnScroll = function(wheel){
    wheel = wheel < 0 ? 1 : -1;
    this.scale += wheel * this.zoomIntensity;
    this.scale = Math.min(Math.max(.125, this.scale),4); // zoom limits
    this.applyTransform();
}

designPlan.prototype.scrollHorizontally = function(wheel){
    wheel = wheel < 0 ? 1 : -1;
    this.moveXValueInProgress += wheel * this.scrollSpeed;   
    this.applyTransform();
}

designPlan.prototype.scrollVertically = function(wheel){
    wheel = wheel < 0 ? 1 : -1;
    this.moveYValueInProgress += wheel * this.scrollSpeed;
    this.applyTransform();
}

designPlan.prototype.changeZoomOnPinch = function(x, y, pointerId){    
    let otherFingerTouch = null;
    for(let k in this.touchPointersInProgress){
        if (k == pointerId) continue;
        otherFingerTouch = this.touchPointersInProgress[k];
    }
    let deltaBetweenTouchpoints = Math.sqrt(Math.pow(x - otherFingerTouch.clientX, 2) + Math.pow(y - otherFingerTouch.clientY, 2));
       
    let scaleDelta = deltaBetweenTouchpoints / this.touch2PointersInitialDistance
    this.scaleInProgress = this.transformValues.scale * scaleDelta;

    //this.moveOnTouch(-(this.scaleInProgress-1)*this.transformValues.originX, -(this.scaleInProgress-1)*this.transformValues.originY)
    //this.moveOnTouch(this.transformValues.originX,this.transformValues.originY)
    this.applyTransform();
}

designPlan.prototype.moveOnTouch = function(x,y){
    //console.log(x,y);
    this.moveXValueInProgress = this.transformValues.x + x
    this.moveYValueInProgress = this.transformValues.y + y// /this.transformValues.scale;
   this.applyTransform();
}

designPlan.prototype.applyTransform = function(){
    console.log('applying transform: ' + this.moveXValueInProgress, this.moveYValueInProgress, this.scaleInProgress)
    this.DOM.style.transform = `translate(${this.moveXValueInProgress}px, ${this.moveYValueInProgress}px) scale(${this.scaleInProgress})`;
}

designPlan.prototype.transformOrigin = function(x, y){
    var designPlanRect = this.DOM.getBoundingClientRect();   

    this.transformValues.originX = (x-designPlanRect.x)/ (this.transformValues.scale)// - this.transformValues.x//(x - designPlanRect.x)/(this.transformValues.scale);
    this.transformValues.originY = (y-designPlanRect.y)/ (this.transformValues.scale)// - this.transformValues.y//(y - designPlanRect.y)/(this.transformValues.scale);
    //insertTestPoint(this.DOM,this.transformValues.originX,this.transformValues.originY);
    this.DOM.style.transformOrigin = this.transformValues.originX + 'px ' + this.transformValues.originY + 'px';

    let designPlanRect2 = this.DOM.getBoundingClientRect();   
    this.moveOnTouch(-(designPlanRect2.x - designPlanRect.x), -(designPlanRect2.y - designPlanRect.y))
    
}

designPlan.prototype.setSelectionFrameDOMs = function(DOMs){
    this.selectionFrameDOMs = {
        parent: DOMs['parent'],
        frame : DOMs['frame'],
        top_left_node: DOMs['top_left'],
        top_right_node: DOMs['top_right'],
        bottom_right_node: DOMs['bottom_right'],
        bottom_left_node: DOMs['bottom_left']
    }
}
//figure out if this is resizing or rotation from the ID of the node - selectionNodeID
designPlan.prototype.setElementToTransform = function(selectionNodeID, originX, originY, operation){// set element and node to resize at the moment mousemove occurs
    var elementID = selectionNodeID.split('__')[0];
    var mapObject = this.mapObjects[elementID];
    var objectRect = mapObject.DOM.getBoundingClientRect();
    this.DOM.style.cursor = 'nwse-resize';
    console.log('Resizing element: ' + elementID);
    this.elementToTransform = {
        ID: elementID,
        object: mapObject,
        starting_X: originX,
        starting_Y: originY,
        starting_width: objectRect.width,
        starting_height: objectRect.height,
        starting_scale: this.mapObjects[elementID].scale,
        operation: operation
    }

    if (selectionNodeID.includes('top_left')){
        this.elementToTransform.direction = 'top_left';            
    } else if (selectionNodeID.includes('top_right')){
        this.elementToTransform.direction = 'top_right';
    } else if (selectionNodeID.includes('bottom_right')){
        this.elementToTransform.direction = 'bottom_right'
    } else if (selectionNodeID.includes('bottom_left')){
        this.elementToTransform.direction = 'bottom_left';
    }
}

designPlan.prototype.unsetElementToTransform = function(){
    this.elementToTransform = null;
    this.DOM.style.cursor = 'default';
}

designPlan.prototype.removeMapObjectPopupMenu = function(){
    if(this.mapObjectPopupMenu!=null){
        var pane_DOM =  this.mapObjectPopupMenu.pane_DOM;
         while (pane_DOM.firstChild) {
             pane_DOM.removeChild(pane_DOM.firstChild);
         }
     }
}
