
class post{    
    constructor(parentConversation, owner, note){
        this.POST_STATUS = {
            "new": "new", "uread":"unread", "read": "read", "deleted": "deleted"
        }
        this.owner = owner;
        this.note = note;
        this.enhancedImages = [];
        this.status = POST_STATUS['unread'];
        this.usersStatus = {};
        this.parentConversation = parentConversation;
    }

    setUsersPostStauses(status){
        for(let k in this.parentConversation.users){
            let user = this.parentConversation.users[k];
            this.setUserPostStatus(user, status);
        }
    }

    setUserPostStatus(user, status){
        this.usersStatus[user] = status;
    }
}


// parent could be any of objects: project, design plan, mapObject
class conversation{
    constructor(parent, owner, subject, users){
        this.ID = Math.random() * 1000000;
        this.subject = subject;
        this.dateStarted = new Date();
        this.parent = parent;
        this.parent.conversations.push(this);
        this.owner = owner;
        this.users = users;
        this.posts = [];
    }

    addUser(user){
        this.users[user.ID] = user;
    }

    addPost(post){
        this.posts.push(post);
    }
}

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