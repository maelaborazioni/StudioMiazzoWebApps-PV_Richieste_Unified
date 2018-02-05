/**
 * @properties={typeid:35,uuid:"0DD4F151-7954-48B6-8B3B-D5CAEE11DF92",variableType:-4}
 */
var vParams = {};

/**
 * @properties={typeid:24,uuid:"282F97E0-9982-45B4-B89A-AD53CE695EA5"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	if(globals._filtroSuDitta)
		globals.lookupFoundset(globals._filtroSuDitta, foundset);
	
	// onTabChange is not triggered the first time you open a form
	var previousIndex = elements.selezione_panel.tabIndex;
	onTabChange(previousIndex, null);
}

/**
 * Callback method when the user changes tab in a tab panel or divider position in split pane.
 *
 * @param {Number} previousIndex index of tab shown before the change
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"B9B63F47-DFBD-4D38-945F-D2BBFCB9F927"}
 */
function onTabChange(previousIndex, event) 
{
	/**
	 * Put the current tab in edit mode
	 */
	var currentIndex = elements.selezione_panel.tabIndex;
	globals.ma_utl_setStatus(globals.Status.EDIT, elements.selezione_panel.getTabFormNameAt(currentIndex));
	
	/**
	 * Copy over all the previous form's variable
	 */
	/** @type {Form<pv_seleziona_richiesta_dtl>} */
	var currentForm  = forms[elements.selezione_panel.getTabFormNameAt(currentIndex)];
	/** @type {Form<pv_seleziona_richiesta_dtl>} */
	var previousForm = forms[elements.selezione_panel.getTabFormNameAt(previousIndex)];
	
	currentForm.updatePeriodo(previousForm.vAnno, previousForm.vMese);
	currentForm.updateCategoria(previousForm.categoria);
	currentForm.updateGruppo(previousForm.gruppo);
}

/**
 * @properties={typeid:24,uuid:"E63AD477-A783-4A82-A45B-AED461FC576E"}
 */
function getParams()
{	
	return vParams;
}

/**
 * @properties={typeid:24,uuid:"BE4B8257-D569-44AB-9FC4-A73CDC4F4199"}
 */
function setParams(params)
{
	vParams = params;
}
