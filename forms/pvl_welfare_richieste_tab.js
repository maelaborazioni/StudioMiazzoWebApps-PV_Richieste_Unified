/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"DEE4F291-DE77-43FC-A521-54F2F45E384C",variableType:4}
 */
var vIdDitta = -1;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9D97709F-049F-4EA1-9CC2-380C73A7C27F",variableType:4}
 */
var vPeriodo = -1;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"639A1E18-B441-48E2-89B1-C89F0B4E1820",variableType:4}
 */
var vIdTabDittaTracciatoWelfare = -1;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9E64350A-FB00-4CF7-85A4-10CDDD792C67",variableType:4}
 */
var vIdTabPianoWelfare = 1;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"7F0B64CA-D3CA-4451-9DAB-2A6396FB8AA0",variableType:4}
 */
var vAnnoContabile = -1;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"C91ED165-B82C-42F9-9A16-2E9FA576EC78"}
 */
var vFileId = '';

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"1B8FBDFF-9CFE-4C1A-AC21-E621EC43C008"}
 */
function onActionAnnulla(event) 
{
	if(!globals.eliminaTemporaryFile(vFileId))
		globals.ma_utl_showWarningDialog('Non è stato possibile eliminare il file caricato avente id ' + vFileId + ', contattare il servizio di assistenza','Annulla importazione tracciato welfare');

	globals.ma_utl_setStatus(globals.Status.BROWSE,controller.getName());
	globals.svy_mod_closeForm(event);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"753D8389-1082-4DA5-80D5-1BA5A0E4BED8"}
 */
function onActionConferma(event) 
{
	var arrWelfareLavRichDaEscludere = [];
	var frmTbl = forms[forms.pvl_welfare_richieste_tbl.controller.getName() + '_temp'];
	var fs = frmTbl.foundset;
	
	for(var i = 1; i <= fs.getSize(); i++)
	{
		var rec = fs.getRecord(i);	
		if(rec['escludi'])
			arrWelfareLavRichDaEscludere.push(rec['id']);			
	}
	
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
        processArgs: [event,arrWelfareLavRichDaEscludere]
    };
	
	plugins.busy.block(params);		
}

/**
 * @param {JSEvent} event
 * @param {Array<Number>} arrWelfareLavRichDaEscludere
 * 
 * @properties={typeid:24,uuid:"838480D5-3C8D-4CB3-98E6-EA5544BDAD09"}
 */
function process_importazione_welfare(event,arrWelfareLavRichDaEscludere)
{
	globals.importaTracciatoWelfareDaFileEsterno(vIdDitta,vPeriodo,vIdTabDittaTracciatoWelfare,vIdTabPianoWelfare,vAnnoContabile,vFileId, arrWelfareLavRichDaEscludere);
	globals.ma_utl_setStatus(globals.Status.BROWSE,controller.getName());
	globals.svy_mod_closeForm(event);
	plugins.busy.unblock();
}