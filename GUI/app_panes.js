function app_pane(name, type, parentDOM, callingElement, css_class){
    this.name = name;
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
            //itemDOM.innerHTML = this.pane_items[k].name;
            if(this.pane_items[k].name == 'delete'){
                //itemDOM.innerHTML = '<a class="waves-effect waves-light btn modal-trigger" href="#modal1" id=' + itemDOM.id + '>delete</a>' ; //materialize requirement for a modal dialog to work to make the trigger like this
                itemDOM.innerHTML = '<a class="modal-trigger" href="#modal1" id=' + itemDOM.id + '>delete</a>' ; //materialize requirement for a modal dialog to work to make the trigger like this
                //itemDOM.dataTarget = "modal1"
                //itemDOM.classList.add("modal-trigger")
            } else {
                itemDOM.innerHTML = this.pane_items[k].name;
            }
            
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
        this.DOM = this.renderDetailsDialog(parentDOM);
        return this.DOM;
    } else if(this.type == 'map object photos'){
        this.DOM = this.renderPhotosDialog(parentDOM);
        return this.DOM;
    } else if (this.type == 'map object deletion'){
        this.DOM = this.renderDeletionConfirmationDialog(parentDOM);
    } else if(this.type == 'project details'){
        this.DOM = this.renderDetailsDialog(parentDOM);
        return this.DOM;
    }
}

app_pane.prototype.removeFromDOM = function(){
    this.parentDOM.removeChild(this.DOM);
}

app_pane.prototype.renderMessageDialog = function(parentDOM){
    let messageBackdrop = document.createElement('div')
    messageBackdrop.classList.add('message_dialog_backdrop');
    parentDOM.appendChild(messageBackdrop);

    let messageDialog = document.createElement('div');
    messageDialog.classList.add('message_dialog');
    setTimeout(function(){
        messageDialog.classList.add('message_dialog_slide_in')
    }.bind(messageDialog), 100)
    messageBackdrop.appendChild(messageDialog);

    // close the dialog on backdrop click
    messageBackdrop.addEventListener('pointerdown', function(ev){
        ev.stopPropagation();
        this.parentNode.removeChild(this);
    })

}

app_pane.prototype.renderDetailsDialog = function(parentDOM){
    let caller = this.callingElement.associatedObject;

    let dialog = document.createElement('div');
    dialog.classList.add('details_dialog');
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
    
    closeButton.addEventListener('pointerdown', function(ev){
        ev.stopPropagation();
        // when dialog is closed save changed data
        for(let key in this.callingElement.associatedObject.parameters){
            let parameter = this.callingElement.associatedObject.parameters[key];
            if (!parameter.editable){
                continue;
            }

            if(general_validation(parameter.DOM)){
                let DOMValue = getValueOfHTMLElement(parameter.DOM);
                if(parameter.value != DOMValue){
                    parameter.value = DOMValue;

                    if(key == 'status'){
                        //if execution got here means the status has changed so we need to write to the history
                        let statusNote = getValueOfHTMLElement(this.callingElement.associatedObject.parameters.statusNote.DOM);
                        let statusHistoryEntry = {
                            user: app.currentUser,
                            dateTime: formatDateTime(new Date()),
                            status: DOMValue,
                            note: statusNote
                        }       
                        this.callingElement.associatedObject.parameters.statusHistory.value.unshift(statusHistoryEntry);       
                    }

                    if(key == 'note'){
                        //if execution got here means the note has changed so we need to write to the history            
                        let noteHistoryEntry = {
                            user: app.currentUser,
                            dateTime: formatDateTime(new Date()),                            
                            note: DOMValue
                        }       
                        this.callingElement.associatedObject.parameters.noteHistory.value.unshift(noteHistoryEntry);       
                    }
                }
            }
            
            
        }
        this.DOM.parentNode.removeChild(this.DOM);
    }.bind(this))

    // Materialize tabs
    let fieldsContainer = document.createElement('div');
    
    //let tabs = ['install','info', 'checklist', 'options']
    let tabContentDivs = createMaterializeTabs(fieldsContainer,caller.tabs) // tabContentDivs['container'] - whole element, tabContentDivs[tabs[0]] - tab 1 ...
    

    let rowDOMs = {}; // for rendering few fields in one row
    for(let k in caller.parameters){
        let parameter = caller.parameters[k];
        let id = this.name + '__' + k;
        // let elementClass = 'dialog_title';
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
            let header = renderHTMLElement(headerContainer, k, parameter.htmlElement, '', id, 'dialog_title', value, valueOptions, '')
            let optionIconsContainer = renderHTMLElement(headerContainer, '', 'div', '', '', '', '', '', '');
            let edit = renderHTMLElement(optionIconsContainer, '', 'i', '', id + '__edit', 'small material-icons', 'edit', '', '')
            let message = renderHTMLElement(optionIconsContainer, '', 'i', '',  'map_object_details_dialog__message', 'small material-icons', 'message', '', '')
            
            //change name event listener (tap on the pencil next to the name)
            edit.addEventListener('pointerdown', (ev) => {
                let newName = prompt('Enter new name: ', caller.parameters.name.value);
                if(newName == ''){
                    alert('Name can\'t be empty!');
                } else if(newName != null) {
                    if (newName.length > 11){
                        header.classList.add('smaller_header_font')
                    } else {
                        header.classList.remove('smaller_header_font')
                    }
                    header.innerHTML = newName;
                    caller.parameters.name.value = newName;
                    caller.mapObject.name = newName;
                    caller.mapObject.updateDisplayedName();
                }
                
            })

            message.addEventListener('pointerdown', function(ev){
                this.renderMessageDialog(parentDOM)
                // if(newMessage == ''){
                //     alert('Message can\'t be empty!');
                // } else if(newMessage != null) {
                    
                // }
                
            }.bind(this))
            continue;
        }
        
        // next if is for rendering few fields in one row if the parameter.row is defined
        let htmlWrapperDivRow = null;
        if(parameter.hasOwnProperty('row'))
        {
            if (general_validation(rowDOMs[parameter.row])){
                htmlWrapperDivRow = rowDOMs[parameter.row];
            } else {
                htmlWrapperDivRow = renderHTMLElement(tabContentDivs[caller.tabs[parameter.tab]], '', 'div', '', '', 'row', '', '', '','');
                rowDOMs[parameter.row] = htmlWrapperDivRow;
            }
             
        } else {
            htmlWrapperDivRow = renderHTMLElement(tabContentDivs[caller.tabs[parameter.tab]], '', 'div', '', '', 'row', '', '', '','');
        }

        let htmlWrapperDivInputField = renderHTMLElement(htmlWrapperDivRow, '', 'div', '', '', wrapperDOMClass, '', '', '','');
        let htmlElementDOM = renderHTMLElement(htmlWrapperDivInputField, k, htmlTag, htmlTagOption, id, 'validate', value, valueOptions, label, editable);
        parameter.DOM = htmlElementDOM;
    }
   
    dialog.appendChild(fieldsContainer);
    
    
    //Materialize init
    var elems = document.querySelectorAll('select');
    let options= {}
    var instances = M.FormSelect.init(elems, options);
    options = {
        'duration': 300,
        'onShow': null,
        'swipeable': false,
        'responsiveTreshold': 300
    }
   var tabsInstance = M.Tabs.init(tabContentDivs['container'],options);
   //fix materialize tab height
   if (options.swipeable){
      document.querySelector('.tabs-content.carousel.carousel-slider').style.height = '700px';
      document.querySelector('.tabs-content.carousel.carousel-slider').style.overflow = 'scroll';
   }
   
   tabsInstance.updateTabIndicator();
   M.updateTextFields();    
    //M.AutoInit();
    return dialog;
}

app_pane.prototype.renderPhotosDialog = function(parentDOM){
    let caller = this.callingElement.associatedObject;

    let dialog = document.createElement('div');
    dialog.classList.add('details_dialog');
    parentDOM.appendChild(dialog);

    //header render
    let thisEquipmentName = caller.parameters.name.value;
    buildHeader(dialog, thisEquipmentName, thisEquipmentName + '__photo_dialog_header', ['edit', 'message'])

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
    
    closeButton.addEventListener('pointerdown', function(ev){
        ev.stopPropagation();

        this.DOM.parentNode.removeChild(this.DOM);
    }.bind(this))

    // Materialize tabs
    let photosContainer = document.createElement('div');
    
    let row = renderHTMLElement(photosContainer, '', 'div', '', '', 'row card', '', '', '','');
    for(let elem of caller.photos){        
        let wrapperDiv = renderHTMLElement(row, '', 'div', '', '', 'col s4 m2', '', '', '','');
        let image = renderHTMLElement(wrapperDiv, '', 'img', elem.src, '', 'responsive-img card materialboxed', '', '', '', '');
    }   
    dialog.appendChild(photosContainer);
    
    let bottomMenu = renderHTMLElement(dialog, '', 'div', '', '', 'dialog_bottom_menu', '', '', '', '');
    //let takePictureButton = renderHTMLElement(bottomMenu, '', 'i', '', 'mapObject_dialog' + '__take_photo', 'small material-icons', 'camera_alt', '', '')



    let camera = document.createElement('input')
    camera.type = 'file';
    camera.accept = "image/*";
    camera.capture = "camera";
    camera.id = 'mapObject_take_photo_button'
    bottomMenu.appendChild(camera);

    camera.addEventListener('change', (ev) => {
        // Method 1 - did not do a popup on image click
        // var reader = new FileReader();
        // reader.onload = function(ev1){
        //     let wrapperDiv = renderHTMLElement(row, '', 'div', '', '', 'col s4 m2', '', '', '','');
        //     let image = renderHTMLElement(wrapperDiv, '', 'img', ev1.target.result, '', 'responsive-img card materialboxed', '', '', '', '');
        // }
        // reader.readAsDataURL(camera.files[0]);

        // Method 2
        let img = URL.createObjectURL(ev.target.files[0]);
        let wrapperDiv = renderHTMLElement(row, '', 'div', '', '', 'col s4 m2', '', '', '','');
        let image = renderHTMLElement(wrapperDiv, '', 'img', img, '', 'responsive-img card materialboxed', '', '', '', '');

        caller.photos.push(
            {
                dateTaken: formatDateTime(new Date()),
                src: img
            }
        )
        // reinit materialize
        var elems = document.querySelectorAll('img.responsive-img');
        options = {
            'inDuration': 300,
            'outDuration': 200,
            'onOpenStart': null,
            'onOpenEnd': null,
            'onCloseStart': null,
            'onCloseEnd': null
        }
        var instances = M.Materialbox.init(elems, options);
    })

    // takePictureButton.addEventListener('pointerup', (ev)=>{
    //     let camera = document.createElement('input')
    //     camera.type = 'file';
    //     camera.accept = "image/*";
    //     camera.capture = "camera";
    //     camera.id = 'mapObject_take_photo_button'
    //     dialog.appendChild(camera);
    // })


    
    //Materialize init
    var elems = document.querySelectorAll('img.responsive-img');
    options = {
        'inDuration': 300,
        'outDuration': 200,
        'onOpenStart': null,
        'onOpenEnd': null,
        'onCloseStart': null,
        'onCloseEnd': null
    }
    var instances = M.Materialbox.init(elems, options);
    
   
    //M.AutoInit();
    return dialog;
}

app_pane.prototype.renderDeletionConfirmationDialog = function(parentDOM){
    let caller = this.callingElement.associatedObject;

    // let dialog = document.createElement('div');
    // dialog.classList.add('map_object_dialog');
    // parentDOM.appendChild(dialog);

    let thisEquipmentName = caller.parameters.name.value;

    // closeButton.addEventListener('pointerup', function(ev){
    //     ev.stopPropagation();
        
    //     this.DOM.parentNode.removeChild(this.DOM);
    // }.bind(this))

    let modalContainer = renderHTMLElement(parentDOM, '', 'div', '', 'modal1', 'modal', '', '', '','');
    let modalContent = renderHTMLElement(modalContainer, '', 'div', '', '', 'modal-content', '', '', '','');
    let header = renderHTMLElement(modalContent, '', 'p', '', '', '', 'Are you sure you want to delete ' + thisEquipmentName + '?', '', '',''); 
    let footer = renderHTMLElement(modalContainer, '', 'div', '', '', 'modal-footer', '', '', '',''); 
    let yesBtn = renderHTMLElement(footer, '', 'a', '#!', '', 'modal-close waves-effect waves-green btn-flat', 'Yes', '', '',''); 
    let noBtn = renderHTMLElement(footer, '', 'a', '#!', '', 'modal-close waves-effect waves-green btn-flat', 'No', '', '',''); 

    yesBtn.addEventListener('pointerdown', (ev)=>{
        let a = yesBtn;
        console.log('Map element ' + this.callingElement.ID + ' is being removed.')
        this.callingElement.remove();
        delete this.callingElement.deletionConfirmation;
        var instance = M.Modal.getInstance(modalContainer);
        instance.close();
        instance.destroy();
        
        let modal = document.getElementById('modal1');
        removeHTMLelement(modal);
    })


    options = {
        opacity:		0.5,
        inDuration:		250,
        outDuration:	250,	
        onOpenStart:	null,	
        onOpenEnd:		null,	
        onCloseStart:   null,	
        onCloseEnd:		(ev)=>{
            var a =1;
        },	
        preventScrolling:true,	
        dismissible:	true,	
        startingTop:	'4%',	
        endingTop:  	'10%'	
    }
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, options);

    // handle events on the dialog to prevent from bubbling
    modalContainer.addEventListener('pointerdown', function(ev){
        ev.stopPropagation();
    })
    modalContainer.addEventListener('pointerup', function(ev){
        ev.stopPropagation();
    })
    modalContainer.addEventListener('pointermove', function(ev){
        ev.stopPropagation();
    })
//     <div id="modal1" class="modal">
//     <div class="modal-content">
//       <h4>Modal Header</h4>
//       <p>A bunch of text</p>
//     </div>
//     <div class="modal-footer">
//       <a href="#!" class="modal-close waves-effect waves-green btn-flat">Agree</a>
//     </div>
//   </div>
}