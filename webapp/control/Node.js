sap.ui.define("iot/ma/iot/node",["sap/ui/thirdparty/d3"], function (d3Object) {

	var oNode = sap.ui.core.Control.extend("iot.ma.iot.node", {
		metadata: { // the Control API
			properties: {
				"name": "string" // setter and getter are created behind the scenes, 
					// including data binding and type validation
			}
		},

		renderer: function (oRm, oControl) { // the part creating the HTML
			oRm.write("<span>Hello ");
			oRm.writeEscaped(oControl.getName()); // write the Control property 'name', with XSS protection
			oRm.write("</span>");
		}
	});
	return oNode;

});