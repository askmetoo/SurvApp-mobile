class htmlHelper {
    constructor(){
        this.doms = {};
        this.listeners = {};
    }

    createDom(tag, parent, domClass, id, type, name, value, innerHtml,src){
        if (tag){
            let uniqueID = randomNumber(100000000);

            let dom = document.createElement(tag);
            dom.uniqueID = uniqueID;
            this.doms[uniqueID] = {};
            this.doms[uniqueID].dom = dom;

            if(parent) {
                parent.appendChild(dom)
            }

            if(domClass){
                let domClasses = domClass.split(','); // split the domClass if it is a list separated by comma
                for(let elem of domClasses){
                    dom.classList.add(elem.trim());
                }                
            }

            if(id){
                dom.id = id;
            }

            if(value){
                dom.value = value;
            }

            if(type){
                dom.type = type;
            }

            if(innerHtml){
                dom.innerHTML = innerHtml;
            }

            if(src){
                dom.src = src;
            }

            return dom;
        }
    };

    addDomListener(uniqueID, listenTo, callback){
        this.doms[uniqueID].dom.addEventListener(listenTo, callback);
        if(!this.doms[uniqueID].hasOwnProperty('listeners')){
            this.doms[uniqueID]['listeners'] = {};
        }
        this.doms[uniqueID].listeners[listenTo] = callback;
    }

    removeDomListener(uniqueID, listenTo){
        this.doms[uniqueID].dom.removeEventListener(listenTo, this.doms[uniqueID].listeners[listenTo])
    }

    addHammerListener(){

    }

}