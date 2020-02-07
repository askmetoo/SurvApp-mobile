// only top most menus are defined in index.html, the rest is created dynamically
// menus may be stacked 

let bottomMenuJSON = { 
    'name': 'bottom menu',   
    'DOM_ID': 'bottom_menu',    
    'items': { //ul
        'DOM_Class': 'bottom_menu_list', // ul class
        'insert' : { // li
           // 'DOM_Class': 'bottom_menu_list_item', // li class
            //'DOM_ID': 'bottom_menu_submenu_1', // li ID
            'icon_src': '',
            'items':{ // ul
                'DOM_Class': 'bottom_menu_list_item_submenu',
                'video': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'camera': 1,
                        'dvr': 2,
                        'switch': 3
                    }                   
                },
                'access control': {                     
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'reader': 1,
                        'panel': 2,
                    }
                },
                'alarm': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'motion': 1,
                        'door contact': 2,
                        'glass break': 3,
                        'panel': 4
                    }
                },
                'intercom': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'ip': 1,
                        'analog':2
                    }
                },
                'access control1': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'reader': 1,
                        'panel': 2,
                    }
                },
                'alarm1': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'motion': 1,
                        'door contact': 2,
                        'glass break': 3,
                        'panel': 4
                    }
                },
                'intercom1': {                   
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
            // 'DOM_ID': 'bottom_menu_submenu_3',             
            'items':{
                'DOM_Class': 'bottom_menu_list_item_submenu', 
                'edit1': {                   
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'camera': 1,
                        'dvr': 2,
                        'switch': 3
                    }
                },
                'edit2': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'reader': 1,
                        'panel': 2,
                    }
                },
                'edit3': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'motion': 1,
                        'door contact': 2,
                        'glass break': 3,
                        'panel': 4
                    }
                },
                'edit4': {                    
                    'items':{
                        'DOM_Class': 'bottom_menu_list_item_submenu',
                        'ip': 1,
                        'analog':2
                    }
                }
            }
        },
        'quote': 1

    }    

}

function CreateAppMenu1(){
    let appMenu1 = new appMenu(bottomMenuJSON);
    appMenu1.addSubmenu();
    //const {DOM_CLASS, ...items} = bottomMenuJSON.items;
    return appMenu1;
    

}

function appMenu(menuJSON){
    this.menuJSON = menuJSON;
    this.name = menuJSON.name;
    this.DOM_ID = menuJSON.DOM_ID; //unique identifier of this menu
    this.DOM = document.getElementById(this.DOM_ID);  
    this.class = menuJSON.items.DOM_Class;
    this.subMenu = {};
    this.menuStatus = 'hidden'; // other options 'shown'    
    this.activeTopSubmenuItem = null; // for highlighting the bottom menu choice
    this.activeSubmenu = null; // for showing/hiding submenu card
    this.activeMenuItem = null; // what 'end' item is active
    this.clickedPath = '';
}

appMenu.prototype.addSubmenu = function(){
    this.subMenu = new subMenu(this, this.menuJSON.items, this.DOM);
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

function subMenu(parent, subMenuJSON, parentDOM){
    this.parent = parent;
    this.parentDOM = parentDOM;
    this.topParent = this.getTopParent();
    this.subMenuJSON = subMenuJSON;
    this.class = subMenuJSON.DOM_Class;
    this.items = {};
    this.visible = false;
    this.DOM = (() => {
        let dom = document.createElement('ul');
        //console.log(this)

        dom.classList.add(this.class);
        //this.parentDOM = this.parent.DM;
        // if(this.class == 'bottom_menu_list' || this.class == 'bottom_menu_list_item'){ // if this class then parent is 
        //     this.parentDOM = this.parent.DOM;
        // }else if(this.class == 'bottom_menu_list_item_submenu') { // else don't create UL for the submenu just 
        //     //console.log(this.parent)
        //     this.parentDOM = this.parent.parent.DOM;
        // }

        this.parentDOM.appendChild(dom); 
        return dom;
    })()  
    

    this.addItems();
    if(this.class === 'bottom_menu_list_item_submenu'){
        let subMenuRect = this.DOM.getBoundingClientRect(); 
        //this.DOM.style.bottom = - subMenuRect.height + 'px'; // hide the menu initially below the bottom menu by the amount of height of UL
    }

    
    
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
    console.log('showing menu');

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

function menuItem(parent, name, itemJSON){
    this.parent = parent;
    this.topParent = this.parent.topParent;
    this.itemJSON = itemJSON;
    this.name = name;
    //this.class = itemJSON.DOM_Class;
    this.DOM_ID = itemJSON.DOM_ID != undefined ? itemJSON.DOM_ID : this.name + '__' + this.parent.class;
    this.iconSrc = itemJSON.icon_src != undefined ? itemJSON.icon_src : '';
    this.DOM = this.createDOM();
   
    //if this there items in this item create submenu
    this.subMenu = itemJSON.items != undefined ? new subMenu(this, itemJSON.items, this.parent.parentDOM) : null;

    this.DOM.addEventListener('touchstart',  function(){
        
        if(this.parent.parent === this.topParent){// check if this subMenu is the top subMenu - the bottom bar
            this.topParent.unsetActiveTopSubmenuItem();
            this.topParent.setActiveTopSubmenuItem(this);
            //this.DOM.classList.add('bottom_menu_list_active_item')
        }
    

        if(this.subMenu){
            // if (this.subMenu.visible){
            //     this.topParent.clickedPath = '';
            //     this.subMenu.hideMenu();
            // } else {
            
            this.subMenu.showMenu(); // hides previously shown menu
            //}
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

menuItem.prototype.createDOM = function(){
    let DOM = document.createElement('li');
    //this.DOM.classList.add(this.class);
    DOM.id = this.DOM_ID;
    //this.DOM.innerHTML = this.name;
    //console.log(this)
    this.parent.DOM.appendChild(DOM);


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

    return DOM;
}

