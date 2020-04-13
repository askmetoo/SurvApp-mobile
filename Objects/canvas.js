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
        this.selectedCanvasObject = null;
        this.selectedObjectColor = '#797921'; // golden

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
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'press', ev => {
            if(this.drawingToolBar.activeTool){
                this.drawingToolBar.activeTool.executePointerPressAction(ev.center.x, ev.center.y)
        
                this.htmlHelper.addDomListener(this.dom.uniqueID, 'pan', ev => {
                    ev.preventDefault();
                    
                    if(this.drawingToolBar.activeTool.constructor.name != ('Pencil')){
                        this.reDraw();
                    }
                    
                    this.drawingToolBar.activeTool.executePointerMoveAction(ev.center.x, ev.center.y);

                    if(this.undoBuffer > this.maxUndoSteps){
                        this.undoBuffer.shift();
                    }
                    this.undoBuffer.push(this.imageData);
                }, 'hammer')
            } else { // execute hit tests, object selection, object moving
                this.startX = ev.center.x;
                this.startY = ev.center.y;

                this.hitObject = this.canvasObjectsHitTest(ev.center.x, ev.center.y);

                
                if (!this.hitObject){ // no new hit object
                    this.unselectObject(); // unselect the current one if there is one
                    this.reDraw() // redraw
                } else if (this.hitObject != this.selectedCanvasObject){ //there is a new hit object and it is differen from currently selected
                    console.log('hit object: ' + this.hitObject.number)
                    this.unselectObject(); // unselect the current one if there is one
                    this.select(this.hitObject);
                    this.reDraw() // redraw
                }
            
                
                // if(this.hitObject){  
                //     //console.log('hit object: ' + this.hitObject)
                //     this.select(hitObject);
                //     this.reDraw()
                // }
                

                if(this.selectedCanvasObject){ // if after previous logic there is a selected object
                    this.htmlHelper.addDomListener(this.dom.uniqueID, 'pan', (ev) => {  // add a pan listener 
                        ev.preventDefault();
                        let deltaX = ev.center.x - this.startX;
                        let deltaY = ev.center.y - this.startY;

                        this.selectedCanvasObject.setPositionDelta(deltaX, deltaY)
                        this.reDraw()
                    }, 'hammer')
                }

                
            }
            
    
        }, 'hammer')

        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointercancel', ev => {
            console.log('pointer cancelled')
        })
        
        this.htmlHelper.addDomListener(this.dom.uniqueID, 'pointerup', ev =>{
            this.htmlHelper.removeDomListener(this.dom.uniqueID, 'pan', 'hammer');

            if(this.drawingToolBar.activeTool){
                let drawnObject = this.drawingToolBar.activeTool.executePointerEndAction(ev.clientX, ev.clientY)
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

    select(object){
        this.selectedCanvasObject = object;
        object.select();
    }

    unselectObject(){
        if(this.selectedCanvasObject){
            this.selectedCanvasObject.unSelect();
            this.selectedCanvasObject = null;
        }
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

let objectNumber = 0;
class CanvasObject{
    constructor(type, startX, startY, endX, endY, data, color, thickness, canvas){
        this.number = objectNumber++;
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
        this.selected = false;
    }

    select(){
        this.canvas.selectedCanvasObject = this;
        this.selected = true;
    }

    unSelect(){
        this.selected = false;
    }

    draw(){
        let context = this.canvas.context;

        context.lineWidth = this.thickness;
        if(this.selected){
            context.strokeStyle = this.canvas.selectedObjectColor;
        } else {
            context.strokeStyle = this.color;
        }
        
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
            case 'lineSegment':
                context.moveTo(this.startX + this.deltaX, this.startY + this.deltaY);
                context.lineTo(this.endX + this.deltaX, this.endY + this.deltaY);
                break;
            case 'zigzag':
                
                for(let lineSegment of this.data){
                    //context.moveTo(this.startX + this.deltaX, this.startY + + this.deltaY);
                    context.moveTo(lineSegment.startX + this.deltaX, lineSegment.startY + this.deltaX)
                    context.lineTo(lineSegment.endX + this.deltaX, lineSegment.endY + this.deltaY);
                }
                
                break;
            case 'rect':
                context.rect(this.startX + this.deltaX, this.startY + this.deltaY, this.endX - this.startX, this.endY - this.startY);
                break;
            case 'circle':
                context.arc(this.startX + this.deltaX, this.startY + this.deltaY, this.data, 0, 2 * Math.PI);
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
                
            case 'lineSegment':
            case 'zigzag':
            case 'rect':
                this.startX += this.deltaX;
                this.startY += this.deltaY;
                this.endX += this.deltaX;
                this.endY += this.deltaY;
                break;
                
            case 'circle':
                this.startX += this.deltaX;
                this.startY += this.deltaY;
                break;
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

    calculateDistance(point, figurePoints, figureType){
        let dist = -1;
        switch (figureType){
            case 'point':
                dist = Math.sqrt( Math.pow(figurePoints.x - point.x, 2) + Math.pow(figurePoints.y - point.y,2));
                break;
            case 'lineSegment':

                var A = point.x - figurePoints[0].x;
                var B = point.y - figurePoints[0].y;
                var C = figurePoints[1].x - figurePoints[0].x;
                var D = figurePoints[1].y - figurePoints[0].y;
                
                var dot = A * C + B * D;
                var len_sq = C * C + D * D;
                var param = -1;
                if (len_sq != 0) //in case of 0 length line
                    param = dot / len_sq;
                
                var xx, yy;
                
                if (param < 0) {
                    xx = figurePoints[0].x;
                    yy = figurePoints[0].y;
                }
                else if (param > 1) {
                    xx = figurePoints[1].x;
                    yy = figurePoints[1].y;
                }
                else {
                    xx = figurePoints[0].x + param * C;
                    yy = figurePoints[0].y + param * D;
                }
                
                var dx = point.x - xx;
                var dy = point.y - yy;
                dist = Math.sqrt(dx * dx + dy * dy);
                break;  
            case 'circle':
                let centerX = figurePoints[0].x; 
                let centerY = figurePoints[0].y;
                let radius = figurePoints[0].radius;

                dist = Math.abs(Math.sqrt(Math.pow(centerX - point.x, 2) + Math.pow(centerY - point.y, 2)) - radius);
                break;       
        }
        
        return dist;
    }

    hitTest(x,y){
        let maxDistance = this.thickness + 4;
        let point = {x:x, y:y};
        var figurePoints = [];
        var dist = 1000;
        switch(this.type){
            case 'free':
                for(let elem of this.data){                   
                    figurePoints = {x:elem.x+this.deltaX, y:elem.y + this.deltaY};
                    dist = this.calculateDistance(point, figurePoints, 'point');
                    if(dist <= maxDistance && dist > 0){
                        return true;
                        break;
                    }
                }
                break;
            case 'lineSegment':
                figurePoints = [];
                figurePoints.push({x:this.startX + this.deltaX, y:this.startY +this.deltaY});
                figurePoints.push({x:this.endX + this.deltaX, y:this.endY +this.deltaY});
                dist = this.calculateDistance(point, figurePoints, 'lineSegment');
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }
                break;
            case 'zigzag':
                    figurePoints = [];
                    for(let lineSegment of this.data){
                        figurePoints.push({x:lineSegment.startX + this.deltaX, y:lineSegment.startY +this.deltaY});
                        figurePoints.push({x:lineSegment.endX + this.deltaX, y:lineSegment.endY +this.deltaY});
                        dist = this.calculateDistance(point, figurePoints, 'lineSegment');
                        if(dist <= maxDistance  && dist > 0){
                        return true;
                        }
                    }
                    
                    break;
            case 'rect':
                figurePoints = [];

                //top side test
                figurePoints.push({x:this.startX + this.deltaX, y:this.startY +this.deltaY});
                figurePoints.push({x:this.endX + this.deltaX, y:this.startY +this.deltaY});
                dist = this.calculateDistance(point, figurePoints, 'lineSegment');

                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                //bottom side test
                // let rectHeight = Math.abs(this.endY - this.startY);
                // dist = rectHeight - dist
                // if(dist <= maxDistance  && dist > 0){
                //     return true;
                // }
                figurePoints = [];
                figurePoints.push({x:this.startX + this.deltaX, y:this.endY +this.deltaY});
                figurePoints.push({x:this.endX + this.deltaX, y:this.endY +this.deltaY});
                dist = this.calculateDistance(point, figurePoints, 'lineSegment');

                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                //left side test
                figurePoints = [];
                figurePoints.push({x:this.startX + this.deltaX, y:this.startY +this.deltaY});
                figurePoints.push({x:this.startX + this.deltaX, y:this.endY +this.deltaY});
                dist = this.calculateDistance(point, figurePoints, 'lineSegment');
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                //right side test
                // let rectWidth = Math.abs(this.endX - this.startX);
                // dist = rectWidth - dist;
                // if(dist <= maxDistance  && dist > 0){
                //     return true;
                // }

                figurePoints = [];
                figurePoints.push({x:this.endX + this.deltaX, y:this.startY +this.deltaY});
                figurePoints.push({x:this.endX + this.deltaX, y:this.endY +this.deltaY});
                dist = this.calculateDistance(point, figurePoints, 'lineSegment');
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }

                break;
            case 'circle':
                figurePoints = [];
                figurePoints.push({x:this.startX + this.deltaX, y:this.startY +this.deltaY, radius: this.data});
                dist = this.calculateDistance(point, figurePoints, 'circle');
                if(dist <= maxDistance  && dist > 0){
                    return true;
                }
                break;
        }

        return false;
    }

    setPositionDelta(x,y){
        this.deltaX = x;
        this.deltaY = y;
    }
}

class contextMenu{
    constructor(canvasObject){
        this.canvasObject = canvasObject;
        this.location = {x:0, y:0};
        this.dom = null;
        this.menuContent = {
            straight: false,
            snapTo:{
                point: false,
                line: false
            },
            angle: false,
            doubleLine: false,
            copy: true,
            paste: false
        }

        this.htmlHelper = new htmlHelper();
    }

    setAllMenuContent(straight, snapToPoint, snapToLine, angle, doubleLine){// booleans
        this.menuContent.staright = straight;
        this.menuContent.menuContent = snapToPoint;
        this.menuContent.snapToLine = snapToLine;
        this.menuContent.angle = angle;
        this.menuContent.doubleLine = doubleLine;
        this.menuContent.copy = true;
        // no paste option because it needs to be set implicitly when content is copied and if canvasObject can receive paste
    }

    setSingleMenuContent(option, value){
        this.menuContent[option] = value;
    }

    showContextMenu(x,y){
        this.dom.classList.add('context_menu_visible');
    }

    hideContextMenu(){
        this.dom.classList.remove('context_menu_visible');
    }

    setMenuContentVisibilty(option, visible){ // let's hide menu option if it is irrelevant during actual context
        if(visible){
            this.menuContent[option].dom.classList.add('visible'); // in css display:inline-block;
            this.menuContent[option].dom.classList.remove('hidden');// in css display: none;
        } else {
            this.menuContent[option].dom.classList.add('hidden');
            this.menuContent[option].dom.classList.remove('visible');
        }
    }

    render(){
        let dom = this.htmlHelper.createDom('div', this.canvasObject.canvas, 'canvas_context_menu')
        let ul = this.htmlHelper.createDom('ul', this.dom)

        // render all options hidden
        if(this.menuContent.straight){
            let liStraight = this.htmlHelper.createDom('li', ul, 'canvas_context_menu_checkbox, hidden')
            let liStraightCheckbox = this.htmlHelper.createDom('input', liStraight, '','straight','checkbox','straight')
            let liStraightLabel = this.htmlHelper.createDom('label', liStraight, '','','','straight') // in case of labels name param is used in 'for' attribute
        }

        if(this.menuContent.snapToPoint){
            let liSnapToPoint = this.htmlHelper.createDom('li', ul, 'canvas_context_menu_checkbox, hidden')
            let liSnapToPointCheckbox = this.htmlHelper.createDom('input', liSnapToPoint, '','snapToPoint','checkbox','snapToPoint')
            let liSnapToPointLabel = this.htmlHelper.createDom('label', liSnapToPoint, '','','','snapToPoint') // in case of labels name param is used in 'for' attribute
        }

        if(this.menuContent.snapToLine){
            let liSnapToLine = this.htmlHelper.createDom('li', ul, 'canvas_context_menu_checkbox, hidden')
            let liSnapToLineCheckbox = this.htmlHelper.createDom('input', liSnapToLine, '','snapToLine','checkbox','snapToLine')
            let liSnapToLineLabel = this.htmlHelper.createDom('label', liSnapToLine, '','','','snapToLine') // in case of labels name param is used in 'for' attribute
        }

        if(this.menuContent.angle){
            let liAngle = this.htmlHelper.createDom('li', ul, 'canvas_context_menu_select, hidden')
            let options = arrayRange(0,355,5);
            let liAngleSelect = this.htmlHelper.createDom('select', liAngle, '','angle','','angle',options)
            let liAngleLabel = this.htmlHelper.createDom('label', liAngle, '','','','angle') // in case of labels name param is used in 'for' attribute
        }

        if(this.menuContent.doubleLine){
            let liDoubleLine = this.htmlHelper.createDom('li', ul, 'canvas_context_menu_checkbox, hidden')
            let liDoubleLineCheckbox = this.htmlHelper.createDom('input', liDoubleLine, '','doubleLine','checkbox','doubleLine')
            let liDoubleLineLabel = this.htmlHelper.createDom('label', liDoubleLine, '','','','doubleLine') // in case of labels name param is used in 'for' attribute
        }

        if(this.menuContent.copy){
            let liCopy = this.htmlHelper.createDom('li', ul, 'canvas_context_menu_checkbox, hidden')
            let liCopyDiv = this.htmlHelper.createDom('div', liCopy, '','copy','','copy')
            let icon = this.htmlHelper.createDom('i', liCopyDiv, 'material-icons','','','','','content_copy');
        }
    }

    detectNeighbor(){

    }

    highlightSnapTarget(){

    }

    snapToNeighboringPoint(canvasObjectPoint){

    }

    snapToNeighboringLine(canvasObject){

    }

    setAngle(angle){

    }

    changeToWall(){

    }

    setStraight(){

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

        let zigzag = new ZigZag(shape, 'materialize__show_chart', this.parentCanvas.context);        
        zigzag.render();
        zigzag.setListeners();
        shape.addChoice(zigzag);

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

        this.actionPointerDown = (x,y) => {
            this.actionStartDrawing(x,y);
        }
        super.setPointerPressAction(this.actionPointerDown);
        
        this.actionPointerMove = (x,y) => {
            this.actionDraw(x,y);
        }
        super.setPointerMoveAction(this.actionPointerMove);

        this.actionPointerEnd = (x,y) => {
            return this.actionDrawEnd(x,y);
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
  
    actionStartDrawing(x,y){
        this.data = [];
        this.canvasObject = new CanvasObject('free', x, y,0,0,this.data,this.color,this.size, this.parentToolBar.parentCanvas);
        this.context.moveTo(x, y);
    }

    actionDraw(x,y){
        this.data.push({x:x, y:y})
        this.canvasObject.setData(this.data);
        //this.context.moveTo(this.data[this.data.length-1].x, this.data[this.data.length-1].y); // because the canvas is redrawn every move of the mouse we need to also moveTo every time
        this.context.lineTo(x, y);
        this.context.stroke();
    }

    actionDrawEnd(x,y){
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

        this.actionPointerDown = (x,y) => {
            this.actionStartDrawing(x,y);
        }
        super.setPointerPressAction(this.actionPointerDown);
        
        this.actionPointerMove = (x,y) => {
            this.actionDraw(x,y);
        }
        super.setPointerMoveAction(this.actionPointerMove);

        this.actionPointerEnd = (x,y) => {
            return this.actionDrawEnd(x,y);
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
  
    actionStartDrawing(x,y){
        this.context.lineWidth = this.size;
        this.context.lineJoin = 'round';
        this.context.lineCap = 'round';
        this.context.strokeStyle = this.color;
        this.context.globalCompositeOperation="source-over";
        this.context.scale(1,1);

        this.activeSubmenuTool.actionStartDrawing(x,y);
    }

    actionDraw(x,y){
        this.activeSubmenuTool.actionDraw(x,y);
    }

    actionDrawEnd(x,y){
        return this.activeSubmenuTool.actionDrawEnd(x,y);
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
  
    actionStartDrawing(x,y){
        this.startXY.x = x;
        this.startXY.y = y;

        this.canvasObject = new CanvasObject('lineSegment', x, y,0,0,null,this.parentTool.color, this.parentTool.size, this.parentTool.parentToolBar.parentCanvas)
    }

    actionDraw(x,y){
        this.context.beginPath();
        this.context.moveTo(this.startXY.x, this.startXY.y)
        this.context.lineTo(x, y);
        this.context.stroke();

        this.canvasObject.setEndCoords(x, y)
    }

    actionDrawEnd(x,y){
        return this.canvasObject;
    }
}

class ZigZag {
    constructor(parentTool, icon, context){
        this.parentTool = parentTool;
        this.parentDom = parentTool.subMenuDom;
        this.dom = null;
        this.icon = icon; 
        this.context = context;
        this.htmlHelper = new htmlHelper();

        this.startXY = {}
        this.data = [];
        this.previousNode = {x:-1, y: -1};
        this.lineSegment = null;

        this.canvasObject = null;
    }

    render(){
        this.dom = this.htmlHelper.createDom('li',this.parentDom,'canvas_tool_zigzag, canvas_submenu_tool');
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
        this.canvasObject = new CanvasObject('zigzag', 0,0,0,0,null,this.parentTool.color, this.parentTool.size, this.parentTool.parentToolBar.parentCanvas)
        this.previousNode.x = -1;
        this.previousNode.y = -1;
    }

    deactivateTool(){
        this.dom.classList.remove('canvas_tool_selected')
        
    }
  
    actionStartDrawing(x,y){
    
        //let lineSegment = null;
        if(this.previousNode.x == -1){
            this.lineSegment = new CanvasObject('lineSegment',x, y, 0,0,null,this.parentTool.color, this.parentTool.size, this.parentTool.parentToolBar.parentCanvas)
            this.startXY.x = x;
            this.startXY.y = y;
        } else {
            this.lineSegment = new CanvasObject('lineSegment',this.previousNode.x, this.previousNode.y, 0,0,null,this.parentTool.color, this.parentTool.size, this.parentTool.parentToolBar.parentCanvas)
        }

    }

    actionDraw(x,y){
                
        this.context.beginPath();
        if(this.previousNode.x == -1){
            this.context.moveTo(this.startXY.x, this.startXY.y)      
        } else {
            this.context.moveTo(this.previousNode.x, this.previousNode.y)       
        }        
        this.context.lineTo(x, y);
        this.context.stroke();
        
        
        
    }

    actionDrawEnd(x,y){

        this.data.push(this.lineSegment)
        this.canvasObject.setData(this.data); // this is needed for redrawing the canvas and need to be updated after every line segment is added

        this.canvasObject.data[this.canvasObject.data.length - 1].setEndCoords(x, y); //update the last element for every line segment
        this.previousNode.x = x;
        this.previousNode.y = y;

        

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
  
    actionStartDrawing(x,y){
        this.startXY.x = x;
        this.startXY.y = y;
        this.canvasObject = new CanvasObject('rect', x, y,0,0,null,this.parentTool.color, this.parentTool.size, this.parentTool.parentToolBar.parentCanvas)
    }

    actionDraw(x,y){
        this.context.beginPath();
        this.context.rect(this.startXY.x, this.startXY.y, x - this.startXY.x, y - this.startXY.y);
        this.context.stroke();

        this.canvasObject.setEndCoords(x, y)
    }

    actionDrawEnd(x,y){
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
  
    actionStartDrawing(x,y){
        this.startXY.x = x;
        this.startXY.y = y;

        this.canvasObject = new CanvasObject('circle', x, y,0,0,0,this.parentTool.color, this.parentTool.size, this.parentTool.parentToolBar.parentCanvas)
    }

    actionDraw(x,y){
        this.context.beginPath();
        let radius = Math.sqrt(Math.pow(x - this.startXY.x,2) + Math.pow(y - this.startXY.y,2)); 
        this.context.arc(this.startXY.x, this.startXY.y, radius, 0, 2 * Math.PI);
        this.context.stroke();

        this.canvasObject.setData(radius)
    }

    actionDrawEnd(x,y){
        return this.canvasObject;
    }
}

class Text {
    constructor(){
        
    }
}


