class  hammerTouch{
    constructor(DOM){
        this.DOM = DOM;
        this.hammerManager = new Hammer.Manager(this.DOM);
        this.hammerManager.options.domEvents = true;

        // Tap recognizer with minimal 2 taps
        this.hammerManager.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
        // Single tap recognizer
        this.hammerManager.add( new Hammer.Tap({ event: 'singletap' }) );
        // Pan recognizer
        this.hammerManager.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );

        this.hammerManager.add( new Hammer.Pinch());
        this.hammerManager.get('pinch').set({ enable: true });


        // we want to recognize this simulatenous, so a quadrupletap will be detected even while a tap has been recognized.
        this.hammerManager.get('doubletap').recognizeWith('singletap');
        // we only want to trigger a tap, when we don't have detected a doubletap
        this.hammerManager.get('singletap').requireFailure('doubletap');
    }

    on(pointerAction, action){
        this.hammerManager.on(pointerAction, action);
    }
}

