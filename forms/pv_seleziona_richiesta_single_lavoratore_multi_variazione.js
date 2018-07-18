/**
 * @param firstShow
 *
 * @properties={typeid:24,uuid:"E97CDE28-80FF-4D87-AB2A-CB4B8F312482"}
 * @AllowToRunInFind
 */
function init(firstShow) 
{
	_super.init(firstShow);
	
	// auto selection of current user as the selected employee
	employee = null;
	
	/** @type {JSFoundSet<db:/ma_anagrafiche/lavoratori>}*/
    var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE,globals.Table.LAVORATORI);
    if(fs.find())
    {
    	fs.idlavoratore = _to_sec_user$user_id.sec_user_to_sec_user_to_lavoratori.idlavoratore;
    	if(fs.search())
    	{
    	    updateLavoratore(fs.getRecord(1));
    	    employee = fs.getRecord(1);
    	}
    }
        
}
