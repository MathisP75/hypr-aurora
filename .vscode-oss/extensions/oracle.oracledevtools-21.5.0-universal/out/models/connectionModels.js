"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionInfo = exports.ConnectionPropertiesExtendedModel = exports.ConnectionPropertiesBaseModel = exports.ConnectionAttributesSelection = exports.ProviderDataSourceType = exports.ConnectionBriefInfo = exports.ConnectionInfoPickUpTypeToUse = void 0;
var ConnectionInfoPickUpTypeToUse;
(function (ConnectionInfoPickUpTypeToUse) {
    ConnectionInfoPickUpTypeToUse[ConnectionInfoPickUpTypeToUse["SavedConnectionInfo"] = 0] = "SavedConnectionInfo";
    ConnectionInfoPickUpTypeToUse[ConnectionInfoPickUpTypeToUse["MostRecent"] = 1] = "MostRecent";
    ConnectionInfoPickUpTypeToUse[ConnectionInfoPickUpTypeToUse["New"] = 2] = "New";
})(ConnectionInfoPickUpTypeToUse = exports.ConnectionInfoPickUpTypeToUse || (exports.ConnectionInfoPickUpTypeToUse = {}));
class ConnectionBriefInfo {
}
exports.ConnectionBriefInfo = ConnectionBriefInfo;
var ProviderDataSourceType;
(function (ProviderDataSourceType) {
    ProviderDataSourceType[ProviderDataSourceType["EzConnect"] = 1] = "EzConnect";
    ProviderDataSourceType[ProviderDataSourceType["Direct"] = 2] = "Direct";
    ProviderDataSourceType[ProviderDataSourceType["TnsNames"] = 3] = "TnsNames";
})(ProviderDataSourceType = exports.ProviderDataSourceType || (exports.ProviderDataSourceType = {}));
var ConnectionAttributesSelection;
(function (ConnectionAttributesSelection) {
    ConnectionAttributesSelection[ConnectionAttributesSelection["SavedProfile"] = 0] = "SavedProfile";
    ConnectionAttributesSelection[ConnectionAttributesSelection["Recent"] = 1] = "Recent";
    ConnectionAttributesSelection[ConnectionAttributesSelection["CreateNew"] = 2] = "CreateNew";
    ConnectionAttributesSelection[ConnectionAttributesSelection["CreateNewWithTns"] = 3] = "CreateNewWithTns";
})(ConnectionAttributesSelection = exports.ConnectionAttributesSelection || (exports.ConnectionAttributesSelection = {}));
class ConnectionPropertiesBaseModel {
}
exports.ConnectionPropertiesBaseModel = ConnectionPropertiesBaseModel;
class ConnectionPropertiesExtendedModel extends ConnectionPropertiesBaseModel {
}
exports.ConnectionPropertiesExtendedModel = ConnectionPropertiesExtendedModel;
class ConnectionInfo {
}
exports.ConnectionInfo = ConnectionInfo;
