/**
*
* @param _firstShow
* @param _event
*
* @properties={typeid:24,uuid:"6067C692-BEDD-4E24-A453-A2DBAE772B41"}
*/
function onShowForm(_firstShow, _event) 
{
	_idditta = globals.getDitta(_to_sec_user$user_id.sec_user_to_sec_user_to_lavoratori.idlavoratore);
	_codditta = globals.getCodDitta(_idditta);
	_ragionesociale = globals.getRagioneSociale(_idditta);
	
	var periodoCed = globals.ma_utl_getUltimoCedolinoStampato(globals.convert_DitteCliente2Sede(_idditta));
	if(periodoCed)
	{
		_annoCed = parseInt(utils.stringLeft(periodoCed.toString(),4),10);
		_meseCed = parseInt(utils.stringRight(periodoCed.toString(),2),10);
	
	    if(_meseCed == 12)
	    {
	       _annoCed++;
	       _meseCed = 1;
	    }
	    else
	       _meseCed++;
	    
		aggiornaPeriodoGiornaliera(_annoCed,_meseCed);
	}
	else
		_annoCed = _meseCed = _anno = _mese = null;

	globals.ma_utl_setStatus(globals.Status.EDIT,controller.getName());
}

/**
*
* @param {JSEvent} event
*
* @properties={typeid:24,uuid:"BEE8AF36-774E-42A5-A1DE-BFF9DB62407C"}
*/
function confermaDittaPeriodoCedolinoVariazioni(event) 
{
	if(_to_sec_user$user_id.sec_user_to_sec_user_to_lavoratori == null
			|| _to_sec_user$user_id.sec_user_to_sec_user_to_lavoratori.idlavoratore == null)
		throw new Error("L\'utente correntemente loggato non ha associato un lavoratore valido. Contattare il proprio responsabile.");
	
	return _super.confermaDittaPeriodoCedolinoVariazioni(event,_to_sec_user$user_id.sec_user_to_sec_user_to_lavoratori.idlavoratore);
}
