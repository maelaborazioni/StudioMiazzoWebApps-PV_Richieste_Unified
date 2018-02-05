/**
 * @properties={typeid:24,uuid:"FB1B1AAF-C7A6-4FE6-8A8C-599546F912F5"}
 * @AllowToRunInFind
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	/** @type {JSFoundset<db:/ma_richieste/tab_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.CATEGORIE_RICHIESTE);
	if (fs && fs.find())
	{
		fs.codice = globals.CategoriaRichiesta.MONETARIA;
		fs.search();
		
		vRequestCategory = fs.idtabrichiesta;
	}
}

/**
 * @properties={typeid:24,uuid:"A5E80E73-C902-4679-9792-54B237073BBB"}
 */
function reset()
{
	var category = vRequestCategory;
	_super.reset();
	vRequestCategory = category;
}