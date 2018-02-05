/**
 * @properties={typeid:24,uuid:"685227D1-FB9C-497C-A991-DC012202DBE5"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	foundset.setSelectedIndex(1);
	
	// Manually update the detail on the first record
	var idx = foundset.getSelectedIndex();
	/** @type {Form<pv_variazione>} */
	var current  = forms[elements.detail_panel.getTabFormNameAt(idx)];

	setDetailStatus(null, current);
	
	forms[elements.navigator.getTabFormNameAt(1)].controller.readOnly = false;
}

/**
 * @AllowToRunInFind
 * 
 * @param {JSForm}	form
 * @param			params
 * @param			layoutParams
 * @param {Boolean}	isMultiple
 * 
 * @properties={typeid:24,uuid:"758895E3-2DA3-4F8C-A87B-B60CF531162D"}
 */
function setBodyElements(form, params, layoutParams, isMultiple)
{
	var fs = foundset;
	if (fs && fs.find())
	{
		fs.idtabrichiestadettagliocondizione = params.idrichieste;
		fs.search();
	}

	elements.detail_panel.removeAllTabs();
	
	var detailPanel = form.getTabPanel('detail_panel');
	var originalWidth, maxWidth;
	
	originalWidth = detailPanel.width;
	maxWidth 	  = detailPanel.width;
		
	// Crea tutti i tab di dettaglio preventivamente
	for(var r = 1; r <= foundset.getSize(); r++)
	{
		var record = foundset.getRecord(r);
		
		var tabParams = globals.copyObject(params, {});
		
		tabParams.requestid 		  = record.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.idtabrichiestadettaglio;
		tabParams.requestcode 		  = record.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.codice;
		tabParams.ruleid			  = record.idtabrichiestadettagliocondizione;
		tabParams.rulecode			  = record.codice;
		tabParams.requesttype         = record.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.tab_richiestedettaglio_to_tab_richieste.codice;
		tabParams.controller		  = globals.PV_Controllers.LAVORATORE;
		tabParams.ammettedecorrenza   = record.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.ammettedecorrenza;
		tabParams.datasource		  = ['ds', tabParams.requestcode, tabParams.rulecode, 'add'].join('_');
		tabParams.ammettemolteplicita = record.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.ammettemolteplicita;
		
		var detailForm = getDetailForm(tabParams);
		var jsForm 	   = detailForm.createRequestForm(tabParams, false, detailForm, getDetailFormName(tabParams, false));
		
		detailPanel.newTab('tab_' + record.idtabrichiestadettagliocondizione, jsForm.name, jsForm);
		
		if(maxWidth < jsForm.width)
			maxWidth = jsForm.width
	}
	
	// Update the width according to the largest detail form
	detailPanel.width = maxWidth;
	
	var variation = maxWidth - originalWidth;
	form.width += variation;
	
	// Update the detail header's width
	var detailHeader 		= form.getLabel('hdr_detail');
		detailHeader.width += variation;
		
	var detailHeaderLabel 	 	 = form.getLabel('lbl_header');
		detailHeaderLabel.width += variation;
		
	// Update the buttons' position
	var cancelButton  = form.getLabel('btn_cancel');
	var confirmButton = form.getLabel('btn_confirm');
	
	cancelButton.x  += variation;
	confirmButton.x += variation;
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"98C81130-066D-45CF-93EF-E3382F25A036"}
 */
function registerListeners(triggerForm)
{
	forms[triggerForm].registerListener
	(
		[globals.Event.ERROR],
		function(error)
		{
			setStatusError(error.message, error.message, 0);
			elements.list_panel.enabled = false;
		}
	);
	
	forms[triggerForm].registerListener
	(
		[globals.Event.WARNING],
		function(warning)
		{
			setStatusWarning(warning.message, warning.message, 0);
			elements.list_panel.enabled = false;
		}
	);
	
	forms[triggerForm].registerListener
	(
		[globals.Event.RESET],
		function(message)
		{
			resetStatus();
			elements.list_panel.enabled = true;
		}
	);
}

/**
 * @properties={typeid:24,uuid:"17C696B8-4A40-4513-9E81-E25084DA0478"}
 */
function getDetailForm(params)
{
	return forms.pv_variazione_lavoratore_dtl;
}

/**
 * @properties={typeid:24,uuid:"1BA98C4E-D814-43D8-AA1C-D7E9CB987642"}
 */
function getDetailFormName(params, multiple)
{
	return forms.pv_seleziona_richiesta_lavoratore_single_variazione.getDetailFormName(params, multiple, false);
}

/**
 * @private
 *
 * @properties={typeid:24,uuid:"E55231B3-C0E3-4DD0-92AF-C51B82AC8AE2"}
 */
function onRecordSelection(event, form) 
{
	// Update the detail form
	updateDetail();
}

/**
 * @properties={typeid:24,uuid:"1B2F7084-0DE2-4838-B114-5EC497737B6E"}
 */
function updateDetail()
{
	elements.detail_panel.tabIndex = 'tab_' + foundset.idtabrichiestadettagliocondizione;
	
	var currentIndex = elements.detail_panel.tabIndex;
	registerListeners(elements.detail_panel.getTabFormNameAt(currentIndex));
	
	forms[elements.detail_panel.getTabFormNameAt(currentIndex)].controller.focusFirstField();
}

/**
 * @properties={typeid:24,uuid:"E5C2F89C-5EB3-4903-AF78-1E5E929391D7"}
 */
function createRequestForm(params, multiple, extendsForm, formName, data, layoutParams)
{
	var form = solutionModel.getForm(formName);
	if(!form)
		form = solutionModel.newForm(formName, solutionModel.getForm(extendsForm.controller.getName()));
	
	form = setBodyElements(form, params, layoutParams, multiple);
	form = setFooterElements(form, params, layoutParams, multiple);
		
	if(form)
		forms[form.name]['vParams'] = params;
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"F239A7DD-7197-43D0-9E8C-E05A72F6624C"}
 */
function gotoEdit()
{
	_super.gotoEdit();
	
	// For some reason, the second time you open the form the detail
	// stays in read-only mode
	var index      = elements.detail_panel.tabIndex;
	var detailForm = elements.detail_panel.getTabFormNameAt(index);
	if(forms[detailForm].controller.readOnly)
		forms[detailForm].controller.readOnly = false;
}

/**
 * @properties={typeid:24,uuid:"0E052280-FE3C-4284-A44C-8CA05077F576"}
 */
function creaRichiesta(fs, params)
{
	try
	{		
		// Call the save method for each record
		for(var r = 1; r <= fs.getSize(); r++)
		{
			/** @type {Form<pv_variazione>} */
			var form = forms[elements.detail_panel.getTabFormNameAt(r)];
			var editedRecords = databaseManager.getEditedRecords(form.foundset);
			
			if(!globals.ma_utl_isNullOrEmpty(editedRecords) && editedRecords[0].getChangedData().getMaxRowIndex() > 0)
				if(form.creaRichiesta(form.foundset, form.vParams).returnValue === -1)
					return -1;
		}
	
		return 0;
	}
	catch(ex)
	{
		logAndShowGenericError(ex);
		return -1;
	}
}

/**
 * @properties={typeid:24,uuid:"563620D5-F0C4-4E9A-A8A2-6E2E8D26ED27"}
 */
function dc_save_pre(fs)
{
	var answer = globals.ma_utl_showYesNoQuestion(i18n.getI18NMessage('i18n:ma.msg.save_all') + '\n<strong>Le richieste non compilate saranno ignorate.</strong>');
	return answer ? _super.dc_save_pre(fs) : -1;
}

/**
 * @properties={typeid:24,uuid:"9438377D-2282-45F4-A8F7-17764621DB9D"}
 */
function dc_save_validate(fs, program)
{
	// Call the validate method for each record
	for(var r = 1; r <= fs.getSize(); r++)
	{
		/** @type {Form<pv_variazione>} */
		var form = forms[elements.detail_panel.getTabFormNameAt(r)];
		var editedRecords = databaseManager.getEditedRecords(form.foundset);
		
		if(!globals.ma_utl_isNullOrEmpty(editedRecords) && editedRecords[0].getChangedData().getMaxRowIndex() > 0)
		{
			if (form.dc_save_validate(form.foundset, program) === -1)
			{
				// Go to the record and stop the save
				fs.setSelectedIndex(r);
				return -1;
			}
		}
	}
	
	return 0;
}

/**
 * Callback method when the user changes tab in a tab panel or divider position in split pane.
 *
 * @param {Number} previousIndex index of tab shown before the change
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"D575465D-A517-434D-8954-1206860BAD47"}
 */
function onDetailChange(previousIndex, event)
{
	var idx = elements.detail_panel.tabIndex;
	/** @type {Form<pv_variazione>} */
	var current  = forms[elements.detail_panel.getTabFormNameAt(idx)];
	/** @type {Form<pv_variazione>} */
	var previous = forms[elements.detail_panel.getTabFormNameAt(previousIndex)];
	
	setDetailStatus(previous, current)
}

/**
 * @param {Form<pv_variazione>} previous
 * @param {Form<pv_variazione>} current
 *
 * @properties={typeid:24,uuid:"D83047AB-F38D-4F3C-840C-621F643915F9"}
 */
function setDetailStatus(previous, current)
{
	if(current)
		globals.ma_utl_setStatus(globals.nav.mode, current.controller.getName(), current.vParams.requiredfields);
	
	if(previous)
		globals.ma_utl_setStatus(globals.Status.BROWSE, previous.controller.getName(), null, null, true);
}
