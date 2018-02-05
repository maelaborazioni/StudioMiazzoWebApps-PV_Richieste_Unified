/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"43DEC173-AB78-4078-8FD7-15D2B4CE9CDC",variableType:93}
 */
var vPeriodo;

/**
 * @properties={typeid:24,uuid:"06413AE0-7C10-46A9-810D-E0EB0D1F83CC"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	vPeriodo = globals.toDate(vParams && vParams.periodo);
}

/**
 * @properties={typeid:24,uuid:"18F2C2BC-437D-4821-8A81-B10F5058139D"}
 */
function getLayoutParams(multiple)
{
	var layoutParams = _super.getLayoutParams(multiple);
	layoutParams.topMargin = null;
	
	return layoutParams;
}
 
/**
 * @properties={typeid:24,uuid:"83360DFE-FB7F-4C3D-9E0D-74B33DCBD7E5"}
 */
function setFormDataProviders(form, params)
{
	form = _super.setFormDataProviders(form, params);
	if(form)
		form.getField(elements.fld_periodo.getName()).dataProviderID = 'vPeriodo';
	
	return form;
}