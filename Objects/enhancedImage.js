class enhancedImage{
    constructor(imageDOM, description, popupEnabled){
        this.imageDOM = imageDOM;
        this.popupEnabled = popupEnabled;
        this.canvasContainer = null;
        this.canvas = null;
        this.canvasContainerLocation = {};
        this.context = null;
        this.strokes = null;

        this.textAreas = {};
        this.selectedTextArea = null;

        this.scale = 1;
        

        this.toolBar = null;
        this.activeTool = null;
        this.activeToolSubmenu = null;
        this.tools = {
            'pencil':{
                'name': 'pencil',
                'icon': 'mode_edit',
                'dom': null,
                'selected': false,
                'currentLineWidth': 0,
                'execute': (context) => {
                    context.lineWidth = this.tools['pencil'].currentLineWidth == 0 ? 1 : this.tools['pencil'].currentLineWidth;
                    context.lineJoin = 'round';
                    context.lineCap = 'round';       
                    context.globalCompositeOperation =  'source-over',                
                    context.scale(1,1);
                },
                'submenu':{
                    'size_select':{
                        'name': 'size_select',
                        'htmlElement': 'div',
                        'class': 'pencil_size_select',
                        'create': (submenuTool) => {
                            //check if the slider is already created which would mean that this execute action is done due to a change of a tool rather than the first time
                            let slider = submenuTool.containerDOM.querySelector('.pencil_size_select_slider')
                            //if slider already exists do nothing
                            if (slider) return;
                            slider = document.createElement('div');
                            slider.classList.add('pencil_size_select_slider');
                            submenuTool.containerDOM.appendChild(slider);
                            submenuTool.toolDOM = slider;
                            noUiSlider.create(slider, {
                                start: [2],
                                connect: true,
                                step: 1,
                                orientation: 'horizontal', // 'horizontal' or 'vertical'
                                range: {
                                  'min': 1,
                                  'max': 10
                                },
                                margin: 1,
                                // format: wNumb({
                                //   decimals: 0
                                // })
                               });
                        }
                    }
                    
                }
            },
            'eraser':{
                'name': 'eraser',
                'icon': 'adb',
                'dom': null,
                'selected': false,
                'execute': (context) => {
                    context.lineWidth = 4;
                    context.lineJoin = 'round';
                    context.lineCap = 'round'; 
                    context.globalCompositeOperation =  'destination-out',             
                    context.scale(1,1);
                },
            },
            'text':{
                'name': 'text',
                'icon': 'text_fields',
                'dom': null,
                'selected': false,
                'execute': (context) => {
                    //this.activateCanvasTextTool();
                },
                'submenu':{
                    'htmlElement': 'ul',
                    'font_size':{
                        'name': 'font_size',
                        'htmlElement':'select',
                        'htmlElementOptions': {10:'10px', 15:'15px', 20:'20px'},
                        'class': 'text_size_select',
                        'dom': null,
                        'value': 8,
                        execute: (thisTool)=>{ // thisTool is a section of this object starttin 'font_size'
                            if (thisTool.dom){
                                let size = thisTool.dom.value;
                                if(this.selectedTextArea){
                                    this.selectedTextArea.style.fontSize = size;
                                    thisTool.value = size; // save this to use it if other textareas are inserted
                                }
                            }
                        }
                    },
                    'font_family':{
                        'name': 'font_family',
                        'htmlElement': 'select',
                        'htmlElementOptions': {
                            'Arial': 'Arial, Helvetica, sans-serif',
                            'Verdana': 'Verdana, Geneva, sans-serif',
                            'Lucida': '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
                            'Geneva': 'Tahoma, Geneva, sans-serif',
                            'Calibri': 'Calibri'
                        },
                        'class': 'text_font_select',
                        dom: null,
                        value: 'Arial',
                        execute: (thisTool)=>{ // thisTool is a section of this object starttin 'font_size'
                            if (thisTool.dom){
                                let fontFamily = thisTool.dom.value;
                                if(this.selectedTextArea){
                                    this.selectedTextArea.style.fontFamily = fontFamily;
                                    thisTool.font_family = fontFamily; // save this to use it if other textareas are inserted
                                }
                            }
                        }            
                    },
                    'font_weight':{
                        'name': 'font_weight',
                        'htmlElement': 'span',
                        'icon': 'format_bold',
                        'class': 'text_weight_select' 
                    }

                }
            },
            'highlighter':{
                'name': 'highlighter',
                'icon': 'adb',
                'dom': null,
                'selected': false
            },
           
            'clear':{
                'name': 'clear',
                'icon': 'clear_all',
                'dom': null
            }, 
            'color':{
                'name': 'color',
                'icon': 'color_lens',
                'dom': null
            },


        }

        this.toolsParams = {
            'thickness':{
                'tool': 'pencil',
                'range': '5'
            },
            'fontSize':{
                'tool': 'text',
                'range': 5,
                'min-value': 8,
                'step': 2
            }

        }
    }

    setListeners(){

        this.hammerManager = new Hammer.Manager(this.imageDOM);

        this.hammerManager.options.domEvents = true;

        // Tap recognizer with minimal 2 taps
        this.hammerManager.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
        // Single tap recognizer
        this.hammerManager.add( new Hammer.Tap({ event: 'singletap' }) );
        // Pan recognizer
        this.hammerManager.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );    
    
        // we want to recognize this simulatenous, so a quadrupletap will be detected even while a tap has been recognized.
        this.hammerManager.get('doubletap').recognizeWith('singletap');
        // we only want to trigger a tap, when we don't have detected a doubletap
        this.hammerManager.get('singletap').requireFailure('doubletap');

        this.imageDOM.addEventListener('pointerdown', ev => {ev.stopPropagation()});
        this.hammerManager.on('singletap', ev => {
            this.popUp();
        });
    }

    popUp(animation){
        this.backDrop = document.getElementById('main_backdrop');
        //this.backDrop.classList.remove('backdrop_removed');
        
        this.backDrop.classList.add('backdrop_visible');
        
        setTimeout(() => {
            let imageElementDOM = this.imageDOM.querySelector('img');
            if (!imageElementDOM){
                imageElementDOM = this.imageDOM;
            }
    
            this.imageFullScreen = imageElementDOM.cloneNode(true);
            this.setSmoothImagePopup();
            
            this.backDrop.appendChild(this.imageFullScreen);
    
            let closeButton = document.createElement('span');
            closeButton.id = 'enhanced_image_popup_close_button';
            closeButton.innerHTML = '&#10006;';
            closeButton.addEventListener('pointerup', ev => {
                this.closePopup();
            })
            this.backDrop.appendChild(closeButton)
    
            this.addCanvas();
        }, 280)
        
       
    }

    setSmoothImagePopup(){
        this.imageFullScreen.id = "enhanced_image_full_screen";
        let originalImageRect = this.imageDOM.getBoundingClientRect();
        this.imageFullScreen.style.position = 'absolute';
        this.imageFullScreen.style.left = originalImageRect.x + "px";
        this.imageFullScreen.style.top = originalImageRect.y + "px";
        this.imageFullScreen.style.width = originalImageRect.width + "px";
        this.imageFullScreen.style.height = originalImageRect.height + "px";
        this.imageFullScreen.style.transition = "all 0.5s"

        setTimeout(() => {this.imageFullScreen.classList.add('image_full_screen');}, 10)
    }

    closePopup(){
        // work later on the closing transition since height is set to auto on css class and when class is removed it jumps back immediately to the original height (without transition)
        let rect = this.imageFullScreen.getBoundingClientRect();
        //document.styleSheets[0].insertRule(`#enhanced_image_full_screen:{height: ${rect.height} }`, 0);
        // this.imageFullScreen.style = '';//.height = rect.height;

       // this.imageFullScreen.style.height = rect.height + 'px';

        // this.imageFullScreen.style.width = rect.width;
        // this.imageFullScreen.style.left = rect.left;
        // this.imageFullScreen.style.top = rect.top;
        setTimeout(()=>{
            this.imageFullScreen.classList.remove('image_full_screen');
            
            
            setTimeout(()=>{
                this.backDrop.innerHTML = '';
                this.backDrop.classList.remove('backdrop_visible');

                // setTimeout(() => {
                //     this.backDrop.classList.remove('backdrop_inserted')
                //     this.backDrop.classList.add('backdrop_removed',)
                // }, 600)
            }, 500)

           
        
        }, 10)
    }


    addCanvas(){
        this.canvasContainer = document.createElement('div');
        this.canvasContainer.classList.add('canvas_container');
        this.backDrop.appendChild(this.canvasContainer);

        this.canvas = document.createElement('canvas');
        this.canvasContainer.appendChild(this.canvas);
        this.canvas.classList.add('canvas_full_screen', 'browser-default');
        //set timeout to let the canvas go through the transition and get the right dimensions and location
        setTimeout(() => {
            //this.matchDimensions(this.backdrop, this.canvasContainer, this.canvas);
            let canvasContainerRect = this.canvasContainer.getBoundingClientRect();
            this.canvas.setAttribute('width', canvasContainerRect.width);
            this.canvas.setAttribute('height', canvasContainerRect.height);
            this.saveCanvasContainerLocation(); // saving location coords of the canvas to use it for pointer events
        }, 600);

        this.context = this.canvas.getContext('2d');
        this.context.lineWidth = 3;
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.strokeStyle = '#00CC99';
        this.context.scale(1,1);

        this.canvas.addEventListener('pointerdown', ev => {
            this.context.beginPath();
            
            let x = (ev.clientX - this.canvasContainerLocation.x) / this.scale;
            let y = (ev.clientY - this.canvasContainerLocation.y) / this.scale;
            this.context.moveTo(x, y); 

            if(this.activeTool.name == 'text' && !this.selectedTextArea){
                
                this.insertText(x,y);
            }

            if(this.activeToolSubmenu){
                this.activeToolSubmenu.submenuDOM.classList.remove('tool_submenu_visible');
                this.activeToolSubmenu = null;
            }
        })

        this.hammer = new hammerTouch(this.canvas);
        this.hammer.on('pan', (ev) => {
            //get the color from the color tool in the tool bar

            if (this.selectedTextArea){
                    let x = ev.deltaX;
                    let y = ev.deltaY;
                    this.selectedTextArea.currentDeltaX = x;
                    this.selectedTextArea.currentDeltaY = y;
                    this.selectedTextArea.style.transform = `translate(${this.selectedTextArea.translateX + x}px, ${this.selectedTextArea.translateY + y}px)`                
            } else {
                this.context.strokeStyle = '#' + this.tools['color'].dom.innerHTML;   
                if (this.activeTool && this.activeTool.name == 'pencil' && this.activeTool.submenu['size_select'].toolDOM){
                    this.context.lineWidth = this.activeTool.submenu['size_select'].toolDOM.noUiSlider.get()
                }
                
                let x = (ev.center.x - this.canvasContainerLocation.x) / this.scale;
                let y = (ev.center.y - this.canvasContainerLocation.y) / this.scale;
                this.context.lineTo(x, y);
                this.context.stroke();
                console.log(`drawing: ${x}, ${y}`)
                this.selectedTextArea = null;
            }
            
        })

        this.canvas.addEventListener('pointerup', ev => {
            document.activeElement.blur()
            if (this.selectedTextArea){
                this.selectedTextArea.translateX += this.selectedTextArea.currentDeltaX;
                this.selectedTextArea.translateY += this.selectedTextArea.currentDeltaY;
                //this.selectedTextArea.removeEventListener('pointermove', this.changeTextAreaDims)                    
                //this.selectedTextArea.removeEventListener('pointerleave', this.setTextAreaDims)
               // this.selectedTextArea = null;
            }
            
        })

        this.buildToolBar();

    }

    matchDimensions(sourceElem, destElement, canvas){
        let rect = sourceElem.getBoundingClientRect();
        destElement.style.left = rect.x + 'px';
        destElement.style.top = rect.y + 'px';
        destElement.style.width = rect.width + 'px';
        destElement.style.height = rect.height + 'px';
        canvas.setAttribute('width', rect.width);
        canvas.setAttribute('height', rect.height);
    }

    saveCanvasContainerLocation(){
        let canvasRect = this.canvasContainer.getBoundingClientRect();
        this.canvasContainerLocation.x = canvasRect.x;
        this.canvasContainerLocation.y = canvasRect.y;
    }

    
    buildToolBar(){
        this.toolBar = document.createElement('div');
        this.toolBar.classList.add('canvas_toolbar');

        this.backDrop.appendChild(this.toolBar);

        for(let k in this.tools){
            let tool = this.tools[k];
            tool.dom = document.createElement('button');
            tool.dom.classList.add('canvas_tool_container', 'browser-default')

           
            this.toolBar.appendChild(tool.dom);

            if(tool.name =='color'){
                tool.dom.classList.add('jscolor')
                jscolor.init();
            } else {
                let toolIcon = document.createElement('i');
                toolIcon.classList.add('material-icons', 'small');
                toolIcon.innerHTML = tool.icon;
    
                tool.dom.appendChild(toolIcon);
            }

            if(tool.hasOwnProperty('submenu')){
                let toolSubmenuContainer = document.createElement('span');
                toolSubmenuContainer.classList.add('tool_submenu_container');
                tool.submenu.submenuDOM = toolSubmenuContainer;

                this.backDrop.appendChild(toolSubmenuContainer);
                for(let k in tool.submenu){
                    if(k == 'submenuDOM' || k == 'htmlElement')continue;
                    let submenuTool = tool.submenu[k];
                    let submenuToolDom = document.createElement(submenuTool.htmlElement);
                    submenuTool.dom = submenuToolDom;

                    if(submenuTool.icon){
                        let toolIcon = document.createElement('i');
                        toolIcon.classList.add('material-icons', 'small');
                        toolIcon.innerHTML = submenuTool.icon;
            
                        submenuToolDom.appendChild(toolIcon);
                    }

                    if(submenuTool.htmlElementOptions){
                        if(submenuTool.htmlElement == 'select'){
                            for(let k in submenuTool.htmlElementOptions){
                                let option = submenuTool.htmlElementOptions[k];
                                let optionDOM = document.createElement('option');
                                optionDOM.text = k;
                                optionDOM.value = option;
                                submenuToolDom.appendChild(optionDOM)
                            }
                        }
                    }
                    submenuToolDom.classList.add(submenuTool.class);
                    toolSubmenuContainer.appendChild(submenuToolDom)
                    submenuTool.containerDOM = submenuToolDom;

                    if(submenuTool.create){
                        submenuTool.create(submenuTool);
                    }
                    
                    if(submenuTool.execute){
                        submenuTool.execute(submenuTool);
                    }

                    submenuToolDom.addEventListener('change', (ev) => {
                        if(submenuTool.execute){
                            submenuTool.execute(submenuTool);
                        }
                    })
                    
                }
            }
           

            tool.dom.addEventListener('pointerdown',ev => {
                ev.stopPropagation();
                if(tool.name != 'color'){
                    if (this.activeTool){
                        this.deactivateTool(this.activeTool);
                    }

                    if(tool.name =='pencil' || tool.name == 'text'){
                        if(tool.hasOwnProperty('submenu') && tool.submenu.hasOwnProperty('submenuDOM') && (tool.submenu.submenuDOM)){
                            tool.submenu.submenuDOM.classList.add('tool_submenu_visible');
                            this.activeToolSubmenu = tool.submenu;
                            //tool.submenu['size_select'].toolDOM.noUiSlider.set(this.context.lineWidth) // set the slider value, for some reason it goes to 0 after reopening
                        }
                    }

                    this.activateTool(tool);
                    tool.execute(this.context);
                    // if(tool.selected){
                    //     tool.selected = false;
                    //     console.log(`tool ${tool.name} is deselected`);
                    //     tool.dom.classList.add('canvas_tool_selected');

                    // } else {
                    //     tool.selected = true;
                    //     console.log(`tool ${tool.name} selected`)
                    //     tool.dom.classList.remove('canvas_tool_selected')
                    // }
                } else {
                    
                }
                
            })

           
        }

        // after building the tool menu select pencil as defaul
        this.activateTool(this.tools['pencil'])
    }

    activateTool(tool){
        tool.dom.classList.add('canvas_tool_selected')
        tool.dom.selected = true;
        this.activeTool = tool;
    }

    deactivateTool(tool){
        tool.dom.classList.remove('canvas_tool_selected')
        tool.dom.selected = false;
    }

    insertText(x,y){
        let textarea = document.createElement('textarea');
        textarea.classList.add('canvas_text_input')//, 'browser-default');
        //textarea.id = randomNumber(MAX_RANDOM_VALUE); // from tools.js
        textarea.style.color = '#' + this.tools['color'].dom.innerHTML;
        textarea.style.transform = `translate(${x}px, ${y}px)`
        textarea.translateX = x;
        textarea.translateY = y;

        setTimeout(() => {
            let textareaRect = textarea.getBoundingClientRect();
            textarea.myHeight = textareaRect.height;
            textarea.myWidth = textareaRect.width;
            textarea.firstX = x; // just a dummy value this will represent a starting point of the pan
            textarea.firstY = y;
        }, 100)
        
        //add this texarea to the object with an index of textarea
        this.textAreas[textarea] = textarea;
        //set selected textarea
        this.selectedTextArea = textarea;

        //textarea.myWidth = 0;


        // textarea.addEventListener('pointerdown', (ev)=>{
        //     this.selectedTextArea = textarea;
        //     textarea.firstX = ev.clientX;
        //     textarea.firstY = ev.clientY;
        // })

        

        textarea.addEventListener('pointerdown', (ev)=>{
            this.selectedTextArea = textarea; // set selected textarea
            textarea.firstX = ev.clientX;  // first poiter touch
            textarea.firstY = ev.clientY;

            //defines the distance from the border of the textarea, in other words lower right corner for resizing operation
            let resizeMargin = 10;

           
            // we need to do a texarea resize manually for iOS
            if(app.isIOS){

                 this.changeTextAreaDims = ev => {
                    textarea.style.width = textarea.myWidth + ev.clientX - textarea.firstX + 'px'
                    textarea.style.height = textarea.myHeight + ev.clientY - textarea.firstY + 'px'
                    console.log(textarea.style.width)
                }

                this.setTextAreaDims = ev => {
                    textarea.myWidth = parseInt(textarea.style.width);
                    textarea.myHeight = parseInt(textarea.style.height);
                    console.log('pointer')
                }

                let textAreaRect = textarea.getBoundingClientRect();
                //resize if touch was in lower right corner with margin of resizeMargin
                if(ev.clientX + resizeMargin >= textAreaRect.x + textAreaRect.width && 
                    ev.clientY + resizeMargin >= textAreaRect.y + textAreaRect.height){  
                    textarea.addEventListener('pointermove', this.changeTextAreaDims)                    
                    textarea.addEventListener('pointerleave', this.setTextAreaDims)
                }

            }
            

            

            // textarea.addEventListener('pointerout', ev => {
            //     textarea.removeEventListener('pointermove', changeTextAreaDims)
            //     textarea.myWidth +=  ev.clientX - textarea.firstX;
            //     textarea.myHeight += ev.clientY - textarea.firstY;
            // })

            
        })

        textarea.addEventListener('focusout', () => {
            //this.selectedTextArea = null;
            textarea.removeEventListener('pointermove', this.changeTextAreaDims)
            textarea.removeEventListener('pointerleave',  this.setTextAreaDims)
        })
       

        // let hammer = new Hammer(textarea);
        // hammer.on("pan", (ev) => {
        //    console.log(ev)

        //    //figure out if panning is close to right or bottom edge
        //    // if()

        //    if(ev.isFirst){
                
        //    } else if(ev.isFinal){
        //         textarea.myWidth += ev.center.x - textarea.firstX;
        //         textarea.myHeight += ev.center.y - textarea.firstY; 
        //    } else {
        //         textarea.style.width = textarea.myWidth + ev.pointers[0].movementX + 'px' //ev.center.x - textarea.firstX + 'px';
        //         textarea.style.height = textarea.myHeight + ev.pointers[0].movementY + 'px' //ev.center.y - textarea.firstY + 'px';
        //    }
           
        // });
        
      //  initTextAreaAutoResize(textarea); // from tools.js
       
        this.canvasContainer.appendChild(textarea);
        return textarea;
    }
     
}

class enhancedImages{
    constructor(){
        this.images = [];
        this.enhancedImages = {};
    }

    enhancedImagesInit(){
        this.images = document.getElementsByClassName('enhanced_image');
        for(let image of this.images){
           this.initImage(image)
        }
    }

    initImage(image){
        let id = '';
        if (image.id) {
            id = image.id;
        } else {
            id = Math.random() * 1000000;
        }
        this.enhancedImages[id] = new enhancedImage(image, true);
        this.enhancedImages[id].setListeners();
    }

    addImage(image){
        this.images.push(image);
        this.initImage(image);
    }
}
