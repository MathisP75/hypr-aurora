define(["require","exports","knockout","ojs/ojknockout-keyset","../common/scriptExecutionModels","../common/autonomousDBModels","../common/dataAccessService","../common/localizedConstants","ojs/ojarraytreedataprovider","../utilities","ojs/ojcore","jquery","ojs/ojtreeview","ojs/ojarraytreedataprovider","ojs/ojbutton","ojs/ojknockout","ojs/ojinputtext","ojs/ojlabel","ojs/ojprogress","ojs/ojformlayout","ojs/ojselectcombobox","ojs/ojmessage","ojs/ojmessages","ojs/ojnavigationlist","ojs/ojcollapsible","ojs/ojlabelvalue","ojs/ojcheckboxset"],(function(require,e,t,a,s,n,o,r,i,c){"use strict";let m;class l{constructor(){this.currentCompartment=r.LocalizedConstants.Instance.currentCompartment,this.compartmentFullPath=r.LocalizedConstants.Instance.compartmentFullPath,this.compartmentName=r.LocalizedConstants.Instance.compartmentName,this.changeCompartmentOrRegion=r.LocalizedConstants.Instance.changeCompartmentOrRegion,this.profileName=r.LocalizedConstants.Instance.profile,this.useDefaultCompartment=r.LocalizedConstants.Instance.useDefaultCompartment,this.currentSelection=r.LocalizedConstants.Instance.currentSelection,this.selectNewCompartment=r.LocalizedConstants.Instance.selectNewCompartment,this.currentRegion=r.LocalizedConstants.Instance.currentRegion,this.selectNewRegion=r.LocalizedConstants.Instance.selectNewRegion,this.applyChanges=r.LocalizedConstants.Instance.applyChanges,this.copyCompartmentname=r.LocalizedConstants.Instance.connUITextCopyConnectionString}}return class{constructor(){this.rootTenancy=t.observable(),this.currentCompartmentName=t.observable(""),this.selectedCompartmentID=t.observable(""),this.currentCompartmentID=t.observable(""),this.selectedCompartmentName="",this.selectedCompartmentFullName="",this.currentCompartmentFullName=t.observable(),this.compartmentArrayTree=[],this.selected=new a.ObservableKeySet,this.expanded=new a.ObservableKeySet,this.data=t.observable(null),this.selectCompartmentLabel="",this.anyCompartmentSelected=t.observable(!1),this.profileName=t.observable(""),this.selectedCompartmentFullNameForDisplay=null,this.selectedCompartmentNameForDisplay=null,this.handlersField=new Map,this.updateConnDataSource=t.observable(""),this.compartmentUILabelTexts=new l,this.themeFileId="ThemeCss",this.themeColorFileId="ThemeColor",this.customThemeTag="customTheme",this.findNode=(e,a)=>{const s=t.isObservable(e)?e():e;for(let e=0;e<s.length;e+=1){if(s[e].id==a)return s[e];if(s[e].children){const t=this.findNode(s[e].children,a);if(t)return t}}},this.onOCIompartmentsDataReceived=e=>{var t=e.data,a=JSON.parse(t.compartmentList),s=t.rootNodeName;if(this.rootTenancy(s),t&&t.compartmentList&&(this.compartmentArrayTree.push(a),this.data(new i(this.compartmentArrayTree,{keyAttributes:"id"}))),t.compartmentToselect){this.anyCompartmentSelected(!0),this.selected.add([t.compartmentToselect]),null!=t.ancestorList&&t.ancestorList.length>0&&(t.ancestorList=t.ancestorList.slice(0,-1),this.expanded.add(t.ancestorList));var n=this.findNode(this.compartmentArrayTree,t.compartmentToselect);this.currentCompartmentID(n.id),this.currentCompartmentName(n.nameForDisplay),this.currentCompartmentFullName(n.fullNameForDisplay)}else this.selected.add([t.rootNodeID]),this.anyCompartmentSelected(!1)},this.selectedChanged=e=>{if(e&&e.detail&&e.detail.value&&e.detail.value&&e.detail.value.values().size>0){var t=[];e.detail.value.values().forEach((function(e){t.push(e)}));var a=this.findNode(this.compartmentArrayTree,t[0]);this.selectedCompartmentID(a.id),this.selectedCompartmentFullName=a.fullPath,this.selectedCompartmentName=a.name,this.selectedCompartmentFullNameForDisplay=a.fullNameForDisplay,this.selectedCompartmentNameForDisplay=a.nameForDisplay}},this.onApplyChanges=()=>{try{o.DataAccessService.instance.logInfo("ApplyChanges handler");var e=new s.MessageBase;e.type=s.MessageName.ociUpdateCompartmentAndRegionMessage;var t=new n.ociUpdateCompartmentAndRegionRequest;t.executionId=o.DataAccessService.instance.currentExecutionId,t.windowUri=o.DataAccessService.instance.windowUri,t.profileName=o.DataAccessService.instance.profileName;let a=this.currentCompartmentID()!==this.selectedCompartmentID(),r=this.currentRegion()!==this.selectedRegion();a&&r?t.updateType=n.CompartmentAndRegionUpdateType.CompartmentAndRegion:a?t.updateType=n.CompartmentAndRegionUpdateType.Compartment:r&&(t.updateType=n.CompartmentAndRegionUpdateType.Region),t.updateType!==n.CompartmentAndRegionUpdateType.CompartmentAndRegion&&t.updateType!==n.CompartmentAndRegionUpdateType.Compartment||(t.rootTenancy=this.rootTenancy(),t.selectedCompartmentFullname=this.selectedCompartmentFullName,t.selectedCompartmentName=this.selectedCompartmentName,t.selectedCompartmentID=this.selectedCompartmentID(),t.saveCompartmentToSetting=null==this.saveDefaultCompartment()||0!=this.saveDefaultCompartment().length,this.anyCompartmentSelected(!0)),t.updateType!==n.CompartmentAndRegionUpdateType.CompartmentAndRegion&&t.updateType!==n.CompartmentAndRegionUpdateType.Region||(t.regionName=this.selectedRegion()),e.data=t;try{o.DataAccessService.instance.send(e),o.DataAccessService.instance.logInfo("Successfully placed ApplyChanges request")}catch(e){o.DataAccessService.instance.logError(e)}}catch(e){o.DataAccessService.instance.logError(e)}},this.currentRegion=t.observable(""),this.regions=t.observableArray(),this.selectedRegion=t.observable(),this.onRegionDataReceived=e=>{var t=e.data;if(t.regionList&&t.regionList.length>0)for(let e=0;e<t.regionList.length;e++)this.regions.push({value:t.regionList[e],label:t.regionList[e]});this.selectedRegion(this.currentRegion())},this.regionChangedHandler=()=>{},this.applyChangesButtonDisabled=t.computed(()=>{let e=!0;return this.currentCompartmentID()===this.selectedCompartmentID()&&this.currentRegion()===this.selectedRegion()||(e=!1),e},this),this.disablePage=t.observable(!1),this.onUpdateCompartmentAndRegionResponse=e=>{var t=e.data;t.upateResult==n.CompartmentAndRegionUpdateType.None?this.disablePage(!0):(t.upateResult!==n.CompartmentAndRegionUpdateType.CompartmentAndRegion&&t.upateResult!==n.CompartmentAndRegionUpdateType.Compartment||(this.currentCompartmentID(t.selectedCompartmentID),this.currentCompartmentName(t.selectedCompartmentNameForDisplay),this.currentCompartmentFullName(t.selectedCompartmentFullnameForDisplay)),t.upateResult!==n.CompartmentAndRegionUpdateType.CompartmentAndRegion&&t.upateResult!==n.CompartmentAndRegionUpdateType.Region||this.currentRegion(t.regionName))},this.onCopyCompartmentname=(e,t,a)=>{try{this.currentCompartmentFullName()&&c.copyToClipBoard(this.currentCompartmentFullName())}catch(e){o.DataAccessService.instance.logError(e)}},m=this,m.saveDefaultCompartment=t.observableArray(),m.handlers=new Map,m.handlers.set(s.MessageName.ociCompartmentResponseMessage,m.onOCIompartmentsDataReceived),m.handlers.set(s.MessageName.ociRegionResponseMessage,m.onRegionDataReceived),m.handlers.set(s.MessageName.ociUpdateCompartmentAndRegionResponse,m.onUpdateCompartmentAndRegionResponse),o.DataAccessService.instance.subscribe(e=>{if(e&&this.handlers.get(e.type)){const t=this.handlers.get(e.type);t&&t(e)}else o.DataAccessService.instance.logError("Could not find handler for message "+e.type)}),o.DataAccessService.instance.logInfo("Fetching Localized resources "),o.DataAccessService.instance.getLocalizedData().done(e=>{o.DataAccessService.instance.logInfo("Fetched localized resources."),r.LocalizedConstants.Instance.Configure(e)}).fail(e=>{o.DataAccessService.instance.logError("Localized resources "+JSON.stringify(e))}),m.getOCICompartments(),m.selectCompartmentLabel=c.stringFormatterCsharpStyle(r.LocalizedConstants.Instance.selectCompartment,o.DataAccessService.instance.profileName),this.profileName(o.DataAccessService.instance.profileName),m.currentRegion(o.DataAccessService.instance.currentRegion),m.getOCIRegion()}get handlers(){return this.handlersField}set handlers(e){this.handlersField=e}getOCICompartments(){o.DataAccessService.instance.logInfo("get oci compartment request received.");var e=new s.MessageBase;e.type=s.MessageName.ociCompartmentRequestMessage;var t=new n.ociCompartmentRequest;t.executionId=o.DataAccessService.instance.currentExecutionId,t.windowUri=o.DataAccessService.instance.windowUri,t.profileName=o.DataAccessService.instance.profileName,e.data=t;try{o.DataAccessService.instance.send(e),o.DataAccessService.instance.logInfo("Successfully placed get oci compartment request")}catch(e){o.DataAccessService.instance.logError(e)}}UpdateCompartment(){try{o.DataAccessService.instance.logInfo("onUpdateCompartment click");var e=new s.MessageBase;e.type=s.MessageName.ociUpdateOCITreeExplorerMessage;var t=new n.ociUpdateTreeExplorerRequest;t.executionId=o.DataAccessService.instance.currentExecutionId,t.windowUri=o.DataAccessService.instance.windowUri,t.rootTenancy=this.rootTenancy(),t.selectedCompartment=this.selectedCompartmentFullName,t.selectedCompartmentID=this.selectedCompartmentID(),t.profileName=o.DataAccessService.instance.profileName,e.data=t,t.saveCompartmentToSetting=null==this.saveDefaultCompartment()||0!=this.saveDefaultCompartment().length,this.anyCompartmentSelected(!0);try{o.DataAccessService.instance.send(e),o.DataAccessService.instance.logInfo("Successfully placed onUpdateCompartment request"),this.currentCompartmentID(this.selectedCompartmentID()),this.currentCompartmentName(this.selectedCompartmentNameForDisplay),this.currentCompartmentFullName(this.selectedCompartmentFullNameForDisplay)}catch(e){o.DataAccessService.instance.logError(e)}}catch(e){o.DataAccessService.instance.logError(e)}}getOCIRegion(){o.DataAccessService.instance.logInfo("get oci Region request received.");var e=new s.MessageBase;e.type=s.MessageName.ociRegionRequestMessage;var t=new n.ociRegionRequest;t.executionId=o.DataAccessService.instance.currentExecutionId,t.windowUri=o.DataAccessService.instance.windowUri,t.profileName=o.DataAccessService.instance.profileName,e.data=t;try{o.DataAccessService.instance.send(e),o.DataAccessService.instance.logInfo("Successfully placed get oci Region request")}catch(e){o.DataAccessService.instance.logError(e)}}UpdateRegion(){try{o.DataAccessService.instance.logInfo("onChangeRegion clicked");var e=new s.MessageBase;e.type=s.MessageName.ociUpdateRegionRequestMessage;var t=new n.ociUpdateRegionRequest;t.executionId=o.DataAccessService.instance.currentExecutionId,t.windowUri=o.DataAccessService.instance.windowUri,t.regionName=this.selectedRegion(),t.profileName=o.DataAccessService.instance.profileName,e.data=t;try{o.DataAccessService.instance.send(e),o.DataAccessService.instance.logInfo("Successfully placed onChangeRegion request"),this.currentRegion(this.selectedRegion())}catch(e){o.DataAccessService.instance.logError(e)}}catch(e){o.DataAccessService.instance.logError(e)}}}}));