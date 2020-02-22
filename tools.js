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
    if(label){
        let label = document.createElement('label');
        label.htmlFor = fieldName;
        label.innerHTML = value;
        parent.appendChild(label);
    }
    let element = document.createElement(htmlTag);
    if(general_validation(domClass)){
        element.classList.add(domClass);
    }
    element.id = id;
    element.name = fieldName;
    if(general_validation(value)){
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
                break;
        }
    }

    parent.appendChild(element);
    return element;
}

