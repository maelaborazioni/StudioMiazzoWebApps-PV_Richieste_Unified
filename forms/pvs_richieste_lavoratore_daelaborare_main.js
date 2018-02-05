/**
 * @properties={typeid:24,uuid:"7A7E580D-4D79-4A6D-8EB6-E116701B8AC2"}
 * @AllowToRunInFind
 */
function getStatusToFilter()
{
	var fs = datasources.db.ma_richieste.tab_statooperazioni.getFoundSet();
	if (fs && fs.find())
	{
		fs.codice = [globals.RequestStatus.SENT, globals.RequestStatus.IN_PROCESS];
		fs.search();
		
		return globals.foundsetToArray(fs, 'pkey');
	}
	
	globals.ma_utl_logError(new Error('i18n:ma.err.findmode'));
	return [];
}