
let app = new application();

let userInstance = new user('Marcin', 'Heniorg', 'marcin@skynet4.com', new userPermissions(true));
app.addUser(userInstance);
app.setCurrentUser(userInstance)

app.addAppMenu(CreateAppMenu1());


let projectInstance = new project('firstTestProject');

app.addProject(projectInstance);
app.setActiveProject(projectInstance);

let designPlanInstance = new designPlan('designPlan1', 'design_plan_container');
designPlanInstance.loadMapImage('/Images/test_map.jpg')
designPlanInstance.setParentProject(projectInstance)
//designPlanInstance.loadMapImage('https://www.dropbox.com/s/0eslvbog1rp0slo/2020-01-2417_00_03.638329.jpg?raw=1');
projectInstance.addDesignPlan(designPlanInstance);
projectInstance.setActiveDesignPlan(designPlanInstance);

console.dir(app)

