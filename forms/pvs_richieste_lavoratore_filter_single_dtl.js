/**
 * @param firstShow
 *
 * @properties={typeid:24,uuid:"FADCAF68-222F-492D-AA3D-5F1A6FEA0320"}
 * @AllowToRunInFind
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	// aggiornamento ditta selezionata
	var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.DITTE);
    if(fs.find())
    {
    	fs.idditta = globals.getDitta(_to_sec_user$user_id.sec_user_to_sec_user_to_lavoratori.idlavoratore);
    	fs.search();
    }
    
	updateDitta(fs.getSelectedRecord());
	
	// aggiornamento selezione dipendente corentemente loggato
	//frmFilter.vIdLavoratoreSingolo = idLavoratore;
	employees = [vIdLavoratoreSingolo];
	employeeNames = globals.getNominativo(vIdLavoratoreSingolo);
}

/**
 *
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"E5EE5F63-4059-4807-8551-EB26ABB7C7B9"}
 */
function onAction$btn_unfilter(event) 
{
	//_super.onAction$btn_unfilter(event)
	resetSingle();
	is_filtered = false;
	toggleButtons();
}

/**
 * @properties={typeid:24,uuid:"6C3F7089-3DAF-4E18-BE55-AD683A2C6EF4"}
 */
function resetSingle()
{
	request =
	rule =
	vRequestCategory =
	vPeriodo =
	vDecorrenza =
	vRequestDateFrom =
	vRequestDateTo =
	vRequestCode =
	vRequestDescription =
	vRuleCode =
	vRuleDescription =
	vRequestStatus = null;
}
/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {Date} oldValue old value
 * @param {Date} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"CAFBC299-5916-4BB7-8390-4B247279429F"}
 */
function onDataChangePeriodo(oldValue, newValue, event) 
{
	if(newValue)
	{
		var frm = forms.pv_seleziona_richiesta_single_lavoratore_single_variazione;
		if(solutionModel.getForm(frm.controller.getName()))
		{
			frm.vAnno = newValue.getFullYear();
			frm.vMese = newValue.getMonth() + 1;
		}
		return true;
	}
	
	return false;
}
