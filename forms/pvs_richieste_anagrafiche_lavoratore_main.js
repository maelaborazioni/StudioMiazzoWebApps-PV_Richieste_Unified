/**
 * @properties={typeid:24,uuid:"51EEAB1A-EE74-404A-93EB-0EA3B95B627A"}
 * @AllowToRunInFind
 */
function filterData(fs)
{
	fs = _super.filterData(fs);
	
	if(fs && fs.find())
	{
		fs['codice'] = globals.CategoriaRichiesta.ANAGRAFICA;
		fs.search();
	}
}
