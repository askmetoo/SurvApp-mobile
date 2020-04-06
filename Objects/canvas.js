class Canvas{
    constructor(parentDom, callingObject){
        this.parentDom = parentDom;
        this.callingObject = callingObject;
        this.domClass = 'drawing_canvas';
        this.containerDom = null;
        this.dom = null;

        this.context = null;
        this.defaultLineWidth = 3;
        this.defaultColor = '#000000';

        this.drawingToolBar = null;

        this.width = 0;
        this.height = 0;

        this.activeTool = null;

        this.htmlHelper = new htmlHelper();

        this.undoBuffer = [];
        this.maxUndoSteps = 6;

        this.canvasObjects = [];

    }

    reDraw(){
        this.context.clearRect(0,0,this.width, this.height);
        for(let elem of this.canvasObjects){
            elem.draw();
        }
    }

    canvasObjectsHitTest(x,y){
        for(let elem of this.canvasObjects){
            if(elem.hitTest(x,y)){
                return elem;
            }
        }
        return null;
    }

    setListeners(){
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerdown', ev => {
            // let canvasRect = this.dom.getBoundingClientRect();
            // this.setContextData(this.defaultLineWidth, this.defaultColor);
            // this.moveTo(ev.clientX - canvasRect.x, ev.clientY - canvasRect.y);

            //this.imageData = this.context.getImageData(0,0,this.width, this.height)

            if(this.drawingToolBar.activeTool){
                this.drawingToolBar.activeTool.executePointerPressAction(ev)
        
                this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointermove', ev => {
                    ev.preventDefault();
                    // if(this.imageData){
                    //     this.context.clearRect(0,0,this.width,this.height)
                    //     this.context.putImageData(this.imageData,0,0);
                    //     this.context.stroke();
                    // } 

                    if(this.drawingToolBar.activeTool.constructor.name != ('Pencil')){
                        this.reDraw();
                    }
                    
                    this.drawingToolBar.activeTool.executePointerMoveAction(ev);

                    if(this.undoBuffer > this.maxUndoSteps){
                        this.undoBuffer.shift();
                    }
                    this.undoBuffer.push(this.imageData);
                })
            } else {
                this.startX = ev.clientX;
                this.startY = ev.clientY;

                this.hitObject = this.canvasObjectsHitTest(ev.clientX, ev.clientY);

                if(this.hitObject){
                    this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointermove', ev => {
                        ev.preventDefault();
                        let deltaX = ev.clientX - this.startX;
                        let deltaY = ev.clientY - this.startY;

                        this.hitObject.setPositionDelta(deltaX, deltaY)
                        this.reDraw()
                    })
                }
            }
            
    
        })

        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointercancel', ev => {
            console.log('pointer cancelled')
        })
        
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerup', ev =>{
            this.htmlHelper.removeDomListener(this.dom.uniqueID, 'pointermove');

            if(this.drawingToolBar.activeTool){
                let drawnObject = this.drawingToolBar.activeTool.executePointerEndAction(ev)
                drawnObject.setCanvas(this)
                this.canvasObjects.push(drawnObject);
            } else {
                if(this.hitObject){
                    this.hitObject.applyPositionDelta();
                    this.hitObject = null;
                }
            }            
        })
    }

    //canvas will be created in the container div, the container div will have a class of the cnvas + '_cntainer'
    render(){
        //createDom (tag, type, name, value, domClass, id, parent)
        this.containerDom = this.htmlHelper.createDom('div', this.parentDom,this.domClass + '_conatiner')
        this.dom = this.htmlHelper.createDom('canvas', this.containerDom);
        this.dom.style.touchAction="none"; // prevent default browser actions

        this.setContextData(this.defaultLineWidth, '#000000')
    }
    
    setPosition(x,y){
        this.dom.style.transform = `translate(${x}, ${y})`;
    }

    setDimensions(w,h){
        this.width = w;
        this.height = h;
        this.dom.setAttribute('width', this.width);
        this.dom.setAttribute('height', this.height);
    }

    setContextData(width, color){
        if(!this.context) this.context = this.dom.getContext('2d');

        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round'; 
        this.context.globalCompositeOperation =  'source-over'; 
    }

    moveTo(x,y){
        this.context.moveTo(x,y)
    }

    drawTo(x,y){
        this.context.lineTo(x,y);
        this.context.stroke();
    }

    addCanvasDrawingToolBar(tool){
        this.drawingToolBar = tool;
    }

    addObject(canvasObject){
        this.canvasObjects.push(canvasObject);
    }
}

class CanvasObject{
    constructor(type, startX, startY, endX, endY, data, color, thickness, canvas){
        this.type = type;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.data = data;

        this.deltaX = 0;
        this.deltaY = 0;

        this.color = color;
        this.thickness = thickness; 

        this.canvas = canvas;
    }

    draw(){
        let context = this.canvas.context;

        context.lineWidth = this.thickness;
        context.strokeStyle = this.color;
        context.lineJoin = 'round';
        context.lineCap = 'round'; 
        context.globalCompositeOperation =  'source-over'; 

        context.beginPath();
        switch (this.type){
            case 'free':
                context.moveTo(this.startX + this.deltaX, this.startY + this.deltaY);
                for(let elem of this.data){
                    context.lineTo(elem.x + this.deltaX, elem.y + this.deltaY);
                }
                break;
            case 'line':
                context.moveTo(this.startX + this.deltaX, this.startY + + this.deltaY);
                context.lineTo(this.endX + + this.deltaX, this.endY + + this.deltaY);
                break;
            case 'rect':
                context.rect(this.startX + this.deltaX, this.startY + this.deltaY, this.endX - this.startX, this.endY - this.startY);
                break;
            case 'circle':
                context.arc(this.startX, this.startY, this.data, 0, 2 * Math.PI);
                break;
        }
        //context.closePath();
        context.stroke();
    }

    applyPositionDelta(){
        switch(this.type){
            case 'free':
                this.startX += this.deltaX;
                this.startY += this.deltaY;

                for(let elem of this.data){
                    elem.x += this.deltaX;
                    elem.y += this.deltaY;
                }
                break;

            case 'line':
                this.startX += this.deltaX;
                this.startY += this.deltaY;
                this.endX += this.deltaX;
                this.endY += this.deltaY;
                break;
            
            case 'rect':
                this.startX += this.deltaX;
                this.startY += this.deltaY;
                this.endX += this.deltaX;
                this.endY += this.deltaY;
        }

        this.deltaX = 0;
        this.deltaY = 0;
    }

    setEndCoords(x,y){
        this.endX = x;
        this.endY = y;
    }

    setData(data){
        this.data = data;
    }

    setColor(color){
        this.color = color;
    }

    setThickness(thickness){
        this.thickness = thickness;
    }

    setCanvas(canvas){
        this.canvas = canvas;
    }

    calculateDistance(point, figure, figureType){
        let dist = -1;
        switch (figureType){
            case 'point':
                dist = Math.sqrt( Math.pow(figure.x - point.x, 2) + Math.pow(figure.y - point.y,2));
                break;
            case 'line':
                let lineStartX = figure[0].x;
                let lineStartY = figure[0].y;
                let lineEndX = figure[1].x;
                let lineEndY = figure[1].y;
                dist = Math.abs(((lineEndY - lineStartY)*point.x) - (lineEndX - lineStartX)*point.y + (lineEndX * lineStartY) - (lineEndY * lineStartX));
                dist = dist / Math.sqrt(Math.pow(lineEndY-lineStartY,2) + Math.pow(lineEndX - lineStartX,2));
                return dist;
                break;         
        }
        
        return dist;
    }

    hitTest(x,y){
        let maxDistance = this.thickness + 4;
        let point = {x:x, y:y};
        var figure = [];
        var dist = 1000;
        switch(this.type){
            case 'free':
                for(let elem of this.data){                   
                    figure = {x:elem.x+this.deltaX, y:elem.y + this.deltaY};
                    dist = this.calculateDistance(point, figure, 'point');
                    if(dist <= maxDistance && dist > 0){
                        return true;
                        break;
                    }
                }
                break;
            case 'line':
                figure = [];
                figure.push({x:this.startX + this.deltaX, y:this.startY +this.deltaY});
                figure.push({x:this.endX + this.deltaX, y:this.endY +this.deltaY});
                dist = this.calculateDistance(point, figure, 'line');
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }
                break;
            case 'rect':
                figure = [];

                //top side test
                figure.push({x:this.startX + this.deltaX, y:this.startY +this.deltaY});
                figure.push({x:this.endX + this.deltaX, y:this.startY +this.deltaY});
                dist = this.calculateDistance(point, figure, 'line');

                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                //bottom side test
                let rectHeight = Math.abs(this.endY - this.startY);
                dist = rectHeight - dist
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                //left side test
                figure = [];
                figure.push({x:this.startX + this.deltaX, y:this.startY +this.deltaY});
                figure.push({x:this.startX + this.deltaX, y:this.endY +this.deltaY});
                dist = this.calculateDistance(point, figure, 'line');
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                //right side test
                let rectWidth = Math.abs(this.endX - this.startX);
                dist = rectWidth - dist;
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                break;
            case 'circle':
                
                break;
        }

        return false;
    }

    setPositionDelta(x,y){
        this.deltaX = x;
        this.deltaY = y;
    }
}

class CanvasToolBar{
    constructor(canvas){
        this.parentCanvas = canvas;
        this.domClass = 'drawing_canvas';
        this.domContainer = null;
        this.dom = null;
        this.tools = {};
        this.activeTool = null;
        this.htmlHelper = new htmlHelper();

    }

    render(){
        this.domContainer = this.htmlHelper.createDom('div', this.parentCanvas.containerDom, 'canvas_tool_bar_container')
        this.dom = this.htmlHelper.createDom('ul', this.domContainer, 'canvas_tool_bar')
    }

    setPosition(x,y){
        this.dom.style.transform = `translate(${x}, ${y})`;
    }

    setListeners(){
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerdown', ev => {
            //this.parentToolBar.deactivateActiveTool();
            
            if(ev.target == this.dom){
                this.deactivateActiveTool();
            }

        });
    }

    addTool(name, tool){
        this.tools[name] = tool;
    }

    addStandardCanvasTools(){
        let pencil = new Pencil(this, 'materialize__mode_edit', this.parentCanvas.context);
        pencil.render();
        pencil.setListeners()
        let eraser = new Eraser(this, 'materialize__adb', this.parentCanvas.context);
        eraser.render();
        eraser.setListeners();

        let shape = new Shape(this, 'Images/ToolbarIcons/drawing-line.svg', this.parentCanvas.context);
        shape.render();
        shape.setListeners();
        shape.renderSubmenu();

        let line = new Line(shape, 'Images/ToolbarIcons/drawing-line.svg', this.parentCanvas.context);        
        line.render();
        line.setListeners();
        shape.addChoice(line);

        let rect = new Rectangle(shape, 'materialize__check_box_outline_blank', this.parentCanvas.context);        
        rect.render();
        rect.setListeners();
        shape.addChoice(rect);

        let circle = new Circle(shape, 'materialize__panorama_fish_eye', this.parentCanvas.context);        
        circle.render();
        circle.setListeners();
        shape.addChoice(circle);

    }

    setActiveTool(tool){
        this.activeTool = tool;
    }

    deactivateActiveTool(){
        if(this.activeTool){
            this.activeTool.deactivateTool();
            this.activeTool = null;
        }
    }


}

class canvasTool{
    constructor(parentToolBar, htmlElement, htmlClass, icon, context){
        this.parentToolBar = parentToolBar;
        this.htmlElement = htmlElement;
        this.htmlClass = htmlClass;
        this.icon = icon;
        this.context = context;
        this.containerDom = null;
        this.dom = null;

        this.executeToolIconPress = null;
        this.executePointerPressAction = null;
        this.executePointerMoveAction = null;
        this.executePointerEndAction = null;

        this.htmlHelper = new htmlHelper();
    }

    setToolIconPress(action){
        this.executeToolIconPress = () => {
            this.parentToolBar.deactivateActiveTool();
            this.parentToolBar.setActiveTool(this);
            action();
            this.activateTool();
        }
    }

    setPointerPressAction(action){
        this.executePointerPressAction = action;
    }

    setPointerMoveAction(action){
        this.executePointerMoveAction = action;
    }

    setPointerEndAction(action){
        this.executePointerEndAction = action;
    }

    render(){
        this.containerDom = this.htmlHelper.createDom('li', this.parentToolBar.dom, this.htmlClass + ',canvas_tool','','','','','');
    
        if(this.htmlElement){
            this.dom = this.htmlHelper.createDom(this.htmlElement, this.containerDom,'','','','','','');
        } else {
            this.dom = this.containerDom;
            this.containerDom = null;
        }
        let icon = this.icon.split('__');
        if(icon[0] == 'materialize'){
            this.iconDom = this.htmlHelper.createDom('i', this.dom, 'material-icons','','','','',icon[1]);
        } else {
            this.iconDom = this.htmlHelper.createDom('img', this.dom, 'tool_icon','','','','','',this.icon);
        } 
    }

    activateTool(){
        this.dom.classList.add('canvas_tool_selected')
    }

    deactivateTool(){
        this.dom.classList.remove('canvas_tool_selected')
    }

    setListeners(){
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerdown', ev => {
            //this.parentToolBar.deactivateActiveTool();
            this.executeToolIconPress(ev);

        });
    }
}

class Pencil extends canvasTool{
    constructor(container, icon, context){
    
        super(container,'', 'canvas_pencil', icon, context);
        this.size = 3;
        this.color = '#000000';
        this.icon = icon;

        this.canvasObject = null;
        this.data = [];

        this.executeToolIconPress = () => {
            this.activatePencil();   
        }
        super.setToolIconPress(this.executeToolIconPress);

        this.actionPointerDown = (ev) => {
            this.actionStartDrawing(ev);
        }
        super.setPointerPressAction(this.actionPointerDown);
        
        this.actionPointerMove = (ev) => {
            this.actionDraw(ev);
        }
        super.setPointerMoveAction(this.actionPointerMove);

        this.actionPointerEnd = (ev) => {
            return this.actionDrawEnd(ev);
        }
        super.setPointerEndAction(this.actionPointerEnd);
    }

    activatePencil(){
        this.activateTool();
        this.context.lineWidth = this.size;
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.strokeStyle = this.color;
        this.context.globalCompositeOperation="source-over";
        this.context.scale(1,1);
    }

    deactivateTool(){
        super.deactivateTool();
    }
  
    actionStartDrawing(ev){
        this.data = [];
        this.canvasObject = new CanvasObject('free', ev.clientX, ev.clientY,0,0,this.data,this.color,this.size);
        this.context.moveTo(ev.clientX, ev.clientY);
    }

    actionDraw(ev){
        this.data.push({x:ev.clientX, y:ev.clientY})
        this.canvasObject.setData(this.data);
        //this.context.moveTo(this.data[this.data.length-1].x, this.data[this.data.length-1].y); // because the canvas is redrawn every move of the mouse we need to also moveTo every time
        this.context.lineTo(ev.clientX, ev.clientY);
        this.context.stroke();
    }

    actionDrawEnd(ev){
        return this.canvasObject;
    }
}

class Eraser extends canvasTool{
    constructor(container, icon, context){
        super(container,'', 'canvas_eraser', icon, context);
        this.size = 6;
        //this.color = '#000000';
        this.icon = icon;

        this.executeToolIconPress = () => {
            this.activateEraser();   
        }
        super.setToolIconPress(this.executeToolIconPress);

        this.actionPointerDown = (ev) => {
            this.actionStartDrawing(ev);
        }
        super.setPointerPressAction(this.actionPointerDown);
        
        this.actionPointerMove = (ev) => {
            this.actionDraw(ev);
        }
        super.setPointerMoveAction(this.actionPointerMove);
    }

    activateEraser(){
        this.activateTool();
        // this.context.lineWidth = this.size;
        // this.context.lineJoin = 'round';
        // this.context.lineCap = 'round';
        // // this.context.strokeStyle = this.color;
        // this.context.globalCompositeOperation = 'destination-out';
        // this.context.scale(1,1);
    }

    deactivateTool(){
        super.deactivateTool();
    }
  
    actionStartDrawing(ev){
        this.context.moveTo(ev.clientX, ev.clientY);
        // this.context.arc(ev.clientX,ev.clientY,5,0,Math.PI*2,false);
        // this.context.fill();
    }

    actionDraw(ev){
        this.context.clearRect(ev.clientX, ev.clientY, this.size, this.size);
        //this.context.stroke();
        // this.context.arc(ev.clientX,ev.clientY,5,0,Math.PI*2,false);
        // this.context.fill();
    }
}

class Shape extends canvasTool{
    constructor(container, icon, context){
        super(container,'', 'canvas_shape', icon, context);
        this.size = 3;
        this.color = '#000000';
        this.icon = icon;

        this.subMenuTools = {};
        this.activeSubmenuTool = null;

        this.subMenuDomContainer = null;
        this.subMenuDom = null;

        this.executeToolIconPress = () => {
            this.activateShape();   
        }
        super.setToolIconPress(this.executeToolIconPress);

        this.actionPointerDown = (ev) => {
            this.actionStartDrawing(ev);
        }
        super.setPointerPressAction(this.actionPointerDown);
        
        this.actionPointerMove = (ev) => {
            this.actionDraw(ev);
        }
        super.setPointerMoveAction(this.actionPointerMove);

        this.actionPointerEnd = (ev) => {
            return this.actionDrawEnd(ev);
        }
        super.setPointerEndAction(this.actionPointerEnd);
    }

    renderSubmenu(){
        //this.subMenuContainerDom = this.htmlHelper.createDom('div', this.parentToolBar.domContainer, 'canvas_tool_submenu_bar_container')
        this.subMenuDom = this.htmlHelper.createDom('ul', this.parentToolBar.domContainer, 'canvas_tool_submenu_bar')
    }

    setListeners(){
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerdown', ev => {
            //this.parentToolBar.deactivateActiveTool();
            this.executeToolIconPress(ev);

        });
    }

    addChoice(toolChoice){
        this.subMenuTools[toolChoice.name] = toolChoice;
    }

    setShapeIcon(icon){
        let newIcon = icon.split('__');
        this.iconDom.parentNode.removeChild(this.iconDom);
        if(newIcon[0] == 'materialize'){
            this.iconDom = this.htmlHelper.createDom('i', this.dom, 'material-icons','','','','',newIcon[1]);
        } else {
            this.iconDom = this.htmlHelper.createDom('img', this.dom, 'tool_icon','','','','','',icon);
        } 
    }

    setActiveSubmenuTool(tool){
        if(this.activeSubmenuTool){
            this.activeSubmenuTool.deactivateTool();
        }
        
        this.activeSubmenuTool = tool;
    }

    activateShape(){
        this.activateTool(); 
        this.showSubmenu();       
    }

    showSubmenu(){
        this.subMenuDom.classList.add('tool_submenu_visible');
    }

    deactivateTool(){
        super.deactivateTool();
        this.hideSubmenu();
    }

    hideSubmenu(){
        this.subMenuDom.classList.remove('tool_submenu_visible');
    }
  
    actionStartDrawing(ev){
        this.context.lineWidth = this.size;
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.strokeStyle = this.color;
        this.context.globalCompositeOperation="source-over";
        this.context.scale(1,1);

        this.activeSubmenuTool.actionStartDrawing(ev);
    }

    actionDraw(ev){
        this.activeSubmenuTool.actionDraw(ev);
    }

    actionDrawEnd(ev){
        return this.activeSubmenuTool.actionDrawEnd(ev);
    }
}

class Line {
    constructor(parentTool, icon, context){
        this.parentTool = parentTool;
        this.parentDom = parentTool.subMenuDom;
        this.dom = null;
        this.icon = icon; 
        this.context = context;
        this.htmlHelper = new htmlHelper();

        this.startXY = {};

        this.canvasObject = null;
    }

    render(){
        this.dom = this.htmlHelper.createDom('li',this.parentDom,'canvas_tool_line, canvas_submenu_tool');
        let icon = this.icon.split('__');
        if(icon[0] == 'materialize'){            
            this.iconDom = this.htmlHelper.createDom('i', this.dom, 'material-icons','','','','',icon[1]);
        } else {
            this.iconDom = this.htmlHelper.createDom('img', this.dom, 'tool_icon','','','','','',this.icon);
        } 
    }

    setListeners(){
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerdown', ev => {
            this.parentTool.setShapeIcon(this.icon);

            this.parentTool.setActiveSubmenuTool(this)
            this.activateShape();
        });
    
    }

    activateShape(){
        this.dom.classList.add('canvas_tool_selected')
    }

    deactivateTool(){
        this.dom.classList.remove('canvas_tool_selected')
    }
  
    actionStartDrawing(ev){
        this.startXY.x = ev.clientX;
        this.startXY.y = ev.clientY;

        this.canvasObject = new CanvasObject('line', ev.clientX, ev.clientY,0,0,null,this.parentTool.color, this.parentTool.size)
    }

    actionDraw(ev){
        this.context.beginPath();
        this.context.moveTo(this.startXY.x, this.startXY.y)
        this.context.lineTo(ev.clientX, ev.clientY);
        this.context.stroke();

        this.canvasObject.setEndCoords(ev.clientX, ev.clientY)
    }

    actionDrawEnd(ev){
        return this.canvasObject;
    }
}

class Rectangle {
    constructor(parentTool, icon, context){
        this.parentTool = parentTool;
        this.parentDom = parentTool.subMenuDom;
        this.dom = null;
        this.icon = icon; 
        this.context = context;
        this.htmlHelper = new htmlHelper();

        this.startXY = {};
        this.canvasObject = null;
    }

    render(){
        this.dom = this.htmlHelper.createDom('li',this.parentDom,'canvas_tool_rect, canvas_submenu_tool');
        let icon = this.icon.split('__');
        if(icon[0] == 'materialize'){            
            this.iconDom = this.htmlHelper.createDom('i', this.dom, 'material-icons','','','','',icon[1]);
        } else {
            this.iconDom = this.htmlHelper.createDom('img', this.dom, 'tool_icon','','','','','',this.icon);
        } 
    }

    setListeners(){
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerdown', ev => {
            this.parentTool.setShapeIcon(this.icon);
            this.parentTool.setActiveSubmenuTool(this)
            this.activateShape();
        });
    
    }

    activateShape(){
        this.dom.classList.add('canvas_tool_selected')
    }

    deactivateTool(){
        this.dom.classList.remove('canvas_tool_selected')
    }
  
    actionStartDrawing(ev){
        this.startXY.x = ev.clientX;
        this.startXY.y = ev.clientY;
        this.canvasObject = new CanvasObject('rect', ev.clientX, ev.clientY,0,0,null,this.parentTool.color, this.parentTool.size)
    }

    actionDraw(ev){
        this.context.beginPath();
        this.context.rect(this.startXY.x, this.startXY.y, ev.clientX - this.startXY.x, ev.clientY - this.startXY.y);
        this.context.stroke();

        this.canvasObject.setEndCoords(ev.clientX, ev.clientY)
    }

    actionDrawEnd(ev){
        return this.canvasObject;
    }
}

class Circle {
    constructor(parentTool, icon, context){
        this.parentTool = parentTool;
        this.parentDom = parentTool.subMenuDom;
        this.dom = null;
        this.icon = icon; 
        this.context = context;
        this.htmlHelper = new htmlHelper();

        this.startXY = {};
        this.canvasObject = null;
    }

    render(){
        this.dom = this.htmlHelper.createDom('li',this.parentDom,'canvas_tool_circle, canvas_submenu_tool');
        let icon = this.icon.split('__');
        if(icon[0] == 'materialize'){            
            this.iconDom = this.htmlHelper.createDom('i', this.dom, 'material-icons','','','','',icon[1]);
        } else {
            this.iconDom = this.htmlHelper.createDom('img', this.dom, 'tool_icon','','','','','',this.icon);
        } 
    }

    setListeners(){
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerdown', ev => {
            this.parentTool.setShapeIcon(this.icon);
            this.parentTool.setActiveSubmenuTool(this)
            this.activateShape();
        });
    
    }

    activateShape(){
        this.dom.classList.add('canvas_tool_selected')
    }

    deactivateTool(){
        this.dom.classList.remove('canvas_tool_selected')
    }
  
    actionStartDrawing(ev){
        this.startXY.x = ev.clientX;
        this.startXY.y = ev.clientY;

        this.canvasObject = new CanvasObject('circle', ev.clientX, ev.clientY,0,0,0,this.parentTool.color, this.parentTool.size)
    }

    actionDraw(ev){
        this.context.beginPath();
        let radius = Math.sqrt(Math.pow(ev.clientX - this.startXY.x,2) + Math.pow(ev.clientY - this.startXY.y,2)); 
        this.context.arc(this.startXY.x, this.startXY.y, radius, 0, 2 * Math.PI);
        this.context.stroke();

        this.canvasObject.setData(radius)
    }

    actionDrawEnd(ev){
        return this.canvasObject;
    }
}

class Text {
    constructor(){
        
    }
}


