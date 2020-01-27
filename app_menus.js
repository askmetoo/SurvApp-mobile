// only top most menus are defined in index.html, the rest is created dynamically
// menus may be stacked 

let menu1Items = {
    'insert' : {
        'DOM_ID': 'main_menu_submenu_1', 
        'items':{
            'video': {
                'camera': 1,
                'dvr': 2,
                'switch': 3
            },
            'access control': {
                'reader': 1,
                'panel': 2,
            },
            'alarm': {
                'motion': 1,
                'door contact': 2,
                'glass break': 3,
                'panel': 4
            },
            'intercom': {
                'ip': 1,
                'analog':2
            },
            'access control1': {
                'reader': 1,
                'panel': 2,
            },
            'alarm1': {
                'motion': 1,
                'door contact': 2,
                'glass break': 3,
                'panel': 4
            },
            'intercom1': {
                'ip': 1,
                'analog':2
            }
        }
    },

    'edit' : {
        'DOM_ID': 'main_menu_submenu_2', 
        'items':{
            'edit1': {
                'camera': 1,
                'dvr': 2,
                'switch': 3
            },
            'edit2': {
                'reader': 1,
                'panel': 2,
            },
            'edit3': {
                'motion': 1,
                'door contact': 2,
                'glass break': 3,
                'panel': 4
            },
            'edit4': {
                'ip': 1,
                'analog':2
            }
        }
    },

    'test' : {
        'DOM_ID': 'main_menu_submenu_3', 
        'items':{
            'edit1': {
                'camera': 1,
                'dvr': 2,
                'switch': 3
            },
            'edit2': {
                'reader': 1,
                'panel': 2,
            },
            'edit3': {
                'motion': 1,
                'door contact': 2,
                'glass break': 3,
                'panel': 4
            },
            'edit4': {
                'ip': 1,
                'analog':2
            }
        }
    }
        

}

function CreateAppMenus(){
    let appMainMenu = new appMenu('bottom', 'main_menu');
    
    for(let k in menu1Items){
        let mainMenuItem = menu1Items[k];
        let menuItemObject = new appSubmenu(k, mainMenuItem['DOM_ID'])
        appMainMenu.addSubmenu(menuItemObject)

        menuItemObject.itemsDOM.addEventListener('menuItemClicked', function(ev){
            console.log('menuItemClicked: ' + ev.detail.menuName)
        })

        for(let j in mainMenuItem['items']){
            let subMenuItem = menuItemObject['items'][j];
            let subMenuItemObject = new menuItem(j)
            menuItemObject.addItem(subMenuItemObject);
        }
        
    }
    return appMainMenu;
}

function appMenu(name, DOM_ID){
    this.name = name;
    this.DOM_ID = DOM_ID; //unique identifier of this menu
    this.DOM = document.getElementById(this.DOM_ID);    
    this.subMenus = {};
    this.menuStatus = 'hidden'; // other options 'shown'    
    this.activeSubmenu = null;
}

appMenu.prototype.addItem = function(item){
    this.items[item.name] = item;
}

appMenu.prototype.addSubmenu = function(submenu){
    this.subMenus[submenu.DOM_ID] = submenu;
    this.subMenus[submenu.DOM_ID].parentMenu = this;
}

function appSubmenu(name, DOM_ID){
    this.parentMenu = null;
    this.name = name;
    this.DOM_ID = DOM_ID; //unique identifier of this menu
    this.DOM = document.getElementById(this.DOM_ID);
    this.itemsDOM = null;
    this.items = {};
    this.subMenu = null;
    this.menuStatus = 'inactive'; // if menu button clicked/tapped and menu shows this will be set to 'active'

    
    let icon = this.DOM.querySelector('div') // div inside the menu is the icon
    icon.innerHTML = '<h2>' + this.name[0].toUpperCase() + '</h2>';

    let text = this.DOM.querySelector('p');
    text.innerHTML = this.name;

    let subMenuContainerDOM = document.createElement('ul'); // all items are going to be here
    subMenuContainerDOM.classList.add('main_menu_list_item_submenu');
    subMenuContainerDOM.id = this.name + '_main_menu_list_item_submenu';
    this.DOM.closest('section').appendChild(subMenuContainerDOM);
    this.itemsDOM = subMenuContainerDOM;
    //console.log('itemsDOM: ' + this.itemsDOM)
    this.DOM.addEventListener('click', this.onClick)
    
    subMenuContainerDOM.addEventListener('click', processEvent)
    // /subMenuContainerDOM.addEventListener('touchstart', processEvent)

    function processEvent(ev){
        console.log('processing event')
        let event = new CustomEvent('menuItemClicked', {
            detail:{
                menuName: ev.target.parentNode.id
            }
        })
        subMenuContainerDOM.dispatchEvent(event)
    }
}

appSubmenu.prototype.addItem = function(item){
    this.items[item.DOM_ID] = item;
    this.itemsDOM.appendChild(item.DOM);

}

appSubmenu.prototype.onClick = function(ev){
    let newActiveSubMenu = app.appMenus['bottom'].subMenus[this.id]; // 'this' here is a calling onClick object
    let previousActiveSubMenu = newActiveSubMenu.parentMenu.activeSubMenu;
    
    let justHidden = false;

    console.log(previousActiveSubMenu)    

    if(previousActiveSubMenu){
        if (previousActiveSubMenu == newActiveSubMenu ){
            justHidden = true;
            console.log('justHidden')
        }
        previousActiveSubMenu['itemsDOM'].style.bottom = '-100px'; // hide previous submenu
        previousActiveSubMenu.menuStatus = 'inactive'
        newActiveSubMenu.parentMenu.activeSubMenu = null;
        console.log('hidden')
    }    

    if (newActiveSubMenu.menuStatus == 'active'){ //if the menu is currently active
        newActiveSubMenu['itemsDOM'].style.bottom = -100 + 'px' // hide it
        newActiveSubMenu.menuStatus = 'inactive';
        newActiveSubMenu.parentMenu.activeSubMenu = null;
        console.log('shown')
    } else if(!justHidden){ // if this menu is not active nad was not just hidden
        newActiveSubMenu['itemsDOM'].style.bottom = 100 + 'px' // show current submenu
        newActiveSubMenu.parentMenu.activeSubMenu = newActiveSubMenu; // save curent submenu as active
        newActiveSubMenu.menuStatus = 'active'
    }    
}

function menuItem(name){
    this.name = name;
    this.DOM_ID = name + "_main_menu_list_item_submenu_item";
    this.DOM = null;
    this.toolTip = '';
    this.action = {};  // saves function of the menu activation i.e. insertObject()
    this.status = 'insert';  // to keep track of the status - 'insert' - single insert of the object, 'insert mode' - double tap inserts until turned off

    this.DOM = document.createElement('li');
    this.DOM.classList.add('main_menu_list_item_submenu_item');
    this.DOM.id = this.DOM_ID;

    let imageDiv = document.createElement('div');
    imageDiv.classList.add('menu_list_item_image');
    this.DOM.appendChild(imageDiv);

    let descriptionP = document.createElement('div');
    descriptionP.classList.add('menu_list_item_description');
    descriptionP.innerHTML = this.name;
    this.DOM.appendChild(descriptionP);

}


