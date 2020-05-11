/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"167B0C0D-F3E5-4A87-AF80-7F06F2A14552",variableType:8}
 */
var _idTabDittaTracciatoWelfare = null;
/**
 * @properties={typeid:35,uuid:"A051B0AB-54D3-4BCF-B588-344E6FC6FB9B",variableType:-4}
 */
var _idTabTracciatoWelfare = null;
/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"F8B34106-F346-4D31-B008-01BAAAA9E216"}
 */
var _codTracciatoWelfare = null;

/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"70A0C5F7-CDDE-4A8B-A8D3-D029F9759349"}
 */
var _descTracciatoWelfare = null;

/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"00AA0028-BF80-4CB6-9942-9DF5A5913AF8",variableType:8}
 */
var _idTabTipoPianoWelfare = null;
/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"8BE2D0D1-9736-4910-98C5-5D9E9B2243C2"}
 */
var _codTipoPianoWelfare = null;

/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"CE91DB49-A6F1-46B7-BAC6-228E125E63B5"}
 */
var _descTipoPianoWelfare = null;

/**
 * @type {String}
 * 
 * @properties={typeid:35,uuid:"38825800-0DAC-45D3-8650-F676E44A667D"}
 */
var _fileId = null;

/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"5696AD8A-7285-44C0-977C-E39E0C71A1C8",variableType:8}
 */
var _annoContabile = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"3D6C5DEB-D81B-445B-B7A7-0409DC5856C7"}
 */
var _message = '';

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"AD6926D6-FA54-4398-884B-296AF3F7A5B9"}
 */
function lookupTracciatoWelfare(event) 
{
	// seleziona tracciato tra quelli disponibili per la ditta selezionata
	globals.ma_utl_showLkpWindow({ 
									event: event, 
							        lookup: 'PV_Lkp_DitteTracciati',
									methodToAddFoundsetFilter: 'filterTracciatiDitta',
									methodToExecuteAfterSelection : 'updateDittaTracciati',
									multiSelect : false
								  });	
}

/**
 * TODO generated, please specify type and doc for the params
 * @param event
 *
 * @properties={typeid:24,uuid:"6F809FD3-808B-492A-8070-8A386CF8AEAF"}
 */
function lookupTipoPianoWelfare(event)
{
	globals.ma_utl_showLkpWindow({ 
									event: event, 
							        lookup: 'PV_Lkp_TipiPiani',
									methodToExecuteAfterSelection: 'updateTipoPiano',
									multiSelect : false
    });
}

/**
 * @param {JSFoundSet<db:/ma_richieste/tab_welfare_dittetracciati>} fs
 *
 * @properties={typeid:24,uuid:"390DFD5A-0629-4DF4-989B-6964757A0A54"}
 */
function filterTracciatiDitta(fs)
{
	fs.addFoundSetFilterParam('idditta','=',globals.ma_utl_ditta_toSede(_idditta));
	return fs;
}

/**
 * @param {JSFoundSet<db:/ma_richieste/tab_welfare_tracciati>} fs
 *
 * @properties={typeid:24,uuid:"3295B666-F525-471B-9935-FCE2EE7268E9"}
 */
function filterTracciati(fs)
{
	return fs;
}

/**
 * @param {JSRecord<db:/ma_richieste/tab_welfare_dittetracciati>} rec
 *
 * @properties={typeid:24,uuid:"B5A592A8-A1BA-4F12-A08C-1FD851B8434A"}
 */
function updateDittaTracciati(rec)
{
	_idTabDittaTracciatoWelfare = rec.idtabwelfaredittatracciato;
	_codTracciatoWelfare = rec.idtabwelfaretracciato
	_descTracciatoWelfare = rec.annotazioni;
}

/**
 * @param {JSRecord<db:/ma_richieste/tab_welfare_tipipiani>} rec
 *
 * @properties={typeid:24,uuid:"E532127C-1D61-460B-BA46-E2AB853B2FA2"}
 */
function updateTipoPiano(rec)
{
	_idTabTipoPianoWelfare = rec.idtabwelfaretipopiano;
	_codTipoPianoWelfare = rec.codice;
	_descTipoPianoWelfare = rec.descrizione;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"F89DF3B6-548B-4A54-8218-CD8E8106EEE0"}
 */
function onActionUploadExternalTrack(event) 
{
	plugins.file.showFileOpenDialog(null,null,false,null,uploadFile,'Seleziona file tracciato Welfare da importare');
}

/**
 * @param {Array<plugins.file.JSFile>} files
 *
 * @properties={typeid:24,uuid:"B026693B-11D6-465D-B61F-30F2787B9BE2"}
 */
function uploadFile(files) 
{
	try {
		if (files && files[0]) 
		{
			var fileName = files[0].getName();
			
			/** @type {JSFoundSet<db:/ma_richieste/ditte_temporaryfile>} */
			var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,'ditte_temporaryfile'); 
			var rec = fs.getRecord(fs.newRecord());
			rec.id = application.getUUID().toString().toLowerCase();
			rec.original_file_name = fileName;
			rec.idditta = globals.ma_utl_ditta_cliente2Sede(_idditta);
			rec.file_type = 'text/csv';
			rec.upload_date = new Date();
			rec.file_bytes = files[0].getBytes();
			
			if(!databaseManager.saveData(rec))
				throw new Error('Error during record saving...');
		
			_message = 'File caricato correttamente';
			_fileId = rec.id;
		}
		else
			_message = 'Nessun file caricato';
	}
	catch (ex) 
	{
		application.output(ex.message, LOGGINGLEVEL.ERROR);
		_message = 'Errore durante il caricamento del file. Contattare il servizio di assistenza dello studio';
		databaseManager.rollbackTransaction();
	}
	finally
	{		
	}
}

/**
 * @properties={typeid:24,uuid:"93063513-84B3-456D-BD81-8F823A2C2CFF"}
 */
function validaDittaPeriodoImportazione()
{
	if(!_idditta)
	{	
		globals.ma_utl_showWarningDialog('Specificare la ditta interessata');
		return false;
	}
	if(!_meseCed || !_annoCed)
	{	
		globals.ma_utl_showWarningDialog('Specificare il periodo relativo all\'importazione');
		return false;
	}
	if(!_idTabDittaTracciatoWelfare)
	{	
		globals.ma_utl_showWarningDialog('Specificare il tracciato richiesto per l\'importazione');
		return false;
	}
	if(!_idTabTipoPianoWelfare)
	{	
		globals.ma_utl_showWarningDialog('Specificare il tipo di piano richiesto perl\'importazione');
		return false;
	}
	if(!_annoContabile)
	{	
		globals.ma_utl_showWarningDialog('Specificare l\'anno contabile di riferimento');
		return false;
	}
	if(!_fileId)
	{
		globals.ma_utl_showWarningDialog('Effettuare il caricamento del file da importare');
		return false;
	}
	
	return true;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A2AB1ADE-3FC2-4242-8422-BF73F53DB7EF"}
 */
function confermaDittaPeriodoImportazione(event) 
{
	if(!validaDittaPeriodoImportazione())
		return;
	
	var params = {
        processFunction: process_importazione_welfare,
        message: '', 
        opacity: 0.5,
        paneColor: '#434343',
        textColor: '#EC1C24',
        showCancelButton: false,
        cancelButtonText: '',
        dialogName : '',
        fontType: 'Arial,4,25',
        processArgs: [event]
    };
	
	var arrLavRich = check_welfare();
	if(arrLavRich && arrLavRich.length)
	{
		// verifica effettiva presenza di voci ancora inserite
		var cols = ['id'];
		var ds = databaseManager.createEmptyDataSet(0, cols);
		for(var i = 1; i <= arrLavRich.length; i++)
	    {
	    	if(arrLavRich[i])
	    	{
	    		var obj = globals.getInfoFromWelfareRichiesta(arrLavRich[i])
	    		if(obj)
	    		{
	    			var currRow = [obj['id']];
	    	   		ds.addRow(currRow);
	    		}
	    	}
	    }
		
	    if(ds.getMaxRowIndex())
	    {
			// ricostruisci form di scelta sovrascrittura richieste
			/** @type {RuntimeForm<pvl_welfare_richieste_tab>} */
			var frm = globals.costruisciRiepilogoAnomalieRichieste(arrLavRich);
			frm.vIdDitta = _idditta;
			frm.vPeriodo = _annoCed * 100 + _meseCed;
			frm.vIdTabDittaTracciatoWelfare = _idTabDittaTracciatoWelfare;
			frm.vIdTabPianoWelfare = _idTabTipoPianoWelfare;
			frm.vAnnoContabile = _annoContabile;
			frm.vFileId = _fileId;
			
			globals.svy_mod_closeForm(event);
			globals.ma_utl_showFormInDialog(frm.controller.getName(),'Richieste da importare già presenti');
			globals.ma_utl_setStatus(globals.Status.EDIT,frm.controller.getName());
	    }
	    else
	    	plugins.busy.block(params);
	}
	else
		plugins.busy.block(params);	
}

/**
 * @param event
 *
 * @properties={typeid:24,uuid:"C449C2CF-3F72-45B9-A052-8FDD3531C1EC"}
 */
function process_importazione_welfare(event)
{
	globals.importaTracciatoWelfareDaFileEsterno(_idditta,_annoCed * 100 + _meseCed,_idTabDittaTracciatoWelfare,_idTabTipoPianoWelfare,_annoContabile,_fileId);
	globals.svy_mod_closeForm(event);
	plugins.busy.unblock();	
}

/**
 * @return {Array<Number>}
 *
 * @properties={typeid:24,uuid:"54E31A58-FFC9-44E7-9580-DC20F104CD6E"}
 */
function check_welfare()
{
	var response = globals.checkTracciatoWelfareDaFileEsterno(_idditta,_annoCed * 100 + _meseCed,_idTabDittaTracciatoWelfare,_idTabTipoPianoWelfare,_annoContabile,_fileId);
	if(!response['returnValue'])
	{
		var arrLavRich = response['lavoratoriRichieste'];
		return arrLavRich;
	}	
	
	return null;	
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"C1040320-E782-411C-B529-AF70E1D459B3"}
 */
function onShow(firstShow, event) 
{
	_super.onShowForm(firstShow,event);
	_idTabDittaTracciatoWelfare = null;
	_codTracciatoWelfare = '';
	_descTracciatoWelfare = '';
	_idTabTipoPianoWelfare = null;
	_codTipoPianoWelfare = '';
	_descTipoPianoWelfare = '';
	_fileId = null;
	_message = 'Nessun file caricato';
	globals.ma_utl_setStatus(globals.Status.EDIT,controller.getName());
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"14AB9E5D-6AC0-427E-9E50-7E0FB7E595E3"}
 */
function onActionAnnullaSelezione(event) 
{
	if(_fileId && !globals.eliminaTemporaryFile(_fileId))
		globals.ma_utl_showWarningDialog('Non è stato possibile eliminare il file caricato avente id ' + _fileId + ', contattare il servizio di assistenza','Annulla importazione tracciato welfare');
		
	globals.ma_utl_setStatus(globals.Status.BROWSE,controller.getName());
	globals.svy_mod_closeForm(event);
}
