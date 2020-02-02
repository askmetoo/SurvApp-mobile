function application(){
    this.users = {};
    this.projects = {};
    this.activeProject = null;
    this.currentUser = null;
    this.appMenus = {};
    this.appMessageDOM = document.getElementById("app_message");
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

application.prototype.setAppMessage = function(message){
    this.appMessageDOM.innerHTML = message;
    this.appMessageDOM.display = 'block';
}

application.prototype.clearAppMessage = function(){
    this.appMessageDOM.innerHTML = '';
    this.appMessageDOM.display = 'none';
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
    //mapObject.addPopupMenu();
    //mapObject.addPopupMenuItems(['info', 'chat', 'status', 'pic', 'test']);   
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



function mapObject(ID, name, category, mapSymbol, type, locationRect, details, notes, status, onMap){
    this.ID = ID; // for programming
    this.name = name; // for the customer 
    this.category = category; // video surveillance, alarm, access control, intercom, general etc.   
    this.mapSymbol = mapSymbol; // for the map limited to 3 chars max
    this.type = type; // camera, dvr, switch, door, motion etc.
    this.details = details; //IP, ID, DIP etc
    this.notes = notes; // any notes
    this.chat = null; // for communication with team
    this.status = status; // installed, not started, wired, cancelled etc
    this.locationRect = locationRect; // location on the map in pixels
    this.onMap = onMap; // determines if the object is on the map or side menu
    this.DOM = null;  // reference to the DOM object
    this.parentDesignPlan = null;
    this.mouseClickOffsetX = 0; // delta X between mouse click and object x
    this.mouseClickOffsetY = 0; // delta Y between mouse click and object y
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;
    this.rotation = 0;
    this.popup_menu ={}    
}

mapObject.prototype.setLocation = function(x,y){   
    this.locationRect.top = y;
    this.locationRect.left = x;
}

mapObject.prototype.getSizeLocation = function(){
    return this.DOM.getBoundingClientRect();
}

mapObject.prototype.getTransformedXY = function(){ // gets position of the object after translation
    var xy = {
        x: this.locationRect.left,
        y: this.locationRect.top
    }
    var style = this.DOM.style.getPropertyValue('transform') //returns i.e. translate(99px, 146px) scale(1) rotate(0deg)
   
    if(general_validation(style)){
        var translate = style.match(/\(([^)]+)\)/); // regular expression that gets a value in 1st parenthesis - value of translate        
        xy.x += parseInt(translate[1].split(',')[0]);
        xy.y += parseInt(translate[1].split(',')[1])
    }
   return xy;
}

mapObject.prototype.lift = function(ID){
    this.DOM.classList.add('map_object_lifted');
}

mapObject.prototype.calcMouseClickOffset = function(clientX, clientY){ // for moving object on the map with mouse - calculates difference between mouse click location and object location
    
    var cssTransformedXY = this.getTransformedXY();
    var designPlanRect = this.parentDesignPlan.DOM.getBoundingClientRect();
    
    this.mouseClickOffsetX = Math.floor((clientX - designPlanRect.x)/this.parentDesignPlan.scale - cssTransformedXY.x)
    this.mouseClickOffsetY = Math.floor((clientY - designPlanRect.y)/this.parentDesignPlan.scale - cssTransformedXY.y)
    
}

mapObject.prototype.moveOnMap = function(clientX, clientY){
    var designPlanRect = this.parentDesignPlan.DOM.getBoundingClientRect();
    this.translateX = Math.floor(((clientX - designPlanRect.x)/ this.parentDesignPlan.scale - this.locationRect.left - this.mouseClickOffsetX) );
    this.translateY = Math.floor(((clientY - designPlanRect.y)/this.parentDesignPlan.scale - this.locationRect.top - this.mouseClickOffsetY) );
    
    this.applyTansform();
}

mapObject.prototype.resizeElement = function(clientX, clientY){
    //console.log('trying resizing')
    var elementToTransform = this.parentDesignPlan.elementToTransform;
    var objectToResizeRect = this.DOM.getBoundingClientRect();
    //console.log('resizing id: ' + objectToResize.ID)
    var transform_origin = '';
    var scaleX = this.scale.x;
    var scaleY = this.scale.y;
    var xm = 0; // distance between the click and the corresponding resize node 
    var ym = 0;

    switch (elementToTransform.direction){
        case "top_left":
            transform_origin = "right bottom"
            break;

        case "top_right":
            transform_origin = "left bottom"
            break;
        
        case "bottom_right":
            transform_origin = "left top"
            break;

        case "bottom_left":
                transform_origin = "right top"
                break;
    }

    transform_origin = "center"
    xm = clientX - elementToTransform.starting_X;
    ym = clientY - elementToTransform.starting_Y;
    scaleX = xm / elementToTransform.starting_width;
    scaleY = ym / elementToTransform.starting_height;
    var scale = Math.max(scaleX, scaleY);
    scale += elementToTransform.starting_scale;
    if(scale>4) scale = 4;
    if(scale<0.3) scale = 0.3;
    
    this.scale = scale;
   
    this.DOM.style.transformOrigin = transform_origin;
    this.applyTansform();
    //console.log(' by scale of ' + scale)
}

mapObject.prototype.rotateElement = function(clientX, clientY){
    var designPlanRect = this.parentDesignPlan.DOM.getBoundingClientRect();
    var cssTransformedXY = this.getTransformedXY();

    var center_x = cssTransformedXY.x + this.locationRect.width / 2;
    var center_y = cssTransformedXY.y + this.locationRect.height / 2;
    var mouse_x = (clientX - designPlanRect.x)/ this.parentDesignPlan.scale;
    var mouse_y = (clientY - designPlanRect.y)/ this.parentDesignPlan.scale;


    var radians = Math.atan2( mouse_y - center_y, mouse_x - center_x);
    this.rotation = radians * ((180 / Math.PI) * 1)+45; // degrees
    // console.log('radians = ' + radians);
    var degree = 0// (radians * (180 / Math.PI) * 1) + 90;// - mapObject.rotation;
    console.log('this.rotate = ' + this.rotation);
    this.applyTansform();
}

mapObject.prototype.bringOnTop = function(){
    var mapObjects = this.parentDesignPlan.mapObjects;
    for(let k in mapObjects){
        mapObjects[k].DOM.style.zIndex = 1;
    }
    this.DOM.style.zIndex = 10;
}

mapObject.prototype.applyTansform = function(){
    //console.log(`translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}) rotate(${this.rotation}deg)`)
    this.DOM.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}) rotate(${this.rotation}deg)`;
}

mapObject.prototype.addPopupMenu = function(){
    this.popup_menu = new app_pane('map_object_popup_menu', 'map_object_popup_menu'); // (name, DOM_ID)
    this.popup_menu.callingElement = this;
}

mapObject.prototype.addPopupMenuItem = function(name){
    var menuItem = this.popup_menu.add_item(new app_pane_general_item(this.ID + '__popup_menu__' + name, name)); // (ID, name)
    
}

mapObject.prototype.addPopupMenuItems = function(names){
    for(var i=0;i<names.length;i++){
        this.addPopupMenuItem(names[i]);
    }    
}

mapObject.prototype.addPopupMenuSubmenuItem = function(name, submenu_item_name){
    this.popup_menu[name] = {};
    this.popup_menu[name][submenu_item_name] = new app_pane_general_item(this.name + '_popup_menu_' + name)
}

mapObject.prototype.popupMenuShow = function(){
    this.popup_menu.RENDER();
    app.activeProject.activeDesignPlan.mapObjectPopupMenu = this.popup_menu;
}

mapObject.prototype.popupMenuRemove = function(){
    if(app.activeProject.activeDesignPlan.mapObjectPopupMenu!=null){
       var pane_DOM =  app.activeProject.activeDesignPlan.mapObjectPopupMenu.pane_DOM;
        while (pane_DOM.firstChild) {
            pane_DOM.removeChild(pane_DOM.firstChild);
        }
    }
   
}
