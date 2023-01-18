define(["require","exports","knockout","../common/scriptExecutionModels","../common/dataAccessService","../common/localizedConstants","../common/autonomousDBModels","ojs/ojcore","ojs/ojcheckboxset","jquery","ojs/ojtreeview","ojs/ojarraytreedataprovider","ojs/ojbutton","ojs/ojknockout","ojs/ojinputtext","ojs/ojlabel","ojs/ojprogress","ojs/ojformlayout","ojs/ojselectcombobox","ojs/ojmessage","ojs/ojmessages","ojs/ojnavigationlist","ojs/ojcollapsible","ojs/ojlabelvalue","ojs/ojdialog","ojs/ojprogress-circle"],(function(require,e,n,t,s,o,i){"use strict";let a;class c{constructor(){this.pswdPattern=o.LocalizedConstants.Instance.pswdPatternForDownloadWalletFile,this.pswdMismatch=o.LocalizedConstants.Instance.pswdMismatch,this.walletFileLocation=o.LocalizedConstants.Instance.connUIPlaceHolderWalletFileLocation,this.tnsAdminLocation=o.LocalizedConstants.Instance.connUIPlaceHolderTnsAdminLocation,this.browse=o.LocalizedConstants.Instance.connUITextBrowse,this.ociReplaceExistingFiles=o.LocalizedConstants.Instance.ociReplaceExistingFiles,this.ociSkipExistingFiles=o.LocalizedConstants.Instance.ociSkipExistingFiles,this.ociCancel=o.LocalizedConstants.Instance.cancelQueryText,this.ociCopyCredentialsFileHeading=o.LocalizedConstants.Instance.ociCopyCredentialsFileHeading,this.ociFileAlreadtExists=o.LocalizedConstants.Instance.ociFileAlreadyExists,this.ociFilePath=o.LocalizedConstants.Instance.ociFilePath,this.ociOK=o.LocalizedConstants.Instance.OK,this.downloadWalletFileCheckboxLabel=o.LocalizedConstants.Instance.downloadWalletFileCheckboxLabel,this.downlaodCredentialFile=o.LocalizedConstants.Instance.downloadCredentialFile,this.useDefaultDBFileName=o.LocalizedConstants.Instance.appendDatabaseName,this.downLoad=o.LocalizedConstants.Instance.download,this.walletType=o.LocalizedConstants.Instance.walletType,this.password=o.LocalizedConstants.Instance.pswdStr,this.requiredText="*",this.confirmpassword=o.LocalizedConstants.Instance.confirmPswd,this.specifyPassword=o.LocalizedConstants.Instance.specifyPassword,this.createADBConnectionCaption=o.LocalizedConstants.Instance.downloadCredentialFileForConnection}}return class{constructor(){this.adbConnectionUILabelTexts=new c,this.newConnectionUIToDisplay=n.observable(i.NewConnectionUIToDisplay.DownloadWalletfileWhileMakingConnection),this.walletFileLocation=n.observable(""),this.connectionType=n.observable(t.ConnectionType.TNS),this.connectionString=n.observable(""),this.isDedicatedDB=n.observable(!1),this.messageHandlersField=new Map,this.launchDBConnectionHandler=(e,n)=>{this.connectionType(e),this.newConnectionUIToDisplay(i.NewConnectionUIToDisplay.NormalDB),this.connectionString(n)},this.updateWalletFilePathHandler=e=>{this.walletFileLocation(e)},this.launchDBConnectionPageHandler=e=>{this.newConnectionUIToDisplay(e),this.connectionType(t.ConnectionType.TNS)},this.tnsName="",this.tlsEnbledNMutualAuthentication=!1,this.launchDownLoadCredentialFilesUIHandler=(e,n)=>{this.tnsName=e,this.tlsEnbledNMutualAuthentication=!0,this.newConnectionUIToDisplay(n)},this.themeFileId="ThemeCss",this.themeColorFileId="ThemeColor",this.customThemeTag="customTheme",this.createADBConnectionCaption=o.LocalizedConstants.Instance.downloadCredentialFileForConnection,this.pageinitialized=!1,a=this,a.messageHandlers=new Map,s.DataAccessService.instance.subscribe(e=>{if(e&&this.messageHandlers.get(e.type)){const n=this.messageHandlers.get(e.type);n&&n(e)}else s.DataAccessService.instance.logError("Could not find handler for message "+e.type)}),this.initialize(),s.DataAccessService.instance.logInfo("Fetching Localized resources "),s.DataAccessService.instance.getLocalizedData().done(e=>{s.DataAccessService.instance.logInfo("Fetched localized resources."),o.LocalizedConstants.Instance.Configure(e)}).fail(e=>{s.DataAccessService.instance.logError("Localized resources "+JSON.stringify(e))})}get messageHandlers(){return this.messageHandlersField}set messageHandlers(e){this.messageHandlersField=e}initialize(){this.walletFileLocation(s.DataAccessService.instance.walletLocation),this.isDedicatedDB(s.DataAccessService.instance.isDedicatedDb),s.DataAccessService.instance.displayMode==t.UIDisplayMode.AutonomousDatabaseConnectionManagement?this.isDedicatedDB()?this.newConnectionUIToDisplay(i.NewConnectionUIToDisplay.DownloadWalletfileWhileMakingConnection):s.DataAccessService.instance.tlsAuthenticationType==i.TLSAuthenticationType.TLS?this.newConnectionUIToDisplay(i.NewConnectionUIToDisplay.TLSAuthentication):this.newConnectionUIToDisplay(i.NewConnectionUIToDisplay.DownloadWalletfileWhileMakingConnection):this.newConnectionUIToDisplay(i.NewConnectionUIToDisplay.DownCredentialsfile),this.pageinitialized=!0}}}));