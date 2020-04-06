class user{
    constructor(fName, lName, email, phoneNumber = '773-767-5400', permissions){
        this.fName = fName;
        this.lName = lName;
        this.fullName = fName + ' ' + lName;
        this.ID = fName + lName[0];
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.permissions = permissions;
        this.imageSrc = "";
        this.initials = (this.fName.charAt(0) + this.lName.charAt(0)).toUpperCase();
        this.projects = null;
        this.conversations = {};
    }

    setPermissions(permissions){
        this.permissions = permissions;
    }

    addProject(project, userRole){
        this.projects[project.name] = project;
        this.projects[project.name].role = userRole;
       
    }

    addConversation(parent, conversation, userRole){
        this.conversations[conversation.ID] = conversation;
        this.conversations[conversation.ID].role = userRole;
        this.conversations[typeof parent][parent.name] = this.conversations[conversation.ID];
    }
}



class userPermissions{
    constructor(userType){
        this.userType = userType;
        this.designPlanEdit = false;
        this.saveAsPdf = false;
        this.viewPrices = false;
        this.viewObjectsMenu = false;
    }

    setUserType(userType){
        if(userType=="master"){
            this.designPlanEdit = true;
            this.saveAsPdf = true;
            this.viewPrices = true;
            this.viewObjectsMenu = true;
        } else {
            this.designPlanEdit = false;
            this.saveAsPdf = false;
            this.viewPrices = false;
            this.viewObjectsMenu = false;
        }
    }
}


user.prototype.setPermissions = function(permissions){
    this.permissions = permissions;
}

