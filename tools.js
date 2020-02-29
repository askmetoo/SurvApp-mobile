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
    
    let element = document.createElement(htmlTag);

    if(editable === false){
        element.disabled = true;
    }

    if(general_validation(domClass)){
        if(domClass.split(' ').length>0)
        {
            let classes = domClass.split(' ');
            for(let elem of classes){
                element.classList.add(elem)
            }
        } else {
            element.classList.add(domClass);
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

    if(htmlTag == 'input'){
        M.updateTextFields();      
    }
    return element;
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
