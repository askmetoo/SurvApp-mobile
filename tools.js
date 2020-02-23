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

function renderHTMLElement(parent, fieldName, htmlTag, id, domClass, value, valueOptions, label){
    
    let element = document.createElement(htmlTag);
    if(general_validation(domClass)){
        element.classList.add(domClass);
    }
    element.id = id;
    element.name = fieldName;
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
                element.innerHTML = value;
                break;  
            case 'select':
                for(let elem of valueOptions){
                    let option = document.createElement('option');
                    option.text = elem;
                    option.value = elem;
                    element.appendChild(option);
                    
                }
                element.value = value;
                break;
        }
    }

    parent.appendChild(element);
    if(label){
        let label = document.createElement('label');
        //label.htmlFor = fieldName;
        label.innerHTML = fieldName;
        parent.appendChild(label);
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
