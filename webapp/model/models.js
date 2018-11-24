sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		getApplicationModel : function(){
			var oApplicationData = {
				"subtype":{
					"enabled" : false,
					"update":{
						"enabled" : false
					}
				}
			};
			return (function(){ var oModel = new JSONModel(); oModel.setData(oApplicationData); return oModel;})();
		}

	};
});