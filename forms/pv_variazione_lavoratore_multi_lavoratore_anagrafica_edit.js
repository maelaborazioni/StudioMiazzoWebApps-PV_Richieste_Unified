/**
 * @properties={typeid:24,uuid:"058B5BD1-0CC8-4F52-8086-CF85FE062FD7"}
 */
function getSpecification(params)
{
	return forms.pv_variazione_lavoratore_anagrafica_dtl.getSpecification(params);
}

/**
 * @properties={typeid:24,uuid:"C641D2DE-9EE2-4750-BCC5-03812C9707EF"}
 */
function getFormDataSet(specification, params, data)
{
	return forms.pv_variazione_lavoratore_anagrafica_dtl.getFormDataSet(specification,params);
}

/**
 * @properties={typeid:24,uuid:"910618F7-32A7-4D2B-8BE0-D01A03C56211"}
 */
function setFormDataProviders(form, params)
{
	return forms.pv_variazione_lavoratore_anagrafica_dtl.setFormDataProviders(form, params);
}

/**
 * @properties={typeid:24,uuid:"7B3EE3A3-4879-425B-A940-5EFE0E4AD968"}
 * @AllowToRunInFind
 */
function setRequiredFields(specification, programName, params, form)
{
	return forms.pv_variazione_lavoratore_single_lavoratore_anagrafica_edit.setRequiredFields(specification,programName,params, form);
}

/**
 * @properties={typeid:24,uuid:"957F5E57-98D1-4480-A5A8-5ECB438FAA11"}
 */
function setFormVariables(form,params,layoutParams,isMultiple)
{
	return forms.pv_variazione_lavoratore_anagrafica_dtl.setFormVariables(form,params,layoutParams,isMultiple);
}

/**
 * @properties={typeid:24,uuid:"82680487-75E6-4F9C-A71C-587CBD2FECC7"}
 */
function creaRichiesta(fs, params)
{
	return forms.pv_variazione_lavoratore_anagrafica_dtl.creaRichiesta(fs, vParams);
}

/**
 * @properties={typeid:24,uuid:"9E1C5E73-5C08-441A-A564-FB8353ED6431"}
 */
function aggiornaRichiesta(fs, params)
{
	return forms.pv_variazione_lavoratore_anagrafica_dtl.aggiornaRichiesta(fs, vParams);
}
