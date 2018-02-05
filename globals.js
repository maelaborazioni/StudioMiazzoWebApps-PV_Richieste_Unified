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