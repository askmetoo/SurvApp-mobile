var manager = new Hammer(document.getElementById('test2'));
manager.get('pinch').set({ enable: true });




manager.on('singletap', function(ev) {
    console.log('singletap')
    // /ev.target.classList.toggle('zoomed');    
})

manager.on('doubletap', function(ev) {
    ev.preventDefault();
    console.log('doubletap')
    ev.target.classList.toggle('rotated');    
})


manager.on('pinch', function(ev) {
    ev.preventDefault();
    console.log('pinch')
    //ev.target.classList.toggle('zoomed');    
    document.getElementById('test2').style.transform = 'scale(' + ev.scale + ')';
})


