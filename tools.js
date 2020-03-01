document.getElementById("app_message").innerHTML = 'tools.js loaded';

function insertTestPoint(DOM,x,y,color){
    let point = document.createElement('div')
    point.classList.add('test_point');
    point.style.left = x +'px';
    point.style.top = y + 'px'
    color == 'undefined' ? 'red' : color;
    point.style.backgroundColor = color;
    DOM.appendChild(point)
}

function isObject(obj){
    if(typeof obj === 'object' && obj !== null){
        return true;
    }
    return false;
}

function general_validation(obj){
    if(obj != null && obj != undefined && obj != ''){
        return true;
    }
    return false;
}

function renderHTMLElement(parent, fieldName, htmlTag, htmlTagOptions, id, domClass, value, valueOptions, label, editable){
   if(label==true){
       let a=1;
   }

    if(htmlTag!='custom'){
        let element = document.createElement(htmlTag);

        if(editable === false){
            element.disabled = true;
        }
    
        if(general_validation(domClass)){
            let classes = domClass.split(' ');
            if(classes.length>0)
            {
                for(let elem of classes){
                    element.classList.add(elem)
                }
            } else {
                element.classList.add(domClass);
            } 
            if(classes.includes('row')){
                element.style.marginBottom = '5px';
                element.style.height = 'auto';
                // element.style.overflow = 'scroll'
            }
            if(classes.includes('input-field')){
                element.style.marginBottom = '5px';
                element.style.height = 'auto';
                // element.style.overflow = 'scroll'
            }
        }
    
    
        if(general_validation(id)){
            element.id = id;
        }
        
        if(general_validation(fieldName)){
            element.name = fieldName;
        }
      
        if(/*general_validation(value)*/true){
            switch (htmlTag){
                case 'div':
                    break;
                
                case 'ul':
                case 'li':
                case 'h1':
                case 'h2':
                case 'h3':   
                case 'p': 
                case 'i':   
                    if(general_validation(value)){
                        element.innerHTML = value;
                    }                
                    break; 
                case 'input':
                        if(general_validation(value)){
                            element.value = value;
                        } 
                        element.type = htmlTagOptions;     
                        
                        break; 
                case 'textarea':
                        if(general_validation(value)){
                            element.value = value;
                        }   
                        element.classList.add('materialize-textarea');             
                    break;     
                    
                case 'select':
                    if(general_validation(valueOptions)){
                        for(let elem of valueOptions){
                            let option = document.createElement('option');
                            option.text = elem;
                            option.value = elem;
                            element.appendChild(option);                    
                        }                    
                    }
                    if(general_validation(value)){
                        element.value = value;
                    }                
                    break;
    
                
            }
        }
    
        parent.appendChild(element);    
        
    
        if(label){
            let htmlLabel = document.createElement('label');
            //label.htmlFor = fieldName;
            htmlLabel.innerHTML = label;
            htmlLabel.htmlFor = element.name;
            if(htmlTag == 'input'){
                htmlLabel.classList.add('active')
            }
            parent.appendChild(htmlLabel);
        }    
        
        return element;
    } else {
        switch (fieldName){
            case 'statusHistory':
                let statusHistoryDOM = buidHistorySection(fieldName,label,value);
                parent.appendChild(statusHistoryDOM);
            break;

            case 'noteHistory':
                let noteHistoryDOM = buidHistorySection(fieldName,label,value);
                parent.appendChild(noteHistoryDOM);
            break; 
        }
    }    
}

function getValueOfHTMLElement(DOM){
    switch (DOM.nodeName){
        case 'SELECT':
        case 'INPUT':
        case 'TEXTAREA':
            return DOM.value;
            break;
    }
}

function buidHistorySection(type,labelText,values){
    let container = document.createElement('div');
    container.classList.add('history_section');

    let label = document.createElement('label');
    label.innerHTML = labelText + ' (' + values.length + ')';
    container.appendChild(label);

    let allHistoryEntriesContainer = document.createElement('div')
    allHistoryEntriesContainer.classList.add('collapsed')
    container.appendChild(allHistoryEntriesContainer)

    label.addEventListener('pointerup', function(ev){
        this.classList.toggle('collapsed')
    }.bind(allHistoryEntriesContainer))

    if(general_validation(values)){
        for(let elem of values){     
            let historyEntryContainer = document.createElement('div');      
            allHistoryEntriesContainer.appendChild(historyEntryContainer);

            let userDateAndTimeContainer = document.createElement('div');
            historyEntryContainer.appendChild(userDateAndTimeContainer)

            let user = document.createElement('span');
            user.innerHTML = elem.user.ID;
            userDateAndTimeContainer.appendChild(user);

            let dateTime = document.createElement('span');
            dateTime.innerHTML = elem.dateTime;
            userDateAndTimeContainer.appendChild(dateTime);

            let hr = document.createElement('hr');
            userDateAndTimeContainer.appendChild(hr);

            let statusAndNoteContainer = document.createElement('div')
            historyEntryContainer.appendChild(statusAndNoteContainer)

            if(type == 'statusHistory'){
                let status = document.createElement('span');
                status.innerHTML = elem.status;
                status.classList.add('status');
                statusAndNoteContainer.appendChild(status);    
            }
           
            let note = document.createElement('span');
            note.innerHTML = elem.note;
            note.classList.add('note');
            statusAndNoteContainer.appendChild(note);

        }
    }
    return container;
}

function createMaterializeTabs(parent, names){
    let tabContainer = document.createElement('div')
    tabContainer.classList.add('row')
    parent.appendChild(tabContainer)

    let materializeColS12 = document.createElement('div')
    materializeColS12.classList.add('col', 's12');
    tabContainer.appendChild(materializeColS12);

    let materializeULTabs = document.createElement('ul')
    materializeULTabs.classList.add('tabs')
    materializeULTabs.style.marginBottom = '10px'
    materializeColS12.appendChild(materializeULTabs)

    for(let elem of names){
        let tab = document.createElement('li')
        tab.classList.add('tab','col','s3')
        materializeULTabs.appendChild(tab)

        let a = document.createElement('a')
        a.href = '#' + elem.replace(/\s+/g, '') // remove spaces if there are any
        a.innerHTML = elem
        tab.appendChild(a)
    }

    materializeULTabs.childNodes[0].childNodes[0].classList.add('active'); // set first tab to active - <a class="active" href="#test2">Test 2</a>

    let tabContentDivs = {}
    tabContentDivs['container'] = materializeULTabs;
    for(let elem of names){
        let tabContent = document.createElement('div')
        tabContent.id = elem.replace(/\s+/g, '')
        tabContent.classList.add('col', 's12')
        tabContainer.appendChild(tabContent)
        tabContentDivs[elem] = tabContent

    }

    return tabContentDivs;
    
}


function formatDateTime(dateTime){
    let day = dateTime.getDate();
    let month = dateTime.getMonth();
    let year = dateTime.getFullYear();
    let dayOfTheWeekNo = dateTime.getDay();
    let hour = dateTime.getHours();
    let minute = dateTime.getMinutes();
    let daysOfWeek = {
        '0': 'Sunday',
        '1': 'Monday',
        '2': 'Tuesday',
        '3': 'Wednesday',
        '4': 'Thursday',
        '5': 'Friday',
        '6': 'Saturday'
    };
    let dayOfWeek = daysOfWeek[dayOfTheWeekNo]

    return dateTime.toDateString() + ', ' + dateTime.toLocaleTimeString();
}