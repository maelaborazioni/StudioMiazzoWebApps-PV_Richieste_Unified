/**
 * Perform the element right-click action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"149BAB84-FC74-4E49-9D7C-729F5589E6D0"}
 */
function onRowRightClick(event) 
{
	// verifichiamo se siamo nel caso utente
	var isUtente = false;
	var frm = forms.pvs_richieste_lavoratore_filter_single_dtl;
	if(solutionModel.getForm(frm.controller.getName())
	   && frm.vIdLavoratoreSingolo)
		isUtente = true;
	
	/**
	 * Disabilita la modifica e la rettifica nel caso utente. 
	 * Disabilita la modifica se già inviata.
	 * Disabilita la rettifica se già rettifica.
	 */
	var editEnabled          = !isUtente && (tiporettifica === globals.TipoRettifica.NESSUNA && status_code === globals.RequestStatus.SUSPENDED);
	var restoreEnabled       = !isUtente && (!editEnabled && !rettificaper && (in_annullamento || in_rettifica));
	var cancelRectifyEnabled = !isUtente && (!editEnabled && !(in_annullamento || in_rettifica) && lavoratori_richieste_to_tab_statooperazioni.ammetterettifica == 1);
	
	var showMenu = editEnabled || restoreEnabled || cancelRectifyEnabled;
	if(!showMenu)
		return;
	
	var contextMenu = plugins.window.createPopupMenu();
	
	if(restoreEnabled)
	{
		var restoreMenuItem = contextMenu.addMenuItem('Ripristina', restoreRequest);
			restoreMenuItem.methodArguments = [idlavoratorerichiesta];
			restoreMenuItem.enabled = true;
	}
	else
	if(cancelRectifyEnabled)
	{
		var cancelMenuItem 		    = contextMenu.addMenuItem('Annulla', cancelRequest);
			cancelMenuItem.enabled  = true;
			cancelMenuItem.methodArguments = [idlavoratorerichiesta];
		var rectifyMenuItem 	    = contextMenu.addMenuItem('Rettifica', rectifyRequest);
			rectifyMenuItem.enabled = true;
			rectifyMenuItem.methodArguments = [idlavoratorerichiesta];
	}
	else
	if(editEnabled)
	{
		contextMenu.addSeparator();
		var editMenu    = contextMenu.addMenuItem('Modifica', editRequest  );
		var deleteMenu  = contextMenu.addMenuItem('Elimina' , deleteRequest);
			deleteMenu.methodArguments = [event];
		
		deleteMenu.enabled = editMenu.enabled = editEnabled;
	}
	
	if(event.getSource() !== null)
		contextMenu.show(event.getSource());
}

/**
 * @properties={typeid:24,uuid:"79B88007-CEC6-4EE8-801F-2975D6881F44"}
 */
function cancelRequest(itemInd, parItem, isSel, parMenTxt, menuTxt, requestid)
{
	var parentForm = forms[globals.ma_utl_getParentForm(controller.getName())];
	return parentForm['cancelRequest'](requestid);
}

/**
 * @properties={typeid:24,uuid:"F654ED1D-1578-4DD0-A726-77AFB6E96DC8"}
 */
function rectifyRequest(itemInd, parItem, isSel, parMenTxt, menuTxt, requestid)
{
	var parentForm = forms[globals.ma_utl_getParentForm(controller.getName())];
	return parentForm['rectifyRequest'](requestid);
}

/**
 * @properties={typeid:24,uuid:"1A5E24D4-41D0-46BD-92E6-B4DF4DCAD86F"}
 */
function restoreRequest(itemInd, parItem, isSel, parMenTxt, menuTxt, requestid)
{
	var parentForm = forms[globals.ma_utl_getParentForm(controller.getName())];
	return parentForm['restoreRequest'](requestid);
}

/**
 * @properties={typeid:24,uuid:"66695022-06FE-40D7-B644-9AF4A958902E"}
 */
function deleteRequest(itemInd, parItem, isSel, parMenTxt, menuTxt, event)
{
	var parentForm = forms[globals.ma_utl_getParentForm(controller.getName())];
	return parentForm['dc_delete'](event, event.getFormName());
}

/**
 * @properties={typeid:24,uuid:"EECC585F-AA23-4F69-9DDC-EEA6FA92877A"}
 */
function editRequest(itemInd, parItem, isSel, parMenTxt, menuTxt, requestid)
{
	var parentForm = forms[globals.ma_utl_getParentForm(controller.getName())];
	return parentForm['editRequest']();
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"4908767F-BE25-4CCC-9E9A-5D1E28689AEC"}
 */
function onRowRender(event) 
{
	/** @type {JSRecord<db:/ma_richieste/lavoratori_richieste>} */
	var record     = event.getRecord();
	var renderable = event.getRenderable();
	
	if(!record || !renderable)
		return;
	
	/**
	 * Mantieni la colorazione per i record selezionati
	 */
	if(event.isRecordSelected())
	{
		renderable.bgcolor = globals.Colors.SELECTED.background;
		renderable.fgcolor = globals.Colors.SELECTED.foreground;
		return;
	}
	
	/**
	 * Colora le rettifiche non valide, ovvero scadute/annullate/rettificate
	 */
	switch(record.status_code)
	{
		case globals.RequestStatus.EXPIRED:
		case globals.RequestStatus.CANCELED:
		case globals.RequestStatus.OVERWRITTEN:
			renderable.bgcolor = globals.Colors.DISABLED.background;
			renderable.fgcolor = globals.Colors.DISABLED.foreground;
			return;
	}
	
	/**
	 * Colora le richieste da rettificare/da annullare. Basta sapere se sono rettificate
	 * perché, se le rettifiche fossero inviate, i record originali sarebbero automaticamente
	 * segnati come non validi, ricadendo quindi nel caso precedente.
	 */ 
	if(record.tiporettifica !== globals.TipoRettifica.NESSUNA)
	{
		renderable.bgcolor = globals.Colors.NOT_CONFIRMED.background;
		renderable.fgcolor = globals.Colors.NOT_CONFIRMED.foreground;
		return;
	}
	
	if(event.getRecordIndex() % 2 == 0)
		renderable.bgcolor = globals.Colors.EVEN.background;
	else
		renderable.bgcolor = globals.Colors.ODD.background;
}
