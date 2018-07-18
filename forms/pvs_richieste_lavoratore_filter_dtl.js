/**
 * @type {JSRecord<db:/ma_anagrafiche/ditte>}
 *
 * @properties={typeid:35,uuid:"91C04E16-6667-4A69-AC4B-40F1AEC44796",variableType:-4}
 */
var company;

/**
 * @type {Array<JSRecord<db:/ma_anagrafiche/lavoratori>>}
 *
 * @properties={typeid:35,uuid:"3910F176-19BA-4257-B270-84D63B7C0C17",variableType:-4}
 */
var employees;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D403640E-7D8F-4547-98F2-3369DB9E2D1F"}
 */
var employeeNames;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"2C70A0FC-75CA-4528-AF43-4EBC0BB217BD",variableType:8}
 */
var vCodDitta = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7F05A9FA-D05D-4205-8DCC-8D2D6DAADD5E"}
 */
var vRagioneSociale;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"94BF5CC9-2683-4445-A28A-A464328038AD",variableType:8}
 */
var vIdGruppoLav = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"968D34E6-478F-4A32-AA7E-F3C14A032B99"}
 */
var vCodGruppoLav = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"27FE909D-4645-441B-8488-B0097F5229B1"}
 */
var vDescGruppoLav = '';

/**
 * @type {Date}
 * 
 * @properties={typeid:35,uuid:"53F942F5-B97D-4A8B-8F73-006A53DF0F53",variableType:93}
 */
var vPeriodoGiornaliera = null;

/**
 * @type {Number}
*
 * @properties={typeid:35,uuid:"DA1F2E5E-813B-4019-9C8C-C5FFCD019363",variableType:8}
 */
var vIdLavoratoreSingolo = null;

/**
 * @properties={typeid:24,uuid:"EFCDF4AC-8CE8-48E1-924A-277AAC06B6F2"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.DITTE);

	if(globals._filtroSuDitta)
	{
		if(!fs.loadRecords(globals._filtroSuDitta))
			setStatusWarning('Ditta non disponibile, controllare il filtro');
		else
		{
			updateDitta(fs.getSelectedRecord());
			elements.btn_selditta.enabled = elements.fld_cod_ditta.enabled = false;
		}
	}
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
 * @properties={typeid:24,uuid:"271C7155-98E2-42FA-A972-F5E90C33E103"}
 * @AllowToRunInFind
 */
function onDataChangeDitta(oldValue, newValue, event) {
	
	if(!newValue)
	{
		resetDitta();
		return true;
	}
	
	/** @type {JSFoundSet<db:/ma_anagrafiche/ditte>} */
	var dittaFs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, 'ditte');
	if (dittaFs.find())
	{
		dittaFs.codice = newValue;
		dittaFs.tipologia = 0;
		if(dittaFs.search() > 0)
			updateDitta(dittaFs.getSelectedRecord());
		else
			showDittaLookup(event);
		
		return true;
	}
	
	return false;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"BB9AFA85-660B-4E65-B6FC-DACE9F4D6E19"}
 */
function showLavoratoriLookup(event)
{
	if(!company)
	{
		globals.ma_utl_getBottomForm().setStatusWarning('Per favore impostare una ditta...');
		return null;
	}
	
	var retValue = globals.ma_utl_showLkpWindow(
	{
		  event									: event
		, lookup								: 'AG_Lkp_Lavoratori'
		, methodToAddFoundsetFilter				: 'filterLavoratori'
		//, methodToExecuteAfterMultipleSelection	: 'updateLavoratori'
		, methodToExecuteAfterSelection	        : 'updateLavoratore'
		, allowInBrowse							: true
		//, multiSelect							: true
		, returnFullRecords						: true
		//, selectedElements						: employees && employees.map(function(lav){ return lav.idlavoratore; })
		, noRecordMessage						: 'Nessun lavoratore per i parametri impostati'
	});
	
	if(!retValue)
		return null;
	
	return retValue;
}

/**
 * @properties={typeid:24,uuid:"C42E4AD5-295E-420C-9B20-56204D91DDC6"}
 */
function showDittaLookup(event)
{
	var retValue = globals.ma_utl_showLkpWindow(
	{
		  event							: event
		, lookup						: 'AG_Lkp_Ditta'
		, methodToAddFoundsetFilter     : 'filtraDittaStandard'	
		, methodToExecuteAfterSelection	: 'updateDitta'
		, allowInBrowse					: true
	});
	
	if(!retValue)
		return null;
	
	return retValue;
}

/**
 * @properties={typeid:24,uuid:"91E586A4-1881-447F-8F43-0B453E19B58F"}
 */
function showRequestLookup(event)
{
	if(!company)
	{
		globals.ma_utl_getBottomForm().setStatusWarning('Per favore impostare una ditta...');
		return null;
	}
	
	return _super.showRequestLookup(event);
}

/**
 * @properties={typeid:24,uuid:"A92B14A9-AFB1-4FFD-BD6B-099CAF01DB99"}
 */
function filterLavoratori(fs)
{
	/**
	 * Mostra solo i lavoratori per la ditta e/od il gruppo di lavoratori selezionati, se presenti
	 */
	if(fs)
	{
		var firstdate = globals.getFirstDate(vPeriodo || globals.TODAY);
		var lastdate = globals.getLastDate(vPeriodo || globals.TODAY);
		
		fs.addFoundSetFilterParam('idditta', globals.ComparisonOperator.EQ, company.idditta);
		fs.addFoundSetFilterParam('codicefiscale', 'IS NOT NULL', null);
		fs.addFoundSetFilterParam('assunzione',         globals.ComparisonOperator.LE, lastdate);
		fs.addFoundSetFilterParam('cessazione', '^||' + globals.ComparisonOperator.GE, firstdate);
		
		// appartenenza all'eventuale gruppo di lavoratori
		if(vCodGruppoLav)
		{
			var params = globals.inizializzaParametriAttivaMese(company.idditta,firstdate.getFullYear() + firstdate.getMonth() + 1,globals.getGruppoInstallazioneDitta(company.idditta),vCodGruppoLav);
			var gr = globals.getLavoratoriGruppo(params,company.idditta);
			fs.addFoundSetFilterParam('idlavoratore',globals.ComparisonOperator.IN,gr)
		}
		
		fs.addFoundSetFilterParam('lavoratori_cliente_to_lavoratori.idlavoratoresede', 'IS NOT NULL', null);
		
		if(vIdLavoratoreSingolo)
			fs.addFoundSetFilterParam('idlavoratore', globals.ComparisonOperator.EQ, vIdLavoratoreSingolo);
	}
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"BBD3D070-103C-4196-9602-71B006573E70"}
 */
function updateLavoratori(lavoratori)
{
	if(lavoratori && lavoratori.length > 0)
	{
		employees     = lavoratori;
		employeeNames = lavoratori.map(function(lav){ return lav.lavoratori_to_persone.nominativo }).join(', ');
	}
}

/**
 * @properties={typeid:24,uuid:"44C6663C-C03B-46F6-82D8-5551C688EFE6"}
 */
function updateLavoratore(lavoratore)
{
	if(lavoratore)
	{
		employees     = [lavoratore.idlavoratore];
		employeeNames = lavoratore.lavoratori_to_persone.nominativo;
	}
}

/**
 * @properties={typeid:24,uuid:"56A8992F-D7B8-46FC-BE69-1DB362CE9F4F"}
 */
function resetLavoratori()
{
	employees = employeeNames = null;
}

/**
 * @properties={typeid:24,uuid:"F3A060AC-932D-4947-AB13-8F0E41D37BEE"}
 */
function updateDitta(ditta)
{
	if(ditta)
	{
		company = ditta;
		
		// aggiorna anagrafica ditta
		vCodDitta = ditta.codice;
		vRagioneSociale = ditta.ragionesociale;
		
		// aggiorna selezionabilità gruppo di lavoratori
		if(elements.btn_selgruppolav)
			elements.btn_selgruppolav.enabled = scopes.giornaliera.haGruppiLavoratori(ditta.idditta); 	
		
		// elimina eventuale selezione di gruppi di lavoratori (e di conseguenza di singolo lavoratore)
		resetGruppiLavoratori();				
	}
}

/**
 * @properties={typeid:24,uuid:"743018CC-8094-478E-A8FB-C2BEC1566181"}
 */
function resetDitta()
{
//	vCodDitta = vRagioneSociale = company = null;
	resetGruppiLavoratori();
}

/**
 * @properties={typeid:24,uuid:"7BF7D1AC-B656-4C44-9970-291AE2F64E62"}
 */
function filterGruppoLavoratori(fs)
{
	if(fs)
	   fs.addFoundSetFilterParam('idditta', globals.ComparisonOperator.EQ, company.idditta);
	
	return fs;	
}

/**
 * @properties={typeid:24,uuid:"9576A481-442E-4CCD-8004-448000F59F95"}
 */
function updateGruppoLavoratori(grLavoratori)
{
	vCodGruppoLav = grLavoratori.codice;
	vDescGruppoLav = grLavoratori.descrizione;
}

/**
 * @properties={typeid:24,uuid:"8A5F09C1-D411-4BE7-B5E0-130C65672F45"}
 */
function resetGruppiLavoratori()
{
	vCodGruppoLav = vDescGruppoLav = null;
	resetLavoratori();
}

/**
 * @AllowToRunInFind
 * 
 * @properties={typeid:24,uuid:"C0F1214D-02E0-4E19-8D26-2E4DB70B2BFB"}
 */
function onDataChangeCodLavoratore(oldValue, newValue, event)
{
	/** @type {JSFoundSet<db:/ma_anagrafiche/lavoratori>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.LAVORATORI);
		fs = filterLavoratori(fs);
	
	if (fs && fs.find())
	{
		fs.codice  	  = newValue;
		
		if(fs.search() > 0)
			updateLavoratori(fs.getSelectedRecord());
		else
			showLavoratoriLookup(event);
			
		return true;
	}
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"48AD6EED-8E68-4286-A3E3-57B7A8C67335"}
 */
function filterRequest(fs)
{
	fs = _super.filterRequest(fs);
	
	if(fs && company)
	{
		var periodo = vPeriodo ? globals.toPeriodo(vPeriodo.getFullYear(), vPeriodo.getMonth()) : null;
		
		var allowedRequests = globals.getAvailableRequests(company.idditta_sede, periodo);
		if (allowedRequests)
			fs.addFoundSetFilterParam('idtabrichiestadettaglio', globals.ComparisonOperator.IN, allowedRequests);
	}
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"C66EFD2E-EC50-475E-B8AC-5D57B4A343B4"}
 */
function getHistoryForm()
{
	return globals.ma_utl_getBottomForm();
}

/**
 * @AllowToRunInFind
 * 
 * @param {Boolean} [removeDetailIfEmpty]	true if you want to remove the detail form if the filter empties the foundset, false otherwise
 * 
 * @properties={typeid:24,uuid:"BBC1A75C-4F98-4276-8D33-AAC2E89CE5FA"}
 */
function filter(removeDetailIfEmpty)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = _super.filter(removeDetailIfEmpty);
	
	var decorrenzaStart = vDecorrenza;

	var richiestaStart = vRequestDateFrom && utils.dateFormat(vRequestDateFrom, globals.ISO_DATEFORMAT);
	var richiestaEnd   = vRequestDateTo   && utils.dateFormat(vRequestDateTo,   globals.ISO_DATEFORMAT);
	
	if(fs && fs.find())
	{
		fs.periodocedolino 									= (vPeriodo && globals.toPeriodo(vPeriodo.getFullYear(), vPeriodo.getMonth() + 1)) || null;
		fs.decorrenza										= decorrenzaStart  && '>=' + decorrenzaStart;
		
		if(richiestaStart && richiestaEnd)
			fs.richiesta_data 								='#' + richiestaStart + ' ... ' + richiestaEnd + '|' + globals.ISO_DATEFORMAT
		else if(richiestaStart)
			fs.richiesta_data								= '>=' + richiestaStart + '|' + globals.ISO_DATEFORMAT;
		else if(richiestaEnd)
			fs.richiesta_data								= '<=' + richiestaEnd + '|' + globals.ISO_DATEFORMAT;
		else
			fs.richiesta_data								= null;
		
		fs.lavoratori_richieste_to_tab_richiestedettaglio
			.idtabrichiesta 	 							= vRequestCategory 				  || null;
		fs.idtabrichiestadettaglio							= (request && request.idtabrichiestadettaglio) || null;
		
		if(rule)
		{
			fs.idtabrichiestadettaglio = rule.idtabrichiestadettaglio;
			fs.codiceregola			   = rule.codice;
		}
		
		if(vCodGruppoLav)
		{
			var params = globals.inizializzaParametriAttivaMese(company.idditta,vPeriodo.getFullYear() * 100 + vPeriodo.getMonth() + 1,globals.getGruppoInstallazioneDitta(company.idditta),vCodGruppoLav);
			employees = globals.getLavoratoriGruppo(params,company.idditta);
		}
			
		if(employees)
		{
			var arrLavSede = [];
			for(var l = 0; l < employees.length; l++)
				arrLavSede.push(globals.convert_LavoratoriCliente2Sede(employees[l]));
			fs.idlavoratore = arrLavSede;
		}
		
		if(company)
			fs.idditta = company.idditta_sede;
		
		if(vRequestStatus)
		{
			var statusCode = globals.getStatusCode(vRequestStatus);
			switch(statusCode)
			{
				case globals.RequestStatus.TO_CANCEL:
					fs.tiporettifica = globals.ComparisonOperator.EQ + globals.TipoRettifica.ANNULLAMENTO;
					fs.lavoratori_richieste_to_tab_statooperazioni.codice = globals.ComparisonOperator.NE + globals.RequestStatus.CANCELED;
					break;
				
				case globals.RequestStatus.TO_OVERWRITE:
					fs.tiporettifica = globals.ComparisonOperator.EQ + globals.TipoRettifica.MODIFICA;
					fs.lavoratori_richieste_to_tab_statooperazioni.codice = globals.ComparisonOperator.NE + globals.RequestStatus.OVERWRITTEN;
					break;
					
				case null:
					break;
					
				case globals.RequestStatus.SENT:
				case globals.RequestStatus.IN_PROCESS:
					fs.tiporettifica = globals.ComparisonOperator.EQ + globals.TipoRettifica.NESSUNA;	
					
				default:
					fs.lavoratori_richieste_to_tab_statooperazioni.codice = statusCode;
			}
		}
		
		if(fs.search() === 0 && removeDetailIfEmpty)
			getHistoryForm().removeDetail();
	}

	return fs;
}

/**
 * @properties={typeid:24,uuid:"5545EDB4-6FF1-41E1-8D8F-886130896616"}
 */
function sortFunction(first,second)
{
	var dateOrder      = first.richiesta_data > second.richiesta_data ? -1 : 1;
	var firstName      = first.lavoratori_richieste_to_lavoratori.lavoratori_to_persone.nominativo;
	var secondName     = second.lavoratori_richieste_to_lavoratori.lavoratori_to_persone.nominativo;
	
	return dateOrder || (firstName < secondName ? -1 : 1);
}

/**
 * @properties={typeid:24,uuid:"AD51947B-BFC5-4A5E-93D0-B0F803E16FC4"}
 */
function reset()
{
	_super.reset();
	resetDitta();
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"4BFD945F-E274-4BF9-840B-59E6C574E1D7"}
 */
function onActionDitta(event) 
{
	filter();
}

/**
 *
 * @param {Boolean} firstShow
 * @param {JSEvent} event
 * @param {Boolean} svyNavBaseOnShow
 *
 * @properties={typeid:24,uuid:"4D9893D6-0C60-4BDA-8B11-A75FB9BF3892"}
 * @AllowToRunInFind
 */
function onShowForm(firstShow, event, svyNavBaseOnShow) 
{
	_super.onShowForm(firstShow, event, svyNavBaseOnShow);
    // apertura filtrata attraverso form di selezione pv_selezione
	sort(filter(true), sortFunction);
	
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"70ADBA31-2601-471B-9679-5C8B5BE821C1"}
 */
function showGruppoLavLkp(event) 
{
	var retValue = globals.ma_utl_showLkpWindow(
	{
		  event							: event
		, lookup						: 'LEAF_Lkp_Gruppigestione'
		, methodToAddFoundsetFilter     : 'filterGruppoLavoratori'	
		, methodToExecuteAfterSelection	: 'updateGruppoLavoratori'
		, allowInBrowse					: true
	});
	
	if(!retValue)
		return null;
	
	return retValue;
}
