/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"07D3D423-1A2C-43DB-98E9-274474A05C28"}
 */
var vRequestDescription = '';

/**
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"49E5D9F1-ACFA-4492-8386-6FD85ACFFC22"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	if(vParams && vParams.requestid)
	{
		/** @type {JSFoundset<db:/ma_richieste/tab_richiestedettagliocondizioni>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.REGOLE_RICHIESTE);
		if (fs && fs.find())
		{
			fs.idtabrichiestadettaglio = vParams.requestid;
			fs.codice = vParams['rulecode'];
			fs.search();
			
			vRequestDescription = fs.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.descrizione + ' - ' + fs.descrizione;
		}
	}
}

/**
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"8445D056-73C6-4D9E-AF41-FD93E470275A"}
 * @AllowToRunInFind
 */
function setFormDataProviders(form, params)
{
	form 															= _super.setFormDataProviders(form, params);
	form.getField(elements.fld_codice.getName()).dataProviderID 	= 'codice';
	form.getField(elements.fld_nominativo.getName()).dataProviderID	= 'nominativo';
	form.getField(elements.fld_posinps.getName()).dataProviderID    = 'posizioneinps';
		
	if(elements.fld_decorrenza)
		form.getField(elements.fld_decorrenza.getName()).dataProviderID	= 'decorrenza';
	
	return form;
}

/**
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"D932EAB5-A1CE-4F33-B2C9-CCD960017CBE"}
 */
function setBodyElements(form, params, layoutParams, multiple)
{
	form = _super.setBodyElements( form, params, layoutParams, multiple);
	
	/**
	 * Nascondi la decorrenza se non prevista, e ridisegna la form di conseguenza
	 */
	if(form)
	{
		var lblDecorrenza = form.getLabel('lbl_decorrenza');
		var fldDecorrenza = form.getField('fld_decorrenza');
		var btnDecorrenza = form.getLabel('btn_decorrenza');
		
		if(lblDecorrenza && fldDecorrenza && btnDecorrenza)
			lblDecorrenza.enabled = fldDecorrenza.enabled = btnDecorrenza.visible = params.ammettedecorrenza;
		
		if(multiple)
		{
			lblDecorrenza.visible = fldDecorrenza.visible = params.ammettedecorrenza;
			
			if(!params.ammettedecorrenza)
			{
				form.width -= fldDecorrenza.width || lblDecorrenza.width;
				lblDecorrenza.tabSeq = SM_DEFAULTS.IGNORE;
			}
		}
	}
	
	return form;
}

/**
 * Handle changed data.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"0075E3B1-C606-4AA1-85AA-524A3299B347"}
 */
function onDataChangeDecorrenza(oldValue, newValue, event) 
{
	updateCurrentValue(newValue);
	
	// Valida la decorrenza per le richieste che la prevedono
	if(newValue && !validateDecorrenza(newValue))
	{
		var message = getAsOfDateNotValidMessage();
		
		setStatusWarning(message, message, 0);
		return false;
	}
	
	resetStatus();
	return true;
}

/**
 * @properties={typeid:24,uuid:"99108396-6EE9-4423-9AAF-A89EC035180D"}
 */
function validateDecorrenza(decorrenza)
{
	/** @type {Date} */
	var periodoLastDay = globals.getLastDatePeriodo(vParams.periodo);
	var oneYearBefore  = globals.ma_utl_copyDate(oneYearBefore, periodoLastDay);
		oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);
	
	return decorrenza <= periodoLastDay && decorrenza >= oneYearBefore;
}

/**
 * @properties={typeid:24,uuid:"E56E54D6-CC3D-4235-A65A-B08E23372DC7"}
 */
function getAsOfDateNotValidMessage()
{
	return 'Decorrenza non valida';
}
