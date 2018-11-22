sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"iot/ma/iot/tree",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/ui/layout/HorizontalLayout',
	'sap/ui/layout/VerticalLayout',
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Input'
], function (Controller, Tree, Fragment, Filter, HorizontalLayout, VerticalLayout, Button, Dialog, Label, MessageToast, Input) {
	"use strict";

	return Controller.extend("IOT.HierarchyModule.controller.main", {
		onInit: function () {

		},

		onAfterRendering: function () {
			"use strict";
			var self = this;
			var fnCallback = function (oEvent) {
				this._oTree = new Tree({
					pressNode: self.handleOpenNodeActionMenu.bind(self),
					expandOnClick:false
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

		onSubTypeChange: function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			var oData = JSON.parse(this.getView().getModel().getJSON());
			this._oTree.setData(oData["SubTypeTree"][oSelectedItem.getKey()]);
		},

		onTypeChange: function (oEvent) {
			"use strict";
			var oTypeContext = oEvent.getParameter("selectedItem").getBindingContext();
			var aSubTypes = oTypeContext.getProperty(oTypeContext.getPath())["subtypes"];
			this.getView().getModel().setProperty("/subtypes",aSubTypes);
			
		},

		handleOpenNodeActionMenu: function (oEvent) {
			// create action sheet only once
			var oNode = oEvent.getParameter("node");
			this._SelectedNode = oEvent.getParameter("nodeData");
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"IOT.HierarchyModule.fragment.ActionSheet",
					this
				);
				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oNode);
		},

		onActionCreate: function () {
			this.onConfirmDialog();
		},
		
		onActionToggle : function(){
			this._oTree.toggleNode();
		},

		onActionDelete : function(){
			this._oTree.deleteNode();
		},
		
		onConfirmDialog: function () {
			var self = this;
			var dialog = new Dialog({
				title: 'Create Node',
				type: 'Message',
				content: [
					new Input('confirmDialogTextarea', {
						placeholder: 'Enter Node'
					})
				],
				beginButton: new Button({
					text: 'Submit',
					press: function () {
						var sText = sap.ui.getCore().byId('confirmDialogTextarea').getValue();
						if (sText) {
							self._oTree.addNode(sText);
						}
						dialog.close();
					}
				}),
				endButton: new Button({
					text: 'Cancel',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});

			dialog.open();
		}
	});
});