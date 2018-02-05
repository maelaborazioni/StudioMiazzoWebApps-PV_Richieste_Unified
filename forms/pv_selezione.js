/**
 * @type {Boolean}
 * 
 * @properties={typeid:35,uuid:"B73A2C96-7BC1-4B3D-A0AA-43C75188141A",variableType:-4}
 */
var _nuovaVariazione = null;

/**
 * Handle changed data.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"9CD8B8FC-B1D6-4C21-B161-696B8A493E5B"}
 */
function onDataChangeAnnoCed(oldValue, newValue, event) {
	if(newValue && _meseCed)
		aggiornaPeriodoGiornaliera(newValue,_meseCed);
	return true
}

/**
 * Handle changed data.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"91DA48AC-54D3-4831-9DB2-B4CE89681669"}
 */
function onDataChangeMeseCed(oldValue, newValue, event)
{
	if(newValue && _annoCed)
		aggiornaPeriodoGiornaliera(_annoCed,newValue);
	return true
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 * @param {Number} [idLavoratore]
 * 
 * @properties={typeid:24,uuid:"0FF9D483-3C40-49A9-AFF6-BAF3584B1831"}
 * @AllowToRunInFind
 */
function confermaDittaPeriodoCedolinoVariazioni(event,idLavoratore) 
{
	var params = {
        processFunction: process_ditta_periodo_cedolino,
        message: '', 
        opacity: 0.5,
        paneColor: '#434343',
        textColor: '#EC1C24',
        showCancelButton: false,
        cancelButtonText: '',
        dialogName : '',
        fontType: 'Arial,4,25',
        processArgs: [event,idLavoratore]
    };
	plugins.busy.block(params);
}

/**
 * @param {JSEvent} event
 * @param {Number} [idLavoratore]
 * 
 * @properties={typeid:24,uuid:"06E8832E-7E93-4072-B346-961B1818F82B"}
 * @AllowToRunInFind
 */
function process_ditta_periodo_cedolino(event,idLavoratore)
{
	try
	{	
		var frm = controller.getName() == forms.pvd_selezione.controller.getName() ? forms.pvs_richieste_lavoratore_filter_single_dtl : forms.pvs_richieste_lavoratore_filter_dtl;
		var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE,globals.Table.DITTE);
		if(fs.find())
		{
			fs.idditta = _idditta;
			
			if(idLavoratore)
				fs.idlavoratore = idLavoratore;
			
			if(fs.search())
			{
				frm.company = fs.getRecord(1);
				frm.vCodDitta = frm.company.codice;
				frm.vRagioneSociale = frm.company.ragionesociale;
				frm.vPeriodo = new Date(_annoCed,_meseCed - 1,1);
			    frm.vPeriodoGiornaliera = new Date(_anno,_mese,1);
			    
				if(_codgrlav)
				{
			    	frm.vCodGruppoLav = _codgrlav;
			    	frm.vDescGruppoLav = _descgrlav;
				}
								
			    if(frm.elements.btn_selgruppolav)
			    	frm.elements.btn_selgruppolav.enabled = scopes.giornaliera.haGruppiLavoratori(frm.company.idditta);
			}
		}
		
		globals.ma_utl_setStatus(globals.Status.BROWSE,frm.controller.getName());
		globals.svy_mod_closeForm(event);
		
		if(idLavoratore)
		{
			var frmFilter = forms.pvs_richieste_lavoratore_filter_single_dtl;
			frmFilter.vIdLavoratoreSingolo = idLavoratore;
			var frmRicInvio = forms.pvs_richieste_lavoratore_dainviare_main;
			frmRicInvio.elements.btn_sendrequests.visible =
				frmRicInvio.elements.btn_deleteall.visible =
					frmRicInvio.elements.btn_reload.visible = false;
			var frmRicElab = forms.pvs_richieste_lavoratore_daelaborare_main;
			frmRicElab.elements.btn_sendrequests.visible =
				frmRicElab.elements.btn_deleteall.visible =
					frmRicElab.elements.btn_reload.visible = false;
			var frmRicDaElab = forms.pvs_richieste_lavoratore_elaborate_main;
			frmRicDaElab.elements.btn_sendrequests.visible =
				frmRicDaElab.elements.btn_deleteall.visible =
					frmRicDaElab.elements.btn_reload.visible = false;
			var frmTutte = forms.pvs_richieste_lavoratore_main;
			frmTutte.elements.btn_sendrequests.visible =
				frmTutte.elements.btn_deleteall.visible =
					frmTutte.elements.btn_reload.visible = false;		
			
			// verificare se è già stato effettutato un invio di variazioni nel periodo : se sì inibiamo
			// l'apertura automatica della form di inserimento
			var arrRequestSent = scopes.richieste.getRequestsSent(frm.company.idditta_sede,frm.periodocedolino || (frm.vPeriodo.getFullYear() * 100 + frm.vPeriodo.getMonth() + 1));
			if(arrRequestSent && arrRequestSent.length)
				_nuovaVariazione = false;
													
			globals.openProgram('PVL_StoricoRichieste_Single', null, true);
		}
		else
			globals.openProgram('PVL_StoricoRichieste', null, true);
	
		if(_nuovaVariazione)
	       globals.ma_utl_getBottomForm().newRequest();
	}
	catch(ex)
	{
		var msg = 'Metodo process_ditta_periodo_cedolino : ' + ex.message;
		globals.ma_utl_showErrorDialog(msg)
		globals.ma_utl_logError(msg,LOGGINGLEVEL.ERROR);
	}
	finally
	{
		plugins.busy.unblock();
	}
}

/**
*
* @param _firstShow
* @param _event
*
* @properties={typeid:24,uuid:"9B9FA358-E6DC-4DE6-BA72-F7BD0EB54FC4"}
*/
function onShowForm(_firstShow, _event) 
{
	_super.onShowForm(_firstShow, _event);
	
	globals.ma_utl_setStatus(globals.Status.EDIT,controller.getName());
}
