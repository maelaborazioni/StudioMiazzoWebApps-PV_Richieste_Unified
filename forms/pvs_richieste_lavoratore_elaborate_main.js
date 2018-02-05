/**
 * @properties={typeid:24,uuid:"F5BA14D6-F587-499D-9883-0F6818256ADD"}
 * @AllowToRunInFind
 */
function getStatusToFilter()
{
	var fs = datasources.db.ma_richieste.tab_statooperazioni.getFoundSet();
	if (fs && fs.find())
	{
		fs.codice = [globals.RequestStatus.EXPIRED, globals.RequestStatus.PROCESSED, globals.RequestStatus.CANCELED, globals.RequestStatus.OVERWRITTEN];
		fs.search();
		
		return globals.foundsetToArray(fs, 'pkey');
	}
	
	globals.ma_utl_logError(new Error('i18n:ma.err.findmode'));
	return [];
}