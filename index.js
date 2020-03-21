// remember to set installationChecklists at the beginning of the app - probably read from the main spreadsheet
try{
    var app = new application();

    let userInstance = new user('Marcin', 'Heniborg', 'marcin@skynet4.com', '773-290-0091', new userPermissions(true));
    app.addUser(userInstance);
    app.setCurrentUser(userInstance)

    let projectInstance = new project('First Test Project', userInstance);

    let userRoman = new user('Roman', 'Wisniewski', 'roman@skynet4.com', '708-288-5667')
    let userMichal = new user('Michal', 'Weglowski', 'michal@skynet4.com', '773-123-4567')    
    let userMoises = new user('Moises', 'Cortez', 'moises@skynet4.com', '773-567-8909')
    let userBrandon = new user('Brandon', 'Zamora', 'brandon@skynet4.com', '773-098-7654')
    let userMarcin = userInstance;

    projectInstance.addProjectUser(userRoman, projectInstance.projectRoles[4])
    projectInstance.addProjectUser(userMichal, projectInstance.projectRoles[0])
    projectInstance.addProjectUser(userMoises, projectInstance.projectRoles[1])
    projectInstance.addProjectUser(userBrandon, projectInstance.projectRoles[3])    
    projectInstance.addProjectUser(userMarcin, projectInstance.projectRoles[5])


    let topProjectMenu = new TopProjectMenu(projectInstance);
    projectInstance.setTopMenu(topProjectMenu);

    app.addProject(projectInstance);
    app.setActiveProject(projectInstance);


    let designPlanMenus = new DesignPlanMenus()
    projectInstance.setDesignPlanMenuBar(designPlanMenus);
    let designPlanInstance = projectInstance.createDesignPlan('First Design Plan', '/Images/map1.jpg')
    

    designPlanInstance.show();

    let inserTionToolSubContent = [
        {name: 'test1',
         img:  '3d_rotation',
         imgOrigin: 'materialize'
        },

        {name: 'test2',
         img:  'ac_unit',
         imgOrigin: 'materialize'
        },

        {name: 'test3',
         img:  'Images/mapObjectImages/bulletCamera.png',
         imgOrigin: 'src'
        }
    ]
    let insertionTool = new Tool('insertionTool', designPlanInstance.DOM, 'Images/mapObjectImages/bulletCamera.png', inserTionToolSubContent )
    this.app.addAppTool(insertionTool)
    let tools = insertionTool.renderSubcontent();

    tools[0].addEventListener('pointerdown', ev => {
        console.log('tool 1 clicked')
    })

    app.addAppMenu(CreateAppMenu((nameClicked, subElements) => {
        console.log(nameClicked)

        if (Object.keys(app.appTools).length > 0){
            // if(Object.keys(app.appTools).contains('insertionTool')){

            // } else {

            // }
        }
    }));


    console.dir(app)
    console.dir(window)

    let error = new appLogMessage('index.js', 'test error', 'error');
    //error.showAppMessage();
    // let cameraTest = new camera('camera1', 'camera1_ID', 'mapIconSource', 'camera details', 'gns model', '5Mpx')
    // console.log(camera.designPlan)
    
} catch (e){
    let error = new appLogMessage('index.js', e, 'error');
    //error.showAppMessage();
    app.addLogMessage(error);
    //document.getElementById("app_message").innerHTML = e;
    throw (e);
}
