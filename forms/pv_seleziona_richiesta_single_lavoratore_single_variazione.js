
/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"85DBDB4D-07BF-4382-9C24-DB54EF209F18"}
 */
function onShow(firstShow, event)
{
	vCategoriaRichiesta = 4;
	categoria = globals.CategoriaRichiesta.MONETARIA;
	
	onDataChangeCategoriaRichiesta(null,vCategoriaRichiesta,event);
	
	elements.fld_categoriarichiesta.enabled = false;
	elements.fld_anno.enabled = false;
	elements.fld_mese.enabled = false;

	_super.onShowForm(firstShow,event);
}
