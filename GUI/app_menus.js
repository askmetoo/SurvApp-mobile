// only top most menus are defined in index.html, the rest is created dynamically
// menus may be stacked 

//new appLogMessage('app_menus.js', 'loaded', 'message').showAppMessage();

class TopProjectMenu{
    constructor(project){
        this.project = project;
        this.associatedObject = project;
        this.detailsDialog = null;

        this.containerDOM = document.getElementById('top_menu');
        this.nameDOM = document.getElementById('top_menu_project_name');
        this.projectEditIconDOM = document.getElementById('top_menu_edit_project');
       
        this.projectEditIconDOM.addEventListener('pointerup', ev => {ev.stopPropagation()});
        this.projectEditIconDOM.addEventListener('pointerdown', ev => {
            console.log('change project data tapped')
            this.showProjectDetailsDialog()
            })       
    }

    showProjectDetailsDialog(){
        this.detailsDialog = new app_pane('project_details_dialog', 'project details', this.project.activeDesignPlan.parentDOM, this, 'project_details_dialog'); // (name, DOM_ID)    
        this.detailsDialog.render(this.project.activeDesignPlan.parentDOM);
    }
}

class DesignPlanMenus{
   
    constructor(designPlan){
        this.designPlan = designPlan;
        this.associatedObject = designPlan;
        this.detailsDialog = null;

        this.topBar = {
            DOM : document.getElementById('design_plan_top_bar'),
            nameDOM : document.getElementById('top_design_plan_name'),
            editDOM : document.getElementById('design_plan_edit'),
            resetDOM : document.getElementById('design_plan_reset'),
            addDOM : document.getElementById('design_plan_new')
        }

        this.navigator = {
            DOM : document.getElementById('design_plan_navigator_floating'),
            previousDOM : document.getElementById('design_plan_previous'),
            nextDOM : document.getElementById('design_plan_next'),
            countDOM : document.getElementById('design_plan_count')
        }

        this.zoom // maybe later

        //addition dialog fields
        this.designPlanAddDialog = {
            tabs: [],
            parameters: {
                'header': {
                    header: true,
                    display: 'new page',
                    value: 'new page',
                    htmlElement: 'h3',
                    DOM: null,
                    show: true,
                    editable: false
                },
        
                'name': {
                    display: 'name',
                    value: this.designPlanname,
                    htmlElement: 'input',
                    htmlElementOption: 'text',
                    // wrapperDOMClass: 'input-field col s6',
                    DOM: null,
                    show: true,
                    editable: true         
                },

                'planImageFile': {
                    display: 'select design plan image',
                    value: 'mapImageSrc',
                    htmlElement: 'input',
                    htmlElementOption: 'file',
                    DOM: null,
                    show: true,
                    editable: true
                },

                'planImageDisplay': {
                    display: 'image',
                    value: 'mapImageSrc',
                    htmlElement: 'img',
                    wrapperDOMClass: 'input-field col s12 designPlan_addition_dialog_image',
                    DOM: null,
                    show: true,
                    editable: true
                },

                'submitButton': {
                    display: '',
                    value: 'save',
                    htmlElement: 'input',
                    htmlElementOption: 'button',
                    DOM: null,
                    show: true,
                    editable: true
                }
            }
        }

        this.topBar.editDOM.addEventListener('pointerdown', ev => {ev.stopPropagation()})
        this.topBar.editDOM.addEventListener('pointerup', ev => {
            ev.stopPropagation();
            this.showDesignPlanDetailsDialog();
        })     
        
        this.topBar.resetDOM.addEventListener('pointerdown', ev => {ev.stopPropagation()})
        this.topBar.resetDOM.addEventListener('pointerup', ev => {
            ev.stopPropagation();
            this.designPlan.resetView();
        }) 

        this.topBar.addDOM.addEventListener('pointerdown', ev => {ev.stopPropagation()})
        this.topBar.addDOM.addEventListener('pointerdown', ev => {
            ev.stopPropagation();
            this.showDesignPlanAdditionDialog();
        })

        this.navigator.previousDOM.addEventListener('pointerdown', ev => {ev.stopPropagation()})
        this.navigator.previousDOM.addEventListener('pointerup', ev => {
            ev.stopPropagation();
            this.showPreviousDesignPlan();
        })

        this.navigator.nextDOM.addEventListener('pointerdown', ev => {ev.stopPropagation()})
        this.navigator.nextDOM.addEventListener('pointerup', ev => {
            ev.stopPropagation();
            this.showNextDesignPlan();
        })

        this.menusVisibility = this.menusVisibility();
        
    }

    changeDesignPlan(designPlan){
        this.designPlan = designPlan;
        this.associatedObject = designPlan;
    }
    
    showDesignPlanDetailsDialog(){
        this.detailsDialog = new app_pane('designPlan_details_dialog', 'design plan details', this.designPlan.parentDOM, this, 'designPlan_details_dialog'); // (name, DOM_ID)    
        this.detailsDialog.render(this.designPlan.parentDOM);
    }

    showDesignPlanAdditionDialog(){
        this.additionDialog = new app_pane('designPlan_addition_dialog', 'design plan addition',  this.designPlan.parentDOM, this.designPlanAddDialog, 'designPlan_addition_dialog'); // (name, DOM_ID)    )
        this.additionDialog.elements = this.additionDialog.render(this.designPlan.parentDOM, {header:true, headerMessage: false, headerEdit: false});
        
        this.additionDialog.elements['closeButton'].addEventListener('pointerdown', ev => {ev.stopPropagation();})
        this.additionDialog.elements['closeButton'].addEventListener('pointerup', ev => {
            ev.stopPropagation();
            let dialog = this.additionDialog.elements['dialog'];
            dialog.parentNode.removeChild(dialog);
        })

        this.additionDialog.elements['planImageFile'].addEventListener('change', ev => {
            let planImageDisplay = this.additionDialog.elements['planImageDisplay'];
            let img = URL.createObjectURL(ev.target.files[0]);
            planImageDisplay.src = img;           
        })

        this.additionDialog.elements['submitButton'].addEventListener('pointerdown', ev => {ev.stopPropagation();})
        this.additionDialog.elements['submitButton'].addEventListener('pointerup', ev => {
            ev.stopPropagation();

            let name = this.additionDialog.elements['name'].value;
            let imgSrc = this.additionDialog.elements['planImageDisplay'].src;
            let dialog = this.additionDialog.elements['dialog'];
            dialog.parentNode.removeChild(dialog);

            let designPlan = app.activeProject.createDesignPlan(name, imgSrc);       
            designPlan.show();     
        })
    }

    showNextDesignPlan(){
        if(this.designPlan.nextPlan){
           
            this.designPlan = this.designPlan.nextPlan;
            this.designPlan.show();
            //this.updateNavigatorCount(); -- is called in .show()

            if(!this.designPlan.nextPlan){
                this.navigator.nextDOM.disabled = true;
            }
            if(!this.designPlan.previousPlan){
                this.navigator.previousDOM.disabled = false;
            }
        }
        
    }

    showPreviousDesignPlan(){
        if(this.designPlan.previousPlan){
            //let currentPlan = this.designPlan;
            this.designPlan = this.designPlan.previousPlan;
            this.designPlan.show();
            
            //this.updateNavigatorCount(); -- is called in .show() 

            if(!this.designPlan.previousPlan){
                this.navigator.previousDOM.disabled = true;
            }

            if(!this.designPlan.nextPlan){
                this.navigator.nextDOM.disabled = false;
            }
        }
        
        
    }

    updateNavigatorCount(){
        let currentPlanNumber = this.designPlan.number;
        let planCount = this.designPlan.parentProject.designPlansCount;

        this.navigator.countDOM.innerHTML = `${currentPlanNumber} of ${planCount}`;
    }


    // I had IIFE here but it did not work on Safari due to lack of support for public class fields
    // menusVisibility = (()=>{
    //     ... same body as below
    // })

    menusVisibility(){
        let returnValue = {};
        returnValue.topBar = {
            set: (visible) => {
                visible ? this.topBar.DOM.classList.remove('design_plan_menus_hide') :
                          this.topBar.DOM.classList.add('design_plan_menus_hide');
            },

            toggle: () => {
                this.topBar.DOM.classList.toggle('design_plan_menus_hide');
            }
        };

        returnValue.navigator={
            set: (visible) => {
                visible ? this.navigator.DOM.classList.remove('design_plan_menus_hide') :
                          this.navigator.DOM.classList.add('design_plan_menus_hide');
            },

            toggle: () => {
                this.navigator.DOM.classList.toggle('design_plan_menus_hide');
            }
        };

        returnValue.all= {
            set: (visible) => {
                returnValue.topBar.set(visible);
                returnValue.navigator.set(visible);
            },

            toggle: () => {
                returnValue.topBar.toggle();
                returnValue.navigator.toggle();
            }
        }
        return returnValue;
    }

    allMenusToggleVisibility(){
        this.topMenuToggleVisibility();
        this.navigatorToggleVisibility();
    }

    topMenuToggleVisibility(){
        this.topBar.DOM.classList.toggle('design_plan_menus_hide');
    }

    navigatorToggleVisibility(){
        this.navigator.DOM.classList.toggle('design_plan_menus_hide');
    }

   // updateDesignPlanName()


}

let bottomMenuJSON = { 
    'name': 'bottom menu',   
    'DOM_ID': 'bottom_menu', 
    'DOM_Class': 'bottom_menu',   
    'items': { //ul
        'DOM_Class': 'bottom_menu_list', // ul class
        'insert' : { // li
           // 'DOM_Class': 'bottom_menu_list_item', // li class
            //'DOM_ID': 'bottom_menu_submenu_1', // li ID
            'icon_src': '',           
            'items':{ // ul
                'DOM_Class': 'bottom_menu_list_item_submenu',
                'icons': [

                ],

                'video': {   
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'camera': {
                            'icon_src': 'Images/mapObjectImages/bulletCamera.png',
                            
                            'items': {
                                'DOM_Class': 'bottom_menu_list_item_submenu',
                                'dome': {
                                    'icon_src': 'Images/mapObjectImages/domeCamera.png',
                                    'icon_origin': 'src'
                                },
                                'box': {
                                    'icon_src': 'Images/mapObjectImages/boxCamera.png',
                                    'icon_origin': 'src'
                                },
                                'bullet': {
                                    'icon_src': 'Images/mapObjectImages/bulletCamera.png',
                                    'icon_origin': 'src'
                                },
                                'housing': {
                                    'icon_src': 'Images/mapObjectImages/housingCamera.png',
                                    'icon_origin': 'src'
                                },
                                '180': {
                                    'icon_src': 'Images/mapObjectImages/180Camera.png',
                                    'icon_origin': 'src'
                                },
                                '360': {
                                    'icon_src': 'Images/mapObjectImages/360Camera.png',
                                    'icon_origin': 'src'
                                },
                            }
                        },
                        'dvr': 1,
                        'nvr': 2,
                        'vms': 3,
                        'switch': 4,
                        
                        'icons': [

                        ]
                    }                   
                },
                'access control': {  
                    'icon_src': '',                   
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'reader': 0,
                        'panel': 1,

                        'icons': [
                            
                        ]
                    }
                },
                'alarm': {
                    'icon_src': '',                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'motion': 0,
                        'door contact': 1,
                        'glass break': 2,
                        'panel': 3,
                        
                        'icons': [

                        ]
                    }
                },
                'intercom': {  
                    'icon_src': '',                  
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'ip intercom': 0,
                        'analog intercom': 1,
                        
                        'icons': [

                        ]
                    }
                },
                'network': {   
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'switch': 0,
                        'router': 1,
                        'injector': 2,                        
                        'antenna': 3,
                        'fiber': 4,
                        
                        'icons': [

                        ]
                    }
                },
                'alarm1': {   
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'motion': 0,
                        'door contact': 1,
                        'glass break': 2,
                        'panel': 3,
                        
                        'icons': [

                        ]
                    }
                },
                'intercom1': {  
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'ip': 0,
                        'analog':1,
                        
                        'icons': [

                        ]
                    }
                }
            }
        },
    
       
        'layers' : {
            // // 'DOM_ID': 'bottom_menu_submenu_3',             
            // 'items':{
            //     'DOM_Class': 'bottom_menu_list_item_submenu', 
            //     'edit1': {                   
            //         'items':{
            //             'DOM_Class': 'bottom_menu_list_item_submenu',
            //             'camera': 1,
            //             'dvr': 2,
            //             'switch': 3
            //         }
            //     },
            //     'edit2': {                    
            //         'items':{
            //             'DOM_Class': 'bottom_menu_list_item_submenu',
            //             'reader': 1,
            //             'panel': 2,
            //         }
            //     },
            //     'edit3': {                    
            //         'items':{
            //             'DOM_Class': 'bottom_menu_list_item_submenu',
            //             'motion': 1,
            //             'door contact': 2,
            //             'glass break': 3,
            //             'panel': 4
            //         }
            //     },
            //     'edit4': {                    
            //         'items':{
            //             'DOM_Class': 'bottom_menu_list_item_submenu',
            //             'ip': 1,
            //             'analog':2
            //         }
            //     }
            //}
        },
        'quote': 1,

        'plans' : {
            // 'DOM_ID': 'bottom_menu_submenu_2',   
            'icon_src': '',          
            'items':{
                'DOM_Class': 'bottom_menu_list_item_submenu', 
                'add...': 1,
                '1st Floor': 2,
                '2nd Floor': 3,
                '3rd Floor': 4
            }
        },
    

    }    

}

function CreateAppMenu(callback){ // callBack is called every time a menu, subMenu or menuItem are clicked with a clicked item name
    let appMenuInstance = new appMenu(bottomMenuJSON.name, bottomMenuJSON.DOM_ID, bottomMenuJSON.DOM_Class, callback);
    let bottomMenuSubmenu = new subMenu('mainSubmenu', bottomMenuJSON.items.DOM_Class, appMenuInstance);
    appMenuInstance.contentJSON[appMenuInstance.name] = {};

    if (bottomMenuJSON.items){
       
        
        appMenuInstance.addSubmenu(bottomMenuSubmenu);
        bottomMenuSubmenu.createDOM();

        for(let k in bottomMenuJSON.items){
            if(k == 'DOM_Class' || k == 'icons') {
                continue;
            } 
                     
            addSubmenuItem(bottomMenuSubmenu, bottomMenuJSON.items[k], k, appMenuInstance.contentJSON[appMenuInstance.name])
        }
        
        //const {DOM_CLASS, ...items} = bottomMenuJSON.items;
        console.log(appMenuInstance)
        return appMenuInstance;
        
    }
    
    function addSubmenuItem(submenuParent, item, name, parentPath){
        parentPath[name] = {};  
        let subMenuItem = new menuItem(name, submenuParent, item.icon_src, item.icon_origin, parentPath[name]);
        submenuParent.addItem(subMenuItem);
        subMenuItem.createDOM();
        subMenuItem.addPointerDownListener();
       // subMenuItem.childreenPath = parentPath; // this will show the path from this item to all childreen
        if(item.items){
            addSubmenuFunction(subMenuItem, item.items, parentPath[name] );
        }
    }

    function addSubmenuFunction(parentItem, items, parentPath){
        let subMenuInstance = new subMenu(parentItem.name, items.DOM_Class, parentItem, bottomMenuSubmenu.parentDOM) // create all subMenus at the same level in DOM, same UL parent - so they would slide up in the same way
        subMenuInstance.createDOM();
        parentItem.addSubmenu(subMenuInstance);

        for(let k in items){
            if (k == 'DOM_Class' || k == 'icons') {
                continue;
            }     
            addSubmenuItem(subMenuInstance, items[k], k, parentPath)
        }
    }

}

function appMenu(name, DOM_ID, DOM_Class, callback){
    this.name = name;
    this.DOM_ID = DOM_ID; //unique identifier of this menu
    this.DOM = document.getElementById(this.DOM_ID);  
    this.class = DOM_Class;
    this.subMenu = {};
    this.menuStatus = 'hidden'; // other options 'shown'    
    this.activeTopSubmenuItem = null; // for highlighting the bottom menu choice
    this.activeSubmenu = null; // for showing/hiding submenu card
    this.activeMenuItem = null; // what 'end' item is active
    this.clickedPath = '';
    this.callback = callback;
    this.contentJSON = {};
}

appMenu.prototype.addSubmenu = function(subMenu){
    this.subMenu = subMenu;
    this.subMenu.parent = this;
    this.subMenu.parentDOM = this.DOM;
}

appMenu.prototype.setActiveTopSubmenuItem = function(subMenu){
    this.activeTopSubmenuItem = subMenu;    
    this.activeTopSubmenuItem.DOM.classList.add('bottom_menu_list_active_item')
}

appMenu.prototype.unsetActiveTopSubmenuItem = function(){  
    if(this.activeTopSubmenuItem){
        this.activeTopSubmenuItem.DOM.classList.remove('bottom_menu_list_active_item')
        this.activeTopSubmenuItem = null;
        this.clickedPath = '';
    }     
    
    if(this.activeMenuItem){
        this.unsetActiveMenuItem();
    }
}

appMenu.prototype.setActiveMenuItem = function(item){
    this.unsetActiveMenuItem();
    this.activeMenuItem = item;    
    this.activeMenuItem.DOM.classList.add('bottom_menu_list_active_item')
}

appMenu.prototype.unsetActiveMenuItem = function(){  
    if(this.activeMenuItem){
        this.activeMenuItem.DOM.classList.remove('bottom_menu_list_active_item')
        this.activeMenuItem = null;
    }          
}

appMenu.prototype.getItem = function(name){
    let checkSubmenu = (name, submenu) => {
        let returnValue = null;
        for(let k in submenu.items)
        {
            let item = submenu.items[k];
            if(item.name == name){
                return item;
            } else {
                if (item.subMenu){
                    returnValue = checkSubmenu(name, item.subMenu);
                    break;
                }
            }
        }
        return returnValue;
    }

    return checkSubmenu(name, this.subMenu)
}

    

appMenu.prototype.addItem = function(section, menuItemType,menuItemSubType,itemID){ // 'layers', 'video', 'camera', 'camera1'
    let menuSection = this.subMenu.items[section]; // layers LI

    if(!menuSection.subMenu){ // Layers LI / Video UL
        menuSection.subMenu = new subMenu('layers', 'bottom_menu_list_item_submenu', menuSection, this.DOM);        
        menuSection.subMenu.createDOM();
    }

    if(!menuSection.subMenu.getItem(menuItemType)){ // Layers LI / Video UL / Video LI 
        let subMenuItem = new menuItem(menuItemType, menuSection.subMenu, '');
        menuSection.subMenu.addItem(subMenuItem);
        subMenuItem.createDOM();
        subMenuItem.addPointerDownListener();
    }

    let itemTypeMenu = menuSection.subMenu.getItem(menuItemType);
    if(!itemTypeMenu.subMenu){ // Layers LI / Video UL / Video LI / Camera UL
        itemTypeMenu.subMenu = new subMenu(menuItemSubType, 'bottom_menu_list_item_submenu', itemTypeMenu, this.DOM);        
        itemTypeMenu.subMenu.createDOM();
    }

    if(!itemTypeMenu.subMenu.getItem(menuItemSubType)){ // Layers LI / Video UL / Video LI / Camera UL / Camera LI
        let subMenuItem = new menuItem(menuItemSubType, itemTypeMenu.subMenu, '');
        itemTypeMenu.subMenu.addItem(subMenuItem);
        subMenuItem.createDOM();
        subMenuItem.addPointerDownListener();
    }

    let itemSubTypeMenu = itemTypeMenu.subMenu.getItem(menuItemSubType);
    if(!itemSubTypeMenu.subMenu){
        itemSubTypeMenu.subMenu = new subMenu(menuItemSubType, 'bottom_menu_list_item_submenu', itemSubTypeMenu, this.DOM);        
        itemSubTypeMenu.subMenu.createDOM();
    }

    let item = new menuItem(itemID, itemSubTypeMenu.subMenu, '');
    item.createDOM();
    item.addPointerDownListener();

}

function subMenu(name, domClass, parent, parentDOM){
    this.name = name + '__submenu'
    this.parent = parent;
    this.parentDOM = general_validation(parentDOM) ? parentDOM : null;
    this.topParent = this.getTopParent();
    this.class = domClass;
    this.items = {};
    this.visible = false;
    this.DOM = null;   
}

subMenu.prototype.createDOM = function(){    
    let dom = document.createElement('ul');   
    dom.classList.add(this.class);
    this.parentDOM.appendChild(dom); 
    this.DOM = dom;
}

subMenu.prototype.addItem = function(item){
    this.items[item.name] = item;
    item.parent = this;
}

subMenu.prototype.addItems = function(){
    let items = {};
    
    for(let k in this.subMenuJSON){
        
        if(k == 'DOM_Class' || k == 'DOM_ID' || k == 'icon_src' || k == 'items' || k == 'icons') continue;
        //console.log(k)
        let item = new menuItem(k, this, this.subMenuJSON[k]);
        
        this.items[item.DOM_ID] = item;
    }
}

subMenu.prototype.getItem = function(itemID){
    if(Object.keys(this.items).includes(itemID)){
        return this.items[itemID]
    }
    return null;    
}

subMenu.prototype.getTopParent = function(){
    let previousParent = null;
    let topParent = this.parent;
    while(true){
        if(!topParent){
            return previousParent;            
        }
        previousParent = topParent;
        topParent = topParent.parent;
    }
}

subMenu.prototype.showMenu = function(){
    //console.log('showing menu');

    if(this.topParent.activeSubmenu){
        this.topParent.activeSubmenu.hideMenu();
    }    
    
    this.topParent.activeSubmenu = this;
    this.DOM.classList.add(this.class + '_visible');
    this.visible = true;

    this.topParent.clickedPath += '/' + this.parent.name;
    
} 
    

subMenu.prototype.hideMenu = function(){
    //console.log('hiding menu');
//    this.DOM.style.bottom = '100px'
    this.DOM.classList.remove(this.class + '_visible');    
    this.visible = false;
}

function menuItem(name, parent, icon_src, icon_origin, parentPath){
    this.parent = parent;
    this.topParent = this.parent.topParent;
    this.name = name;
    this.DOM_ID =  this.name + '__' + this.parent.class;
    this.iconSrc = icon_src ? icon_src:''
    this.iconOrigin = icon_origin ? icon_origin:'';
    this.DOM = null;//this.createDOM();
    this.subMenu = subMenu;

    //below values are useful for later menu usage, i.e. during the creation of an appTool
    this.childrenPath = parentPath; // chidreen path starts from this point down, 
    this.childrenPath.iconSrc = this.iconSrc;
    this.childrenPath.iconOrigin = this.iconOrigin;
}

menuItem.prototype.addPointerDownListener = function(){
    this.DOM.addEventListener('pointerdown',  function(ev){
        
        ev.stopPropagation();
        if(this.parent.parent === this.topParent){// check if this subMenu is the top subMenu - the bottom bar
            if(this.topParent.activeTopSubmenuItem && this.topParent.activeTopSubmenuItem == this){ // this item's submenu is already visible
                this.topParent.activeSubmenu.hideMenu(); // so hide it
                //console.log('hides submenu 1')
                this.topParent.unsetActiveTopSubmenuItem();
                this.topParent.unsetActiveMenuItem();
                this.topParent.activeSubmenu = null;

            } else {
                this.topParent.unsetActiveTopSubmenuItem();
                this.topParent.setActiveTopSubmenuItem(this);
            }
        } 
        
        if(this.subMenu){ // if this item has subMenu
           if(this.topParent.activeTopSubmenuItem){
            this.subMenu.showMenu(); // hides also previously shown menu
           }           
            
        } else { // if the clicked element doesnt have a subMenu this means it is an 'end' item           
            if(this.topParent.activeMenuItem){ // if there is an active item already
                let newPath = this.topParent.clickedPath.split('/') 
                newPath.pop(); // remove it's name from the path
                newPath = newPath.join('/');
                newPath += '/' + this.name;  // and add this item's name
                this.topParent.clickedPath = newPath;
            } else { // if there is no active item 
                this.topParent.clickedPath += '/' + this.name; // then just add the name to the path
            }
            this.topParent.setActiveMenuItem(this)
            //app.setAppMessage(this.topParent.activeTopSubmenuItem.name + ': ' + this.name)
            
            //console.log(this.DOM_ID.split('__')[0]);
        }

        this.topParent.callback(this, this.subMenu ? this.subMenu.items : null); // notify the menu owner (app) of menu being clicked
        
    }.bind(this))
}

menuItem.prototype.addSubmenu = function(submenu){
    this.subMenu = submenu;
   // submenu.parent = this;
}

menuItem.prototype.createDOM = function(){
    let DOM = document.createElement('li');
    DOM.id = this.DOM_ID;
    this.parent.DOM.appendChild(DOM);
    this.DOM = DOM;

    let div = document.createElement('div');
    div.classList.add('menu_list_item_image');
    if (this.iconSrc){
        let img = document.createElement('img');
        img.src = this.iconSrc;
        div.appendChild(img);
    } else {
        div.innerHTML = '<h2>' + this.name[0].toUpperCase() + '</h2>'
    }

    DOM.appendChild(div);

    let p = document.createElement('p');
    p.classList.add('menu_list_item_description');
    p.innerHTML = this.name;
    DOM.appendChild(p);
}

