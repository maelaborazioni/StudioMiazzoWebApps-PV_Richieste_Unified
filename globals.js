/**
 * Returns an object containing the form specification and the exceptions, i.e.
 * records for which some fields must be differently handled.<br/>
 * It basically look for any entity in for which some field is either not enabled 
 * or not visible.
 * 
 * @properties={typeid:24,uuid:"BECB1DBF-22E1-41F9-8C56-01756F2815C3"}
 */
function performRequest(params, requestType)
{
	var wsController = 'Variazioni';
	var wsAction = requestType === globals.TipoRichiesta.SINGOLA ? 'RichiestaSingola' : 'RichiestaMultipla';
	
	var url = [globals.WS_PV_URL, wsController, wsAction].join('/');
	var response = globals.getWebServiceResponse(url, params);
	
	return response;
}

/**
 * @properties={typeid:24,uuid:"11D7BE29-42FA-467F-986C-DB479F73B4C2"}
 * @AllowToRunInFind
 */
function openRequestSelection()
{
	if(globals.ma_utl_hasKeySede())
	{
		globals.ma_utl_showErrorDialog('i18n:ma.msg.not_available');
		return;
	}
	
	var frm = forms.pv_selezione;
	frm._nuovaVariazione = true;
	globals.ma_utl_showFormInDialog(frm.controller.getName(),'Seleziona ditta e periodo cedolino');
}

/**
 * @properties={typeid:24,uuid:"92F9220E-AD16-4FB8-9693-AE0526D9658C"}
 */
function openRequestTrackSelection()
{
	if(globals.ma_utl_hasKeySede())
	{
		globals.ma_utl_showErrorDialog('i18n:ma.msg.not_available');
		return;
	}
	
	var frm = forms.pvd_selezione_welfare;
	globals.ma_utl_showFormInDialog(frm.controller.getName(),'Seleziona i parametri per l\'importazione');
}

/**
 * @properties={typeid:24,uuid:"8378682D-B2EB-402C-8AE0-0145F221D514"}
 */
function openRequest()
{
	if(globals.ma_utl_hasKeySede())
	{
		globals.ma_utl_showErrorDialog('i18n:ma.msg.not_available');
		return;
	}
	
	var frm = forms.pv_selezione;
	frm._nuovaVariazione = false;
	globals.ma_utl_showFormInDialog(frm.controller.getName(),'Seleziona ditta e periodo cedolino');
}

/**
 * @properties={typeid:24,uuid:"5FFE5ACA-8FAC-4562-8DE3-EC5032285D6A"}
 */
function openRequestSingle()
{
	var frm = forms.pvd_selezione;
	frm._nuovaVariazione = true;
	globals.ma_utl_showFormInDialog(frm.controller.getName(),'Seleziona periodo variazioni');
}

/**
 * @properties={typeid:24,uuid:"E0CE2B30-7B7C-46E9-9D40-D0925918B0E3"}
 */
function openGestioneRichieste()
{
	var idditta = globals._filtroSuDitta;
	if(!idditta) 
	{
		idditta = globals.ma_utl_showLkpWindow
		(
			{
				lookup						: 'AG_Lkp_Ditta',
				methodToAddFoundsetFilter	: 'filtraDittaStandard',
				allowInBrowse				: true
			}
		);
	}
	
	if(idditta)
	{
		var form = globals.openProgram('PVA_GestioneRichieste');
		lookup(idditta, form);
	}
}

/**
 * @return {{ rulesperemployee, rulesspecification }}
 * 
 * @properties={typeid:24,uuid:"F9BE4A1C-3B86-4B7F-916A-C4D4F7D0B045"}
 */
function FiltraRegoleLavoratori(params)
{
	var url = [globals.WS_PV_URL, globals.PV_Controllers.LAVORATORE, 'FiltraRegoleLavoratori'].join('/');
	/** @type {{ rulesperemployee, rulesspecification }} */
	var response = getWebServiceResponse(url, params);
	
	return response;
}

/**
 * Costruisce e mostra la form relativa al dettaglio giornaliero della voce selezionata
 * 
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"825055B0-DBCA-4992-ABA1-998EF09C7707"}
 */
function onActionBtnDettaglioGiorni(event)
{
	// costruzione della form per l'inserimento delle richieste sui singoli giorni
	var frmName = event.getFormName();
	/** @type {RuntimeForm<pv_variazione_lavoratore_single_lavoratore_monetaria_edit>}*/
	var frm = forms[frmName];
	var params = frm['vParams'];
	var data = null;
	var layoutParams = frm.getLayoutParams(false);
	var extendsForm = forms.pv_variazione_lavoratore_single_lavoratore_monetaria_edit;
	var detailForm = frm.createRequestFormDetail(params, false, extendsForm,frmName + '_detail',data,layoutParams);
	
	globals.ma_utl_showFormDialog({ name: detailForm.name, title: 'Dettaglio variazione', blocking: true});
	
}

/**
 * TODO generated, please specify type and doc for the params
 * @param {Array<Number>} arrLavoratoriRichieste
 * 
 * @return {RuntimeForm<>}
 * 
 * @properties={typeid:24,uuid:"17371ADE-74CD-4CF5-823C-308D2E114609"}
 */
function costruisciRiepilogoAnomalieRichieste(arrLavoratoriRichieste)
{
	var frm = forms.pvl_welfare_richieste_tbl;
	var frmName = frm.controller.getName();
	var frmNameTemp = frmName + '_temp';

	var frmTab = forms.pvl_welfare_richieste_tab;
	
	frmTab.elements.tab_welfare.removeAllTabs();
	
    if(forms[frmNameTemp] != null)
    {
		history.removeForm(frmNameTemp);
        solutionModel.removeForm(frmNameTemp);
    }
    
    solutionModel.cloneForm(frmNameTemp,solutionModel.getForm(frmName));
    
    var cols = ['id','codice','nominativo','tipo_richiesta','quantita','base','importo','escludi'];
    
    var types = [JSColumn.NUMBER,JSColumn.NUMBER,JSColumn.TEXT,JSColumn.TEXT,JSColumn.NUMBER,JSColumn.NUMBER,JSColumn.NUMBER,JSColumn.NUMBER];

    var ds = databaseManager.createEmptyDataSet(0,cols);
    
    for(var i = 1; i <= arrLavoratoriRichieste.length; i++)
    {
    	if(arrLavoratoriRichieste[i])
    	{
    		var obj = getInfoFromWelfareRichiesta(arrLavoratoriRichieste[i])
    		var currRow = [obj['id'],obj['codice'],obj['nominativo'],obj['tipo_richiesta'],obj['quantita'],obj['base'],obj['importo'],0];
    	
    		ds.addRow(currRow);
    	}
    }
    
    var dS = ds.createDataSource('dS_' + application.getUUID(),types);
    solutionModel.getForm(frmNameTemp).dataSource = dS;
    solutionModel.getForm(frmNameTemp).getField('fld_id').dataProviderID = 'id';
    solutionModel.getForm(frmNameTemp).getField('fld_codice').dataProviderID = 'codice';
    solutionModel.getForm(frmNameTemp).getField('fld_nominativo').dataProviderID = 'nominativo';
    solutionModel.getForm(frmNameTemp).getField('fld_tipo_richiesta').dataProviderID = 'tipo_richiesta';
    solutionModel.getForm(frmNameTemp).getField('fld_quantita').dataProviderID = 'quantita';
    solutionModel.getForm(frmNameTemp).getField('fld_base').dataProviderID = 'base';
    solutionModel.getForm(frmNameTemp).getField('fld_importo').dataProviderID = 'importo';
    solutionModel.getForm(frmNameTemp).getField('fld_escludi').dataProviderID = 'escludi';
    
    frmTab.elements.tab_welfare.addTab(frmNameTemp);
    
    return frmTab;
}


/**
 * @AllowToRunInFind
 * 
 * TODO generated, please specify type and doc for the params
 * @param {Number} idLavoratoreRichiesta
 * 
 * 
 * @properties={typeid:24,uuid:"1B08B007-F685-4BBC-B27C-84D72DA0C159"}
 */
function getInfoFromRichiesta(idLavoratoreRichiesta)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,globals.Table.LAVORATORI_RICHIESTE);
	if(fs.find())
	{
		fs.idlavoratorerichiesta = idLavoratoreRichiesta;
		
		if(fs.search())
		{
			var idLavoratore = globals.ma_utl_lav_toCliente(fs.idlavoratore);
			var tipoRichiesta = fs.lavoratori_richieste_to_tab_richiestedettaglio.codice + ' - ' + fs.lavoratori_richieste_to_tab_richiestedettaglio.descrizione;
			var importo = getImportoFromRichiesta(idLavoratoreRichiesta);
			
			return {
				codice : globals.getCodLavoratore(idLavoratore),
				nominativo : globals.getNominativo(idLavoratore),
				tipo_richiesta : tipoRichiesta,
				valore_richiesta : importo
			}
		}
	}
	
	return null;
}

/**
 * @AllowToRunInFind
 * 
 * TODO generated, please specify type and doc for the params
 * @param {Number} idWelfareLavoratoreRichiesta
 *
 * @properties={typeid:24,uuid:"A91A902E-6522-4B60-B6E0-0C73EC31A170"}
 */
function getInfoFromWelfareRichiesta(idWelfareLavoratoreRichiesta)
{
	/** @type {JSFoundSet<db:/ma_richieste/welfare_lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,'welfare_lavoratori_richieste');
	if(fs.find())
	{
		fs.idwelfarelavoratorerichiesta = idWelfareLavoratoreRichiesta;
		if(fs.search())
		{
			var idLavoratore = globals.ma_utl_lav_toCliente(fs.welfare_lavoratori_richieste_to_lavoratori_richieste.idlavoratore);
						
			var obj = {
				id : idWelfareLavoratoreRichiesta,
				codice : globals.getCodLavoratore(idLavoratore),
				nominativo : globals.getNominativo(idLavoratore),
				quantita : fs.quantita,
				base : fs.base,
				importo : fs.importo,
				tipo_richiesta : getDescrizioneTracciatoConversione(fs.welfare_lavoratori_richieste_to_welfare_ditte_richieste.idtabwelfaredittatracciato
					                                                ,fs.welfare_lavoratori_richieste_to_welfare_ditte_richieste.idtabwelfaretipopiano
																	,fs.codicetracciato
																	,fs.codicetracciatodettaglio)
			}
			
			return obj;
		}
	}
	
	return null;
}

/**
 * @AllowToRunInFind
 * 
 * TODO generated, please specify type and doc for the params
 * @param {Number} idTabWelfareDittaTracciato
 * @param {Number} idTabWelfareTipoPiano
 * @param {String} codiceTracciato
 * @param {String} codiceTracciatoDettaglio
 *
 * @properties={typeid:24,uuid:"97C39058-ADDC-4512-960B-B5C01EBDAA1A"}
 */
function getDescrizioneTracciatoConversione(idTabWelfareDittaTracciato,idTabWelfareTipoPiano,codiceTracciato,codiceTracciatoDettaglio)
{
	/** @type {JSFoundSet<db:/ma_richieste/tab_welfare_dittetracciati_conversione>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,'tab_welfare_dittetracciati_conversione');
	if(fs.find())
	{
		fs.idtabwelfaredittatracciato = idTabWelfareDittaTracciato;
		fs.idtabwelfaretipopiano = idTabWelfareTipoPiano;
		fs.codicetracciato = codiceTracciato;
		fs.codicetracciatodettaglio = codiceTracciatoDettaglio;
		
		if(fs.search())
			return fs.descrizionetracciato;
	}
	
	return '';
}


/**
 * @AllowToRunInFind
 * 
 * TODO generated, please specify type and doc for the params
 * @param idLavoratoreRichiesta
 *
 * @properties={typeid:24,uuid:"C22447C6-BEEA-4079-B779-910912344BE3"}
 */
function getImportoFromRichiesta(idLavoratoreRichiesta)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richiestecampi>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,'lavoratori_richiestecampi');
	if(fs.find())
	{
		fs.idlavoratorerichiesta = idLavoratoreRichiesta;
		fs.codice = 'IMP';
	
		if(fs.search())
			return fs.valore;
	}
	
	return null;
}

/**
 * @AllowToRunInFind
 * 
 * Elimina il record in tabella relativo al file temporaneo caricato
 * 
 * @param {String} fileId
 *
 * @properties={typeid:24,uuid:"6025C5D3-1848-43CE-8B1C-FFF050643B33"}
 */
function eliminaTemporaryFile(fileId)
{
	/** @type {JSFoundSet<db:/ma_richieste/ditte_temporaryfile>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,'ditte_temporaryfile');
	if(fs.find())
	{
		fs.id = fileId;
		if(fs.search())
			return fs.deleteRecord(fs.getSelectedRecord());
	}
	
	return false;
}