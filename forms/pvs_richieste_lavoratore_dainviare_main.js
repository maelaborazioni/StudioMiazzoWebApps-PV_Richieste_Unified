/**
 * @properties={typeid:24,uuid:"C1AD0F9F-51D1-4798-9977-51883AED1741"}
 * @AllowToRunInFind
 */
function getStatusToFilter()
{
	var fs = datasources.db.ma_richieste.tab_statooperazioni.getFoundSet();
	if (fs && fs.find())
	{
		fs.codice = globals.RequestStatus.SUSPENDED;
		fs.search();
		
		return globals.foundsetToArray(fs, 'pkey');
	}
	
	globals.ma_utl_logError(new Error('i18n:ma.err.findmode'));
	return [];
}
