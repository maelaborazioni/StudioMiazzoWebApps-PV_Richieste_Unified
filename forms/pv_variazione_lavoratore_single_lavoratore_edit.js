/**
 * @properties={typeid:24,uuid:"315CEEFE-42D6-44EF-8221-8C83E4098BA3"}
 */
function setFooterElements(form, params, layoutParams, multiple)
{
	// Adjust the footer and keep objects on it
	/** @type {JSForm} */
	form = _super.setFooterElements(form, params, layoutParams, multiple);
	
	var heightVariation = form.getFooterPart().getPartYOffset() - controller.getPartYOffset(JSPart.FOOTER);
	
	var confirmButton = form.getLabel(elements.btn_confirm.getName());
	var cancelButton  = form.getLabel(elements.btn_cancel.getName());
	
	cancelButton.x  = form.width - 10 - cancelButton.width;
	confirmButton.x = cancelButton.x - confirmButton.width;
	
	cancelButton.y  += heightVariation;
	confirmButton.y += heightVariation;
	
	return form;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"863943F4-55D5-4A16-8F53-B29DB3E715F5"}
 */
function onAction$btn_save(event)
{
	var success = dc_save(event, event.getFormName());
	if (success)
		closeAndContinue(event);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"DB492D03-E7CE-4D99-80C1-546EA03FA285"}
 */
function onAction$btn_cancel(event) 
{
	globals.cancel(event);
}
