/**
 * @properties={typeid:35,uuid:"00D55EBD-46C6-4185-A919-A1FE54E7F8B5",variableType:-4}
 */
var employee = null;

/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"11F8E62B-75B4-4CA0-A9DC-BDA4943B2677",variableType:8}
 */
var vEmployeeCode = null;

/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"E898CE28-6970-4198-9038-13E9346145FD",variableType:8}
 */
var vEmployeeID = null;

/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"844835F2-B488-412C-83F8-D8528FF725F2"}
 */
var vEmployeeName = null;

/**
 * // TODO generated, please specify type and doc for the params
 * @param {Object} firstShow
 *
 * @properties={typeid:24,uuid:"06B67D14-28F6-4DD0-BC82-43D2B6A87C40"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	vTipoRichiesta = globals.TipoRichiesta.MULTIPLA;
	
	// Clean all errors
	resetStatus();	
}

/**
 * @properties={typeid:24,uuid:"221B489F-6F9C-41F6-8D90-0B5CB33DC745"}
 */
function updateGruppo(gruppo)
{
	_super.updateGruppo(gruppo);
	resetLavoratore();
}

/**
 * @param {JSRecord<db:/ma_anagrafiche/lavoratori>} lav
 *
 * @properties={typeid:24,uuid:"8F4628DB-63DB-43EE-9C8E-8EB9B6B43755"}
 */
function updateLavoratore(lav)
{
	if(lav)
	{
		vEmployeeID   = lav.idlavoratore;
		vEmployeeCode = lav.codice;
		vEmployeeName = lav.lavoratori_to_persone.nominativo;
		
		employee = lav;
	}
}

/**
 * @properties={typeid:24,uuid:"9636593E-29B4-4FF9-AEC3-6A7268E338E3"}
 */
function onDataChangeCodGruppoLavoratori(oldValue,newValue,event)
{
	if(_super.onDataChangeCodGruppoLavoratori(oldValue,newValue,event))
		return true;
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"1F9D8BFC-CC94-4C5A-A0BB-D5174C715535"}
 */
function onDataChangeGruppoLavoratori(oldValue,newValue,event)
{
	if(_super.onDataChangeGruppoLavoratori(oldValue,newValue,event))
		return true;
		
	 return false;
}

/**
 * @properties={typeid:24,uuid:"14E0CB08-2AF7-4A1C-AB42-2DE0388DE53A"}
 */
function resetLavoratore()
{
	vEmployeeID = vEmployeeCode = vEmployeeName = null;
}

/**
 * @properties={typeid:24,uuid:"B6218808-E7FA-4FB2-8AF1-9B1430C05268"}
 */
function updateDitta(ditta)
{
	if(ditta && ditta.idditta !== foundset.idditta)
		resetLavoratore();
	
	_super.updateDitta(ditta);
}

/**
 * @properties={typeid:24,uuid:"4A90C832-57AD-4529-8F2D-DB513CEEEE09"}
 * @AllowToRunInFind
 */
function onDataChangePeriodo(oldValue, newValue, event)
{
	var success = _super.onDataChangePeriodo(oldValue, newValue, event);
	if (success && vEmployeeID)
	{
		var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.LAVORATORI);
			fs = filterLavoratori(fs);
			
			fs.addFoundSetFilterParam('idlavoratore', globals.ComparisonOperator.EQ, vEmployeeID);
			
		if (fs.loadAllRecords() && fs.getSize() > 0)
			return true;
		
		resetLavoratore();
		return false;
	}
	
	return success;
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
 * @properties={typeid:24,uuid:"F14ECBB6-B1B9-4E3E-98C5-B2A25ECCD7B5"}
 * @AllowToRunInFind
 */
function onDataChangeCodLavoratore(oldValue, newValue, event)
{
	/** @type {JSFoundSet<db:/ma_anagrafiche/lavoratori>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.LAVORATORI);
		fs = _super.filterLavoratori(fs);
	
	if (fs && fs.find())
	{
		fs.codice  	  = newValue;
		fs.idditta 	  = idditta;
		
		if(fs.search() > 0)
			updateLavoratore(fs.getSelectedRecord());
		else
			lookupLavoratori(event, false);
			
		return true;
	}
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"B8526EB5-1862-4EE9-8BD3-9EDC72458875"}
 */
function checkFields()
{
	return _super.checkFields() && vEmployeeID;
}

/**
 * @properties={typeid:24,uuid:"4FAB2987-0149-4243-8162-09A9AA844A63"}
 */
function getSingleEditForm()
{
	return forms.pv_variazione_lavoratore_single_lavoratore_edit;
}

/**
 * @return {RuntimeForm}
 * 
 * @properties={typeid:24,uuid:"0C7BEC3E-36FC-44AE-8FCD-7AA0DD0D073A"}
 * @AllowToRunInFind
 */
function getMultiEditForm()
{
	/** @type {JSFoundSet<db:/ma_richieste/tab_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.CATEGORIE_RICHIESTE);
	if (fs && fs.find())
	{
		fs.idtabrichiesta = vCategoriaRichiesta;
		fs.search();
	}
	
	switch(fs.codice)
	{
		case globals.CategoriaRichiesta.MONETARIA:
			return forms.pv_variazione_lavoratore_multi_variazione_monetaria_edit;
			break;
		case globals.CategoriaRichiesta.INQUADRAMENTO:
		case globals.CategoriaRichiesta.ANAGRAFICA:
			throw new Error('Richieste multiple non supportate per la categoria selezionata');
			break;
			
		default:
			return forms.pv_variazione_lavoratore_multi_variazione_edit;
	}
}

/**
 * @properties={typeid:24,uuid:"FE078BF9-F0A5-453F-A89E-A19CAFD09D3D"}
 */
function getDetailFormName(params, multiple, edit)
{
	var formName = ['form_variazione_' + application.getUUID(), multiple ? 'multi' : 'single'].join('_');
	
	if(edit)
		formName += '_edit';
	
	return formName;
}

/**
 * @properties={typeid:24,uuid:"C57404D8-2C5E-4667-8D23-BF0D3698DC6F"}
 */
function getParams(multiSelect, event)
{
	var params 				= _super.getParams(multiSelect, event);
		params.dialogtitle  = 'Richiesta variazione: ' + employee.nominativo; 
		params.iddipendenti = [employee.idlavoratore];
		params.datasource   = ['ds', employee.idlavoratore, 'add'].join('_');
		
	if(categoria && categoria.codice === globals.CategoriaRichiesta.MONETARIA)
	{
		var response = globals.getAvailableRequestsWithRules
		(
			  params.idditta
			, params.iddipendenti[0]
			, params.periodo
			, params.idcategoria
			, params.gruppolavoratori
		);
		
		/** @type {Array}*/
		var excludedRules  = globals.getDisabledRules(params.idditta, params.iddipendenti, params.periodo);
		
		params.rulesObject 	     = response;
		params.idrichieste 		 = response.Rules.filter(function(rule){ return excludedRules.indexOf(rule) === -1; });
		params.ammettedecorrenza = 0;
		
	}
	else
	{
		var disabledElements = globals.getDisabledRules(params.idditta, params.iddipendenti, params.periodo);
		
		/** @type {Array<JSRecord<db:/ma_richieste/tab_richiestedettagliocondizioni>>} */
		var requests = lookupRegole(event, multiSelect, disabledElements);
		if(!requests)
			return null;
		
		if(multiSelect)
			params.idrichieste = requests.map(function(req){ return req.idtabrichiestadettagliocondizione; });
		else
		{
			params.requestid   = requests[0].tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.idtabrichiestadettaglio;
			params.requestcode = requests[0].tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.codice;
			params.rulecode	   = requests[0].codice;
			params.requesttype = requests[0].tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.tab_richiestedettaglio_to_tab_richieste.codice;
		}
	}
		
	return params;
}

/**
 * @param {JSEvent} event
 * @param {Boolean} multiSelect
 * @param {Array} 	[disabledElements]
 * 
 * @private
 * 
 * @properties={typeid:24,uuid:"F005ED7B-55C0-46D6-844D-3E2CD2D3878A"}
 */
function lookupRegole(event, multiSelect, disabledElements)
{
	var richieste = globals.ma_utl_showLkpWindow
	(
		{
			event						: event,
			lookup					 	: 'PV_Lkp_RegolaRichiesta',
			methodToAddFoundsetFilter	: 'filterRegole',
			allowInBrowse				: true,
			multiSelect					: multiSelect,
			returnFullRecords			: true,
			sortMethod					: 'sortRegole',
			disabledElements			: disabledElements
		}
	);
	
	if(!richieste)
		return null;
	
	return multiSelect ? richieste : [richieste];
}

/**
 * @param {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocondizioni>} fs
 *
 * @properties={typeid:24,uuid:"E2FF48D5-5B3D-4939-80EB-2FEC3834AD3A"}
 * @AllowToRunInFind
 */
function filterRegole(fs)
{
	if(!vCategoriaRichiesta)
	{
		setStatusWarning('Per favore selezionare una categoria per la richiesta');
		return null;
	}
	
	if(fs)
	{
		fs.addFoundSetFilterParam('idditta', '^||' + globals.ComparisonOperator.EQ, idditta_sede);

		var periodo   = globals.toPeriodo(vAnno, vMese);
		var firstDate = globals.getFirstDatePeriodo(periodo);
		var lastDate  = globals.getLastDatePeriodo(periodo);
		
		fs.addFoundSetFilterParam('iniziovalidita', '^||' + globals.ComparisonOperator.LE, lastDate );
		fs.addFoundSetFilterParam('finevalidita'  , '^||' + globals.ComparisonOperator.GE, firstDate);
		
		var allowedObjects = globals.getAvailableRequestsWithRules(idditta, vEmployeeID, periodo, vCategoriaRichiesta, vCodGruppoLavoratori);
		if (allowedObjects && allowedObjects.rules)
			fs.addFoundSetFilterParam('idtabrichiestadettagliocondizione', globals.ComparisonOperator.IN, allowedObjects.Rules)
		else
			fs.addFoundSetFilterParam('idtabrichiestadettagliocondizione', globals.ComparisonOperator.IN, []);
			
		var duplicate = fs.duplicateFoundSet();
		if (duplicate && duplicate.find())
		{
			duplicate.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.idtabrichiesta = vCategoriaRichiesta;
			duplicate.search();
			
			fs.addFoundSetFilterParam('idtabrichiestadettagliocondizione', globals.ComparisonOperator.IN, globals.foundsetToArray(duplicate, 'idtabrichiestadettagliocondizione'));
		}
	}
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"5C8CF25C-3917-4762-A448-84315826EC28"}
 */
function sortRegole(first, second)
{
	// Order by 'ordine', then by 'descrizione', null values come last
	var    order  = globals.nullLastComparator(first, second, 'tab_richiestedettagliocondizioni_to_ditte_gestionerichieste.ordine');
	return order || (first.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.descrizione < second.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.descrizione ? -1 : 1);
}

/**
 * @properties={typeid:24,uuid:"1634E9D0-A7A1-4717-AC7E-7A4AF39DBA39"}
 */
function reset()
{
	_super.reset();
	resetLavoratore();
}
