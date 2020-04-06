// remember to set installationChecklists at the beginning of the app - probably read from the main spreadsheet
//tests******************************

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.materialboxed');
    var instances = M.Materialbox.init(elems, '');
  });

  let enhancedImagesInstance = new enhancedImages().enhancedImagesInit();


  let backdrop = document.getElementById('main_backdrop');
  backdrop.classList.add('backdrop_visible')
  let backdropRect = backdrop.getBoundingClientRect()
  let canvasTest = new Canvas(backdrop, null);
  canvasTest.render();
  canvasTest.setPosition(parseInt(backdropRect.x),parseInt(backdropRect.y));
  canvasTest.setDimensions(parseInt(backdropRect.width),parseInt(backdropRect.height));
  canvasTest.setListeners();
  let canvasToolBar = new CanvasToolBar(canvasTest)
  canvasToolBar.render()
  canvasToolBar.setListeners();
  canvasTest.addCanvasDrawingToolBar(canvasToolBar);
  canvasToolBar.addStandardCanvasTools();

//888888888888888888888888888888888888

try{


    var app = new application();

    //testing if iOS
    let isIOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    app.isIOS = isIOS;

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

    let inserTionToolContent = {
        'mainButtonName': 'cameras',
        'mainImage': 'Images/mapObjectImages/bulletCamera.png',
        'mainImageOrigin': 'src',

        'subContent': [
            {name: 'test1',
             img:  'Images/mapObjectImages/boxCamera.png',
             imgOrigin: 'src'
            },
    
            {name: 'test2',
             img:  'Images/mapObjectImages/domeCamera.png',
             imgOrigin: 'src'
            },
    
            {name: 'test3',
             img:  'Images/mapObjectImages/bulletCamera.png',
             imgOrigin: 'src'
            },

            {name: 'test4',
             img:  'Images/mapObjectImages/boxCamera.png',
             imgOrigin: 'src'
            },
    
            {name: 'test5',
             img:  'Images/mapObjectImages/domeCamera.png',
             imgOrigin: 'src'
            },
    
            {name: 'test6',
             img:  'Images/mapObjectImages/bulletCamera.png',
             imgOrigin: 'src'
            }
        ]
    }
    
   
    

    // create bottom menu with a callback as a parameter, callback is executed every time a menu item is clicked
    app.addAppMenu(CreateAppMenu(app.processBottomMenu));

    //extract object showing elements of the menu starting with camera and going down the menu
    let cameraItem = app.appMenus['bottom menu'].getItem('camera');
    //small tool showing after the insert element group is selected, this tool will display all the camera types
    let cameraIsertionToolContent = {
        'mainButtonName': 'cameras',
        'mainImage': 'Images/mapObjectImages/bulletCamera.png',
        'mainImageOrigin': 'src',
        'subContent': cameraItem.childrenPath
    }
    let cameraInsertionTool = new Tool('materialize_floating_action_button', 'insertionTool_camera', designPlanInstance.parentDOM, cameraIsertionToolContent, app.processTool)
    this.app.addAppTool(cameraInsertionTool)
    cameraInsertionTool.renderTool();
    cameraInsertionTool.setEventListeners();
    //after rendering the tool the Tool.subContentDOMs allows to create listeners
    // for(let elem of cameraInsertionTool.subcontentDOMs){
    //     elem.addEventListener('pointerdown', ev => {
    //         console.log(`tool ${elem.id} clicked`)

    //         //change main button image
    //         let clickedData = insertionTool.subcontent[elem.id];
    //         insertionTool.changeMainButtonImage(clickedData.data.img, clickedData.data.imgOrigin == 'materialize' ? true:false)
    //     })
    // }


    console.dir(app)
    console.dir(window)

    //let error = new appLogMessage('index.js', 'test error', 'error');
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
