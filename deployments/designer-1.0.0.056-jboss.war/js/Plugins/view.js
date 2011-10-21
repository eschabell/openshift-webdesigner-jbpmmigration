/**
 * Copyright (c) 2006
 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/

/**
 * @namespace Oryx name space for plugins
 * @name ORYX.Plugins
*/
if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

/**
 * The view plugin offers all of zooming functionality accessible over the 
 * tool bar. This are zoom in, zoom out, zoom to standard, zoom fit to model.
 * 
 * @class ORYX.Plugins.View
 * @extends Clazz
 * @param {Object} facade The editor facade for plugins.
*/
ORYX.Plugins.View = {
	/** @lends ORYX.Plugins.View.prototype */
	facade: undefined,

	construct: function(facade, ownPluginData) {
		this.facade = facade;
		//Standard Values
		this.zoomLevel = 1.0;
		this.maxFitToScreenLevel=1.5;
		this.minZoomLevel = 0.1;
		this.maxZoomLevel = 2.5;
		this.diff=5; //difference between canvas and view port, s.th. like toolbar??
		
		//Read properties
		if (ownPluginData.properties) {
			ownPluginData.properties.each( function(property) {			
				if (property.zoomLevel) {this.zoomLevel = Number(1.0);}		
				if (property.maxFitToScreenLevel) {this.maxFitToScreenLevel=Number(property.maxFitToScreenLevel);}
				if (property.minZoomLevel) {this.minZoomLevel = Number(property.minZoomLevel);}
				if (property.maxZoomLevel) {this.maxZoomLevel = Number(property.maxZoomLevel);}
			}.bind(this));
		}

		
		/* Register zoom in */
		this.facade.offer({
			'name':ORYX.I18N.View.zoomIn,
			'functionality': this.zoom.bind(this, [1.0 + ORYX.CONFIG.ZOOM_OFFSET]),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/magnifier_zoom_in.png",
			'description': ORYX.I18N.View.zoomInDesc,
			'index': 1,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){return this.zoomLevel < this.maxZoomLevel }.bind(this)});
		
		/* Register zoom out */
		this.facade.offer({
			'name':ORYX.I18N.View.zoomOut,
			'functionality': this.zoom.bind(this, [1.0 - ORYX.CONFIG.ZOOM_OFFSET]),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/magnifier_zoom_out.png",
			'description': ORYX.I18N.View.zoomOutDesc,
			'index': 2,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){ return this._checkSize() }.bind(this)});
		
		/* Register zoom standard */
		this.facade.offer({
			'name':ORYX.I18N.View.zoomStandard,
			'functionality': this.setAFixZoomLevel.bind(this, 1),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/zoom_standard.png",
			'cls' : 'icon-large',
			'description': ORYX.I18N.View.zoomStandardDesc,
			'index': 3,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){return this.zoomLevel != 1}.bind(this)
		});
		
		/* Register zoom fit to model */
		this.facade.offer({
			'name':ORYX.I18N.View.zoomFitToModel,
			'functionality': this.zoomFitToModel.bind(this),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/image.png",
			'description': ORYX.I18N.View.zoomFitToModelDesc,
			'index': 4,
			'minShape': 0,
			'maxShape': 0
		});
		
		/* Register popout to model */
		this.facade.offer({
			'name':ORYX.I18N.View.showInPopout,
			'functionality': this.showInPopout.bind(this),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/popup.gif",
			'description': ORYX.I18N.View.showInPopoutDesc,
			'index': 5,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		
		/* Register task form generation to model */
		this.facade.offer({
			'name':ORYX.I18N.View.generateTaskForms,
			'functionality': this.generateTaskForms.bind(this),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/human_task.gif",
			'description': ORYX.I18N.View.generateTaskFormsDesc,
			'index': 6,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register jpdl transformation to model */
		this.facade.offer({
			'name':ORYX.I18N.View.migratejPDL,
			'functionality': this.migrateJPDL.bind(this),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/jpdl_import_icon.png",
			'description': ORYX.I18N.View.migratejPDLDesc,
			'index': 7,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register jbpm service repository to model */
		this.facade.offer({
			'name':ORYX.I18N.View.connectServiceRepo,
			'functionality': this.jbpmServiceRepoConnect.bind(this),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/repository_rep.gif",
			'description': ORYX.I18N.View.connectServiceRepoDesc,
			'index': 8,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register information view to model */
		this.facade.offer({
			'name':ORYX.I18N.View.showInfo,
			'functionality': this.showInfo.bind(this),
			'group': ORYX.I18N.View.group,
			'icon': ORYX.PATH + "images/information.png",
			'description': ORYX.I18N.View.showInfoDesc,
			'index': 9,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		// Footer items
		/* Register information view to model */
		this.facade.offer({
			'name':'ViewBPMN2Button',
			'functionality': this.showProcessBPMN.bind(this),
			'group': 'footerViewSourceButton',
			'text': 'BPMN2',
			'description': 'View BPMN2 Source',
			'index': 1,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register information view to model */
		this.facade.offer({
			'name':'ViewJSONButton',
			'functionality': this.showProcessJSON.bind(this),
			'group': 'footerViewJSONButton',
			'text': 'JSON',
			'description': 'View JSON Source',
			'index': 2,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register information view to model */
		this.facade.offer({
			'name':'ViewSVGButton',
			'functionality': this.showProcessSVG.bind(this),
			'group': 'footerViewSVGButton',
			'text': 'SVG',
			'description': 'View SVG Source',
			'index': 3,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register information view to model */
		this.facade.offer({
			'name':'ViewERDFButton',
			'functionality': this.showProcessERDF.bind(this),
			'group': 'footerViewERDFButton',
			'text': 'ERDF',
			'description': 'View ERDF Source',
			'index': 4,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register information view to model */
		this.facade.offer({
			'name':'ViewPDFButton',
			'functionality': this.showAsPDF.bind(this),
			'group': 'footerViewPDFButton',
			'text': 'PDF',
			'description': 'View PDF',
			'index': 5,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
		
		/* Register information view to model */
		this.facade.offer({
			'name':'ViewPNGButton',
			'functionality': this.showAsPNG.bind(this),
			'group': 'footerViewPNGButton',
			'text': 'PNG',
			'description': 'View PNG',
			'index': 6,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){
				profileParamName = "profile";
				profileParamName = profileParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				regexSa = "[\\?&]"+profileParamName+"=([^&#]*)";
		        regexa = new RegExp( regexSa );
		        profileParams = regexa.exec( window.location.href );
		        profileParamValue = profileParams[1]; 
				return profileParamValue == "jbpm";
			}.bind(this)
		});
	},
	
	/**
	 * It sets the zoom level to a fix value and call the zooming function.
	 * 
	 * @param {Number} zoomLevel
	 * 			the zoom level
	 */
	setAFixZoomLevel : function(zoomLevel) {
		this.zoomLevel = zoomLevel;
		this._checkZoomLevelRange();
		this.zoom(1);
	},
	
	/**
	 * Shows the canvas in bigger popout window.
	 * 
	 */
	showInPopout : function() {
		uuidParamName = "uuid";
        uuidParamName = uuidParamName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        regexS = "[\\?&]"+uuidParamName+"=([^&#]*)";
        regex = new RegExp( regexS );
        uuidParams = regex.exec( window.location.href );

        uuidParamValue = uuidParams[1]; 
        window.open (ORYX.EXTERNAL_PROTOCOL + "://" + ORYX.EXTERNAL_HOST + "/" + ORYX.EXTERNAL_SUBDOMAIN  + "/org.drools.guvnor.Guvnor/standaloneEditorServlet?assetsUUIDs=" + uuidParamValue + "&client=oryx" , "Process Editor","status=0,toolbar=0,menubar=0,resizable=0,location=no,width=1400,height=1000");
	},
	
	/**
	 * Connects to the jbpm service repository
	 * and displays it's assets.
	 */
	jbpmServiceRepoConnect : function() {
		var repoLoadMask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.View.connectServiceRepoConnecting});
		repoLoadMask.show();
		
		Ext.Ajax.request({
            url: ORYX.PATH + "jbpmservicerepo",
            method: 'POST',
            success: function(request){
    	   		try {
    	   			repoLoadMask.hide();
    	   			this._showJbpmServiceDialog(request.responseText);
    	   		} catch(e) {
    	   			Ext.Msg.alert("Connecting the jBPM Service Repository failed :\n" + e);
    	   		}
                Ext.Msg.hide();
            }.createDelegate(this),
            failure: function(){
            	Ext.Msg.alert("Failed to connect to jBPM Service Repository");
            },
            params: {
            	action: 'display',
            	profile: ORYX.PROFILE,
            	uuid : ORYX.UUID
            }
        });
	},
	
	/**
	 * Migrates a jPDL based process to BPMN2
	 */
	migrateJPDL : function() {
		this._showImportDialog();
	},
	
	_renderIcon: function(val) {
		return '<img src="' + val + '"/>';
	},
	
	_renderDocs: function(val) {
		return '<a href="' + val + '" target="_blank">link</a>';
	},

	_showJbpmServiceDialog: function( jsonString ) {
		var jsonObj = jsonString.evalJSON();
		
		var myData = [];
		var j = 0;
		for (var key in jsonObj) {
			myData[j] = jsonObj[key];
			j++;
		}
		
		var store = new Ext.data.SimpleStore({
			fields: [{name: 'name'},
			         {name: 'displayName'},
			         {name: 'icon'},
			         {name: 'category'},
			         {name: 'explanation'},
			         {name: 'documentation'},
			         {name: 'inputparams'},
			         {name: 'results'}
			         ],
			         data : myData 
		});
		
		var grid = new 	Ext.grid.GridPanel({
	        store: store,
	        columns: [
	            {header: 'ICON', width: 50, sortable: true, dataIndex: 'icon', renderer: this._renderIcon},
	            {header: 'NAME', width: 100, sortable: true, dataIndex: 'displayName'},
	            {header: 'EXPLANATION', width: 100, sortable: true, dataIndex: 'explanation'},
	            {header: 'DOCUMENTATION', width: 100, sortable: true, dataIndex: 'documentation', renderer: this._renderDocs},
	            {header: 'INPUT PARAMETERS', width: 200, sortable: true, dataIndex: 'inputparams'},
	            {header: 'RESULTS', width: 200, sortable: true, dataIndex: 'results'},
	            {header: 'CATEGORY', width: 100, sortable: true, dataIndex: 'category'}
	        ],
	        title: 'Service Nodes. Double-click on a row to install.',
	        autoHeight:true,
	        frame:true
	    });
		
		grid.on('rowdblclick', function(g, i, e) {
			// g is the grid
			// i is the index
			// e is the event
			var aname = g.getStore().getAt(i).get('name');
			var acategory = g.getStore().getAt(i).get('category');
			// send request to server to install the selected service node
			Ext.Ajax.request({
	            url: ORYX.PATH + 'jbpmservicerepo',
	            method: 'POST',
	            success: function(request) {
	    	   		try {
	    	   			Ext.Msg.alert('Installation was successful. Please save your process and reopen it in the editor to see the installed assets.');
	    	   		} catch(e) {
	    	   			Ext.Msg.alert('Installing the repository assets failed :\n' + e);
	    	   		}
	            }.createDelegate(this),
	            failure: function(){
	            	Ext.Msg.alert('Failed to install the repository assets');
	            },
	            params: {
	            	action: 'install',
	            	profile: ORYX.PROFILE,
	            	uuid : ORYX.UUID,
	            	asset : aname,
	            	category : acategory
	            }
	        });
			
		});
		
		var tabs = new Ext.TabPanel({
	        activeTab: 0,
	        border: false,
	        width:'100%',
	        height:'100%',
	        tabPosition: 'top',
	        layoutOnTabChange: true,
            deferredRender : false,
	        defaults:{autoHeight: true, autoScroll: true},
	        items: [{
	            title: 'Service Nodes',
	            anchor: '100%',
                autoScroll   : true,
                layout       : 'table',
	            items: [grid],
	            margins: '10 10 10 10',
	            listeners: {
	            	'tabchange': function(tp, p) {
	            		tabs.doLayout();
	            }}
	        }]
	    });

		// Create the panel
		var dialog = new Ext.Window({ 
			autoCreate: true,
			autoScroll:true, 
			layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		ORYX.I18N.View.connectServiceRepoDataTitle, 
			height: 	440, 
			width:		600,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[tabs],
			buttons:[
				{
					text:ORYX.I18N.jPDLSupport.close,
					handler:function(){
						
						dialog.hide();
					
					}.bind(this)
				}
			]
		});
		
		// Destroy the panel when hiding
		dialog.on('hide', function(){
			dialog.destroy(true);
			delete dialog;
		});

		// Show the panel
		dialog.show();
	},
	
	/**
	 * Opens a upload dialog.
	 */
	_showImportDialog: function( successCallback ) {
	    var form = new Ext.form.FormPanel({
		baseCls: 		'x-plain',
	        labelWidth: 	50,
	        defaultType: 	'textfield',
	        items: [
	        {
	            text : 		ORYX.I18N.jPDLSupport.selectFile, 
				style : 	'font-size:12px;margin-bottom:10px;display:block;',
	            //anchor:		'100%',
				xtype : 	'label' 
	        },
	        {
	            fieldLabel: ORYX.I18N.jPDLSupport.file,
	            name: 		'subject',
				inputType : 'file',
				style : 	'margin-bottom:10px;display:block;',
				itemCls :	'ext_specific_window_overflow'
	        }, 
	        {
	            xtype: 'textarea',
	            hideLabel: true,
	            name: 'msg',
		        grow: false,
				width: 450,
				height: 200
	        }
	        ]
	    });
	    
	    var form2 = new Ext.form.FormPanel({
			baseCls: 		'x-plain',
	        labelWidth: 	50,
	        defaultType: 	'textfield',
	        items: [
	        {
	            text : 		ORYX.I18N.jPDLSupport.selectGpdFile, 
				style : 	'font-size:12px;margin-bottom:10px;display:block;',
	            //anchor:		'100%',
				xtype : 	'label' 
	        },
	        {
	            fieldLabel: ORYX.I18N.jPDLSupport.gpdfile,
	            name: 		'subject',
				inputType : 'file',
				style : 	'margin-bottom:10px;display:block;',
				itemCls :	'ext_specific_window_overflow'
	        }, 
	        {
	            xtype: 'textarea',
	            hideLabel: true,
	            name: 'msg',
		        grow: false,
                width: 450,
                height: 200
	        }
	        ]
	    });

		// Create the panel
		var dialog = new Ext.Window({ 
			autoCreate: true,
			autoScroll:true, 
			//layout: 	'fit',
			plain:		true,
			bodyStyle: 	'padding:5px;',
			title: 		ORYX.I18N.jPDLSupport.impJPDL, 
			height: 	450, 
			width:		500,
			modal:		true,
			fixedcenter:true, 
			shadow:		true, 
			proxyDrag: 	true,
			resizable:	true,
			items: 		[form,form2],
			buttons:[
				{
					text:ORYX.I18N.jPDLSupport.impBtn,
					handler:function(){
						
						var loadMask = new Ext.LoadMask(Ext.getBody(), {msg:ORYX.I18N.jPDLSupport.impProgress});
						loadMask.show();
						
						window.setTimeout(function(){
					
							var jpdlString =  form.items.items[2].getValue();
							var gpdString =  form2.items.items[2].getValue();
							
							this._sendRequest(
									ORYX.CONFIG.TRANSFORMER_URL(),
									'POST',
									{ 'jpdl' : jpdlString,
									  'gpd'  : gpdString,
									  'transformto' : 'jpdl2bpmn2',
									  'profile' : ORYX.PROFILE,
									  'uuid' : ORYX.UUID
									},
									function( arg ) { this._loadJSON( arg );  loadMask.hide();  dialog.hide(); }.bind(this),
									function() { loadMask.hide();  dialog.hide(); }.bind(this)
								);

						}.bind(this), 100);
			
					}.bind(this)
				},{
					text:ORYX.I18N.jPDLSupport.close,
					handler:function(){
						
						dialog.hide();
					
					}.bind(this)
				}
			]
		});
		
		// Destroy the panel when hiding
		dialog.on('hide', function(){
			dialog.destroy(true);
			delete dialog;
		});

		// Show the panel
		dialog.show();
				
		// Adds the change event handler to 
		form.items.items[1].getEl().dom.addEventListener('change',function(evt){
				var text = evt.target.files[0].getAsText('UTF-8');
				form.items.items[2].setValue( text );
			}, true);
		form2.items.items[1].getEl().dom.addEventListener('change',function(evt){
                var text = evt.target.files[0].getAsText('UTF-8');
                form2.items.items[2].setValue( text );
            }, true);
	},
	
	/**
	 * Loads JSON into the editor
	 * 
	 */
	_loadJSON: function( jsonString ){
		if (jsonString) {
			var jsonObj = jsonString.evalJSON();
			this.facade.importJSON(jsonString);
		} else {
			this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.impFailedJson);
		}
	},
	
	/**
	 * Sends request to a given URL.
	 */
	_sendRequest: function( url, method, params, successcallback, failedcallback ){

		var suc = false;

		new Ajax.Request(url, {
           method			: method,
           asynchronous	: false,
           parameters		: params,
		   onSuccess		: function(transport) {
				
				suc = true;
				
				if(successcallback){
					successcallback( transport.responseText )	
				}
				
			}.bind(this),
			
			onFailure		: function(transport) {

				if(failedcallback){
					
					failedcallback();
					
				} else {
					this._showErrorMessageBox(ORYX.I18N.Oryx.title, ORYX.I18N.jPDLSupport.impFailedReq);
					ORYX.log.warn("jPDL migration failed: " + transport.responseText);	
				}
				
			}.bind(this)		
		});
		
		return suc;		
	},
	
	/**
	 * Converts the process to pdf format.
	 * 
	 */
	showAsPDF : function() {
		var transformval = 'pdf';
		var formattedSvgDOM = DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
		var rawSvgDOM = DataManager.serialize(ORYX.EDITOR.getCanvas().getRootNode().cloneNode(true))
		var method ="post";
		var form = document.createElement("form");
		form.setAttribute("name", "transformerform");
		form.setAttribute("method", method);
		form.setAttribute("action", ORYX.CONFIG.TRANSFORMER_URL());
		form.setAttribute("target", "_blank");
		
		var hfFSVG = document.createElement("input");
		hfFSVG.setAttribute("type", "hidden");
		hfFSVG.setAttribute("name", "fsvg");
		hfFSVG.setAttribute("value", formattedSvgDOM);
        form.appendChild(hfFSVG);
        
        var hfRSVG = document.createElement("input");
        hfRSVG.setAttribute("type", "hidden");
        hfRSVG.setAttribute("name", "rsvg");
        hfRSVG.setAttribute("value", rawSvgDOM);
        form.appendChild(hfRSVG);
        
        var hfUUID = document.createElement("input");
        hfUUID.setAttribute("type", "hidden");
        hfUUID.setAttribute("name", "uuid");
        hfUUID.setAttribute("value", ORYX.UUID);
        form.appendChild(hfUUID);
        
        var hfPROFILE = document.createElement("input");
        hfPROFILE.setAttribute("type", "hidden");
        hfPROFILE.setAttribute("name", "profile");
        hfPROFILE.setAttribute("value", ORYX.PROFILE);
        form.appendChild(hfPROFILE);
        
        var hfTRANSFORMTO = document.createElement("input");
        hfTRANSFORMTO.setAttribute("type", "hidden");
        hfTRANSFORMTO.setAttribute("name", "transformto");
        hfTRANSFORMTO.setAttribute("value", transformval);
        form.appendChild(hfTRANSFORMTO);
        
        document.body.appendChild(form);
        form.submit();	 
	},
	
	/**
	 * Shows designer version info.
	 * 
	 */
	showInfo : function() {
		window.alert("Version: " + ORYX.VERSION);
	},
	
	/**
	 * Displays the process SVG sources (formatted)
	 */
	showProcessSVG : function() {
		var formattedSvgDOM = DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
		var cf = new Ext.form.TextArea({
            id:"svgSourceTextArea",
            fieldLabel:"SVG Source",
            width:400,
            height:450,
            value:formattedSvgDOM
            });

		var win = new Ext.Window({
			width:400,
			id:'processSVGSource',
			height:450,
			autoScroll:true,
			title:'Process SVG Source',
			items: [cf]
			});
		win.show();
	},
	
	showProcessERDF : function() {
		var processERDF = ORYX.EDITOR.getERDF();
		var cf = new Ext.form.TextArea({
            id:"erdfSourceTextArea",
            fieldLabel:"ERDF Source",
            width:400,
            height:450,
            value:processERDF
            });

		var win = new Ext.Window({
			width:400,
			id:'processERDFSource',
			height:450,
			autoScroll:true,
			title:'ERDF Source',
			items: [cf]
			});
		win.show();
	},
	
	showProcessJSON : function() {
		var processJSON = ORYX.EDITOR.getSerializedJSON();
		var cf = new Ext.form.TextArea({
            id:"jsonSourceTextArea",
            fieldLabel:"JSON Source",
            width:400,
            height:450,
            value:processJSON
            });

		var win = new Ext.Window({
			width:400,
			id:'processJSONSource',
			height:450,
			autoScroll:true,
			title:'JSON Source',
			items: [cf]
			});
		win.show();
	},
	
	showProcessBPMN : function() {
		var processJSON = ORYX.EDITOR.getSerializedJSON();
		Ext.Ajax.request({
            url: ORYX.PATH + "uuidRepository",
            method: 'POST',
            success: function(request){
    	   		try{
    	   			var cf = new Ext.form.TextArea({
    	   	            id:"bpmnSourceTextArea",
    	   	            fieldLabel:"BPMN2 Source",
    	   	            width:400,
    	   	            height:450,
    	   	            value:request.responseText
    	   	            });

    	   			var win = new Ext.Window({
    	   				width:400,
    	   				id:'processBPMNSource',
    	   				height:450,
    	   				autoScroll:true,
    	   				title:'BPMN2 Source',
    	   				items: [cf]
    	   				});
    	   			win.show();
    	   		}catch(e){
    	   			Ext.Msg.alert("Converting to BPMN2 Failed :\n"+e);
    	   		}
                Ext.Msg.hide();
            }.createDelegate(this),
            failure: function(){
            	Ext.Msg.alert("Converting to BPMN2 Failed");
            },
            params: {
            	action: 'toXML',
            	pp: ORYX.PREPROCESSING,
            	profile: ORYX.PROFILE,
            	data: processJSON
            }
        });
	},
	
	/**
	 * Converts the process to png format.
	 * 
	 */
	showAsPNG : function() {
		var transformval = 'png';
		var formattedSvgDOM = DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
		var rawSvgDOM = DataManager.serialize(ORYX.EDITOR.getCanvas().getRootNode().cloneNode(true))
		var method ="post";
		var form = document.createElement("form");
		form.setAttribute("name", "transformerform");
		form.setAttribute("method", method);
		form.setAttribute("action", ORYX.CONFIG.TRANSFORMER_URL());
		form.setAttribute("target", "_blank");
		
		var hfFSVG = document.createElement("input");
		hfFSVG.setAttribute("type", "hidden");
		hfFSVG.setAttribute("name", "fsvg");
		hfFSVG.setAttribute("value", formattedSvgDOM);
        form.appendChild(hfFSVG);
        
        var hfRSVG = document.createElement("input");
        hfRSVG.setAttribute("type", "hidden");
        hfRSVG.setAttribute("name", "rsvg");
        hfRSVG.setAttribute("value", rawSvgDOM);
        form.appendChild(hfRSVG);
        
        var hfUUID = document.createElement("input");
        hfUUID.setAttribute("type", "hidden");
        hfUUID.setAttribute("name", "uuid");
        hfUUID.setAttribute("value", ORYX.UUID);
        form.appendChild(hfUUID);
        
        var hfPROFILE = document.createElement("input");
        hfPROFILE.setAttribute("type", "hidden");
        hfPROFILE.setAttribute("name", "profile");
        hfPROFILE.setAttribute("value", ORYX.PROFILE);
        form.appendChild(hfPROFILE);
        
        var hfTRANSFORMTO = document.createElement("input");
        hfTRANSFORMTO.setAttribute("type", "hidden");
        hfTRANSFORMTO.setAttribute("name", "transformto");
        hfTRANSFORMTO.setAttribute("value", transformval);
        form.appendChild(hfTRANSFORMTO);
        
        document.body.appendChild(form);
        form.submit();	 
	},
	
	generateTaskForms : function() {
		
		var processJSON = ORYX.EDITOR.getSerializedJSON();
		var preprocessingData = ORYX.PREPROCESSING;
		
		var method ="post";
		var form = document.createElement("form");
		form.setAttribute("name", "taskformsform");
		form.setAttribute("method", method);
		form.setAttribute("action", ORYX.CONFIG.TASKFORMS_URL());
		form.setAttribute("target", "_blank");
		
		var hfSVG = document.createElement("input");
		hfSVG.setAttribute("type", "hidden");
		hfSVG.setAttribute("name", "json");
		hfSVG.setAttribute("value", processJSON);
        form.appendChild(hfSVG);
        
        var hfSVG = document.createElement("input");
		hfSVG.setAttribute("type", "hidden");
		hfSVG.setAttribute("name", "ppdata");
		hfSVG.setAttribute("value", preprocessingData);
        form.appendChild(hfSVG);
        
        var hfUUID = document.createElement("input");
        hfUUID.setAttribute("type", "hidden");
        hfUUID.setAttribute("name", "uuid");
        hfUUID.setAttribute("value", ORYX.UUID);
        form.appendChild(hfUUID);
        
        var hfPROFILE = document.createElement("input");
        hfPROFILE.setAttribute("type", "hidden");
        hfPROFILE.setAttribute("name", "profile");
        hfPROFILE.setAttribute("value", ORYX.PROFILE);
        form.appendChild(hfPROFILE);
        
        document.body.appendChild(form);
        form.submit();
	},
	
	/**
	 * It does the actual zooming. It changes the viewable size of the canvas 
	 * and all to its child elements.
	 * 
	 * @param {Number} factor
	 * 		the factor to adjust the zoom level
	 */
	zoom: function(factor) {
		// TODO: Zoomen auf allen Objekten im SVG-DOM
		
		this.zoomLevel *= factor;
		var scrollNode 	= this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
		var canvas 		= this.facade.getCanvas();
		var newWidth 	= canvas.bounds.width()  * this.zoomLevel;
		var newHeight 	= canvas.bounds.height() * this.zoomLevel;
		
		/* Set new top offset */
		var offsetTop = (canvas.node.parentNode.parentNode.parentNode.offsetHeight - newHeight) / 2.0;	
		offsetTop = offsetTop > 20 ? offsetTop - 20 : 0;
		canvas.node.parentNode.parentNode.style.marginTop = offsetTop + "px";
		offsetTop += 5;
		canvas.getHTMLContainer().style.top = offsetTop + "px";
		
		/*readjust scrollbar*/
		var newScrollTop=	scrollNode.scrollTop - Math.round((canvas.getHTMLContainer().parentNode.getHeight()-newHeight) / 2)+this.diff;
		var newScrollLeft=	scrollNode.scrollLeft - Math.round((canvas.getHTMLContainer().parentNode.getWidth()-newWidth) / 2)+this.diff;
		
		/* Set new Zoom-Level */
		canvas.setSize({width: newWidth, height: newHeight}, true);
		
		/* Set Scale-Factor */
		canvas.node.setAttributeNS(null, "transform", "scale(" +this.zoomLevel+ ")");	

		/* Refresh the Selection */
		this.facade.updateSelection();
		scrollNode.scrollTop=newScrollTop;
		scrollNode.scrollLeft=newScrollLeft;
		
		/* Update the zoom-level*/
		canvas.zoomLevel = this.zoomLevel;
	},
	
	
	/**
	 * It calculates the zoom level to fit whole model into the visible area
	 * of the canvas. Than the model gets zoomed and the position of the 
	 * scroll bars are adjusted.
	 * 
	 */
	zoomFitToModel: function() {
		
		/* Get the size of the visible area of the canvas */
		var scrollNode 	= this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
		var visibleHeight = scrollNode.getHeight() - 30;
		var visibleWidth = scrollNode.getWidth() - 30;
		
		var nodes = this.facade.getCanvas().getChildShapes();
		
		if(!nodes || nodes.length < 1) {
			return false;			
		}
			
		/* Calculate size of canvas to fit the model */
		var bounds = nodes[0].absoluteBounds().clone();
		nodes.each(function(node) {
			bounds.include(node.absoluteBounds().clone());
		});
		
		
		/* Set new Zoom Level */
		var scaleFactorWidth =  visibleWidth / bounds.width();
		var scaleFactorHeight = visibleHeight / bounds.height();
		
		/* Choose the smaller zoom level to fit the whole model */
		var zoomFactor = scaleFactorHeight < scaleFactorWidth ? scaleFactorHeight : scaleFactorWidth;
		
		/*Test if maximum zoom is reached*/
		if(zoomFactor>this.maxFitToScreenLevel){zoomFactor=this.maxFitToScreenLevel}
		/* Do zooming */
		this.setAFixZoomLevel(zoomFactor);
		
		/* Set scroll bar position */
		scrollNode.scrollTop = Math.round(bounds.upperLeft().y * this.zoomLevel) - 5;
		scrollNode.scrollLeft = Math.round(bounds.upperLeft().x * this.zoomLevel) - 5;
		
	},
	
	/**
	 * It checks if the zoom level is less or equal to the level, which is required
	 * to schow the whole canvas.
	 * 
	 * @private
	 */
	_checkSize:function(){
		var canvasParent=this.facade.getCanvas().getHTMLContainer().parentNode;
		var minForCanvas= Math.min((canvasParent.parentNode.getWidth()/canvasParent.getWidth()),(canvasParent.parentNode.getHeight()/canvasParent.getHeight()));
		return 1.05 > minForCanvas;
		
	},
	/**
	 * It checks if the zoom level is included in the definined zoom
	 * level range.
	 * 
	 * @private
	 */
	_checkZoomLevelRange: function() {
		/*var canvasParent=this.facade.getCanvas().getHTMLContainer().parentNode;
		var maxForCanvas= Math.max((canvasParent.parentNode.getWidth()/canvasParent.getWidth()),(canvasParent.parentNode.getHeight()/canvasParent.getHeight()));
		if(this.zoomLevel > maxForCanvas) {
			this.zoomLevel = maxForCanvas;			
		}*/
		if(this.zoomLevel < this.minZoomLevel) {
			this.zoomLevel = this.minZoomLevel;			
		}
		
		if(this.zoomLevel > this.maxZoomLevel) {
			this.zoomLevel = this.maxZoomLevel;			
		}
	}
};

ORYX.Plugins.View = Clazz.extend(ORYX.Plugins.View);
