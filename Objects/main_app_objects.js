function application(){
    this.users = {};
    this.projects = {};
    this.activeProject = null;
    this.currentUser = null;
    this.appMenus = {};
    this.appMessageDOM = document.getElementById("app_message");
    this.customEvents = {};
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
    let userImage = document.getElementById("user_image");
    if (this.currentUser.imageSrc != ""){
        userImage.innerHTML = '<img class="circle" src="' + this.currentUser.imageSrc + '">'
    } else {
        userImage.innerHTML = '<div class="default_user_image">' + this.currentUser.initials + '</div>'
    }

    let userName = document.getElementById('user_name');
    userName.innerHTML = '<span class="white-text name">' + this.currentUser.fName + ' ' + this.currentUser.lName + '</span>'

    let userEmail = document.getElementById('user_email');
    userEmail.innerHTML = '<span class="white-text email">' + this.currentUser.email + '</span>'
}

application.prototype.addAppMenu = function(menu){
    this.appMenus[menu.name] = menu;
}

application.prototype.setActiveProject = function(project){
    this.activeProject = project;
    this.updateProjectNameDisplay();    
}

application.prototype.updateProjectNameDisplay = function(){
    document.getElementById("top_menu_project_name").innerHTML = this.activeProject.name;
}

application.prototype.setAppMessage = function(message){
    this.appMessageDOM.innerHTML = message;
    this.appMessageDOM.display = 'block';
}

application.prototype.clearAppMessage = function(){
    this.appMessageDOM.innerHTML = '';
    this.appMessageDOM.display = 'none';
}


function user(fName, lName, email, phoneNumber = '773-767-5400', permissions) {
    this.fName = fName;
    this.lName = lName;
    this.fullName = fName + ' ' + lName;
    this.ID = fName + lName[0];
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.permissions = permissions;
    this.imageSrc = "";
    this.initials = (this.fName.charAt(0) + this.lName.charAt(0)).toUpperCase();
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

class TopProjectMenu{
    constructor(project){
        this.project = project;
        this.containerDOM = document.getElementById('top_menu');
        this.nameDOM = document.getElementById('top_menu_project_name');
        this.projectEditIconDOM = document.getElementById('top_menu_edit_project');
       
        this.associatedObject = project;
        this.detailsDialog = null;
        
        this.projectEditIconDOM.addEventListener('pointerdown', ev => {
            console.log('change project data tapped')
            this.showProjectDetailsDialog()
            // let newName = prompt('Enter new project name: ', this.project.name);
            //     if(newName == ''){
            //         alert('Name can\'t be empty!');
            //     } else if(newName != null) {                   
            //         this.updateProjectNameDisplay(newName);
            //         this.project.name = newName;
            //     }
                
            })
       
    }

    updateProjectNameDisplay(name){
        if (name.length > 11){
            this.nameDOM.classList.add('smaller_header_font')
        } else {
            this.nameDOM.classList.remove('smaller_header_font')
        }
        this.nameDOM.innerHTML = name;
    }

    showProjectDetailsDialog(){
        this.detailsDialog = new app_pane('project_details_dialog', 'project details', this.project.activeDesignPlan.parentDOM, this, 'project_details_dialog'); // (name, DOM_ID)    
        this.detailsDialog.render(this.project.activeDesignPlan.parentDOM);
    }
}

function project(name, createdBy, cretedDate = formatDateTime(new Date())){
    this.parentApp = null;
    this.name = name;
    this.designPlans = {};
    this.activeDesignPlan = null;
    this.createdBy = createdBy;
    this.createdDate = cretedDate;
    this.customer = null;
    this.projectRoles = ['project manager', 'team leader', 'technician','purchasing','account exec','support'];
    this.projectUsers = {};
    this.equipment = {};
    this.topMenu = null;

    this.tabs = ['info', 'customer']
    this.parameters = {
        'name': {
            header: true,
            display: 'project name',
            value: this.name,
            htmlElement: 'h3',
            // htmlElementOption: 'text',
            // wrapperDOMClass: 'input-field col s6',
            DOM: null,
            show: true,
            editable: true,
            // tab: 0
        },

        'dateCreated': {
            display: 'created date',
            value: this.createdDate,
            htmlElement: 'input',
            htmlElementOption: 'text',
            // wrapperDOMClass: 'input-field col s6',
            DOM: null,
            show: true,
            editable: false,
            tab: 0               
        },

        'createdBy': {
            display: 'created by',
            value: this.createdBy.fullName,
            htmlElement: 'input',
            htmlElementOption: 'text',
            // wrapperDOMClass: 'input-field col s6',
            DOM: null,
            show: true,
            editable: false,
            tab: 0               
        },

        'projectPeople': {
            display: 'people',
            value: this.projectUsers,
            htmlElement: 'custom',
            // wrapperDOMClass: 'input-field col s6',
            DOM: null,
            show: true,
            editable: false,
            tab: 0               
        },

        



    }
    //example
    // this.projectUsers['MichalWeglowski'] = {
    //     user: user,
    //     role: this.projectRoles[0]
    // }
    // this.projectUsers['MosesCortez'] = {
    //     user: user,
    //     role: this.projectRoles[1]
    // }
}

project.prototype.setParentApp = function(app){
    this.parentApp = app;
}

project.prototype.setTopMenu = function(topMenu){
    this.topMenu = topMenu;
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

project.prototype.addProjectUser = function(user, role){
    this.projectUsers[user.ID] = {};
    this.projectUsers[user.ID].details = user;
    this.projectUsers[user.ID].role = role;
}

project.prototype.addEquipment = function(equipment){
    if(!this.equipment.hasOwnProperty(equipment.parameters.type)){
        this.equipment[equipment.parameters.type] = {};
    }

    if(!this.equipment[equipment.parameters.type].hasOwnProperty(equipment.parameters.subType)){
        this.equipment[equipment.parameters.type][equipment.parameters.subType] = {};
    }

    this.equipment[equipment.parameters.type][equipment.parameters.subType][equipment.parameters.name] = equipment;
    equipment.parentProject = this;
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
    this.reopenPopup = false; // used to reopen popup if the map is being resized or panned in tapAndHeld and other events or if mapObject is being moved

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
        var pane_DOM =  this.mapObjectPopupMenu.DOM;
         while (pane_DOM.firstChild) {
             pane_DOM.removeChild(pane_DOM.firstChild);
         }
         this.mapObjectPopupMenu = null;
     }
}



function mapObject(equipment, ID='', mapIconSrc='', type='', subType='', locationRect=null, details='', notes='', status='', onMap=false){
    this.associatedObject = equipment;
    
    this.name = equipment.name; // for the customer 
    this.type = equipment.type; // Video Surveillance, Access Control etc.
    this.subType = equipment.subType; // camera, dvr, switch, door, motion etc.
    equipment.mapObject = this;
    
    this.ID = 'map_object__' + this.type + '__' + this.subType + '__' + equipment.equipmentNumber; // for DOM
    this.mapSymbol = this.subType.substring(0,1).toUpperCase() + equipment.equipmentNumber;
    this.mapNumber = equipment.equipmentNumber;
    this.mapIconSrc = mapIconSrc;    
   
    this.locationRect = locationRect; // location on the map in pixels
    this.onMap = onMap; // determines if the object is on the map or side menu

    this.DOM = null;  // reference to the DOM of the mapObject icon
    this.containerDOM = null; // reference to the DOM of the mapObject container which may hold many different buttons, descriptions etc.

    this.parentDesignPlan = null;
    this.parentLayer = null;

    this.displayElements = {'name' : {
                                DOM: null,
                                x: 0,
                                y: 0 
                             }
                           }
    
    this.displayName = true;
    this.selectionFrame = {frameDOM: null, rotationNodeDOM: null, rotationNodeConatainerDOM: null};
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
   
    let containerDOM = document.createElement('div');
    containerDOM.classList.add('map_object_container');
    
    // containerDOM.dispatchEvent(new CustomEvent(app.customEvents['singleTap']))
    this.containerDOM = containerDOM;
    
    let div = document.createElement('div');
    if (this.mapIconSrc != ''){
        div.classList.add('map_object_icon');
    } else {
        div.classList.add('map_object_icon_default');
    }
    containerDOM.appendChild(div);
    
    if (this.mapIconSrc != ''){
        let img = document.createElement('img');
        img.src = this.mapIconSrc;
        div.appendChild(img);
    } else {
        div.innerHTML = '<h2>' + this.mapSymbol + '</h2>'
    }
    
    div.id = this.ID;
    this.DOM = div;

   

    if (this.displayName){
        let nameDOM = document.createElement('p');
        nameDOM.classList.add('map_object_name');
        nameDOM.innerHTML = this.name;
        containerDOM.appendChild(nameDOM);
        this.displayElements['name'].DOM = nameDOM;
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
   
    this.selectObject();
}

mapObject.prototype.remove = function(){
    this.popupMenuRemove();
    removeHTMLelement(this.containerDOM);
    delete (this.parentDesignPlan.mapObjects[this.ID]);
}

mapObject.prototype.updateDisplayedName = function(){
    if(this.displayElements['name'].DOM){
        this.displayElements['name'].DOM.innerHTML = this.name;
    }
}

mapObject.prototype.setClick_TapListener = function(){
    //this.DOM.dispatchEvent(eventSingleTap);
    this.DOM.addEventListener('pointerdown', function(ev){    
        this.selectObject();    
        //initialize values for translation
        console.log('element tapped')
        this.transformStartValues.x = this.transformValues.x;
        this.transformStartValues.x = this.transformValues.y;
    }.bind(this));

    //
    this.containerDOM.addEventListener('singleTap', ev => {
        ev.preventDefault();
        ev.stopPropagation()
        console.log('map object single tap');
        this.selectObject();
        if(this.parentDesignPlan.mapObjectPopupMenu){
            this.parentDesignPlan.removeMapObjectPopupMenu();
        }

    })

    this.containerDOM.addEventListener('doubleTap', ev => {
        ev.preventDefault();
        ev.stopPropagation()
        console.log('map object double tap');
        this.selectObject();
        this.popupMenuShow();
    })
}
    

mapObject.prototype.setMoveListener = function(){
    this.containerDOM.addEventListener('pointermove', function(ev){
        ev.stopPropagation();
        if(this.parentDesignPlan.activeMapObject == this){ // if this is an active object
            if(this.parentDesignPlan.mapObjectPopupMenu){ // if popup is shown
                this.popupMenuRemove();
                this.parentDesignPlan.reopenPopup = true;
            }            
            console.log('element moved')
            this.moveOnMap(ev.pageX, ev.pageY)
        }
        
        
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
       
}

mapObject.prototype.setSelectionFrame = function(){
   
    let selectionFrame = document.createElement('span');   
    selectionFrame.classList.add('map_object_selection_frame')
    this.containerDOM.appendChild(selectionFrame);
    //this.selectionFrameDOM = selectionFrame;

    let rotationNodeContainer =  document.createElement('div');
    rotationNodeContainer.classList.add('map_object_rotation_node_container')
    this.containerDOM.append(rotationNodeContainer);

    let rotationNode = document.createElement('div');
    rotationNode.classList.add('map_object_rotation_node');
    rotationNodeContainer.append(rotationNode);
    //set origin for rotation of the rotation node to the middle of the mapObject container DOM
    let domRect = this.containerDOM.getBoundingClientRect();
    let originX = domRect.width/2;
    let originY = domRect.height/2;
    rotationNodeContainer.style.transformOrigin = `${originX}px ${originY}px`;
    //rotate the node by the value it was previously rotated (before the object was previously unselected)
    rotationNodeContainer.style.transform = `rotate(${this.transformValues.rotation}deg)`
    //this.rotationNodeDOM = rotationNode;

    this.selectionFrame.frameDOM = selectionFrame;
    this.selectionFrame.rotationNodeDOM = rotationNode;
    this.selectionFrame.rotationNodeContainerDOM = rotationNodeContainer;

    rotationNodeContainer.addEventListener('pointerdown',(ev) => {
        ev.stopPropagation();
        //console.log('rotation start...')
        rotationNodeContainer.addEventListener('pointermove', function(ev){
            ev.stopPropagation();
            //console.log('rotation in progress...')
            this.popupMenuRemove();
            this.parentDesignPlan.reopenPopup = false;
            this.rotateElement(ev.pageX,ev.pageY);
            this.rotateRelatedElements(ev.pageX,ev.pageY);

        }.bind(this))
            // 'this' is mapObject because of bind
    })

    this.displayElements['name'].DOM.addEventListener('pointerdown', ev => {
        ev.stopPropagation();
        let startX = ev.clientX;
        let startY = ev.clientY;

        let moveX = 0;
        let moveY = 0;

        this.displayElements['name'].DOM.addEventListener('pointermove', ev => {
            ev.stopPropagation();            
            moveX = ev.clientX - startX + this.displayElements['name'].x;
            moveY = ev.clientY - startY + this.displayElements['name'].y;
            this.displayElements['name'].DOM.style.transform = `translate(${moveX}px, ${moveY}px)`
        })

        // when the moving event is finished save values that were currently calculated for translation to continue strating with them next time this elem is moved
        this.displayElements['name'].DOM.addEventListener('pointerup', ev => {
            ev.stopPropagation();
            this.displayElements['name'].x = moveX;
            this.displayElements['name'].y = moveY;
        })
    })
}

mapObject.prototype.unsetSelectionFrame = function(){
    this.selectionFrame.frameDOM.remove();
    this.selectionFrame.frameDOM = null;
    this.selectionFrame.rotationNodeDOM.remove();
    this.selectionFrame.rotationNodeDOM = null;
    this.selectionFrame.rotationNodeContainerDOM.remove();
    this.selectionFrame.rotationNodeContainerDOM = null;
    
    //this.containerDOM.classList.remove('map_object_container_selected');
}

mapObject.prototype.setLocation = function(x,y){   
    this.locationRect.top = y;
    this.locationRect.left = x;
}

mapObject.prototype.getSizeLocation = function(){
    return this.DOM.getBoundingClientRect();
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
    var domRect = this.containerDOM.getBoundingClientRect();
    this.transformValues.x = this.transformStartValues.x + Math.floor(((clientX - domRect.width/2 - designPlanRect.x)/ this.parentDesignPlan.transformValues.scale - this.transformStartValues.x) );
    this.transformValues.y = this.transformStartValues.y + Math.floor(((clientY - domRect.height/2 - designPlanRect.y)/this.parentDesignPlan.transformValues.scale - this.transformStartValues.y) );
    
    this.applyTansform('translate');
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

mapObject.prototype.rotateRelatedElements = function(pointerX, pointerY){
    let pointerLocalX = pointerX / this.parentDesignPlan.transformValues.scale;
    let pointerLocalY = pointerY / this.parentDesignPlan.transformValues.scale;

    let domRect = this.containerDOM.getBoundingClientRect();

    let objectCenterX = (domRect.x + domRect.width/2) / this.parentDesignPlan.transformValues.scale;
    let objectCenterY = (domRect.y + domRect.height/2) / this.parentDesignPlan.transformValues.scale;

    let radians = Math.atan2(pointerLocalY - objectCenterY, pointerLocalX - objectCenterX)
    this.transformValues.rotation = radians * ((180 / Math.PI) * 1)+135; // + 135 because the rotation node is at 135 degrees from the x axis (90+45)
   
    

    //console.log(`${originX}px ${originY}px`)

    
    this.selectionFrame.rotationNodeContainerDOM.style.transform = `rotate(${this.transformValues.rotation}deg)`;
    //console.log(this.transformValues.rotation)
    //this.applyTansform('rotate');
}

mapObject.prototype.rotateElement = function(pointerX, pointerY){
    let pointerLocalX = pointerX / this.parentDesignPlan.transformValues.scale;
    let pointerLocalY = pointerY / this.parentDesignPlan.transformValues.scale;

    let domRect = this.DOM.getBoundingClientRect();

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
        this.DOM.style.transform = `rotate(${this.transformValues.rotation}deg)`;
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
    this.reopenPopup = false;
}

mapObject.prototype.setPopupMenuListener = function(){
    for(let k in this.popup_menu.pane_items){
        let paneItem = this.popup_menu.pane_items[k];

         //stop propagation of pointer down, pointer down propagates and puts objects on the map befor below program react on pointerup, since arrow function is used the scope of vars is the same as in calling function
        paneItem.DOM.addEventListener('pointerdown', function(ev){
            ev.stopPropagation();
        })
        paneItem.DOM.addEventListener('pointerup',listener = (ev) => {
            ev.stopPropagation();
            //console.log('test')
            
            let menuClicked = ev.target.id.split('__')[5];
            console.log(this.name + ': ' + menuClicked + ' clicked' );

            let dialog = null;
            switch (menuClicked){
                case 'details':
                    console.log('building details dialog')
                    this.detailsPane = this.addDetailsPane('map_object_details_pane')
                    dialog = this.detailsPane.render(this.parentDesignPlan.parentDOM);
                    //.appendChild(dialog);
                    break;
                    
                case 'photos':
                    console.log('building photos dialog')
                    this.photosPane = this.addPhotosPane('map_object_photos_pane')
                    dialog = this.photosPane.render(this.parentDesignPlan.parentDOM);                    
                    break;

                case 'delete':
                    console.log('deleting element')
                    this.deletionConfirmation = this.addDeletionConfirmationDialog('deletion_confirmation_dialog');
                    dialog = this.deletionConfirmation.render(this.parentDesignPlan.parentDOM);                    
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
        DOM = null;
        delete app.activeProject.activeDesignPlan.mapObjectPopupMenu;
    }
   
}

mapObject.prototype.addDetailsPane = function(domClass){
    return new app_pane('map_object_details_pane', 'map object details', this.parentDesignPlan.parentDOM, this, domClass); // (name, DOM_ID)    
}

mapObject.prototype.addPhotosPane = function(domClass){
    return new app_pane('map_object_photos_pane', 'map object photos', this.parentDesignPlan.parentDOM, this, domClass); // (name, DOM_ID)    
}

mapObject.prototype.addDeletionConfirmationDialog = function(domClass){
    return new app_pane('map_object_deletion_pane', 'map object deletion', this.parentDesignPlan.parentDOM, this, domClass); // (name, DOM_ID)    
}
