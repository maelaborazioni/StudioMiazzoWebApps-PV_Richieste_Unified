/**
 * @properties={typeid:24,uuid:"2F8153AA-F16C-4953-9B0B-EA55E8A35801"}
 * @AllowToRunInFind
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	/** @type {JSFoundSet<db:/ma_richieste/tab_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.CATEGORIE_RICHIESTE);
	if (fs && fs.find())
	{
		fs.codice = globals.CategoriaRichiesta.INQUADRAMENTO;
		fs.search();
		
		vRequestCategory = fs.idtabrichiesta;
	}
}

/**
 * @properties={typeid:24,uuid:"CC55478A-1F9B-4295-A125-5870C0803625"}
 */
function reset()
{
	var category = vRequestCategory;
	_super.reset();
	vRequestCategory = category;
}
