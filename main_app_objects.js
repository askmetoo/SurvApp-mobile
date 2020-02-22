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
    project.setParentApp(this);
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
    this.parentApp = null;
    this.name = name;
    this.designPlans = {};
    this.activeDesignPlan = null;
    this.createdBy = createdBy;
    this.createdDate = cretedDate;
    this.customer = null;
}

project.prototype.setParentApp = function(app){
    this.parentApp = app;
}

project.prototype.addDesignPlan = function(designPlan){
    this.designPlans[designPlan.name] = designPlan;
    designPlan.setParentProject(this);
}

project.prototype.setActiveDesignPlan = function(designPlan){
    this.activeDesignPlanID = designPlan.name;
    this.activeDesignPlan = designPlan;
}

project.prototype.setCustomer = function(customer){
    this.customer = customer;
}

//it's like a map i.e 1st fl, basement etc
function designPlan(name, designPlanDOMID){
    this.name = name;
    this.DOM = document.getElementById(designPlanDOMID);
    this.parentDOM = this.DOM.parentElement;
    this.mapImageSrc = '';

    this.parentProject = null;
    this.mapObjects = {};
    this.activeMapObject = null; // object that was last clicked
    this.selectedMapObjects = {}; // objects that were clicked with ctrl button pressed (first object doesn't have to be clicked with ctrl)
    this.currentlyClickedMapObject = null; // currently clicked object - this is used for moving the object on mouse move    

    this.layers = {}; // grouping of objects by type i.e. cameras, access control etc also different notes canvases

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
    let query = '#map_image_plane>img'
    let dom = document.querySelector(query)
    dom.src = this.mapImageSrc;
}

designPlan.prototype.setParentProject = function(project){
    this.parentProject = project;
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
        //mapObject.parentDesignPlan = this;
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
        //this.activeMapObject.DOM.classList.add("map_object-" + this.activeMapObject.type + "_selected_active");        
        //this.selectionFrameDOMs = add_selection_frame_around_DOM(this.activeMapObject.DOM);        
    }
}

designPlan.prototype.getActiveObject = function(){
    return this.activeMapObject;
}

designPlan.prototype.unsetActiveObject = function(){
    if(general_validation(this.activeMapObject)){
        //this.activeMapObject.DOM.classList.remove("map_object-" + this.activeMapObject.type + "_selected_active"); 
        this.activeMapObject = null;
        // for(var k in this.selectionFrameDOMs){
        //     if(k== 'parent') continue;
        //     this.selectionFrameDOMs[k].remove();
        //}
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



function mapObject(equipment, ID='', mapIconSrc='', type='', subType='', locationRect=null, details='', notes='', status='', onMap=false){
    this.associatedEquipment = equipment;
    
    this.name = equipment.name; // for the customer 
    this.type = equipment.type; // Video Surveillance, Access Control etc.
    this.subType = equipment.subType; // camera, dvr, switch, door, motion etc.
    this.ID = 'map_object__' + this.type + '__' + this.subType + '__' + equipment.equipmentNumber; // for DOM
    this.mapSymbol = this.subType.substring(0,1).toUpperCase() + equipment.equipmentNumber;
    this.mapNumber = equipment.equipmentNumber;
    this.mapIconSrc = mapIconSrc;    
   
    this.locationRect = locationRect; // location on the map in pixels
    this.onMap = onMap; // determines if the object is on the map or side menu

    this.elementDOM = null;  // reference to the DOM of the mapObject icon
    this.containerDOM = null; // reference to the DOM of the mapObject container which may hold many different buttons, descriptions etc.

    this.parentDesignPlan = null;
    this.parentLayer = null;

    
    this.displayName = true;
    this.selectionFrame = {frameDOM: null, rotationNodeDOM: null};
    this.rotationNode = null;

    this.transformValues = {x:0, y:0, scale:1, rotation:0}
    this.transformStartValues = {x:0, y:0, scale:1, rotation:0}; // when object is tapped save it's initial values here
    this.translateX = 0;
    this.translateY = 0;
    this.scale = 1;
    this.rotation = 0;
    this.popup_menu ={};
}

mapObject.prototype.setParentDesignPlan = function(designPlan){
    this.parentDesignPlan = designPlan;
}

mapObject.prototype.generateIDAndMapSymbol = function(){
    let nextNumber = 1;
    if (Object.keys(this.parentDesignPlan.layers).includes(this.type)){
        if (Object.keys(this.parentDesignPlan.layers[this.type]).includes(this.subType)){
            nextNumber = Object.keys(this.parentDesignPlan.layers[this.type][this.subType]).length + 1;
        }        
    }
    this.ID = 'map_object__' + this.type + '__' + this.subType + '__' + this.equipment.equipmentNumber;
    this.mapNumber = nextNumber;
    this.mapSymbol = this.subType.substring(0,1).toUpperCase() + nextNumber;
}

mapObject.prototype.setName = function(){
    this.name = this.ID.split('__')[2] + this.ID.split('__')[3];
}

mapObject.prototype.setTypeAndSubType = function(type, subType){
    this.type = type;
    this.subType = subType;
}

mapObject.prototype.assignToLayer = function(){
    // if layers object of parent design plan doesn't include a type
    if (!Object.keys(this.parentDesignPlan.layers).includes(this.type)){        
        this.parentDesignPlan.layers[this.type] = {}; //create this.type object in layers
        this.parentDesignPlan.layers[this.type][this.subType] = {}; // create this.subType in layers[this.type] 
    } else if(!Object.keys(this.parentDesignPlan.layers[this.type]).includes(this.subType)){
        this.parentDesignPlan.layers[this.type][this.subType] = {};
    }
    this.parentDesignPlan.layers[this.type][this.subType][this.ID] = this; // add this to the this.type layer in design plan
    this.parentLayer = this.parentDesignPlan.layers[this.type][this.subType];
    // add to menu layers
    app.appMenus['bottom menu'].addItem('layers', this.type, this.subType, this.name);
    
}

mapObject.prototype.insertToDesignPlan = function(x,y){
    this.parentDesignPlan.addMapObject(this);
   
    
    let div = document.createElement('div');
    if (this.mapIconSrc != ''){
        div.classList.add('map_object_icon');
    } else {
        div.classList.add('map_object_icon_default');
    }
    
    if (this.mapIconSrc != ''){
        let img = document.createElement('img');
        img.src = this.iconSrc;
        div.appendChild(img);
    } else {
        div.innerHTML = '<h2>' + this.mapSymbol + '</h2>'
    }
    
    div.id = this.ID;
    this.elementDOM = div;

    let containerDOM = document.createElement('div');
    containerDOM.classList.add('map_object_container');
    containerDOM.appendChild(div);
    this.containerDOM = containerDOM;

    if (this.displayName){
        let nameDOM = document.createElement('p');
        nameDOM.classList.add('map_object_name');
        nameDOM.innerHTML = this.name;
        containerDOM.appendChild(nameDOM);
    }

    

    //console.log(`tapped: x=${x}, y=${y}, scale=${this.parentDesignPlan.transformValues.scale}`)
    this.parentDesignPlan.DOM.appendChild(containerDOM);

    //calculate offset of the div being inserted to center it with the mouse click/ finger tap 
    let domRect = div.getBoundingClientRect();
    let xClickOffset = domRect.width/2;
    let yClickOffset = domRect.height/2;
    //console.log(xClickOffset,yClickOffset)

    let designPlanRect = this.parentDesignPlan.DOM.getBoundingClientRect();
    //console.log(designPlanRect)
    this.transformValues.x = (x - designPlanRect.x - xClickOffset)/this.parentDesignPlan.transformValues.scale;//(x - this.parentDesignPlan.transformValues.originX - this.parentDesignPlan.transformValues.x) / this.parentDesignPlan.transformValues.scale;
    this.transformValues.y = (y - designPlanRect.y - yClickOffset)/this.parentDesignPlan.transformValues.scale// - designPlanRect.y;//y - this.parentDesignPlan.transformValues.originY - this.parentDesignPlan.transformValues.y) / this.parentDesignPlan.transformValues.scale;
    //let randomColor = Math.random() * 255;
    //this.DOM.style.backgroundColor = `rgb(${randomColor},${randomColor},${randomColor})`
    //console.log(`transformed: x=${this.transformValues.x}, ${y=this.transformValues.y}`)
    this.applyTansform('translate');

    this.addPopupMenu('mapObject_popup_menu');
    this.addPopupMenuItems(['details', 'add note', 'photos', 'delete'])
    this.popupMenuShow();
   // this.setPopupMenuListener();


    this.selectObject();
}

mapObject.prototype.setClick_TapListener = function(){
    this.elementDOM.addEventListener('pointerdown', function(ev){
        ev.stopPropagation();
        // this.select();
        // this.parent.addToSelected();

        //initialize values for translation
        console.log('element tapped')
        this.transformStartValues.x = this.transformValues.x;
        this.transformStartValues.x = this.transformValues.y;
        this.selectObject();
        
        
    }.bind(this));
}

mapObject.prototype.setMoveListener = function(){
    this.containerDOM.addEventListener('pointermove', function(ev){
        ev.stopPropagation();
        console.log('element moved')
        this.moveOnMap(ev.pageX, ev.pageY)
    }.bind(this))
}

mapObject.prototype.selectObject = function(){
    let currentActiveObject = this.parentDesignPlan.getActiveObject();
        
        if(general_validation(currentActiveObject)){
            if(currentActiveObject != this){
                currentActiveObject.unsetSelectionFrame();
                this.parentDesignPlan.setActiveObject(this);
                this.setSelectionFrame();
            }
        } else {
            this.parentDesignPlan.setActiveObject(this);
            this.setSelectionFrame();
        }
        this.bringOnTop();
        this.popupMenuShow();
}

mapObject.prototype.setSelectionFrame = function(){
    let selectionFrame = document.createElement('div');
    selectionFrame.classList.add('map_object_selection_frame');

    let elementRect =  this.elementDOM.getBoundingClientRect();
    let elementLargerDimension = (elementRect.width > elementRect.height ? elementRect.width : elementRect.height) / this.parentDesignPlan.transformValues.scale;

    selectionFrame.style.width = parseInt(elementLargerDimension *1.4) + 'px';
    selectionFrame.style.height = parseInt(elementLargerDimension *1.4) + 'px';

    this.elementDOM.appendChild(selectionFrame); // to get rect dims the element needs to be added to DOM

    let frameRect = selectionFrame.getBoundingClientRect();
    let frameLeft = (Math.floor(- (frameRect.width - elementRect.width) / 2) -1)/ this.parentDesignPlan.transformValues.scale;
    let frameTop = (Math.floor(- (frameRect.height - elementRect.height) / 2) -1) / this.parentDesignPlan.transformValues.scale;
    selectionFrame.style.transform = `translate(${frameLeft}px, ${frameTop}px)`;
    //selectionFrame.style.top = this.transformValues.y + 'px';

    let rotationNode = document.createElement('div');
    rotationNode.classList.add('map_object_rotation_node');
    this.elementDOM.appendChild(rotationNode);

    this.selectionFrame.frameDOM = selectionFrame;
    this.selectionFrame.rotationNodeDOM = rotationNode;

    rotationNode.addEventListener('pointerdown', function(ev){
        ev.stopPropagation();
        //console.log('rotation start...')
        this.selectionFrame.rotationNodeDOM.addEventListener('pointermove', function(ev){
            ev.stopPropagation();
            //console.log('rotation in progress...')
            this.rotateElement(ev.pageX,ev.pageY);
        }.bind(this))
            // 'this' is mapObject because of bind
    }.bind(this))


}

mapObject.prototype.unsetSelectionFrame = function(){
    this.selectionFrame.frameDOM.remove();
    this.selectionFrame.rotationNodeDOM.remove();
}

mapObject.prototype.setLocation = function(x,y){   
    this.locationRect.top = y;
    this.locationRect.left = x;
}

mapObject.prototype.getSizeLocation = function(){
    return this.elementDOM.getBoundingClientRect();
}

mapObject.prototype.getTransformedXY = function(){ // gets position of the object after translation
    let xy = {}
    var style = this.containerDOM.style.getPropertyValue('transform') //returns i.e. translate(99px, 146px) scale(1) rotate(0deg)
   
    if(general_validation(style)){
        var translate = style.match(/\(([^)]+)\)/); // regular expression that gets a value in 1st parenthesis - value of translate        
        xy.x = parseInt(translate[1].split(',')[0]);
        xy.y = parseInt(translate[1].split(',')[1])
    }
   return xy;
}

mapObject.prototype.lift = function(ID){
    this.elementDOM.classList.add('map_object_lifted');
}

mapObject.prototype.calcMouseClickOffset = function(clientX, clientY){ // for moving object on the map with mouse - calculates difference between mouse click location and object location
    
    var cssTransformedXY = this.getTransformedXY();
    var designPlanRect = this.parentDesignPlan.DOM.getBoundingClientRect();
    
    this.mouseClickOffsetX = Math.floor((clientX - designPlanRect.x)/this.parentDesignPlan.scale - cssTransformedXY.x)
    this.mouseClickOffsetY = Math.floor((clientY - designPlanRect.y)/this.parentDesignPlan.scale - cssTransformedXY.y)
    
}

mapObject.prototype.moveOnMap = function(clientX, clientY){
    var designPlanRect = this.parentDesignPlan.DOM.getBoundingClientRect();
    var domRect = this.containerDOM.getBoundingClientRect();
    this.transformValues.x = this.transformStartValues.x + Math.floor(((clientX - domRect.width/2 - designPlanRect.x)/ this.parentDesignPlan.transformValues.scale - this.transformStartValues.x) );
    this.transformValues.y = this.transformStartValues.y + Math.floor(((clientY - domRect.height/2 - designPlanRect.y)/this.parentDesignPlan.transformValues.scale - this.transformStartValues.y) );
    
    this.applyTansform('translate');
}

mapObject.prototype.resizeElement = function(clientX, clientY){
    //console.log('trying resizing')
    var elementToTransform = this.parentDesignPlan.elementToTransform;
    var objectToResizeRect = this.elementDOM.getBoundingClientRect();
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
   
    this.elementDOM.style.transformOrigin = transform_origin;
    this.applyTansform();
    //console.log(' by scale of ' + scale)
}

mapObject.prototype.rotateElement = function(pointerX, pointerY){
    let pointerLocalX = pointerX / this.parentDesignPlan.transformValues.scale;
    let pointerLocalY = pointerY / this.parentDesignPlan.transformValues.scale;

    let domRect = this.elementDOM.getBoundingClientRect();

    let objectCenterX = (domRect.x + domRect.width/2) / this.parentDesignPlan.transformValues.scale;
    let objectCenterY = (domRect.y + domRect.height/2) / this.parentDesignPlan.transformValues.scale;

    let radians = Math.atan2(pointerLocalY - objectCenterY, pointerLocalX - objectCenterX)
    this.transformValues.rotation = radians * ((180 / Math.PI) * 1)+135; // + 135 because the rotation node is at 135 degrees from the x axis (90+45)
   
    //console.log(this.transformValues.rotation)
    this.applyTansform('rotate');
}

mapObject.prototype.bringOnTop = function(){
    var mapObjects = this.parentDesignPlan.mapObjects;
    for(let k in mapObjects){
        mapObjects[k].containerDOM.style.zIndex = 1;
    }
    this.containerDOM.style.zIndex = 10;
}

mapObject.prototype.applyTansform = function(which){
    if(which == 'translate'){
        this.containerDOM.style.transform = `translate(${this.transformValues.x}px, ${this.transformValues.y}px) scale(${this.transformValues.scale})`
    } else if(which == 'rotate'){
        this.elementDOM.style.transform = `rotate(${this.transformValues.rotation}deg)`;
    }
    //console.log(`translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}) rotate(${this.rotation}deg)`)
    
}

mapObject.prototype.addPopupMenu = function(domClass){
    this.popup_menu = new app_pane('map_object_popup_menu', 'popup menu', this.parentDesignPlan.parentDOM, this, domClass); // (name, DOM_ID)
    //this.popup_menu.callingElement = this;
}

mapObject.prototype.addPopupMenuItem = function(name){
    var menuItem = this.popup_menu.add_item(new app_pane_general_item(this.ID + '__popup_menu__' + name, name)); // (ID, name)
    menuItem.addParent(this.popup_menu);
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
    if(this.parentDesignPlan.mapObjectPopupMenu){
        this.parentDesignPlan.mapObjectPopupMenu.callingElement.popupMenuRemove();
    }
    this.popup_menu.render();
    this.setPopupMenuListener();
    app.activeProject.activeDesignPlan.mapObjectPopupMenu = this.popup_menu;
}

mapObject.prototype.setPopupMenuListener = function(){
    for(let k in this.popup_menu.pane_items){
        let item = this.popup_menu.pane_items[k];
        item.DOM.addEventListener('pointerdown',listener = (ev) => {
            ev.stopPropagation();
            //console.log('test')
            
            let menuClicked = ev.target.id.split('__')[5];
            console.log(this.name + ': ' + menuClicked + ' clicked' );

            switch (menuClicked){
                case 'details':
                    console.log('building details dialog')
                    this.addDetailsPane('map_object_details_pane')
                    let dialog = this.detailsPane.render();
                    this.parentDesignPlan.parentDOM.appendChild(dialog);
                    break;
            }
        })
    }
    
}

mapObject.prototype.popupMenuRemove = function(){
    if(app.activeProject.activeDesignPlan.mapObjectPopupMenu!=null){
        for(let k in this.popup_menu.pane_items){
            let item = this.popup_menu.pane_items[k];
            item.DOM = null;
        }
       var DOM =  app.activeProject.activeDesignPlan.mapObjectPopupMenu.DOM;
        while (DOM.firstChild) {
            DOM.removeChild(DOM.firstChild);
        }
        DOM.parentElement.removeChild(DOM);
    }
   
}

mapObject.prototype.addDetailsPane = function(domClass){
    this.detailsPane = new app_pane('map_object_details_pane', 'map object details', this.parentDesignPlan.parentDOM, this, domClass); // (name, DOM_ID)    
}

mapObject.prototype.addDetailsPaneItem = function(name, value, htmlElement, domID, domClass){
    this.detailsPane.items = {};
    this.detailsPane.items[name].name = name;
    this.detailsPane.items[name].value = value;
    this.detailsPane.items[name].htmlElement = htmlElement;
    this.detailsPane.items[name].domID = domID;
    this.detailsPane.items[name].domClass = domClass;
}

mapObject.prototype.addDetailsPaneItems = function(){
    this.addDetailsPaneItem(this.name, this.type, )
}


// function camera(name, ID, mapIconSrc, details, model, resolution){
//     mapObject.call(this, ID, name, mapIconSrc, 'video surveillance', 'camera', null, details)
//     this.model = model;
//     this.resolution = resolution;
//     this.prototype = Object.create(mapObject);
//     this.type='camera'
//     console.dir(this)
// }

