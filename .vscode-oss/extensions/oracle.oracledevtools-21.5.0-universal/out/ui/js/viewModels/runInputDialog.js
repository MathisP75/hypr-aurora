define(["require","exports","knockout","ojs/ojarraydataprovider","ojs/ojcontext","../common/dataAccessService","../common/localizedConstants","../common/models","../common/scriptExecutionModels","ojs/ojbutton","ojs/ojoption","ojs/ojprogress","ojs/ojselectcombobox","ojs/ojtable"],(function(require,e,t,a,i,r,s,n,o){"use strict";class u{constructor(e){if(this.rawData=t.observableArray([]),this.gridMode=t.observable(),this.editRow=t.observable({rowIndex:-1}),this.directions=t.observableArray([{value:o.Direction.IN,label:o.Direction.IN},{value:o.Direction.OUT,label:o.Direction.OUT},{value:o.Direction.IN_OUT,label:o.Direction.IN_OUT}]),this.predefinedValues=t.observableArray([{value:u.NULL_VALUE,label:s.LocalizedConstants.Instance.nullDisplayString}]),this.moreValues=t.observableArray([{value:u.DEFAULT_VALUE,label:s.LocalizedConstants.Instance.defaultDisplayString},{value:u.NULL_VALUE,label:s.LocalizedConstants.Instance.nullDisplayString}]),this.selectText=e=>{if(e.target){let t=e.target,a=document.getElementById(t.id+"|input");a&&a.select()}},this.handleFocus=()=>{const e=document.getElementById("table");e&&e.currentRow&&(-1===e.currentRow.rowIndex?this.editRow({rowIndex:0}):this.editRow(e.currentRow))},this.handleEditRow=(e,t)=>{this.editRow({rowKey:t.key})},this.valueChangeHandler=(e,t)=>{const a=e.detail,i=t.row;"option_selected"===a.trigger||"blur"===a.trigger?i.hasDefault&&i.value.toString()===u.DEFAULT_VALUE?(i.useDefaultValueForBinding=!0,i.useNullValueForBinding=!1,i.value=s.LocalizedConstants.Instance.defaultDisplayString):i.value.toString()===u.NULL_VALUE?(i.useDefaultValueForBinding=!1,i.useNullValueForBinding=!0,this.inputArgs.parameters.operationName!==o.OperationName.BindVariableInput&&(i.value=s.LocalizedConstants.Instance.nullDisplayString)):(i.useDefaultValueForBinding=!1,i.useNullValueForBinding=!1):(i.useDefaultValueForBinding=!1,i.useNullValueForBinding=!1)},this.onFetchData=(e,t,a)=>{const i=new o.ScriptExecutionDataBatchRequest;i.ownerUri=this.inputArgs.parameters.ownerUri,i.queryId=this.inputArgs.parameters.queryId,i.executionId=this.inputArgs.parameters.executionId,i.startIndex=1,i.endIndex=i.startIndex+r.DataAccessService.instance.dataBatchSize,i.queryResultId=t.row.queryResultId,i.bindVariableName=t.row.name,i.isImplicitRefCursor=t.row.isImplicitRefCursor,i.batchId=1,r.DataAccessService.instance.logInfo("Fetching data batch");try{r.DataAccessService.instance.getDataBatch(i),r.DataAccessService.instance.logInfo("Successfully placed batch request for "+JSON.stringify(i))}catch(e){r.DataAccessService.instance.logError(e)}e.currentTarget.disabled=!0},this.validateUserInput=()=>{const e=new o.UserInputParams;return e.queryId=this.inputArgs.parameters.queryId,e.ownerUri=this.inputArgs.parameters.ownerUri,e.executionId=this.inputArgs.parameters.executionId,e.operationName=this.inputArgs.parameters.operationName,e.inputVariables=this.rawData(),this.inputArgs.parameters.operationName===o.OperationName.BindVariableInput&&e.inputVariables.forEach(e=>{e&&e.value.toString()===u.NULL_VALUE&&(e.useDefaultValueForBinding=!1,e.useNullValueForBinding=!0)}),r.DataAccessService.instance.sendUserInput(e),r.DataAccessService.instance.logInfo("ValuesSentToServer "+JSON.stringify(e.inputVariables)),!0},this.inputArgs=e,this.inputArgs){this.inputArgs.isInputValid=this.validateUserInput,this.inputArgs.onOk=()=>this.validateUserInput(),this.inputArgs.onCancel=()=>{const e=new o.UserInputParams;return e.queryId=this.inputArgs.parameters.queryId,e.ownerUri=this.inputArgs.parameters.ownerUri,e.executionId=this.inputArgs.parameters.executionId,e.inputVariables=this.rawData(),e.cancelScript=!0,r.DataAccessService.instance.sendUserInput(e),r.DataAccessService.instance.logInfo("ValuesSentToServer "+JSON.stringify(e.inputVariables)),!0},this.mode=e.mode,this.inputArgs.parameters&&this.inputArgs.parameters.inputVariables&&(this.rawData=this.populate(this.inputArgs.parameters.inputVariables)),this.dataSource=new a(this.rawData,{keyAttributes:"name"}),this.mode===n.ParametersUIMode.TakeParameters?this.gridMode("rowEdit"):this.gridMode("none"),this.displayColumns=this.popultaeColumndata(),this.datatypes=this.getDataTypeList();i.getPageContext().getBusyContext().whenReady().then(()=>{this.editRow({rowIndex:0})})}}getDataTypeList(){const e=t.observableArray();return n.PLSQLDataTypes10G.instance.datatypes.forEach((t,a)=>{e.push({value:a,label:t})}),e}popultaeColumndata(){const e=t.observableArray([]),a=new o.ColumnInfo(0,"name");if(a.template="nameTemplate",a.headerText="Name",a.weight=1,e.push(a),this.inputArgs.parameters.operationName!==o.OperationName.BindVariableInput){const t=new o.ColumnInfo(1,"direction");t.template="directionTemplate",t.headerText="Direction",t.weight=1,e.push(t);const a=new o.ColumnInfo(2,"dataType");a.template="typeTemplate",a.headerText="Type",a.weight=1,e.push(a)}const i=new o.ColumnInfo(3,"value");return this.mode===n.ParametersUIMode.DisplayOutput?i.template="cursorTemplate":i.template="valueTemplate",i.headerText="Value",i.weight=1,e.push(i),e}convertValue(e){return e.value.toString()===u.DEFAULT_VALUE?s.LocalizedConstants.Instance.defaultDisplayString:e.value.toString()===u.NULL_VALUE?s.LocalizedConstants.Instance.nullDisplayString:e.value}populate(e){const a=t.observableArray([]);return e.forEach(e=>{this.mode===n.ParametersUIMode.TakeParameters&&(this.inputArgs.parameters.operationName===o.OperationName.BindVariableInput&&e.value?(e.useDefaultValueForBinding=!1,e.useNullValueForBinding=!1,e.value=e.value):e.hasDefault?(e.useDefaultValueForBinding=!0,e.useNullValueForBinding=!1,e.value=u.DEFAULT_VALUE):(e.useDefaultValueForBinding=!1,e.useNullValueForBinding=!0,e.value=u.NULL_VALUE)),this.mode===n.ParametersUIMode.TakeParameters||this.mode===n.ParametersUIMode.DisplayInput?e.direction!==o.Direction.OUT&&a.push(e):this.mode===n.ParametersUIMode.DisplayOutput&&(e.direction!==o.Direction.OUT&&e.direction!==o.Direction.IN_OUT&&e.direction!==o.Direction.RETURN_VALUE||a.push(e))}),a}}return u.NULL_VALUE="NULL-5D243FA1-4CA8-4343-9F8A-227C1567CD86",u.DEFAULT_VALUE="DEAFULT-43D33D00-6CBE-4A48-BA0A-1B7D1A0C0353",u}));