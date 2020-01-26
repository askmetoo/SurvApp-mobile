// only top most menus are defined in index.html, the rest is created dynamically
// menus may be stacked 

let menu1Items = {
    'insert' : {
        'video surveillance': {
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
        }

    }
}

function CreateAppMenus(){
    let appMenu1 = new appMenu('insert', 'main_menu_list_item_1');
    let menu1Submenus = {};

    for(key in menu1Items){
        let subMenuDOM = document.createElement('ul');
        
    }
}

function appMenu(name, DOM_ID){
    this.name = name;
    this.DOM_ID = DOM_ID; //unique identifier of this menu
    this.DOM = document.getElementById(this.DOM_ID);
    this.items = {};
    this.subMenu = null;
    this.menuStatus = 'inactive'; // if menu button clicked/tapped and menu shows this will be set to 'active'
}

appMenu.prototype.addSubmenu = function(submenu){
    this.submenu[submenu.DOM_ID] = subMenu;
}

function menuItem(name){
    this.name = '';
    this.DOM_ID = '';
    this.toolTip = '';
    this.action = {};  // saves function of the menu activation i.e. insertObject()
    this.status = 'insert';  // to keep track of the status - 'insert' - single insert of the object, 'insert mode' - double tap inserts until turned off
}

appMenu.prototype.addItem = function(item){
    this.items[item.name] = item;
}
