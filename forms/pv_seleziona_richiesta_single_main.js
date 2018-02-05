
/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"145D5F5C-7542-4E92-AFC6-CBA6B76A29DF"}
 */
function onShow(firstShow, event) 
{
	_super.onShowForm(firstShow,event);
	if(firstShow)
	   elements.selezione_panel.removeTabAt(2);
}
