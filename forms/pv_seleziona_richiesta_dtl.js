/**
 * @properties={typeid:35,uuid:"1CA9AAF1-6725-4978-B587-B04B4259FB6C",variableType:-4}
 */
var categoria = null;

/**
 * @properties={typeid:35,uuid:"3D1E5DED-9D9E-411C-99A5-558180773CED",variableType:-4}
 */
var gruppo = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9EF9E7F2-426A-4695-94FF-E5BBBA312269",variableType:4}
 */
var vAnno = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"A7916B72-18FF-471B-BCA2-36BDDD63FD2A",variableType:4}
 */
var vCategoriaRichiesta = null;

/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"73BED569-B206-49B2-90AC-1B2344921F4D"}
 */
var vCodGruppoLavoratori = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"A67D6BC2-CEB7-464E-9EC4-FCF75E6A6982",variableType:4}
 */
var vCompanyCode = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"53D29DAC-B9FD-4379-8D04-3C0897E80C9F",variableType:8}
 */
var vGruppoLavoratori = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"5DBF0911-B57E-4E3F-B23C-F7CF43390DB1",variableType:4}
 */
var vMese = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"7679BFD3-FC85-4B2D-94CD-C8A6F7D59B44"}
 */
var vNomeGruppoLavoratori = '';

/**
 * @type {Object}
 *
 * @properties={typeid:35,uuid:"4390CAD7-6EF0-42DA-B0AB-36C789336640",variableType:-4}
 */
var vParams;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"ADA366C2-06DA-4652-88FA-79A12A966874",variableType:4}
 */
var vTipoRichiesta = 1;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"B9E5B937-014D-44C8-A4B0-C55D4D90805D",variableType:4}
 */
var vChkDettaglioGiorni = 0;


/**
 * @properties={typeid:24,uuid:"1BADD6B4-AF02-4898-8651-7BBA656DBCF5"}
 * @AllowToRunInFind
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	vTipoRichiesta		= vTipoRichiesta 	  || globals.TipoRichiesta.SINGOLA;
	vCategoriaRichiesta = vCategoriaRichiesta || application.getValueListItems('vls_categoriarichiesta').getValue(1,2);
	
	foundset.loadRecords(filterDitta(foundset.duplicateFoundSet()));
	
	if(foundset.getSize() == 1)
	{
		elements.btn_codditta.enabled = 
		elements.fld_codditta.enabled = false;
	}
		
	updateDitta(foundset.getSelectedRecord());
}

/**
 * @properties={typeid:24,uuid:"6E6AB914-6ECA-4A65-A0AD-FAA876073436"}
 */
function filterDitta(fs)
{
	if(fs)
	{
		fs.addFoundSetFilterParam('tipologia', globals.ComparisonOperator.EQ, 0);
		if(globals._filtroSuDitta > 0)
			fs.addFoundSetFilterParam('idditta', globals.ComparisonOperator.EQ, globals._filtroSuDitta);
	}

	return fs;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected 
 *
 * @properties={typeid:24,uuid:"FCF17708-BDAE-4B75-8A67-E5A3D3A87E27"}
 */
function lookupDitta(event) 
{
	globals.ma_utl_showLkpWindow
			(
				{
					event							: event,
					lookup							: 'AG_Lkp_Ditta',
					methodToExecuteAfterSelection	: 'updateDitta',
					methodToAddFoundsetFilter		: 'filterDitta',
					allowInBrowse					: true
				}
			);
}

/**
 * @properties={typeid:24,uuid:"0ECE224F-3E21-4C2D-92AD-C702C66C7E70"}
 */
function lookupGruppoLavoratori(event, multiSelect)
{
	returnValue = globals.ma_utl_showLkpWindow(
	{
		  event							: event
		, lookup						: 'LEAF_Lkp_Gruppigestione'
		, methodToAddFoundsetFilter		: 'filterGruppi'
		, methodToExecuteAfterSelection	: 'updateGruppo'
		, allowInBrowse					: true
		, multiSelect					: multiSelect
	});
	
	return multiSelect ? returnValue : [returnValue];
}

/**
 * @param {JSEvent} event
 * @param {Boolean} multiSelect
 * @param {Array} 	[disabledElements]
 * 
 * @properties={typeid:24,uuid:"F242A8AE-62E4-4CE0-B0CE-A230F3A2BB8C"}
 */
function lookupLavoratori(event, multiSelect, disabledElements)
{
	var lavoratori = globals.ma_utl_showLkpWindow(
	{
		  event							: event
		, lookup						: 'AG_Lkp_Lavoratori'
		, methodToAddFoundsetFilter		: 'filterLavoratori'
		, methodToExecuteAfterSelection : 'updateLavoratore'
		, allowInBrowse					: true
		, multiSelect					: multiSelect
		, disabledElements				: disabledElements
	});
	
	if(!lavoratori)
		return null;
	
	return multiSelect ? lavoratori : [lavoratori];
}

/**
 * @properties={typeid:24,uuid:"40C04C8F-D51F-4088-A89D-EDEB09C6CCAC"}
 * @AllowToRunInFind
 */
function getDisabledEmployees(companyid, periodo, requestid)
{
	try
	{
		/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
		if (fs && fs.find())
		{
			// Ignore canceled requests
			fs.lavoratori_richieste_to_tab_statooperazioni.codice = globals.ComparisonOperator.NE + globals.RequestStatus.CANCELED;
			fs.rettificaper = '^||=0';
			
			if(!globals.ma_utl_hasKeySede())
				fs.owner_id = globals.svy_sec_lgn_owner_id;
			
			fs.idditta                						  					  = globals.ma_utl_ditta_toSede(companyid);
			//TODO PANNELLO VARIAZIONI
			//fs.idditta                						  					  = companyid;
			
			fs.periodocedolino 		   						  					  = periodo;
			fs.idtabrichiestadettaglio 						  					  = requestid;
			fs.lavoratori_richieste_to_tab_richiestedettaglio.ammettemolteplicita = globals.FALSE;
			
			fs.search();
		}
		
		return globals.foundsetToArray(fs, 'idlavoratore_cliente');
		// TODO PANNELLO VARIAZIONI
		//return globals.foundsetToArray(fs, 'idlavoratore');
	}
	catch(ex)
	{
		logAndShowGenericError(ex);
		return [];
	}
}

/**
 * @AllowToRunInFind
 * 
 * @properties={typeid:24,uuid:"49E0F205-5FE2-48B8-850D-AE0C2DF51949"}
 */
function getDisabledRules(companyid, employeesid, periodo)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
	if (fs && fs.find())
	{
		// Ignore canceled requests and rectifications
		fs.status_code  = globals.ComparisonOperator.NE + globals.RequestStatus.CANCELED;
		fs.rettificaper = '^||=0';
		
		if(globals.isCliente())
			employeesid = employeesid.map(function(id){ return globals.ma_utl_lav_convertId(id); });
		
		fs.idditta                 = companyid
		fs.idlavoratore			   = employeesid
		fs.periodocedolino 		   = periodo;
		fs.lavoratori_richieste_to_tab_richiestedettaglio
		  .ammettemolteplicita     = 0;
		
		fs.search();
	}
	
	return globals.foundsetToArray(fs, 'lavoratori_richieste_to_tab_richiestedettagliocondizioni.idtabrichiestadettagliocondizione');
}

/**
 * @param {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} fs
 *
 * @properties={typeid:24,uuid:"FA1424C1-8EDB-4D79-91C7-E602AFC9A644"}
 * @AllowToRunInFind
 */
function filterRequest(fs)
{
	if(fs)
	{
		var periodo 		 = globals.toPeriodo(vAnno, vMese);
		var periodoFirstDate = globals.getFirstDatePeriodo(periodo);
		var periodoLastDate  = globals.getLastDatePeriodo(periodo);
		
		var duplicate = fs.duplicateFoundSet();
		if (duplicate.loadAllRecords() && duplicate.find())
		{
			duplicate
				.tab_richiestedettaglio_to_tab_richiestedettagliocondizioni
				.idditta 		= '^||' + idditta_sede;
			duplicate
				.tab_richiestedettaglio_to_tab_richiestedettagliocondizioni
				.iniziovalidita = '^||' 
									+ globals.ComparisonOperator.LE 
									+ globals.formatForFind(periodoLastDate);
			duplicate
				.tab_richiestedettaglio_to_tab_richiestedettagliocondizioni
				.finevalidita   = '^||' 
									+ globals.ComparisonOperator.GE
									+ globals.formatForFind(periodoFirstDate);
			
			duplicate.search();
		}
		
		fs.addFoundSetFilterParam('idtabrichiestadettaglio', globals.ComparisonOperator.IN, globals.foundsetToArray(duplicate, 'idtabrichiestadettaglio'));
		fs.addFoundSetFilterParam('idtabrichiesta', globals.ComparisonOperator.EQ, vCategoriaRichiesta);
	}
		
	return fs;
}

/**
 * @properties={typeid:24,uuid:"B09CEBCE-A48F-4B5B-B34A-E3F9BC305DD4"}
 */
function filterLavoratori(fs)
{
	try
	{
		var periodo = globals.toPeriodo(vAnno, vMese);
		
		fs.addFoundSetFilterParam('idditta', globals.ComparisonOperator.EQ, idditta);
		fs.addFoundSetFilterParam('codicefiscale', 'IS NOT NULL', null);
		fs.addFoundSetFilterParam('assunzione',         globals.ComparisonOperator.LE, globals.getLastDatePeriodo(periodo));
		fs.addFoundSetFilterParam('cessazione', '^||' + globals.ComparisonOperator.GE, globals.getFirstDatePeriodo(periodo));
		
		// TODO PANNELLO VARIAZIONI
//		fs.addFoundSetFilterParam('lavoratori_cliente_to_lavoratori.idlavoratoresede', 'IS NOT NULL', null);
		
		// Filtra in base al gruppo lavoratori, se presente
		if(vGruppoLavoratori)
		{
			var params = 
			{
				  idditta				: idditta
				, periodo				: globals.toPeriodo(vAnno, vMese)
				, idlavoratori			: []
				, idgruppoinstallazione	: -1 //TODO da eliminare
				, gruppoinstallazione   : -1
				, codgruppogestione		: vCodGruppoLavoratori
				, tipoconnessione		: globals.getTipoConnessione()
			};
			
			var lavoratori = globals.getLavoratoriGruppo(params, idditta);
			if(globals.ma_utl_isNullOrUndefined(lavoratori))
				throw new Error('Errore durante il filtraggio per gruppo di lavoratori');
			
			fs.addFoundSetFilterParam('idlavoratore', globals.ComparisonOperator.IN, lavoratori);
		}
		
		return fs;
	}
	catch(ex)
	{
		logAndShowGenericError(ex);
		return null;
	}
}

/**
 * @properties={typeid:24,uuid:"2D81AC3A-5FA1-4C4D-A2D5-0CEF2838D243"}
 */
function filterGruppi(fs)
{
	if(fs)
	{
		fs.addFoundSetFilterParam('idditta'  , globals.ComparisonOperator.EQ, idditta);
		fs.addFoundSetFilterParam('richieste', globals.ComparisonOperator.EQ, 1		 );
	}
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"8F7574CC-1FD1-4083-ACCE-7845C4DD9531"}
 * @AllowToRunInFind
 */
function possiedeGruppi(ditta)
{
	if(!ditta)
		return false;
	
	/** @type {JSFoundSet<db:/ma_anagrafiche/ditte_presenzegruppigestione>} */
	var gruppiFs = ditta.ditte_to_ditte_presenzegruppigestione;
	if (gruppiFs && gruppiFs.find())
	{
		gruppiFs.richieste = globals.TRUE;
		return gruppiFs.search() > 0;
	}
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"71185A12-47F9-46F7-B916-5399C4A840B5"}
 */
function updateDitta(ditta)
{
	if(ditta)
	{
		vCompanyCode = ditta.codice;
		
		globals.vCurrentEmployerID = ditta.idditta;
		globals.lookupFoundset(ditta.idditta, foundset);

		var periodo;
		if(vAnno && vMese)
			periodo = globals.toDate(globals.toPeriodo(vAnno, vMese));
		else
			periodo = null;
		
		filterPeriodo(ditta, periodo);
		
		if(possiedeGruppi(ditta))
			enableGruppo();
		else
			disableGruppo();
	}
}

/**
 * @properties={typeid:24,uuid:"9EF24445-3E90-4A80-95B6-44F922446ED5"}
 */
function filterPeriodo(ditta, periodo)
{
	if(ditta)
	{
		// Recupera l'ultimo mese stampato
		var minPeriodo = globals.ma_utl_getUltimoCedolinoStampato(ditta.idditta_sede);
		if (minPeriodo)
		{
			resetStatus();
			
			// Imposta il periodo minimo per cui è possibile inserire variazioni
			// (il mese successivo all'ultimo mese stampato)
			var minDate = globals.toDate(minPeriodo);
				minDate.setMonth(minDate.getMonth() + 1);
			
			globals.vls_anno_filter_min = minDate.getFullYear();
			globals.vls_mese_filter_min = minDate.getMonth() + 1;
			
			// Se il periodo correntemente selezionato è precedente il primo disponibile, sovrascrivi
			// la selezione con quest'ultimo, altrimenti reimposta il solo mese, se nello stesso anno
			if(minDate >= periodo) // null is always lower than anything
			{				
				vAnno = minDate.getFullYear();
				vMese = minDate.getMonth() + 1;
			}
			else 
			if(periodo && minDate.getFullYear() < periodo.getFullYear())
				globals.vls_mese_filter_min = 1;
		}
		else
			setStatusError('Impossibile recuperare i dati dell\'ultimo cedolino stampato. Contattare lo studio.');
	}
}

/**
 * @properties={typeid:24,uuid:"A8485A36-244E-4008-8F26-1F961DE5EDA9"}
 */
function updatePeriodo(anno, mese)
{
	vAnno = anno;
	vMese = mese;
}

/**
 * @properties={typeid:24,uuid:"129DBE8F-6DC8-47ED-B4D4-DB98FA04578D"}
 */
function updateCategoria(category)
{
	if(category)
	{
		categoria = category;
		vCategoriaRichiesta = category.idtabrichiesta;
	}
	
}

/**
 * @properties={typeid:24,uuid:"514F11CB-0860-4946-8A8F-AF11D1B60A12"}
 */
function resetGruppo()
{
	gruppo = vGruppoLavoratori = vCodGruppoLavoratori = null;
}

/**
 * @properties={typeid:24,uuid:"D8EF17FF-98B3-4F46-A9EF-A4CD962BAA0D"}
 */
function enableGruppo()
{
	setGroupEnabled(true);
}

/**
 * @properties={typeid:24,uuid:"45C61D8E-BCC3-4EAA-B18C-A40192F48184"}
 */
function disableGruppo()
{
	setGroupEnabled(false);
}

/**
 * @properties={typeid:24,uuid:"E0EEEDFE-F594-4457-A045-3F9AA3663BBE"}
 */
function setGroupEnabled(isEnabled)
{
	if(elements.fld_codgruppolavoratori)
		elements.fld_codgruppolavoratori.enabled = isEnabled;
	if(elements.fld_gruppolavoratori)
		elements.fld_gruppolavoratori.enabled = isEnabled;
	if(elements.btn_gruppolavoratori)
		elements.btn_gruppolavoratori.enabled = isEnabled;
	
	updateUI();
}

/**
 * @properties={typeid:24,uuid:"EBBA064B-4909-454A-B13F-AEDB19579CFA"}
 */
function updateGruppo(group)
{
	if(group)
	{
		gruppo = group;
		
		vGruppoLavoratori	  = group.iddittapresenzegruppigestione;
		vCodGruppoLavoratori  = group.codice;
		vNomeGruppoLavoratori = group.descrizione;
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
 * @protected
 *
 * @properties={typeid:24,uuid:"848CF856-C607-4F22-8FD0-E499C98A7892"}
 * @AllowToRunInFind
 */
function onDataChangeCategoriaRichiesta(oldValue, newValue, event)
{
	resetRichiesta();
	resetRegola();

	if(newValue)
	{
		// Disabilita l'inserimento di richieste multiple per le categorie che non lo prevedono
		// Disabilita la scelta del gruppo lavoratori per le categorie che non lo prevedono
		/** @type {JSFoundSet<db:/ma_richieste/tab_richieste>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.CATEGORIE_RICHIESTE);
		if (fs && fs.find())
		{
			fs.idtabrichiesta = newValue;
			fs.search();
			
			categoria = fs.getSelectedRecord();
		}
		
		if(categoria.codice !== globals.CategoriaRichiesta.MONETARIA)
		{
			vTipoRichiesta = globals.TipoRichiesta.SINGOLA;
			if(elements.rad_tiporichiesta)
				elements.rad_tiporichiesta.enabled = false;
		}
		else
			if(elements.rad_tiporichiesta)
				elements.rad_tiporichiesta.enabled = true;
		
		if(categoria.ammettegruppolavoratori 
				&& possiedeGruppi(foundset.getSelectedRecord()))
			enableGruppo();
		else
			disableGruppo();
		
		forms.pv_seleziona_richiesta_main.elements.selezione_panel.setTabEnabledAt(2, categoria.ammetterichiestemultiple === 1);
		if(!categoria.ammetterichiestemultiple)
			forms.pv_seleziona_richiesta_main.elements.selezione_panel.tabIndex = 1;		
	}
	
	return true;
}

/**
 * @properties={typeid:24,uuid:"F5155281-1CBA-4AFD-84FB-AE6FBD4C3B20"}
 */
function resetRichiesta()
{
}

/**
 * @properties={typeid:24,uuid:"2C56B2D1-6AE3-4D1E-BAA8-438BFAEC5DCE"}
 */
function resetRegola()
{
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
 * @properties={typeid:24,uuid:"F4AF9D45-4488-4EEB-A755-B67ABEFE085B"}
 * @AllowToRunInFind
 */
function onDataChangeCodDitta(oldValue, newValue, event)
{
	/** @type {JSFoundSet<db:/ma_anagrafiche/ditte>} */
	var ditteFs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.DITTE);
	if (ditteFs && ditteFs.find())
	{
		ditteFs.codice = newValue;
		ditteFs.tipologia = 0;
		
		if(ditteFs.search() > 0)
			updateDitta(ditteFs.getSelectedRecord());
		else
			lookupDitta(event);
			
		return true;
	}
	
	return false;
}

/**
 * @protected 
 * 
 * @properties={typeid:24,uuid:"0EF485B5-A22F-4671-8565-2C8EE214DDD5"}
 */
function checkFields()
{
	return vAnno && vMese && vCategoriaRichiesta && vTipoRichiesta > -1;
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
 * @properties={typeid:24,uuid:"1C5E21B8-6002-495C-859F-C3213E64CA43"}
 */
function onDataChangePeriodo(oldValue, newValue, event) 
{
	filterPeriodo(foundset.getSelectedRecord(), globals.toDate(globals.toPeriodo(vAnno, vMese)));
	
	resetRichiesta();
	resetRegola();
	
	return true;
}

/**
 * @return {Form<pv_variazione>}
 * 
 * @protected 
 * 
 * @properties={typeid:24,uuid:"5A4B7C38-8FAC-49F4-BF73-C78E3184D64E"}
 */
function getSingleEditForm()
{
	return null;
}

/**
 * @return {Form<pv_variazione>}
 * 
 * @protected
 *  
 * @properties={typeid:24,uuid:"D9A2B188-F7E6-4396-B82B-39A640D2EF73"}
 */
function getMultiEditForm()
{
	return null;
}

/**
 * @param {Boolean} [multiSelect]
 * @param {JSEvent} [event]
 * 
 * @properties={typeid:24,uuid:"203D44CF-5762-4E3B-BDD2-7406FA29B862"}
 */
function getParams(multiSelect, event)
{
	var params 					= vParams || getParentForm(event).getParams();
		params.idditta 			= idditta;
		params.periodo  		= globals.toPeriodo(vAnno, vMese);
		params.tipoconnessione	= globals.getTipoConnessione();
		params.decorrenza		= null;
		params.controller		= globals.PV_Controllers.LAVORATORE;
		params.tiporettifica	= globals.TipoRettifica.NESSUNA;
		params.autosave			= databaseManager.getAutoSave();
		params.idcategoria      = categoria && categoria.idtabrichiesta;
		params.gruppolavoratori = gruppo && gruppo.codice;
		params.user_id          = security.getUserName();
		params.client_id        = security.getClientID();
		params.terminato        = 1;
		
	/**
	 * Imposta il primo giorno del mese come decorrenza per le richieste
	 * di tipo non monetario.
	 */
	var requestCategory = categoria && categoria.codice;
	if (requestCategory !== globals.CategoriaRichiesta.MONETARIA)
		params.decorrenza = globals.getFirstDatePeriodo(params.periodo);
	
	return params;
}

/**
 * @properties={typeid:24,uuid:"D0A0DF9C-809D-4057-8F56-B386F477BF9E"}
 */
function setParams(params)
{
	vParams = params;
}

/**
 * @param {JSEvent} event
 * 
 * @protected
 * 
 * @properties={typeid:24,uuid:"4F5DED9F-6FAA-4E4F-8B0D-2F467F0B6FBC"}
 */
function confermaRichiesta(event)
{
	try
	{
		if(!checkFields())
		{
			setStatusWarning('i18n:ma.msg.check_fields');
			return;
		}
		
		var multiple = vTipoRichiesta === globals.TipoRichiesta.MULTIPLA;
		var editForm = multiple ? getMultiEditForm() : getSingleEditForm();
		
		var params = getParams(multiple, event);
		if(!params)
			throw new Error("Errore durante il recupero dei parametri");
		if(!multiple && params['info'] != '')
			throw new Error(params['info']);
		
		var form;
		
		form = editForm.createRequestForm(params, multiple, editForm, getDetailFormName(params, multiple, true)); // creazione form per getione classica
		
		if(!form)
			return;
		
		databaseManager.setAutoSave(false);
		globals.ma_utl_setStatus(globals.Status.ADD, form.name, params['requiredfields']);

		var success = globals.ma_utl_showFormDialog({ name: form.name, title: params['dialogtitle'], blocking: true}) == 1;
		if (success)
			setStatusSuccess('i18n:ma.msg.save_successful');
	}
	catch(ex)
	{
		showGenericError(ex);
	}
}

/**
 * @param {JSEvent} [event]
 * @properties={typeid:24,uuid:"A98E704C-DFAD-4E4F-9780-D1876482C0A5"}
 */
function getParentForm(event)
{
	return (event && event.getFormName() == forms.pv_seleziona_richiesta_single_lavoratore_single_variazione.controller.getName()) ?
			forms.pv_seleziona_richiesta_single_main : forms.pv_seleziona_richiesta_main;
}

/**
 * @properties={typeid:24,uuid:"60DB963D-211F-452A-9305-46ABDFA29C18"}
 */
function getDetailFormName(params, multiple, edit)
{
	var request  = [params.requestcode, params.rulecode].join('_');
	var formName = ['form_lavoratore', request, multiple ? 'multi' : 'single'].join('_');
	
	if(edit)
		formName += '_edit';
	
	return formName;
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
 * @properties={typeid:24,uuid:"E2F50D42-2FB2-4D66-852C-7C12D0914E12"}
 * @AllowToRunInFind
 */
function onDataChangeCodGruppoLavoratori(oldValue, newValue, event)
{
	if(!newValue)
	{
		resetGruppo();
		return true;
	}
		
	/** @type {JSFoundSet<db:/ma_anagrafiche/ditte_presenzegruppigestione>} */
	var gruppiFs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, 'ditte_presenzegruppigestione');
	if (gruppiFs && gruppiFs.find())
	{
		gruppiFs.idditta = idditta;
		gruppiFs.codice  = newValue || 0;
		
		if(gruppiFs.search() > 0)
			updateGruppo(gruppiFs.getSelectedRecord());
		else
			lookupGruppoLavoratori(event, false);
			
		return true;
	}
	
	return false;
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
 * @properties={typeid:24,uuid:"C96961F6-777A-4B64-A0B9-F544814891FF"}
 * @AllowToRunInFind
 */
function onDataChangeGruppoLavoratori(oldValue, newValue, event) 
{
	if(!newValue)
	{
		resetGruppo();
		return true;
	}
	
	/** @type {JSFoundSet<db:/ma_anagrafiche/ditte_presenzegruppigestione>} */
	var gruppiFs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, 'ditte_presenzegruppigestione');
	if (gruppiFs && gruppiFs.find())
	{
		gruppiFs.iddittapresenzegruppigestione = newValue || 0;
		
		if(gruppiFs.search() > 0)
			updateGruppo(gruppiFs.getSelectedRecord());
		else
			lookupGruppoLavoratori(event, false);
			
		return true;
	}
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"C8515F8C-A17E-4A09-9247-367BA48F1CE9"}
 */
function onRecordSelection(event, form)
{
	reset();
}

/**
 * @properties={typeid:24,uuid:"8AB3BF0A-00C0-45CC-BD88-BFF764A77F48"}
 */
function reset()
{
	resetGruppo();
	resetRichiesta();
	resetRegola();
}

/**
 * @properties={typeid:24,uuid:"DB8191DB-C327-4ED4-A342-27F2210A23AB"}
 */
function sortRequest(first, second)
{
	return sortRequests(first,second);
}

/**
 * @properties={typeid:24,uuid:"46C98B0F-F04F-4038-9E6D-53F5B3A614C2"}
 */
function sortRequests(first, second)
{
	// Order by 'ordine', then by 'descrizione', null values come last
//	var    order  = globals.nullLastComparator(first, second, 'tab_richiestedettaglio_to_ditte_gestionerichieste.ordine');
//	return order || (first.descrizione < second.descrizione ? -1 : 1);

	return (first.descrizione < second.descrizione ? -1 : 1);
}