
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"B294D0FF-D662-4C69-B5B6-3D9BEFA855A9"}
 */
function onAction$btn_save(event) 
{
	var success = dc_save(event, event.getFormName()) !== -1;
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
 * @properties={typeid:24,uuid:"D1F0969D-FD90-48FB-8F65-480E2872E3A9"}
 */
function onAction$btn_cancel(event) 
{
	globals.cancel(event);
}
