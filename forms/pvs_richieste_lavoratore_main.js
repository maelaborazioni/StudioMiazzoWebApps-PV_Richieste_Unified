/**
 * @properties={typeid:24,uuid:"3BB34B3D-65E2-4CFF-8E96-F1EEC400C593"}
 */
function onLoad(event)
{
	_super.onLoad(event);
	
	var frmFilter = forms.pvs_richieste_lavoratore_filter_single_dtl.vIdLavoratoreSingolo ? 
			forms.pvs_richieste_lavoratore_filter_single_dtl : forms.pvs_richieste_lavoratore_filter_dtl;
	
	frmFilter.registerListener([globals.Event.SET_STATUS], function(error){ setStatusNeutral(error.message); });
	frmFilter.registerListener([globals.Event.ERROR],      function(error){ setStatusError(error.message);   });
	frmFilter.registerListener([globals.Event.WARNING],    function(error){ setStatusWarning(error.message); });
	frmFilter.registerListener([globals.Event.RESET],      function(error){ resetStatus(); });
}

/**
 * @properties={typeid:24,uuid:"FF0FB03E-96F0-4A1C-BBB4-3D5A9A77C714"}
 */
function getButtonObject()
{
	var btnObj 			          = _super.getButtonObject();
		btnObj.btn_edit.enabled   = btnObj.btn_edit.enabled   && status_code === globals.RequestStatus.SUSPENDED;
		btnObj.btn_delete.enabled = btnObj.btn_delete.enabled && status_code === globals.RequestStatus.SUSPENDED;
		
	return btnObj;
}

/**
 * @param {JSFoundset} fs
 * 
 * @properties={typeid:24,uuid:"60D5F766-2782-4AB0-B9A8-E16E39F2D1AF"}
 */
function filterData(fs)
{
	fs = _super.filterData(fs);
	if(fs.getFoundSetFilterParams('ftr_escludi_rettifiche').length == 0)
		fs.addFoundSetFilterParam('rettificaper', 'is null', null, 'ftr_escludi_rettifiche');
	
	var statusToFilter = getStatusToFilter();
	if (statusToFilter.length > 0)
		fs.addFoundSetFilterParam
		(
			  'idtabstatooperazione'
			, globals.ComparisonOperator.IN
			, statusToFilter 
			, 'ftr_lavoratori_richieste'
		);
	
	fs.loadAllRecords();

	return fs;
}

/**
 * @properties={typeid:24,uuid:"5CDABB55-E14E-4A88-AF5E-B1974DECD1E7"}
 */
function getStatusToFilter()
{
	return [];
}

/**
 * @properties={typeid:24,uuid:"00F3DF4F-65C2-4EFC-9B71-E0D49BC755FA"}
 */
function dc_new(event, triggerForm, forceForm)
{
	// nel caso utente verificare che non sia già stato effettutato un invio
	var frm = forms.pvs_richieste_lavoratore_filter_single_dtl;
	if(solutionModel.getForm(frm.controller.getName())
	   && frm.vIdLavoratoreSingolo)
	{
		var arrRequestSent = scopes.richieste.getRequestsSent(frm.company.idditta_sede,frm.periodocedolino || (frm.vPeriodo.getFullYear() * 100 + frm.vPeriodo.getMonth() + 1));
		if(arrRequestSent && arrRequestSent.length)
		{
			var msg = 'Non è possibile inserire variazioni per il periodo selezionato poichè un precedente invio è già stato effettuato. \
			           Contattare la propria figura di riferimento per ulteriori informazioni sulle modalità di inserimento.';
			var title = 'Nuova variazione';
			globals.ma_utl_showWarningDialog(msg,title);
			return;
		}
	}
	
	newRequest();
}

/**
 * @properties={typeid:24,uuid:"DB6A2175-444A-4EBD-B28E-C555B1A4B207"}
 */
function dc_edit(event, triggerForm, forceForm)
{
	var frm = forms.pvs_richieste_lavoratore_filter_single_dtl.vIdLavoratoreSingolo ? forms.pvs_richieste_lavoratore_filter_single_dtl : forms.pvs_richieste_lavoratore_filter_dtl;
	frm.vPeriodo = globals.toDate(periodocedolino);
	editRequest(foundset.getSelectedRecord());
}

/**
 * @properties={typeid:24,uuid:"2DDF504E-ECD6-4CDF-A0B6-6BC810D53078"}
 */
function dc_delete_pre(fs, multiDelete)
{
	/**
	 * Se stiamo eliminando una rettifica, ripristina l'originale.
	 */
	if(fs && _super.dc_delete_pre(fs, multiDelete) !== -1)
	{
		if(fs.rettificaper)
		{
			var originalRequest = fs.lavoratori_richieste_to_lavoratori_richieste_rettificate;
			if (originalRequest)
				originalRequest.tiporettifica = globals.TipoRettifica.NESSUNA;
		}
			
		return 0;
		
	}
	
	return -1;
}

/**
 * @properties={typeid:24,uuid:"2ACB3DA9-7764-484B-9285-BB94FCBB2A0E"}
 * @AllowToRunInFind
 */
function newRequest()
{
	/**
	 * Mostra la dialog di scelta per la tipologia della richiesta
	 */
	// Carica tutte le ditte
	var choiceForm = getChoiceForm();
		choiceForm.foundset.loadAllRecords();
		choiceForm.foundset.sort('codice asc');
	// Pre-seleziona la stessa ditta indicata nell'intestazione
	var ftrForm = forms.pvs_richieste_lavoratore_filter_single_dtl.vIdLavoratoreSingolo ? forms.pvs_richieste_lavoratore_filter_single_dtl : forms.pvs_richieste_lavoratore_filter_dtl; 
	if(ftrForm.company)
		globals.lookupFoundset(ftrForm.company.idditta,choiceForm.foundset);
	else if(ftrForm.vIdLavoratoreSingolo)
		globals.lookupFoundset(globals.getDitta(ftrForm.vIdLavoratoreSingolo),choiceForm.foundset);
		
	var params = 
	{ 
		post_save_callback: 
			function(parameters)
			{
				// Re-apply any filter, plus the request's period
				var filterForm = getFilterForm();
				
//				var dittefs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.DITTE);
//					dittefs.loadRecords(parameters.idditta);
//					
//				filterForm.updateDitta(dittefs.getSelectedRecord());
//				filterForm.vPeriodo = globals.toDate(parameters.periodo);
				
				filterForm.filter();
				
				if(foundset.getSize() > 0)
					sort(foundset, sortFunction);
			}
	};
	
	choiceForm.setParams(params);
	
	globals.ma_utl_setStatus(globals.Status.EDIT, choiceForm.controller.getName(), null, null, true);	
	globals.ma_utl_showFormInDialog(choiceForm.controller.getName(), 'Nuova variazione');
}

/**
 * @properties={typeid:24,uuid:"280B37FB-583F-449A-91A6-C63CF51BB4C8"}
 */
function cancelRequest(requestid)
{
	if(!requestid)
		return false;
	
	try
	{
		databaseManager.startTransaction();
		
		var fs = foundset.duplicateFoundSet().unrelate();
		// Request not found
		if(!fs.loadRecords(requestid))
		{
			databaseManager.rollbackTransaction();
			return false;
		}
		
		// Request updated at hq
		if(globals.isUpdated(requestid, true))
		{
			setStatusWarning('i18n:ma.msg.update_requests');
			databaseManager.rollbackTransaction();
		
			return false;
		}
		
		var request   = fs.getSelectedRecord();
		markRequestAsToCancel(request);

		// throws an exception if unsuccessful
		if(!databaseManager.commitTransaction())
		{
			databaseManager.rollbackTransaction();
			return false;
		}
			
			
		setStatusSuccess();

		return true;
	}
	catch(ex)
	{
		databaseManager.rollbackTransaction();
		application.output(ex.message, LOGGINGLEVEL.ERROR);
		setStatusError(ex.message);
		
		return false;
	}
}

/**
 * @param {JSRecord<db:/ma_richieste/lavoratori_richieste>} request
 *
 * @properties={typeid:24,uuid:"9B042FBD-5A10-42A5-8E44-E2F51FA1EB0B"}
 */
function markRequestAsToCancel(request)
{
	// Set request as TO_CANCEL
	request.tiporettifica = globals.TipoRettifica.ANNULLAMENTO;
}

/**
 * @param {JSRecord<db:/ma_richieste/lavoratori_richieste>} request
 *
 * @properties={typeid:24,uuid:"BD256C22-B8B6-45C6-B2EE-0207DA1F9A6E"}
 */
function markRequestAsToRectify(request)
{
	// Set request as TO_RECTIFY
	request.tiporettifica = globals.TipoRettifica.MODIFICA;
}

/**
 * @properties={typeid:24,uuid:"7B8489AE-37A6-41F4-AADE-E19A0BFC3779"}
 */
function rectifyRequest(requestid)
{
	if(!requestid)
		return false;
	
	try
	{
		databaseManager.startTransaction();
		
		var fs = foundset.duplicateFoundSet().unrelate();
		// Request not found
		if(!fs.loadRecords(requestid))
		{
			databaseManager.rollbackTransaction();
			return false;
		}
		
		var request = fs.getSelectedRecord();
		
		var params              = getParams(fs);
			params.rettificaper = params.recordid;
			params.recordid     = null;													// unset the original request's id, just in case
			
		var editForm = getDetailForm(params, true, request.idlavoratorerichiesta);
		if(!editForm)
			throw new Error("Error while creating the request form, params: " + params.toString());
		
		globals.ma_utl_setStatus(globals.Status.ADD, editForm.name);
		
		var success = globals.ma_utl_showFormDialog({ name: editForm.name, title: 'Rettifica di variazione', blocking: true }) == 1;
		if(!success)
		{
			databaseManager.rollbackTransaction();
			return false;
		}

		markRequestAsToRectify(request);

		if(!databaseManager.commitTransaction())
		{
			databaseManager.rollbackTransaction();
			return false;
		}
		
		setStatusSuccess();
		
		return true;
	}
	catch(ex)
	{
		databaseManager.rollbackTransaction();
		application.output(ex.message, LOGGINGLEVEL.ERROR);
		setStatusError(ex.message);
		
		return false;
	}
}

/**
 * @properties={typeid:24,uuid:"12B97E96-387E-4804-998D-26533CBC6BD1"}
 */
function restoreRequest(requestid)
{
	if(!requestid)
		return false;
	
	try
	{
		var autoSave = databaseManager.getAutoSave();
		
		databaseManager.setAutoSave(false);
		databaseManager.startTransaction();
		
		/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
		var fs = foundset.duplicateFoundSet().unrelate();
		if(!fs.loadRecords(requestid))
			return false;
		
		var request = fs.getSelectedRecord();
		
		var success = true;
		if (request.in_rettifica)
		{
			success = request.lavoratori_richieste_to_lavoratori_richieste_rettifiche.deleteAllRecords();
			if(!success)
			{
				var error = globals.ma_utl_getDatabaseErrors();
				if (error.length > 0)
					throw error[0];
			}
		}
		
		/**
		 * Rimuovi il record di rettifica e ripristina la richiesta allo stato originale
		 */
		request.tiporettifica = globals.TipoRettifica.NESSUNA;
		
		if(!databaseManager.commitTransaction())
		{
			databaseManager.rollbackTransaction();
			return false;
		}
		
		setStatusSuccess();
		updateDetail();

		return true;
	}
	catch(ex)
	{
		globals.ma_utl_rollbackTransaction();
		
		application.output(ex.message, LOGGINGLEVEL.ERROR);
		setStatusError(ex.message);
		
		return false;
	}
	finally
	{
		databaseManager.setAutoSave(autoSave);
	}
}

/**
 * @properties={typeid:24,uuid:"491FDB0B-D3BC-4D4D-BBF2-D228C0DCCEFA"}
 */
function editRequest(request)
{
	var params = getParams(foundset);
	
	var form = getDetailForm(params, true, request ? request.idlavoratorerichiesta : idlavoratorerichiesta);
	if(!form)
		return;
	
	var title = 'Modifica variazione';
	
	databaseManager.setAutoSave(false);
	
	globals.ma_utl_setStatus(globals.Status.EDIT, form.name, params.requiredfields);
	globals.ma_utl_showFormInDialog(form.name, title);
}

/**
 * @properties={typeid:24,uuid:"55F54C09-D366-40C0-9285-F6E4156E2726"}
 */
function updateDetail()
{
	_super.updateDetail();
	
	var params = getParams(foundset);
	var form = getDetailForm(params, false, params.recordid || idlavoratorerichiesta);
	if(!form)
		return;
	
	globals.ma_utl_setStatus(globals.Status.BROWSE, form.name);
	
	if(removeDetail())
		addDetail(form);
}

/**
 * @param form
 *
 * @properties={typeid:24,uuid:"306EE94C-B320-4D90-B8A0-B4CA5720B475"}
 */
function addDetail(form)
{
	if(elements.detail_panel.addTab(form.name, form.name, '', '', '', null, null, null, 2))
       elements.detail_panel.tabIndex = 2;	
}

/**
 * @properties={typeid:24,uuid:"C417C858-001E-416C-8FC1-F161AD653A92"}
 */
function getChoiceForm()
{
	return forms.pvs_richieste_lavoratore_filter_single_dtl.vIdLavoratoreSingolo ? forms.pv_seleziona_richiesta_single_main : forms.pv_seleziona_richiesta_main;
}

/**
 * @properties={typeid:24,uuid:"2079995F-8DB8-44A6-8EC3-DC543CDD3126"}
 */
function getDetailForm(params, edit, id)
{
	// Populate the data array for each field in the form
	var data 					   = {};
		data[idlavoratore_cliente] = { 'decorrenza' : decorrenza, 'dettaglio' : dettaglio, 'terminato' : terminato };
	
	// A query is way faster than foundset processing...
	var sqlQuery = "SELECT Dataprovider, Valore FROM [dbo].[F_Lav_ValoriRichiesta](?)";
	var result   = databaseManager.getDataSetByQuery(globals.Server.MA_RICHIESTE, sqlQuery, [id || idlavoratorerichiesta], -1);

	var dataproviders = result.getColumnAsArray(1);
	var values 		  = result.getColumnAsArray(2);
	
	for(var dp = 0; dp < dataproviders.length; dp++)
		data[idlavoratore_cliente][dataproviders[dp]] = values[dp];
	
	return createDetailForm(params, data, edit);
}

/**
 * @properties={typeid:24,uuid:"66CC9DDD-58D9-4453-BC38-29C39200F44F"}
 */
function createDetailForm(params, data, edit)
{
	var request  = [params.requestcode, params.rulecode].join('_');
	var formName = ['form', request, 'dtl'].join('_');
	
	var form;
	
	var detailForm;
	var categoria = lavoratori_richieste_to_tab_richiestedettaglio.tab_richiestedettaglio_to_tab_richieste.codice;
	switch (categoria)
	{
		case globals.CategoriaRichiesta.MONETARIA:
			detailForm = edit ? forms.pv_variazione_lavoratore_single_lavoratore_monetaria_edit : forms.pv_variazione_lavoratore_monetaria_dtl;
			form = detailForm.createRequestForm
					(
						  params
						, false
						, detailForm
						, edit ? formName + '_edit' : formName
						, data
					);
			break;
		
		case globals.CategoriaRichiesta.INQUADRAMENTO:
			detailForm = edit ? forms.pv_variazione_lavoratore_single_lavoratore_inquadramento_edit : forms.pv_variazione_lavoratore_inquadramento_dtl;
			form = detailForm.createRequestForm
			(
				  params
				, false
				, detailForm
				, edit ? formName + '_edit' : formName
				, data
			);
			break;
			
		case globals.CategoriaRichiesta.ANAGRAFICA:
			detailForm = edit ? forms.pv_variazione_lavoratore_single_lavoratore_anagrafica_edit : forms.pv_variazione_lavoratore_anagrafica_dtl;
			form = detailForm.createRequestForm
			(
				  params
				, false
				, detailForm
				, edit ? formName + '_edit' : formName
				, data
			);
			break;
		
		default:
			form = forms.pv_variazione_lavoratore_dtl.createRequestForm
			(
				  params
				, false
				, forms.pv_variazione_lavoratore_dtl
				, edit ? formName + '_edit' : formName
				, data
			);
	}
	
	forms[form.name]['vClose'] = true;
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"5DEE2727-8748-4E95-AF1C-A3822DCDCD49"}
 */
function sortFunction(first,second)
{
	var dateOrder      = first.richiesta_data > second.richiesta_data ? -1 : 1;
	var firstName      = first.lavoratori_richieste_to_lavoratori.lavoratori_to_persone.nominativo;
	var secondName     = second.lavoratori_richieste_to_lavoratori.lavoratori_to_persone.nominativo;
	
	return dateOrder || (firstName < secondName ? -1 : 1);
}

/**
 * @properties={typeid:24,uuid:"E59CCF3C-6F53-4852-8DEA-32D44B8D96EA"}
 */
function getParams(fs)
{
	if(!fs)
		fs = foundset;
	
	var params 					 = _super.getParams(fs);
		params.idditta 			 = globals.convert_DitteSede2Cliente(fs.idditta);
		params.periodo			 = fs.periodocedolino;
		params.requestcode		 = fs.lavoratori_richieste_to_tab_richiestedettaglio.codice;
		params.requestid		 = fs.idtabrichiestadettaglio;
		params.requesttype       = fs.lavoratori_richieste_to_tab_richiestedettaglio.tab_richiestedettaglio_to_tab_richieste.codice;
		params.ruleid			 = fs.lavoratori_richieste_to_tab_richiestedettagliocondizioni && fs.lavoratori_richieste_to_tab_richiestedettagliocondizioni.idtabrichiestadettagliocondizione;
		params.rulecode			 = fs.lavoratori_richieste_to_tab_richiestedettagliocondizioni && fs.lavoratori_richieste_to_tab_richiestedettagliocondizioni.codice;
		params.iddipendenti		 = fs.lavoratori_richieste_to_lavoratori && [fs.lavoratori_richieste_to_lavoratori.idlavoratore_cliente];
		params.decorrenza		 = fs.decorrenza;
		params.controller		 = globals.PV_Controllers.LAVORATORE;
		params.ammettedecorrenza = fs.lavoratori_richieste_to_tab_richiestedettaglio.ammettedecorrenza;
		params.recordid			 = fs.tiporettifica === globals.TipoRettifica.MODIFICA ? fs.lavoratori_richieste_to_lavoratori_richieste_rettifiche.idlavoratorerichiesta : fs.idlavoratorerichiesta;
		params.autosave			 = databaseManager.getAutoSave();
	    params.dettaglio         = fs.dettaglio;
	    params.terminato         = fs.terminato;
	    
	return params;
}

/**
 * @properties={typeid:24,uuid:"4166C0F8-80C9-432B-9B7E-7A5E1CB3BE02"}
 * @AllowToRunInFind
 */
function deleteAll()
{
	if(!_super.deleteAll())
		return false;
	
	var table   = databaseManager.getTable(foundset.getDataSource());
	var pk      = table && table.getRowIdentifierColumnNames()[0];
	
	var fs = foundset.duplicateFoundSet();
	if (fs && fs.find())
	{
		fs.lavoratori_richieste_to_tab_statooperazioni.codice = globals.RequestStatus.SUSPENDED;
		fs.idlavoratorerichiesta = globals.foundsetToArray(foundset, pk);
		fs.search();
	}
	else
		return false;
	
	var ids = globals.foundsetToArray(fs, pk);
	if(!ids || ids.length === 0)
		return true;

	var sql     = 'DELETE FROM ' + table.getSQLName() + ' WHERE ' + pk + ' IN (' + ids.join(',') + ')';
	var success = plugins.rawSQL.executeSQL(table.getServerName(), table.getSQLName(), sql, []);
	if (success)
	{
		refreshRequests();
		globals.svy_nav_dc_setStatus(globals.Status.BROWSE, controller.getName());
	}
	else
	{
		setStatusError('Errore durante la cancellazione dei dati', 'Errore durante la cancellazione dei dati');
		application.output(plugins.rawSQL.getException().getMessage(), LOGGINGLEVEL.ERROR);
	}
	
	return success;
}

/**
 * @properties={typeid:24,uuid:"0BBE6CF5-E0E4-422B-8E29-E933BBA33163"}
 */
function getFilterForm()
{
	return forms.pvs_richieste_lavoratore_filter_single_dtl.vIdLavoratoreSingolo ? forms.pvs_richieste_lavoratore_filter_single_dtl : forms.pvs_richieste_lavoratore_filter_dtl;
}

/**
 * @properties={typeid:24,uuid:"3AB6B5FF-B2E7-43F6-8B04-596C1DDF9A79"}
 * @AllowToRunInFind
 */
function onActionSendRequests(event)
{
	// Check if we're in DEMO mode, so we disable the sending
	if(globals.ma_utl_getOwnerName(globals.svy_sec_lgn_owner_id) === 'DEMO')
	{
		setStatusWarning('i18n:ma.msg.not_available_in_demo_mode');
		return;
	}
	
	var ftrFrm = forms.pvs_richieste_lavoratore_filter_dtl;

	/**
	 * 
	 */
	var requestsToBeTerminated = getRequestsToBeTerminated(ftrFrm.company.idditta,ftrFrm.periodocedolino);
	if(requestsToBeTerminated && requestsToBeTerminated.getSize())
	{
		// yes/no con seguente visualizzazione del riepilogo di richieste non terminate
		var msg = 'Ci sono ancora delle variazioni il cui inserimento risulta non ancora terminato.\
		           Nella prossima schermata verranno visualizzate e, confermando la selezione, automaticamente terminate e preparate per la successiva fase di invio.\
		           Proseguire?';
		var title = 'Variazioni non pronte all\'invio';
		
		var answer = globals.ma_utl_showYesNoQuestion(msg,title);
		if(!answer)
			return;
		
		var arrRequestsToBeTerminated = globals.foundsetToArray(requestsToBeTerminated,'idlavoratorerichiesta');
		
		/** @type {Array<Number>} */
		var requestsConfirmed = globals.ma_utl_showLkpWindow
		(
			{
				event						: event,
				lookup						: 'PV_Lkp_LavoratoriRichiesteDaTerminare',
				fieldToReturn               : 'idlavoratorerichiesta',
				sortMethod					: 'sortRequestsToSend',
				methodToAddFoundsetFilter	: 'filterRequestsToBeTerminated',
				multiSelect					: true,
				allowInBrowse				: true,
				dateFormat					: 'dd/MM/yyyy HH:mm',
				selectedElements            : arrRequestsToBeTerminated,
				unselectableElements        : arrRequestsToBeTerminated
			}
		);
		
		if(globals.ma_utl_isNullOrEmpty(requestsConfirmed))
			return;
		if(!scopes.richieste.updateRequestsAsTerminated(arrRequestsToBeTerminated))
		{
			setStatusError('Errore durante la terminazione delle variazioni selezionate');
			return;
		}
	}
	
	/**
	 * Show a lookup with the requests currently shown, but add a filter
	 * so to only include those with status 'suspended' or those which
	 * are being overwritten, either by canceling or rectifying them
	 */
	/** @type {Array<JSRecord<db:/ma_richieste/lavoratori_richieste>>} */
	var requests = globals.ma_utl_showLkpWindow
	(
		{
			event						: event,
			lookup						: 'PV_Lkp_LavoratoriRichieste',
			methodToAddFoundsetFilter	: 'filterRequestsToSend',
			sortMethod					: 'sortRequestsToSend',
			multiSelect					: true,
			allowInBrowse				: true,
			returnFullRecords			: true,
			dateFormat					: 'dd/MM/yyyy HH:mm',
			noRecordMessage				: 'L\'elenco non contiene richieste da inviare'
		}
	);
	
	if(globals.ma_utl_isNullOrEmpty(requests))
		return;
	
	if(!scopes.richieste.markRequestsAsSent(requests, reload_job))
		setStatusError('Errore durante la terminazione delle variazioni selezionate');
		
	    // TODO PANNELLO VARIAZIONI
//	var frmFilter = forms.pvs_richieste_lavoratore_filter_dtl;
//	var idDitta = frmFilter.company.idditta;
//	var periodo = (frmFilter.vPeriodoGiornaliera.getFullYear() * 100 + frmFilter.vPeriodoGiornaliera.getMonth() + 1);
//	var grInst = globals.getGruppoInstallazioneDitta(idDitta);
//	var grLav = '';
//	
//	var params = globals.inizializzaParametriAttivaMese(idDitta
//		                                                 ,periodo
//														 ,grInst
//														 ,grLav
//														 ,globals.TipoConnessione.CLIENTE);
//	
//	globals.chiusuraMeseCliente(params,true);	
}

/**
 * @properties={typeid:24,uuid:"1E44A27B-2B63-4191-BC79-DFF7CF2154E3"}
 */
function reload_job()
{
	setStatusNeutral('Aggiornamento dati in corso, ancora un po\' di pazienza...');
	
	var startDate = new Date();
		startDate.setMilliseconds(startDate.getMilliseconds() + 200);
		
	plugins.scheduler.removeJob('reload_job');
	plugins.scheduler.addJob('reload_job', startDate, reload, 1e9, 0, startDate, null);
}

/**
 * @param {JSFoundSet} fs
 * 
 * @return {JSFoundSet}
 * 
 * @properties={typeid:24,uuid:"9DCD3844-2DA9-4BBD-BB6D-6F29730808E5"}
 * @AllowToRunInFind
 */
function filterRequestsToSend(fs)
{
	if(fs)
	{
		var duplicate = foundset.duplicateFoundSet();
		if (duplicate && duplicate.find())
		{
			var requestsToInclude = globals.foundsetToArray(foundset)
									.filter
									(
										function(req)
										{
											var ultimoCedolinoStampato = globals.ma_utl_getUltimoCedolinoStampato(req.idditta);
										    if (ultimoCedolinoStampato >= req.periodocedolino)
												return false;
											else
												return req.status_code === globals.RequestStatus.SUSPENDED		    || 
														(
															req.tiporettifica !== globals.TipoRettifica.NESSUNA 	&& 
															req.status_code   !== globals.RequestStatus.CANCELED 	&& 
															req.status_code   !== globals.RequestStatus.OVERWRITTEN
														);
										}
									);
				
			fs.addFoundSetFilterParam('idlavoratorerichiesta', globals.ComparisonOperator.IN, requestsToInclude.map(function(_){ return _.idlavoratorerichiesta; }), 'ftr_requests_to_send');
		}
	}
		
	return fs;
}

/**
 * @param {JSFoundSet} fs
 * 
 * @return {JSFoundSet}
 * 
 * @properties={typeid:24,uuid:"875EC50E-EDE1-4658-87D2-D110E4F097A2"}
 */
function filterRequestsToBeTerminated(fs)
{
	if(fs)
	{
		var ftrFrm = forms.pvs_richieste_lavoratore_filter_dtl;
		var fsToBeTerminated = getRequestsToBeTerminated(ftrFrm.company.idditta,ftrFrm.periodocedolino);
		var arrToBeTerminated = globals.foundsetToArray(fsToBeTerminated,'idlavoratorerichiesta');
		
		fs.addFoundSetFilterParam('idlavoratorerichiesta', globals.ComparisonOperator.IN, arrToBeTerminated);
	}
	
	return fs;
}

/**
 * @return {JSFoundset}
 *
 * @AllowToRunInFind 
 * @properties={typeid:24,uuid:"A7B44D20-12DE-47A3-85CC-1FE5DE946D74"}
 */
function getRequestsToBeTerminated(idDitta,periodoCedolino)
{
	if(foundset)
	{
		var duplicate = foundset.duplicateFoundSet();
		if (duplicate && duplicate.find())
		{
			duplicate.status_code = globals.RequestStatus.SUSPENDED;
			duplicate.terminato = globals.TipoStatoInserimento.IN_CORSO;
			duplicate.periodocedolino = periodoCedolino;
			
		    duplicate.search();
			
		    return duplicate;
		}		
	}
	return null;
}

/**
 * @properties={typeid:24,uuid:"3F9422DB-A32A-47E2-9697-452FA16CF25C"}
 */
function sortRequestsToSend(first, second)
{	
	var dateOrder;
			
	if(first.rettificaper && second.rettificaper)
		dateOrder = first.lavoratori_richieste_to_lavoratori_richieste_rettificate.richiesta_data > second.lavoratori_richieste_to_lavoratori_richieste_rettificate.richiesta_data ? -1 : 1;
	else if(first.rettificaper)
		dateOrder = first.lavoratori_richieste_to_lavoratori_richieste_rettificate.richiesta_data > second.richiesta_data ? -1 : 1;
	else if(second.rettificaper)
		dateOrder = first.richiesta_data > second.lavoratori_richieste_to_lavoratori_richieste_rettificate.richiesta_data ? -1 : 1;
	else
		dateOrder = first.richiesta_data > second.richiesta_data ? -1 : 1;
		
	var nameOrder = first.nominativo < second.nominativo ? -1 : 1;
	
	return dateOrder || nameOrder;
}