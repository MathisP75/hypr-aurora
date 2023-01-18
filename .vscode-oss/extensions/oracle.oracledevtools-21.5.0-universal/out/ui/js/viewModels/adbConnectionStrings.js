define(["require","exports","knockout","ojs/ojarraydataprovider","../common/autonomousDBModels","../common/scriptExecutionModels","../common/dataAccessService","../common/localizedConstants","../utilities","ojs/ojradioset","ojs/ojlabelvalue","ojs/ojlabel","ojs/ojselectcombobox","ojs/ojbutton","ojs/ojtable","ojs/ojknockout","ojs/ojgauge","ojs/ojinputtext","ojs/ojformlayout"],(function(require,e,t,n,i,s,o,a,c){"use strict";let r;class l{constructor(){this.copyToClipBoard=a.LocalizedConstants.Instance.connUITextCopyConnectionString,this.authentication=a.LocalizedConstants.Instance.authentication,this.getTLSconnectionStrings=a.LocalizedConstants.Instance.getTLSconnectionStrings,this.tnsNames=a.LocalizedConstants.Instance.tnsNames,this.userName=a.LocalizedConstants.Instance.connUIPlaceHolderUserId,this.password=a.LocalizedConstants.Instance.pswdStr,this.ociOK=a.LocalizedConstants.Instance.OK,this.getConnectonStringErrMsg1=a.LocalizedConstants.Instance.getConnectonStringErrMsg1,this.getConnectonStringErrMsg2=a.LocalizedConstants.Instance.getConnectonStringErrMsg2,this.requiredText="*",this.selectTLSconnectionStrings=a.LocalizedConstants.Instance.selectTLSconnectionStrings,this.connectionString=a.LocalizedConstants.Instance.connectionString,this.mtlsAuthenticationDescription=a.LocalizedConstants.Instance.downloadCredentialFileDescription}}return class{constructor(e){this.tlsAuthenticationTypes=t.observableArray([{value:i.TLSAuthenticationType.MutalTLS,label:a.LocalizedConstants.Instance.mutualTLSConnection},{value:i.TLSAuthenticationType.TLS,label:a.LocalizedConstants.Instance.tlsConnection}]),this.tnsNames=t.observableArray(),this.tnsName=t.observable(),this.connectionString=t.observable(),this.tlsAuthenticationType=t.observable(i.TLSAuthenticationType.None),this.isDedicatedDB=!1,this.showTLSAuthenticationPage=t.observable(),this.connectionProfiles=new Array,this.adbConnectionUILabels=new l,this.handlersField=new Map,this.launchFromConnectionContextMenu=t.observable(),this.headerText=t.observable(),this.errorInFetchConnectionString=t.observable(!1),this.firstLineErrorInFetchConnectionString=t.observable(!1),this.secondLineErrorInFetchConnectionString=t.observable(!1),this.getConnectionStringErrorMesageFirstLine=t.observable(""),this.getConnectionStringErrorMesageSecondLine=t.observable(""),this.showMTLSAuthenticationDescription=t.observable(!1),this.onADBConnectionStringsDataReceived=e=>{var t=e.data;if(this.launchFromConnectionContextMenu()?this.headerText(this.adbConnectionUILabels.selectTLSconnectionStrings):($("#getConnectionStringsID").addClass("connDlgBody"),$("#getConnectionStringsID").css("max-width","700px"),this.headerText(this.adbConnectionUILabels.getTLSconnectionStrings),this.showTLSAuthenticationPage(1==t.isDedicated)),t.errorMessage&&t.errorMessage.length>0){this.errorInFetchConnectionString(!0);let e=t.errorMessage.split("\n");if(e&&e.length>0){for(let t=0;t<e.length;t++)if(e[t].length>0){if(0==t){this.firstLineErrorInFetchConnectionString(!0),this.getConnectionStringErrorMesageFirstLine(e[t]);continue}this.secondLineErrorInFetchConnectionString(!0),this.getConnectionStringErrorMesageSecondLine(this.getConnectionStringErrorMesageSecondLine()+e[t])}}else this.getConnectionStringErrorMesageFirstLine(t.errorMessage)}else this.connectionProfiles=[],this.connectionProfiles=t.connectionProfiles,this.isDedicatedDB=t.isDedicated,t.tlsAuthenticationType&&t.tlsAuthenticationType!=i.TLSAuthenticationType.None&&(this.tlsAuthenticationType(t.tlsAuthenticationType==i.TLSAuthenticationType.MutalTLS?i.TLSAuthenticationType.MutalTLS:i.TLSAuthenticationType.TLS),this.adbAuthenticationType=t.tlsAuthenticationType,this.showMTLSAuthenticationDescription(t.tlsAuthenticationType==i.TLSAuthenticationType.MutalTLS),this.showTLSAuthenticationPage(!0)),t.connectionProfiles.forEach(e=>{(t.isDedicated||!t.isDedicated&&e.tlsAuthentication==t.tlsAuthenticationType)&&this.tnsNames.push({value:e.displayName,label:e.displayName})}),this.tnsNames&&this.tnsNames()&&this.tnsNames().length>0&&this.tnsName(this.tnsNames()[0].value),this.connectionString(this.getConnectionString(this.tlsAuthenticationType(),this.tnsName()))},this.OnAuthenticationChange=(e,t)=>{e&&e.detail&&(this.tnsNames.removeAll(),this.connectionProfiles.forEach(t=>{t.tlsAuthentication==e.detail.value&&this.tnsNames.push({value:t.displayName,label:t.displayName})}),this.connectionString(this.getConnectionString(e.detail.value,this.tnsName())))},this.OnTNSNameChange=(e,t)=>{e&&e.detail&&this.connectionString(this.getConnectionString(this.tlsAuthenticationType(),e.detail.value))},this.onCopyConnectionString=(e,t,n)=>{try{this.connectionString()&&c.copyToClipBoard(this.connectionString())}catch(e){o.DataAccessService.instance.logError(e)}},this.onOk=e=>{this.tlsAuthenticationType()==i.TLSAuthenticationType.MutalTLS?this.launchDownLoadCredentialFilesUIHandler(this.tnsName(),i.NewConnectionUIToDisplay.DownloadWalletfileWhileMakingConnection):this.launchDBConnectionHandler(s.ConnectionType.Advanced,this.connectionString())},this.dataProvider=new n(this.connectionProfiles,{keyAttributes:"displayName"}),r=this,e&&e.launchFromConnectionContextMenu&&"yes"==e.launchFromConnectionContextMenu?(this.launchFromConnectionContextMenu(!0),this.launchDBConnectionHandler=e.launchDBConnectionHandler,this.launchDownLoadCredentialFilesUIHandler=e.launchDownLoadCredentialFilesUIHandler):this.launchFromConnectionContextMenu(!1),r.handlers=new Map,r.handlers.set(s.MessageName.ociGetConnectionstringsResponseMessage,r.onADBConnectionStringsDataReceived),o.DataAccessService.instance.subscribe(e=>{if(e&&this.handlers.get(e.type)){const t=this.handlers.get(e.type);t&&t(e)}else o.DataAccessService.instance.logError("Could not find handler for message "+e.type)}),o.DataAccessService.instance.logInfo("Fetching Localized resources "),o.DataAccessService.instance.getLocalizedData().done(e=>{o.DataAccessService.instance.logInfo("Fetched localized resources."),a.LocalizedConstants.Instance.Configure(e)}).fail(e=>{o.DataAccessService.instance.logError("Localized resources "+JSON.stringify(e))}),r.getADBConnectionStrings()}get handlers(){return this.handlersField}set handlers(e){this.handlersField=e}getConnectionString(e,t){let n="";for(let i=0;i<this.connectionProfiles.length;i++){const s=this.connectionProfiles[i];if(this.isDedicatedDB&&t==s.displayName||!this.isDedicatedDB&&t==s.displayName&&s.tlsAuthentication==e){n=s.connectionString;break}}return n}getADBConnectionStrings(){o.DataAccessService.instance.logInfo("get oci compartment request received.");var e=new s.MessageBase;e.type=s.MessageName.ociGetConnectionstringsRequestMessage;var t=new i.ociADBConnectionStringsRequest;t.executionId=o.DataAccessService.instance.currentExecutionId,t.windowUri=o.DataAccessService.instance.windowUri,t.profileName=o.DataAccessService.instance.profileName,t.adbDatabaseID=o.DataAccessService.instance.adbDatabaseID,t.workloadType=o.DataAccessService.instance.adbWorkLoadType,e.data=t;try{o.DataAccessService.instance.send(e),o.DataAccessService.instance.logInfo("Successfully placed to get connection strings request")}catch(e){o.DataAccessService.instance.logError(e)}}}}));