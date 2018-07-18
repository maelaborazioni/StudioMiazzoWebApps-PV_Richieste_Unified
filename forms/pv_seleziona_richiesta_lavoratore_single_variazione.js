/**
 * @type {JSRecord<db:/ma_richieste/tab_richiestedettaglio>}
 * 
 * @protected  
 * 
 * @properties={typeid:35,uuid:"C5321200-B16A-4DEC-B961-2524024601A2",variableType:-4}
 */
var request;

/**
 * @type {JSRecord<db:/ma_richieste/tab_richiestedettagliocondizioni>}
 *
 * @properties={typeid:35,uuid:"F729BE3F-B5F2-427B-93B1-D04DDAC02CA4",variableType:-4}
 */
var rule;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"FEDE4EF3-1211-4FE6-B231-4546E82162A6"}
 */
var vCodRegola = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"256D8AF2-2F20-4C8A-ADBA-44524F4A3082"}
 */
var vCodRichiesta = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"06899EC8-05A2-4E66-922E-5DE18FBCA489"}
 */
var vDettaglioRichiesta = '';

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"D4615033-94FD-4306-BA1D-CE09F1401D08",variableType:8}
 */
var vIDDettaglioRichiesta;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"AEE48973-9DB9-45F5-BED3-0F50336E871C",variableType:8}
 */
var vIDRegola;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"8008197D-5F5C-4C0C-89EF-EBAB770A3A8E"}
 */
var vRegola = '';

/**
 * @properties={typeid:24,uuid:"D22C8489-3D4D-4DD1-A0ED-BB832AA17FBA"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	// Clean all errors
	resetStatus();	
	
	vTipoRichiesta = globals.TipoRichiesta.SINGOLA;
}

/**
 * @param {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} fs
 *
 * @properties={typeid:24,uuid:"E8715EDF-4FB8-4133-96E8-9F392F8DC686"}
 * 
 */
function filterRequest(fs)
{
	if(!vCategoriaRichiesta)
	{
		setStatusWarning('Per favore selezionare una categoria per la richiesta');
		return null;
	}
	
	fs = _super.filterRequest(fs);
	if(fs)
	{
		var allowedRequests = globals.getAvailableRequests(idditta_sede, globals.toPeriodo(vAnno, vMese));
		if (allowedRequests)
			fs.addFoundSetFilterParam('idtabrichiestadettaglio', globals.ComparisonOperator.IN, allowedRequests);
		
		var isPvUserOnly = forms.pvs_richieste_lavoratore_filter_single_dtl && forms.pvs_richieste_lavoratore_filter_single_dtl.vIdLavoratoreSingolo;
		if(isPvUserOnly)
		{
			var allowedEvents = globals.getEventiAbilitati(idditta_cliente,globals.CategoriaSW.PV);
			fs.addFoundSetFilterParam('idtabellariferimento',globals.ComparisonOperator.IN,globals.foundsetToArray(allowedEvents,'idevento'));
		}
	}
		
	return fs;
}

/**
 * @param {JSFoundset} fs
 * 
 * @properties={typeid:24,uuid:"53593B3C-777C-4BFC-B8F8-8670235C3E68"}
 */
function filterLavoratori(fs)
{
	if(fs)
	{
		fs = _super.filterLavoratori(fs);
		
		if(rule)
		{
			var periodo = globals.toPeriodo(vAnno, vMese);
			
			var allowedEmployees = globals.getAvailableEmployees(rule.idtabrichiestadettagliocondizione, idditta, periodo, gruppo && gruppo.codice);
			if (allowedEmployees)
				fs.addFoundSetFilterParam('idlavoratore', globals.ComparisonOperator.IN, allowedEmployees);
		}
	}
	
	return fs;
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
 * @properties={typeid:24,uuid:"A9712965-4ED5-4C2A-93F9-6883F46FA8DD"}
 * @AllowToRunInFind
 */
function onDataChangeCodRichiesta(oldValue, newValue, event) 
{
	if(!vCategoriaRichiesta)
	{
		setStatusWarning('Per favore selezionare una categoria per la richiesta');
		return true;
	}
	
	if(!newValue)
	{
		resetRichiesta();
		resetRegola();
		
		return true;
	}
	
	var allowedRequests = globals.getAvailableRequests(idditta_sede, globals.toPeriodo(vAnno, vMese));
	if(!allowedRequests)
	{
		setStatusWarning('Nessuna richiesta disponibile');
		return true;
	}
	
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} */
	var requestDetailFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.DETTAGLIO_RICHIESTE);
	if (requestDetailFs && requestDetailFs.find())
	{
		requestDetailFs.codice 		   			= newValue;
		requestDetailFs.idtabrichiesta 			= vCategoriaRichiesta;
		requestDetailFs.idtabrichiestadettaglio = allowedRequests;
		
		if(requestDetailFs.search() > 0)
			updateRequest(requestDetailFs.getSelectedRecord());
		else
			lookupDetail(event);
			
		return true;
	}

	vCodRichiesta = oldValue;
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"2EC9358D-B6DD-4328-96B0-9C0E60254B04"}
 * @AllowToRunInFind
 */
function updateRequest(req)
{
	try
	{
		resetStatus();
		
		if(req)
		{			
			var periodo     = globals.toPeriodo(vAnno, vMese);
			var periodoDate = globals.toDate(periodo);
			
			/** @type {Array<Number>} */
			var regoleAmmesse = globals.getAvailableRules(globals.ma_utl_ditta_toSede(idditta), periodo, req.idtabrichiestadettaglio);
			if(!regoleAmmesse || regoleAmmesse.length === 0)
				throw new Error('Nessuna regola definita per la richiesta ' + req.descrizione + ', periodo ' + utils.dateFormat(periodoDate, 'MM/yyyy') + '\nContattare lo studio.');
			else 
			{
				/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocondizioni>} */
				var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.REGOLE_RICHIESTE);
					fs.loadRecords(regoleAmmesse[0]);
					
				if(regoleAmmesse.length === 1)
				{
					updateRule(fs.getSelectedRecord());
					disableRegola();
				}
				else
				{					
					resetRegola();
					updateRule(fs.getSelectedRecord());
					enableRegola();
				}
			}
			
			request 			= req;
			vCodRichiesta		= req.codice;
			vDettaglioRichiesta = req.descrizione;
		}
	}
	catch(ex)
	{
		application.output(ex.message);
		setStatusError(ex.message);
		
		resetRichiesta();
		resetRegola();
	}
	finally
	{
		updateUI();
	}
}

/**
 * @properties={typeid:24,uuid:"0EEC04F2-6DF5-472A-9EA0-56EC99D78507"}
 */
function resetRichiesta()
{
	vCodRichiesta = vDettaglioRichiesta = request = null;
}

/**
 * @properties={typeid:24,uuid:"F9E02337-62E9-4BBF-AF5B-6890F93A8701"}
 */
function resetRegola()
{
	rule = vCodRegola = vRegola = null;
	elements.btn_codregola.enabled = false;
	
	updateUI();
}

/**
 * @properties={typeid:24,uuid:"089B5314-378D-4123-995A-D101DABBF880"}
 */
function disableRegola()
{
	elements.btn_codregola.enabled = 
	elements.fld_codregola.enabled = false;
}

/**
 * @properties={typeid:24,uuid:"0ABF89FA-8240-4312-B1C5-93BCC3935FCF"}
 */
function enableRegola()
{
	elements.btn_codregola.enabled = 
	elements.fld_codregola.enabled = true;
}

/**
 * @properties={typeid:24,uuid:"E962C332-9777-4889-9BAD-92CFB69E1659"}
 */
function onDataChangeCodDitta(oldValue, newValue, event)
{
	var success = _super.onDataChangeCodDitta(oldValue, newValue, event);
	if (success)
	{
		resetRichiesta();
		resetRegola();
		
		return true;
	}
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"995C22C1-BC60-4DCB-AD10-CE24244D478C"}
 */
function lookupDetail(event)
{
	if(!vCategoriaRichiesta)
	{
		setStatusWarning('Per favore selezionare una categoria per la richiesta');
		return null;
	}
	
	return globals.ma_utl_showLkpWindow
	(
		{
			event							: event,
			lookup							: 'PV_Lkp_DettaglioRichiesta',
			allowInBrowse					: true,
			methodToAddFoundsetFilter		: 'filterRequest',
			methodToExecuteAfterSelection	: 'updateRequest',
			returnFullRecords				: true,
			sortMethod						: 'sortRequests'
		}
	);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * 
 * @protected 
 *
 * @properties={typeid:24,uuid:"B80D660F-C2EF-4DCF-802B-3EA739C62B90"}
 */
function lookupRule(event) 
{
	return globals.ma_utl_showLkpWindow
	(
		{
			event							: event,
			lookup							: 'PV_Lkp_Regola',
			allowInBrowse					: true,
			methodToAddFoundsetFilter		: 'filterRule',
			methodToExecuteAfterSelection	: 'updateRule',
			returnFullRecords				: true
		}
	);
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
 * @properties={typeid:24,uuid:"EB703C76-B8AD-451F-A7B8-2FCBC00DE205"}
 * @AllowToRunInFind
 */
function onDataChangeCodRegola(oldValue, newValue, event) 
{
	if(!newValue)
	{
		resetRegola();
		return true;
	}
	
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocondizioni>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.REGOLE_RICHIESTE);
		filterRule(fs);
		
	if (fs && fs.find())
	{
		fs.idtabrichiestadettaglio = request.idtabrichiestadettaglio;
		fs.codice = newValue;
		
		if(fs.search() === 1)
			updateRule(fs.getSelectedRecord());
		else 
		if(globals.ma_utl_isNullOrUndefined(newValue))
			resetRegola();
		else
			lookupRule(event);
			
		return true;
	}
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"88BB0F1E-909C-44A0-BED2-54C683BC698E"}
 */
function updateRule(rec)
{
	resetStatus();
	
	if(rec)
	{		
		rule 	   = rec;
		vIDRegola  = rule.idtabrichiestadettagliocondizione;
		vCodRegola = rule.codice;
		vRegola	   = rule.descrizione;
	}
}

/**
 * @properties={typeid:24,uuid:"DB07669A-4348-472B-9546-9F1488484EEC"}
 */
function filterRule(fs)
{
	if(fs)
	{
		if(!request)
		{
			setStatusError('Nessuna richiesta impostata');
			return null;
		}
		
		var periodo = globals.toPeriodo(vAnno, vMese);
		var rules   = globals.getAvailableRules(idditta_sede, periodo, request && request.idtabrichiestadettaglio);
		
		fs.addFoundSetFilterParam('idtabrichiestadettagliocondizione', globals.ComparisonOperator.IN, rules);
	}
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"68B681F9-102A-4D09-B786-86E8BB0319AD"}
 * 
 * @return {RuntimeForm<pv_variazione>}
 * 
 * @AllowToRunInFind
 */
function getSingleEditForm()
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
			return forms.pv_variazione_lavoratore_single_lavoratore_monetaria_edit;
			break;
		case globals.CategoriaRichiesta.INQUADRAMENTO:
			return forms.pv_variazione_lavoratore_single_lavoratore_inquadramento_edit;
			break;
		case globals.CategoriaRichiesta.ANAGRAFICA:
			return forms.pv_variazione_lavoratore_single_lavoratore_anagrafica_edit;
			break;
			
		default:
			return forms.pv_variazione_lavoratore_single_lavoratore_edit;
	}
}

/**
 * @return {RuntimeForm}
 * 
 * @properties={typeid:24,uuid:"A5940F2A-885E-427D-A6FB-4060A6B6799B"}
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
			return forms.pv_variazione_lavoratore_multi_lavoratore_monetaria_edit;
			break;
			
		case globals.CategoriaRichiesta.INQUADRAMENTO:
			return forms.pv_variazione_lavoratore_multi_lavoratore_inquadramento_edit;
			break;
			
		case globals.CategoriaRichiesta.ANAGRAFICA:
			return forms.pv_variazione_lavoratore_multi_lavoratore_anagrafica_edit;
			break;
		
		default:
			//TODO getMultiEditForm : verificare se OK
			return forms.pv_variazione_lavoratore_multi_lavoratore_tbl_edit;
	}
}

/**
 * @param {Boolean} multiSelect
 * @param {JSEvent} event
 *  
 * @properties={typeid:24,uuid:"48079064-89D0-4EC0-BC0E-E1829D5D4E17"}
 * @AllowToRunInFind
 */
function getParams(multiSelect, event)
{
	var params 			     	   = _super.getParams(multiSelect, event);
		params.dialogtitle		   = 'Richiesta variazione: ' + request.descrizione;
		params.controller    	   = globals.PV_Controllers.LAVORATORE;
		params.requestcode   	   = request.codice;
		params.requestid     	   = request.idtabrichiestadettaglio;
		params.requesttype         = request.tab_richiestedettaglio_to_tab_richieste.codice;
		params.ruleid			   = (rule && rule.idtabrichiestadettagliocondizione) || 0;
		params.rulecode			   = (rule && rule.codice);
		params.ammettedecorrenza   = request.ammettedecorrenza;
		params.gruppolavoratori    = vCodGruppoLavoratori;
		params.ammettemolteplicita = request.ammettemolteplicita;
		params.info                = ''; 
		
		if(rule)
			params.datasource		 = ['ds', request.codice, rule.codice, 'add'].join('_');
		else
			params.datasource		 = ['ds', request.codice, 'add'].join('_');
	
	var disabledElements = getDisabledEmployees(params.idditta, params.periodo, params.requestid);
	
	if(event.getFormName() == forms.pv_seleziona_richiesta_single_lavoratore_single_variazione.controller.getName())
	{
		params.iddipendenti = [_to_sec_user$user_id.sec_user_to_sec_user_to_lavoratori.idlavoratore];
		if(disabledElements.length && disabledElements.indexOf(params.iddipendenti[0]) != -1)
			params.info = 'La richiesta è già stata inserita. Modificare la richiesta esistente';
	}
	else
		params.iddipendenti = lookupLavoratori(event, multiSelect, disabledElements);
	if(!params.iddipendenti || params.iddipendenti.length === 0)
		return null;
	
	if(!multiSelect)
		params = setEmployeeRule(params.idditta, params.iddipendenti[0], params.periodo, categoria.idtabrichiesta, params.gruppolavoratori, params);

	return params;
}

/**
 * @AllowToRunInFind
 * @properties={typeid:24,uuid:"D9597AD1-8559-42CA-81FA-B0C8A05FCBD8"}
 */
function setEmployeeRule(companyID, employeeID, periodo, categoryID, gruppolavoratori, params)
{
	var regole = globals.getAvailableRequestsWithRules(companyID, employeeID, periodo, categoryID, gruppolavoratori);
	if (regole)
	{
		var fs = request.tab_richiestedettaglio_to_tab_richiestedettagliocondizioni;
		if (fs && fs.find())
		{
			fs.idtabrichiestadettagliocondizione = regole.rules;
			fs.idtabrichiestadettaglio           = request.idtabrichiestadettaglio;
			
			if(fs.search() == 0)
			{
				setStatusError("Dipendente non compatibile con la regola selezionata");
				return null;
			}
			
			params.ruleid   = fs.idtabrichiestadettagliocondizione;
			params.rulecode = fs.codice;
		}
		else
			throw new Error('i18n:ma.err.findmode');
	}
	
	return params;
}

/**
 * @properties={typeid:24,uuid:"913D4954-38EB-424A-8A0D-E5AFE534799E"}
 */
function checkFields()
{
	return _super.checkFields() && request && ((categoria.codice === globals.CategoriaRichiesta.MONETARIA && rule) || true);
}
