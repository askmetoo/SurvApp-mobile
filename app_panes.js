function app_pane(name, type, parentDOM, callingElement, css_class){
    this.pane_name = name;
    this.type = type;
    this.parentDOM = parentDOM;
    this.DOM = '';
    this.pane_item_categories = {};
    this.pane_items = {};
    this.activeItem = null;
    this.callingElement = callingElement;
    this.margin = 5; // distance from calling object
    this.location = {
        x: 0,
        y: 0
    }

    this.cssClass = css_class;
     
}

function app_pane_general_item(ID, name){
    this.name = name;
    this.ID = ID;
    this.parent = null;
    this.DOM = null;
    this.state = null;
    this.hint = '';    

    this.htmlElement = '';
}


app_pane_general_item.prototype.addParent = function(parent){
    this.parent = parent;
}

app_pane.prototype.add_category = function(name, DOM_ID){
    this.pane_item_categories[name] = {};
    if(general_validation(DOM_ID)){
        this.pane_item_categories[name].DOM_ID = DOM_ID;
    }    
}

app_pane.prototype.add_item = function(item){
    this.pane_items[item.ID] = item;
    if(general_validation(item.category)){ // if item has category
        if(!this.pane_item_categories.hasOwnProperty(item.category)){ // and if the category doesn't exist in pane_item_categories
            //throw "category missing during item addition to pane; app_pane: " + this.name + ",  item: " + item.name; // throw n error because the category should be always added before the item
            this.pane_item_categories[item.category] = {};
            this.pane_item_categories[item.category].name = item.category;
            this.pane_item_categories[item.category].DOM_ID = 'main-content__left-sidebar__' + item.category;
            this.pane_item_categories[item.category].DOM = null; // will be added during rendering 
        } 
        if(!general_validation(this.pane_item_categories[item.category].items)){
            this.pane_item_categories[item.category].items = {};
        }   
        this.pane_item_categories[item.category].items[item.ID] = item;  // add object to the category object     
    }   
    return this.pane_items[item.ID];  
}

app_pane.prototype.remove_item = function(DOM_ID){
    if(general_validation(this.pane_items[DOM_ID].category)){
        if(this.pane_item_categories.hasOwnProperty([this.pane_items[DOM_ID].category])){
           delete this.pane_item_categories[[this.pane_items[DOM_ID].category]][DOM_ID];
        } else {
            throw "category missing during item removal from pane; app_pane: " + this.name + ",  item: " + item.name; // throw n error because the category was not there but the item had a category
        }
    }    
    this.pane_items[DOM_ID].DOM.remove();
    delete this.pane_items[DOM_ID];
}

app_pane.prototype.set_location = function(){
    let appPaneRect = this.DOM.getBoundingClientRect();
    let elementRect = this.callingElement.containerDOM.getBoundingClientRect();
    let designPlanRect = this.callingElement.parentDesignPlan.DOM.getBoundingClientRect();
    
    //console.log(appPaneRect)
    //console.log(elementRect)
    //console.log(designPlanRect)

    let adjustedX = elementRect.x;
    let adjustedY = elementRect.y + elementRect.height + this.margin;
    if(elementRect.x + appPaneRect.width > designPlanRect.width){
        adjustedX = designPlanRect.width - appPaneRect.width - this.margin;
    }

    if(elementRect.y + elementRect.height + appPaneRect.height + this.margin > designPlanRect.height){
        adjustedY = elementRect.y - appPaneRect.height - this.margin;
    }
    

    this.DOM.style.left = adjustedX + 'px';
    this.DOM.style.top = adjustedY + 'px';
}

app_pane.prototype.render = function(parentDOM){
    if (this.type == 'popup menu'){
        //render container
        let menuContainer = document.createElement('div');
        menuContainer.classList.add(this.cssClass);
        this.parentDOM.appendChild(menuContainer)
        this.DOM = menuContainer;
        this.set_location();

        //render menu items
        let menuList = document.createElement('ul');
        for(let k in this.pane_items){
            let itemDOM = document.createElement('li');
            itemDOM.id = this.pane_items[k].ID;
            itemDOM.innerHTML = this.pane_items[k].name;
            this.pane_items[k].DOM = itemDOM;
            menuList.appendChild(itemDOM);
        }
        this.DOM.appendChild(menuList)

        // resize parent container -- not needed for now
        let menuListRect = menuList.getBoundingClientRect();
        let menuContainerRect = menuContainer.getBoundingClientRect();
        if(menuListRect.height > menuContainerRect.height){
            
        }
    } else if(this.type == 'map object details'){
        this.DOM = this.buildDetailsDialog(parentDOM);
        return this.DOM;
    }
}

app_pane.prototype.removeFromDOM = function(){
    this.parentDOM.removeChild(this.DOM);
}

app_pane.prototype.buildDetailsDialog = function(parentDOM){
    let caller = this.callingElement.associatedEquipment;

    let dialog = document.createElement('div');
    dialog.classList.add('map_object_details_dialog');
    parentDOM.appendChild(dialog);

    // handle events on the dialog to prevent from bubbling
    dialog.addEventListener('pointerdown', function(ev){
        ev.stopPropagation();
    })
    dialog.addEventListener('pointerup', function(ev){
        ev.stopPropagation();
    })
    dialog.addEventListener('pointermove', function(ev){
        ev.stopPropagation();
    })
    
    //define dialog close button
    let closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.ID = 'dialog_close_button';
    dialog.appendChild(closeButton);
    closeButton.addEventListener('pointerup', function(ev){
        ev.stopPropagation();
        this.DOM.parentNode.removeChild(this.DOM);
    }.bind(this))

    // Materialize tabs
    let fieldsContainer = document.createElement('div');
    
    let tabs = ['install','info', 'checklist', 'options']
    let tabContentDivs = createMaterializeTabs(fieldsContainer,tabs) // tabContentDivs['container'] - whole element, tabContentDivs[tabs[0]] - tab 1 ...


    let rowDOMs = {}; // for rendering few fields in one row
    for(let k in caller.parameters){
        let parameter = caller.parameters[k];
        let id = 'map_object_details_dialog__' + k;
        let value = parameter.value;
        let valueOptions = parameter.hasOwnProperty('options') ? parameter.options : null;
        let label = parameter.hasOwnProperty('display') ? parameter.display : null;
        let visible = parameter.show;
        let editable = parameter.editable;
        let htmlTag = parameter.htmlElement;
        let htmlTagOption = parameter.hasOwnProperty('htmlElementOption') ? parameter.htmlElementOption : '';
        let wrapperDOMClass = parameter.hasOwnProperty('wrapperDOMClass') ? parameter.wrapperDOMClass : 'input-field col s12';

        if(parameter.hasOwnProperty('header')){
            let headerContainer = renderHTMLElement(dialog, '', 'div', '', '', '', '', '', '')
            let header = renderHTMLElement(headerContainer, k, parameter.htmlElement, '', id, '', value, valueOptions, '')
            let edit = renderHTMLElement(headerContainer, '', 'i', '', id + '__edit', 'small material-icons', 'edit', '', '')
            edit.addEventListener('pointerdown', function(ev){
                let newName = prompt('Enter new name: ');
                if(newName == ''){
                    alert('Name can\'t be empty!');
                } else {
                    header.innerHTML = newName;
                    caller.parameters.name.value = newName;
                }
                
            }.bind(caller))
            continue;
        }
        
        // next if is for rendering few fields in one row if the parameter.row is defined
        let htmlWrapperDivRow = null;
        if(parameter.hasOwnProperty('row'))
        {
            if (general_validation(rowDOMs[parameter.row])){
                htmlWrapperDivRow = rowDOMs[parameter.row];
            } else{
                htmlWrapperDivRow = renderHTMLElement(tabContentDivs[tabs[parameter.tab]], '', 'div', '', '', 'row', '', '', '','');
                rowDOMs[parameter.row] = htmlWrapperDivRow;
            }
             
        } else {
            htmlWrapperDivRow = renderHTMLElement(tabContentDivs[tabs[parameter.tab]], '', 'div', '', '', 'row', '', '', '','');
        }

        let htmlWrapperDivInputField = renderHTMLElement(htmlWrapperDivRow, '', 'div', '', '', wrapperDOMClass, '', '', '','');
        let htmlElementDOM = renderHTMLElement(htmlWrapperDivInputField, k, htmlTag, htmlTagOption, id, 'validate', value, valueOptions, label, editable);
        parameter.DOM = htmlElementDOM;
        
        //renderHTMLElement(parent, fieldName, htmlTag, id, domClass, value, valueOptions, label){

    }
    // for(let k in caller.htmlElements){
    //     let dialogElement = caller.htmlElements[k];
        
    //     let id = 'map_object_details_dialog__' + k;
    //     let value = caller[dialogElement.value];
    //     if(dialogElement.hasOwnProperty('choices')){
    //         valueOptions = dialogElement.choices;
    //     } else {
    //         valueOptions = ['no options yet'];
    //     }

    //     if(dialogElement.hasOwnProperty('header')){ 
    //         //append header to dialog
    //         let domElement = renderHTMLElement(dialog, dialogElement.value, dialogElement.htmlElement, id, '', dialogElement.display, valueOptions, false)

    //         //fieldsContainer.appendChild(domElement);
    //     } else {
    //         //append all others to tab 1
    //         let domElement = renderHTMLElement(tabContentDivs[tabs[0]], dialogElement.value, dialogElement.htmlElement, id, '', dialogElement.display, valueOptions, true)
    //         //fieldsContainer.appendChild(domElement);

    //         if(dialogElement.hasOwnProperty('subElements')){
    //             //let subElementsContainer = document.createElement('div');
    //             if(caller[k].length>0){ // if caller[k] object i.e. statusHistory has any subElements
    //                 for(let arrElement of caller[k]){ // i.e. statusHistory element which is an object containing elements describing 1 status entry
    //                     for(let j in dialogElement.subElements){  // go over fields in subElements     
    //                         let id = 'map_object_details_dialog__' + k + '__' + dialogElement.subElements[j].value;
    //                         let value = arrElement[dialogElement.subElements[j].value]
    //                         let subElement = renderHTMLElement(domElement, dialogElement.value, dialogElement.subElements[k], id, '', dialogElement.name, '')
    //                         //domElement.appendChild(subElement);
    //                     }
    //                 }
    //             } else { // no subElements yet
    //                 //let subElementsContainer = document.createElement('div');
    //                // subElementsContainer.innerHTML = '<span>nothig to display yet...</span>'
    //                 //domElement.appendChild(subElementsContainer);
    //                 domElement.innerHTML = 'nothig to display yet...'
    //             }
    //             //domElement.appendChild(subElementsContainer);
    //         }
    //     }
        
    // }

    for(let k in caller.additionalParameters){
        let parameter = caller.additionalParameters[k];
        let id = 'map_object_details_dialog__additionalParameters_' + k;
        let value = parameter.value;
        let elementDIV = document.createElement('div')
        elementDIV.classList.add('input-field', 'col', 's12')
        tabContentDivs[tabs[1]].appendChild(elementDIV); // append to tab 2

        let domElement = renderHTMLElement(elementDIV, parameter.display, parameter.htmlElement, parameter.htmlElementOption, id, '', value, parameter.options, true);
        parameter.DOM = domElement;

        elementDIV.addEventListener('focusout', function(ev){            
            if(parameter.htmlElement == 'select'){
                parameter.value = parameter.DOM.value;
                console.log(parameter.display + '=' + parameter.value);
            }            
        }.bind(parameter))

        

    }
    dialog.appendChild(fieldsContainer);
    
    //Materialize init
    var elems = document.querySelectorAll('select');
    let options= {}
    var instances = M.FormSelect.init(elems, options);
    options = {
        'duration': 300,
        'onShow': null,
        'swipeable': true,
        'responsiveTreshold': 300
    }
   var tabsInstance = M.Tabs.init(tabContentDivs['container'],options)
   tabsInstance.updateTabIndicator();
    //M.AutoInit();
    return dialog;
}