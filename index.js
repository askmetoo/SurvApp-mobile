// remember to set installationChecklists at the beginning of the app - probably read from the main spreadsheet
//try{
    var app = new application();

    let userInstance = new user('Marcin', 'Heniborg', 'marcin@skynet4.com', '773-290-0091', new userPermissions(true));
    app.addUser(userInstance);
    app.setCurrentUser(userInstance)

    app.addAppMenu(CreateAppMenu());


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


    let designPlanInstance = new designPlan('designPlan1', 'design_plan_container');
    designPlanInstance.loadMapImage('/Images/test_map.jpg')
    designPlanInstance.setParentProject(projectInstance)
    //designPlanInstance.loadMapImage('https://www.dropbox.com/s/0eslvbog1rp0slo/2020-01-2417_00_03.638329.jpg?raw=1');
    projectInstance.addDesignPlan(designPlanInstance);
    projectInstance.setActiveDesignPlan(designPlanInstance);

    console.dir(app)
    console.dir(window)

    // let cameraTest = new camera('camera1', 'camera1_ID', 'mapIconSource', 'camera details', 'gns model', '5Mpx')
    // console.log(camera.designPlan)
    //app.setAppMessage('index.js processed');
//} catch (e){
//     document.getElementById("app_message").innerHTML = e;
//     throw (e);
// }
