/**
 * @properties={typeid:24,uuid:"FD50A901-D09D-4125-9315-AECFB8EB62E4"}
 */
function getSpecification(params)
{
	return forms.pv_variazione_lavoratore_inquadramento_dtl.getSpecification(params);
}

/**
 * @properties={typeid:24,uuid:"812687E0-845D-4183-B9F2-58D6A6C98D83"}
 */
function getFormDataSet(specification, params, data)
{
	return forms.pv_variazione_lavoratore_inquadramento_dtl.getFormDataSet(specification,params);
}

/**
 * @properties={typeid:24,uuid:"79D6D407-3A30-4563-BEAE-F099D0E8BFB3"}
 */
function setFormDataProviders(form, params)
{
	return forms.pv_variazione_lavoratore_inquadramento_dtl.setFormDataProviders(form, params);
}

/**
 * @properties={typeid:24,uuid:"896D45F9-D48D-45CE-9EF0-ADFF8A71D10C"}
 * @AllowToRunInFind
 */
function setRequiredFields(specification, programName, params, form)
{
	return forms.pv_variazione_lavoratore_single_lavoratore_inquadramento_edit.setRequiredFields(specification, programName, params, form);
}

/**
 * @properties={typeid:24,uuid:"E432BCD5-E5CA-41F6-8A1C-82EB9102FF75"}
 */
function setFormVariables(form,params,layoutParams,isMultiple)
{
	return forms.pv_variazione_lavoratore_inquadramento_dtl.setFormVariables(form,params,layoutParams,isMultiple);
}

/**
 * @properties={typeid:24,uuid:"5714EAD5-E754-469A-ABBB-4D852BC661C7"}
 */
function creaRichiesta(fs, params)
{
	return forms.pv_variazione_lavoratore_inquadramento_dtl.creaRichiesta(fs, vParams);
}

/**
 * @properties={typeid:24,uuid:"6C448C5E-B349-4AEC-8ECC-9E58EBEF9FE2"}
 */
function aggiornaRichiesta(fs, params)
{
	return forms.pv_variazione_lavoratore_inquadramento_dtl.aggiornaRichiesta(fs, vParams);
}
