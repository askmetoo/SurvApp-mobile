class htmlHelper {
    constructor(){
        this.doms = {};
        this.listeners = {};
        this.hammerManagers = {};
    }

    createDom(tag, parent, domClass, id, type, name, value, innerHtml, src, options){
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

            if(type){
                dom.type = type;
            }

            if(name){
                if(tag == 'label'){
                   dom.htmlFor = name;
                } else {
                    dom.name = name;
                }
                
            }

            if(value){
                dom.value = value;
            }

            
            if(innerHtml){
                dom.innerHTML = innerHtml;
            }

            if(src){
                dom.src = src;
            }

            if(tag=='select'){
                for(let option of options){
                    let optionDom = document.createElement('option');
                    optionDom.innerHTML = option;
                    dom.appendChild(optionDom);
                }
            }

            return dom;
        }
    };

    addDomListener(uniqueID, listenTo, callback, method){
        switch (method){
            case 'hammer':
                let dom = this.doms[uniqueID].dom;
                if(!this.hammerManagers.hasOwnProperty(uniqueID)){
                    this.hammerManagers[uniqueID] = new Hammer.Manager(dom);
                    this.hammerManagers[uniqueID].add(new Hammer.Press({ event: 'press', pointers: 1, time: 10 }));
                    this.hammerManagers[uniqueID].add( new Hammer.Tap({ event: 'singletap'}));
                    this.hammerManagers[uniqueID].add( new Hammer.Tap({ event: 'doubletap', taps:2}));
                    this.hammerManagers[uniqueID].add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );
                    this.hammerManagers[uniqueID].add( new Hammer.Pinch());
                    this.hammerManagers[uniqueID].get('pinch').set({ enable: true });
                }                

                this.hammerManagers[uniqueID].on(listenTo, callback)
                // switch (listenTo){
                //     case 'singletap':
                        
                        
                //         break;
                //     case 'doubletap':
                        
                //         break;
                //     case 'pan':
                        
                //         break;
                //     case 'pinch':
                        
                        
                //         break;
                // }
                break;
            case 'regular':
            default:
                this.doms[uniqueID].dom.addEventListener(listenTo, callback);
                if(!this.doms[uniqueID].hasOwnProperty('listeners')){
                    this.doms[uniqueID]['listeners'] = {};
                }
                this.doms[uniqueID].listeners[listenTo] = callback;
                break;
            
            
        }
        
    }

    removeDomListener(uniqueID, listenTo, method){
        switch (method){
            case 'hammer':
                this.hammerManagers[uniqueID].off(listenTo);
                break;
            case 'regular':
            default:
                this.doms[uniqueID].dom.removeEventListener(listenTo, this.doms[uniqueID].listeners[listenTo])
                break;

        }
        
    }

    addHammerListener(){

    }

}