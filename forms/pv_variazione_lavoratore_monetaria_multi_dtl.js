/**
 * @properties={typeid:24,uuid:"8966E824-1213-4803-900E-E2D4584FB43E"}
 */
function getLayoutParams(multiple)
{
	var params = _super.getLayoutParams(multiple);
		params.topMargin = null;
		
	return params;
}

/**
 * @properties={typeid:24,uuid:"F4E13CDF-9EE8-4723-B196-EA689596208B"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	var enabled = vParams['ammettemolteplicita'] === globals.TRUE;
	elements.navigator.enabled 			 = enabled;
	elements.btn_duplicaterecord.enabled = enabled;
}

/**
 * @properties={typeid:24,uuid:"FA87F8ED-600E-42AC-A4BE-15E51ADCD9A5"}
 */
function setFooterElements(form, params, layoutParams, multiple)
{
	form = _super.setFooterElements(form, params, layoutParams, multiple);
	if(form)
	{
		var heightVariation = form.getFooterPart().getPartYOffset() - controller.getPartYOffset(JSPart.FOOTER);
		
		var btn_duplicaterecord = form.getLabel(elements.btn_duplicaterecord.getName());
		var navigator     		= form.getTabPanel(elements.navigator.getName());
		
		if (btn_duplicaterecord && navigator)
		{
			btn_duplicaterecord.y += heightVariation;
			navigator.y     	  += heightVariation;
		}
	}
	
	return form;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E039EE9E-7B74-4EFC-9D5A-E0BF652C4F70"}
 */
function onActionDuplicateRecord(event) 
{
	duplicateRecord(event);
}

/**
 * @properties={typeid:24,uuid:"4B8F4660-F42D-427D-811B-D3F0E2B92A2A"}
 */
function duplicateRecord(event)
{
	var selectedIndex = foundset.getSelectedIndex();
	var original      = foundset.getSelectedRecord();
	var duplicate     = foundset.getRecord(foundset.newRecord(selectedIndex + 1, false));
	
	forms[elements.navigator.getTabFormNameAt(1)].dc_rec_next(event);
	
	/** @type {Array<String>}*/
	var fieldsToCopy = getFieldsToCopy();
	
	return databaseManager.copyMatchingFields(original, duplicate, fieldsToCopy) && databaseManager.saveData(duplicate);
}