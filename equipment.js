
let manufacturers = {
    camera: ['HIK Vision', 'Avigilon', 'Hanwha', 'Axis'],
    DVR: ['HIK Vision'],
    NVR: ['HIK Vision', 'Avigilon'],
    VMS: ['Avigilon', 'Digital Watchdog', 'Exacq Vision'],
    accessControl: ['Roslarre', 'Avigilon', 'Brivo'],
    alarm: ['Honeywell', 'DSC'],
    VSaaS: ['Eagle Eye Networks']
}

let vendors = {
    camera: ['ADI', 'Avigilon', 'GNS'],
    DVR: ['ADI', 'GNS'],
    NVR: ['ADI', 'GNS'],
    VMS: ['ADI','Avigilon'],
    accessControl: ['ADI', 'GNS', 'Avigilon'],
    alarm: ['ADI'],
    VSaaS: ['ADI', 'Eagle Eye Networks']
    
}

document.getElementById("app_message").innerHTML = 'equipment.js loaded';

var equipmentSelection = function(type, subType){
    switch(type){
        case 'video':
            switch (subType){
                case 'camera':
                    return new Camera();
                    break;
                
                case 'dvr':
                    return new DVR();
                    break;
        
                case 'nvr':
                    return new NVR();
                    break;
                
                case 'vms':
                    return new VMS();
                    break;
        
                case 'access control panel':
                    return new accessControlPanel();
                    break;
        
                
            }
            break;
        
        case 'access control':
            switch (subType){
                case 'panel':
                    return new accessControlPanel();
                    break;

                case 'reader':
                    return new Reader();
                    break;
            }
            break;
    }
    
}

var equipmentCounts = new function (){
    this.counts = {};
    this.increaseAndGetCount = function(type){
        if(!this.counts.hasOwnProperty(type)){
            this.counts[type] = 0;
        }
        return this.counts[type] +=1;
    }
}();

class Equipment {    
    constructor(type='', subType='',name='', statusOptions) {
        this.name = name;
        this.type = type;
        this.subType = subType;
        this._manufacturer = 'not selected';
        this.manufacturerOptions = [];
        this.vendor = 'not selected';
        this.vendorOptions = [];
        this._model = '';
        this._price = '';
        this._currentStatus = 'not started';
        this.statusDateAndTime = new Date();
        this.statusOptions = ['not started', 'wired', 'installed', 'completed'].concat(statusOptions);
        this.statusNote = '';
        this.statusHistory = []; // status1: {dateTime, status, statusNote, user}
        //   this._installedBy = '';
        //   this._installedDateTime = '';   
        
        
        this.projectSpecificInstructions = 'default instructions'; // this is used to set instructions for this equipment in this project i.e. how to wire, or where exactly to install
        this.notes = {}; 
        this.noteLevelOptions = ['survey', 'sales', 'install', 'completion']
        //   note1:{
        //       level: survey, sales, install, completion
        //       note,
        //       dateTime,
        //       user
        //   };
        this.canvasNotes = {};

        this.equipmentNumber = 0;
        this.mapObject = null;
        this.parentProject = null;

        this.parameters = {
            'name' : {
                header: true,
                display: 'name',
                value: name,
                htmlElement: 'h3',
                DOM: null,
                show: true,
                editable: true
            },

            'type': {
                display: 'type',
                value: type,
                htmlElement: 'input',
                htmlElementOption: 'text',
                wrapperDOMClass: 'input-field col s6',
                DOM: null,
                show: true,
                editable: false,
                tab: 1,
                row: 1
            },

            'subType': {
                display: 'subtype',
                value: subType,
                htmlElement: 'input',
                htmlElementOption: 'text',
                wrapperDOMClass: 'input-field col s6',
                DOM: null,
                show: true,
                editable: false,
                tab: 1,
                row: 1
            },

            'vendor': {
                display: 'vendor',
                value: '',
                options: [],
                htmlElement: 'select',
                wrapperDOMClass: 'input-field col s6',
                DOM: null,
                show: true,
                editable: true,
                tab: 1,
                row: 2
            },

            'manufacturer': {
                display: 'manufacturer',
                value: '',
                options: [],
                htmlElement: 'select',
                wrapperDOMClass: 'input-field col s6',
                DOM: null,
                show: true,
                editable: true,
                tab: 1,
                row: 2
            },

            'model': {
                display: 'model',
                value: '',
                options: [],
                htmlElement: 'input',
                htmlElementOption: 'text',
                DOM: null,
                show: true,
                editable: true,
                tab: 1
            },

            'status': {
                display: 'status',
                value: 'not started',
                options: ['not started', 'installed', 'completed'].concat(statusOptions),
                user: '',
                htmlElement: 'select',
                DOM: null,
                show: true,
                editable: true,
                tab: 0,
                row: 3
            },

            'statusNote': {
                display: 'status note',
                value: '',
                dateTime: '',
                htmlElement: 'textarea',
                DOM: null,
                show: true,
                editable: true,
                tab: 0,
                row: 3
            },

            'statusHistory': {
                display: 'status history',
                value: [
                    { // sample note history
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/01/20 3:25 pm')),
                        status: 'started',
                        note: 'started wiring the camera'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/03/20 12:10 pm')),
                        status: 'wired',
                        note: 'wiring done'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/04/20 09:30 am')),
                        status: 'completed',
                        note: 'camera done and tested'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/04/20 09:30 am')),
                        status: 'completed',
                        note: 'camera done and tested tedjsna.sl;xcmvxlknznxcvb;cxlvbmlkcxvnblxkcmbvlk'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/04/20 09:30 am')),
                        status: 'completed',
                        note: 'camera done and tested'
                    }
                ],                
                htmlElement: 'custom',
                DOM: null,
                show: true,
                editable: false,
                tab: 0,
                row: 3
            },

            'note': {
                display: 'current note',
                value: '',   
                dateTime: '',             
                htmlElement: 'textarea',
                DOM: null,
                show: true,
                editable: true,
                tab: 0
            },

            'noteHistory': {
                display: 'note history',
                value: [
                    { // sample note history
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/01/20 3:25 pm')),
                        note: 'started wiring the camera'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/03/20 12:10 pm')),
                        note: 'wiring done'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/04/20 09:30 am')),
                        note: 'camera done and tested'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/04/20 09:30 am')),
                        note: 'camera done and tested tedjsna.sl;xcmvxlknznxcvb;cxlvbmlkcxvnblxkcmbvlk'
                    },
                    {
                        user: app.currentUser,
                        dateTime: formatDateTime(new Date('02/04/20 09:30 am')),
                        note: 'camera done and tested'
                    }
                ],                
                dateTime: '',             
                htmlElement: 'custom',
                DOM: null,
                show: true,
                editable: false,
                tab: 0
            },

            'directions': {
                display: 'directions',
                value: '',            
                htmlElement: 'p',
                DOM: null,
                show: true,
                editable: false,
                tab: 0
            },

            'checkList': {
                display: 'check list',
                value: {
                    // step1 : {
                    //     type: '', // wiring, installation, programming, troubleshooting 
                    //     name: '',
                    //     directions: '',
                    //     images: [],
                    // }
                },
                htmlElement: 'custom',
                DOM: null,
                show: true,
                editable: false,
                tab: 2
            }
        }      

        this.photos = [
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/1.jpg',
            // },
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/2.jpg',
            // },
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/3.jpg',
            // },
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/4.jpg',
            // },
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/5.jpg',
            // },
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/6.jpg',
            // },
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/7.jpg',
            // },
            // {
            //     dateTaken: formatDateTime(new Date('02/04/20 09:30 am')),
            //     src: '/Images/testImages/8.jpg',
            // },
        ]
    }

    setHTMLManufacturerChoices(choices){
        this.htmlElements.manufacturer.choices = choices;
    }
    
}

class Camera extends Equipment {
   
    constructor() {
      let cameraNumber = equipmentCounts.increaseAndGetCount('camera');//Camera.setCameraNumber();
      let name = 'Camera ' + cameraNumber;//Camera.setCameraName(cameraNumber);  
      let additionalStatusOptions = ['adjusted','programmed'];

      super('video', 'camera', name, additionalStatusOptions); 

      this.equipmentNumber = cameraNumber;
      this.additionalStatusOptions = additionalStatusOptions;
     
      this.parameters.vendor.options = vendors.camera;
      this.parameters.manufacturer.options = manufacturers.camera;

      this.additionalParameters = {         

          technology : {
              display : 'technology',
              value : '',
              options : ['IP','TVI','Analog'],
              htmlElement : 'select',
              DOM: null,
              editable: true,
              tab: 1
          },

          resolution : {
              display : 'resolution',
              value : '',
              options : ['1', '2', '3', '4', '5', '6', '8', '12', '16', '28', '30'],
              htmlElement : 'select',
              DOM: null,
              editable:true,
              tab: 1
          },

          formFactor : {
              display : 'form factor',
              value : '',
              options : ['bullet', 'dome', 'multisensor', 'fisheye', 'full body'],
              htmlElement : 'select',
              DOM: null,
              editable:true,
              tab: 1
          },

          power : {
              display : 'power',
              value : '',
              options : ['POE','12VDC', '24VDC','24VAC'],
              htmlElement : 'select',
              DOM: null,
              editable:true,
              tab: 1
          }
      }

      this.parameters = {...this.parameters, ...this.additionalParameters}
    }
}

class DVR extends Equipment {
    // static dvrCount;
    // static installationChecklistCSV;  // this could be used to generate general checklist for particullar equipment install
    
    // static setDVRNumber(){
    //     if (DVR.dvrCount == undefined){
    //         DVR.dvrCount = 0;
    //     }
    //     return DVR.dvrCount+=1;
    // }

    // static setDVRName(dvrNumber){
    //     return 'DVR ' + dvrNumber;
    // }


    constructor() {
        let dvrNumber = equipmentCounts.increaseAndGetCount('dvr');        
        let name = 'DVR ' + dvrNumber;  
        let additionalStatusOptions = ['programmed','remotely connected']

        super('video', 'DVR', name, additionalStatusOptions);  

        this.equipmentType = 'camera';
        this.equipmentNumber = dvrNumber;
        this.additionalStatusOptions = additionalStatusOptions;
        this._channels = '';
        this._storage = '';    
    }

    
    // static setInstallationChecklist(csv){
    //     this.installationChecklistCSV = csv;
    // }

    get channels() {
        return this._channels;
    }  
    set channels(channels) {
        this._channels = channels;
    }

    get storage() {
        return this._storage;
    }    
    set storage(storage) {
    this._storage = storage;
    }
}

class NVR extends Equipment {
    // static nvrCount;
    // static installationChecklistCSV;  // this could be used to generate general checklist for particullar equipment install

    // static setNVRNumber(){
    //     if (NVR.nvrCount == undefined){
    //         NVR.nvrCount = 0;
    //     }
    //     return NVR.nvrCount+=1;
    // }
    // static setNVRName(nvrNumber){
    //     return 'NVR ' + nvrNumber;
    // }

    constructor() {
        let nvrNumber = equipmentCounts.increaseAndGetCount('nvr');
        let name = 'NVR ' + nvrNumber;
        let additionalStatusOptions = ['programmed','remotely connected'];

        super('video', 'NVR', name, additionalStatusOptions);  
        
        this.equipmentType = 'NVR';
        this.equipmentNumber = nvrNumber;
        this.additionalStatusOptions = additionalStatusOptions;
        this._channels = '';
        this._storage = '';    
    }

    // static setInstallationChecklist(csv){
    //     this.installationChecklistCSV = csv;
    // }

    get channels() {
        return this._channels;
    }  
    set channels(channels) {
        this._channels = channels;
    }

    get storage() {
        return this._storage;
    }    
    set storage(storage) {
    this._storage = storage;
    }
}

class VMS extends Equipment {
    // static VMSCount;
    // static installationChecklistCSV;  // this could be used to generate general checklist for particullar equipment install

    // static setVMSNumber(){
    //     if (VMS.VMSCount == undefined){
    //         VMS.VMSCount = 0;
    //     }
    //     return VMS.VMSCount+=1;
    // }

    // static setVMSName(VMSNumber){
    //     return 'VMS ' + VMSNumber;
    // }

    constructor() {
        let VMSNumber = equipmentCounts.increaseAndGetCount('vms');
        let name = 'VMS ' + VMSNumber;  
        let additionalStatusOptions = ['programmed','remotely connected']
        super('video surveillance', 'VMS', name, additionalStatusOptions);   
        
        this.equipmentNumber = VMSNumber;
        this.additionalStatusOptions = additionalStatusOptions;        
        this._channels = '';
        this._storage = '';    
        this._licenses = '';
    }

    
    // static setInstallationChecklist(csv){
    //     this.installationChecklistCSV = csv;
    // }

    get channels() {
        return this._channels;
    }  
    set channels(channels) {
        this._channels = channels;
    }

    get licenses() {
        return this._licenses;
    }      
    set licenses(licenses) {
        this._licenses = licenses;
    }
    addLicense(license){
        this._licenses += ','+license;
    }

    get storage() {
        return this._storage;
    }    
    set storage(storage) {
    this._storage = storage;
    }
}

class accessControlPanel extends Equipment {
    // static accessControlPanelCount;
    // static installationChecklistCSV;  // this could be used to generate general checklist for particullar equipment install

    // static setaccessControlPanelNumber(){
    //     if (accessControlPanel.accessControlPanelCount == undefined){
    //         accessControlPanel.accessControlPanelCount = 0;
    //     }
    //     return accessControlPanel.accessControlPanelCount+=1;
    // }

    // static setaccessControlPanelName(accessControlPanelNumber){
    //     return 'access control panel ' + accessControlPanelNumber;
    // }

    constructor() {
      let accessControlPanelNumber =  equipmentCounts.increaseAndGetCount('accessControlPanel');
      
      let name = 'access control panel ' + accessControlPanelNumber;
      let additionalStatusOptions = ['equipment programmed','users programmed','cards programmed']

      super('access control', 'panel', name, additionalStatusOptions);  

      this.equipmentNumber = accessControlPanelNumber;
      this.additionalStatusOptions = additionalStatusOptions;
      this._technology = '';
      this.technologyOptions = ['cloud','server based','embedded'];      
    }
  
    
    // static setInstallationChecklist(csv){
    //     this.installationChecklistCSV = csv;
    // }

    get technology() {
        return this._technology;
    }  
    set technology(technology) {
        this._technology = technology;
    }
}

class Reader extends Equipment {
    // static readerCount;
    // static installationChecklistCSV;  // this could be used to generate general checklist for particullar equipment install

    // static setreaderNumber(){
    //     if (Reader.readerCount == undefined){
    //         Reader.readerCount = 0;
    //     }
    //     return Reader.readerCount+=1;
    // }

    // static setreaderName(readerNumber){
    //     return 'reader ' + readerNumber;
    // }

    constructor() {
      let readerNumber = equipmentCounts.increaseAndGetCount('reader');
      let name = 'Reader ' + readerNumber;
      let additionalStatusOptions = []

      super('access control', 'reader', name, additionalStatusOptions);  

      this.equipmentNumber = readerNumber;
      this.additionalStatusOptions = additionalStatusOptions;
      this._technology = '';
      this.technologyOptions = ['iClass','prox','iClass w/ keypad', 'prox w/ keypad'];  
      this._formFactor = '';
      this.formFactorOptions = ['mullion', 'regular', 'long range']    
    }
  
    
    // static setInstallationChecklist(csv){
    //     this.installationChecklistCSV = csv;
    // }

    get technology() {
        return this._technology;
    }  
    set technology(technology) {
        this._technology = technology;
    }

    get formFactor() {
        return this._formFactor;
    }  
    set formFactor(formFactor) {
        this._formFactor = formFactor;
    }
}