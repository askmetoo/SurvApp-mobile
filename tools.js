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