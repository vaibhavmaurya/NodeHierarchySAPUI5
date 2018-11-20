sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"iot/ma/iot/tree",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter'
], function (Controller, Tree, Fragment, Filter) {
	"use strict";

	return Controller.extend("IOT.HierarchyModule.controller.main", {
		onInit: function () {

		},

		onAfterRendering: function () {
			"use strict";
			var sDynamicId = this.getView().byId("dynamicPageId").getId();
			var oDynamicSpacer = $("#" + sDynamicId + "-spacer");
			var oDynamicContent = $("#" + sDynamicId + "-contentFitContainer");
			var self = this;
			var fnCallback = function (oEvent) {
				this._oTree = new Tree({
					contentWidth: oDynamicSpacer.width() + "px",
					contentHeight: (oDynamicContent.height() - 10) + "px",
					openNodeMenu: self.handleOpenNodeActionMenu.bind(self)
					// height: "100%"

				});
				this.getView().byId("dynamicPageId").setContent(this._oTree);
			};
			fnCallback = fnCallback.bind(this);
			this.getView().getModel().attachRequestCompleted(fnCallback);
		},

		handleValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			this.inputId = oEvent.getSource().getId();
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"IOT.HierarchyModule.fragment.Dialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"name",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Name",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var oData = JSON.parse(this.getView().getModel().getJSON());
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);

			this._oTree.setData(oData["SubTypeTree"][oSelectedItem.getDescription()]);
		},

		onTypeChange: function (oEvent) {
			"use strict";
		},
		
		handleOpenNodeActionMenu: function (oEvent) {
			// create action sheet only once
			var oNode = oEvent.getParameter("node");
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"IOT.HierarchyModule.fragment.ActionSheet",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oNode);
		},
	});
});