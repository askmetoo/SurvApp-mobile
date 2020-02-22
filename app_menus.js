// only top most menus are defined in index.html, the rest is created dynamically
// menus may be stacked 

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
                'video': {   
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'camera': 1,
                        'dvr': 2,
                        'nvr': 3,
                        'vms': 4,
                        'switch': 5
                    }                   
                },
                'access control': {  
                    'icon_src': '',                   
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'reader': 1,
                        'panel': 2,
                    }
                },
                'alarm': {
                    'icon_src': '',                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'motion': 1,
                        'door contact': 2,
                        'glass break': 3,
                        'panel': 4
                    }
                },
                'intercom': {  
                    'icon_src': '',                  
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'ip intercom': 1,
                        'analog intercom':2
                    }
                },
                'access control1': {   
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'reader': 1,
                        'panel': 2,
                    }
                },
                'alarm1': {   
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'motion': 1,
                        'door contact': 2,
                        'glass break': 3,
                        'panel': 4
                    }
                },
                'intercom1': {  
                    'icon_src': '',                 
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'ip': 1,
                        'analog':2
                    }
                }
            }
        },
    
        'edit' : {
            // 'DOM_ID': 'bottom_menu_submenu_2',   
            'icon_src': '',          
            'items':{
                'DOM_Class': 'bottom_menu_list_item_submenu', 
                'edit1': 1,
                'edit2': 2,
                'edit3': 3,
                'edit4': 4
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
        'quote': 1

    }    

}

function CreateAppMenu(){
    let appMenuInstance = new appMenu(bottomMenuJSON.name, bottomMenuJSON.DOM_ID, bottomMenuJSON.DOM_Class);
    let bottomMenuSubmenu = new subMenu('mainSubmenu', bottomMenuJSON.items.DOM_Class, appMenuInstance);
    if (bottomMenuJSON.items){
       
        
        appMenuInstance.addSubmenu(bottomMenuSubmenu);
        bottomMenuSubmenu.createDOM();

        for(let k in bottomMenuJSON.items){
            if(k == 'DOM_Class') {
                continue;
            }            
            addSubmenuItem(bottomMenuSubmenu, bottomMenuJSON.items[k], k)
        }
        
        //const {DOM_CLASS, ...items} = bottomMenuJSON.items;
        console.log(appMenuInstance)
        return appMenuInstance;
        
    }
    
    function addSubmenuItem(submenuParent, item, name){
        let subMenuItem = new menuItem(name, submenuParent, item.icon_src);
        submenuParent.addItem(subMenuItem);
        subMenuItem.createDOM();
        subMenuItem.addPointerDownListener();

        if(item.items){
            addSubmenuFunction(subMenuItem, item.items);
        }
    }

    function addSubmenuFunction(parentItem, items){
        let subMenuInstance = new subMenu(parentItem.name, items.DOM_Class, parentItem, bottomMenuSubmenu.parentDOM) // create all subMenus at the same level in DOM, same UL parent - so they would slide up in the same way
        subMenuInstance.createDOM();
        parentItem.addSubmenu(subMenuInstance);

        for(let k in items){
            if (k == 'DOM_Class') {
                continue;
            }     
            addSubmenuItem(subMenuInstance, items[k], k)
        }
    }

}

function appMenu(name, DOM_ID, DOM_Class){
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
        
        if(k == 'DOM_Class' || k == 'DOM_ID' || k == 'icon_src' || k == 'items') continue;
        //console.log(k)
        let item = new menuItem(this,k , this.subMenuJSON[k]);
        
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

function menuItem(name, parent, icon_src){
    this.parent = parent;
    this.topParent = this.parent.topParent;
    this.name = name;
    this.DOM_ID =  this.name + '__' + this.parent.class;
    this.iconSrc = icon_src;
    this.DOM = null;//this.createDOM();
    this.subMenu = null;

    
}

menuItem.prototype.addPointerDownListener = function(){
    this.DOM.addEventListener('pointerdown',  function(ev){
        ev.stopPropagation();
        if(this.parent.parent === this.topParent){// check if this subMenu is the top subMenu - the bottom bar
            if(this.topParent.activeTopSubmenuItem && this.topParent.activeTopSubmenuItem == this){ // this item's submenu is already visible
                this.topParent.activeSubmenu.hideMenu(); // so hide it
                //console.log('hides submenu 1')
                this.topParent.unsetActiveTopSubmenuItem();
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
            app.setAppMessage(this.topParent.activeTopSubmenuItem.name + ': ' + this.name)
            
            //console.log(this.DOM_ID.split('__')[0]);
        }
        
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

