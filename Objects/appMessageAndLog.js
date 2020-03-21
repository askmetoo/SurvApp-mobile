class appLogMessage{
    constructor(location, message, type){
        this.location = location;
        this.message = message;
        this.date = formatDateTime(new Date());
        this.type = type;

        this.appMessageDOM = document.getElementById('app_message');
        this.appMessageCloseButtonDOM = document.getElementById('app__message_close_button')

        this.appMessageCloseButtonDOM.addEventListener('pointerdown', function(ev){ev.stopPropagation()})
        this.appMessageCloseButtonDOM.addEventListener('pointerup', (ev) => {
            this.hideAppMessage();
        })
    }

    showAppMessage(){
        switch (this.type){
            case 'error':                
                this.appMessageDOM.classList.add('app_message_type_error');
            break;
            case 'message':
                this.appMessageDOM.classList.remove('app_message_type_error');
            break;
        }

        if(this.type != 'log'){
            this.appMessageDOM.querySelector('span').innerHTML = this.location + ': ' + this.message;
            this.appMessageDOM.classList.add('app_message_show');
        }
    }

    hideAppMessage(){
        this.appMessageDOM.classList.remove('app_message_show');
    }
}