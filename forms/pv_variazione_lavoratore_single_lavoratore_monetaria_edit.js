/**
 * @properties={typeid:24,uuid:"21528EBB-B757-405E-B7D7-F95FF555753B"}
 */
function setFooterElements(form, params, layoutParams, multiple)
{
	// Adjust the footer and keep objects on it
	/** @type {JSForm} */
	form = _super.setFooterElements(form, params, layoutParams, multiple);
	
	var heightVariation = form.getFooterPart().getPartYOffset() - controller.getPartYOffset(JSPart.FOOTER);
	
	var confirmButton = form.getLabel(elements.btn_confirm.getName());
	var cancelButton  = form.getLabel(elements.btn_cancel.getName());
	
	cancelButton.x  = form.width - 10 - cancelButton.width;
	confirmButton.x = cancelButton.x - confirmButton.width;
	
	cancelButton.y  += heightVariation;
	confirmButton.y += heightVariation;
	
	return form;
}
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"541D6DA2-72A5-4E88-A9F6-2A68E87119DC"}
 */
function onAction$btn_save(event) 
{
	var params = {
        processFunction: process_conferma_variazione_dettaglio,
        message: '', 
        opacity: 0.5,
        paneColor: '#434343',
        textColor: '#EC1C24',
        showCancelButton: false,
        cancelButtonText: '',
        dialogName : 'This is the dialog',
        fontType: 'Arial,4,25',
        processArgs: [event]
    };
	plugins.busy.block(params);
}

/**
 * @param event
 *
 * @properties={typeid:24,uuid:"BC731250-E2A4-4D69-8306-C1A5E52D6D64"}
 */
function process_conferma_variazione_dettaglio(event)
{
	var frmName = event.getFormName();
	var frm = forms[frmName];
	
	var isDetailed = utils.stringRight(frmName,7) == '_detail'; 
	if(isDetailed)
	{		
		var oriFrmName = utils.stringLeft(event.getFormName(),event.getFormName().length - 7) 
		var oriFrm = forms[oriFrmName];
		if(['v_base_tot'])
			oriFrm.foundset['base'] =  utils.stringReplace(frm['v_base_tot'],',','.');
		if(['v_quantita_tot'])
			oriFrm.foundset['quantita'] = utils.stringReplace(frm['v_quantita_tot'],',','.');
		if(['v_importo_tot'])
			oriFrm.foundset['importo'] = utils.stringReplace(frm['v_importo_tot'],',','.');
		
		oriFrm.foundset['dettaglio'] = 1;
		
		databaseManager.saveData(oriFrm.foundset);
		
		plugins.busy.unblock();
		
		closeAndContinue(event);
	}
	else
	{
		var success =  parseInt(frm['dettaglio'],10) ?
						dc_save_detail(event, event.getFormName()) !== -1 :		
						dc_save(event, event.getFormName()) !== -1;
		
		plugins.busy.unblock();				
						
		if (success)
			closeAndContinue(event);
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"23D16E91-2466-4112-96FF-CDD17BB62C02"}
 */
function onAction$btn_cancel(event) 
{
	// rimozione dell'eventuale form di dettaglio su giorni
	var dtlFrmName = event.getFormName() + '_detail';
	if(solutionModel.getForm(dtlFrmName))
	{
		history.removeForm(dtlFrmName);
		solutionModel.removeForm(dtlFrmName);
	}
	
	globals.cancel(event);
	
}

/**
 * Update the fields of the detailed forms 
 * 
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"B5CBB309-E8C3-4393-8910-A8847EDF5B57"}
 */
function updateFields(event)
{
	/** @type{Date}*/
	var firstDate = vPeriodo;
	var daysNumber = globals.getTotGiorniMese(firstDate.getMonth() + 1,firstDate.getFullYear());
	var frmName = event.getFormName();
	var frm = forms[frmName];
    
	var specification = ['quantita','base','importo'];
	
	for(var s in specification)
	{
		/** @type {String}*/
		var tot = '';
		/** @type {String} */
		var tempTot = null;
		/** @type {String} */
		var formula = frm['v_' + specification[s] + '_formula'];
		var g = 0;
		var day;
		var isoDay;
		
		switch(formula)
		{
			case 'quantita * base':
				// effettua la moltiplicazione del valori	
				for(g = 0; g < daysNumber; g++)
				{
					day = new Date(firstDate.getFullYear(),firstDate.getMonth(),firstDate.getDate() + g);
				    isoDay = globals.dateFormat(day,globals.ISO_DATEFORMAT);
				    var valQta = frm['v_quantita_' + isoDay];
					var valBase = frm['v_base_' + isoDay];
					if(valQta && valBase) 
						frm['v_' + specification[s] + '_' + isoDay] = utils.stringReplace( ( (Math.round(valQta * 1e2) / 1e2) * (Math.round(valBase * 1e2) / 1e2) ).toFixed(2),'.',',');
					else
						frm['v_' + specification[s] + '_' + isoDay] = null;
				}
				break;
			default:
				break;
			
		}
		   			
		if(isNaN(parseFloat(formula)))
		{
			tempTot = "";
			for(g = 0; g < daysNumber; g++) 
			{
				day = new Date(firstDate.getFullYear(),firstDate.getMonth(),firstDate.getDate() + g);
			    isoDay = globals.dateFormat(day,globals.ISO_DATEFORMAT);
			    if(frm['v_' + specification[s] + '_' + isoDay])
			    {
			    	var val = parseFloat(utils.stringReplace(frm['v_' + specification[s] + '_' + isoDay],",","."));
			        var currTot = parseFloat(tempTot) ? parseFloat(tempTot) + val : val;
			    	tempTot = currTot.toFixed(2);
				}
		   	}
			
		   	tot = scopes.utl.isInt(tempTot) ? utils.stringLeft(tempTot.toString(),utils.stringPosition(tempTot.toString(),'.',0,1) - 1) : tempTot.toString();
		   	frm['v_' + specification[s] + '_tot'] = tempTot ? utils.stringReplace(tot,'.',',') : null;
		}
		else
		{
			tot = frm['v_' + specification[s] + '_formula'].toString();
			frm['v_' + specification[s] + '_tot'] = tot ? utils.stringReplace(tot,'.',',') : null;			
		}		
	}
}

/**
 * @properties={typeid:24,uuid:"B17D3168-1106-454C-8E92-79A2E46EA7AF"}
 */
function onDataChangeFieldDetail(oldValue,newValue,event)
{
	// aggiornamento totali in inserimento
	if(oldValue != newValue)
		updateFields(event);
}

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E1A37F09-96E7-40C2-B128-204E2560DA98"}
 */
function onShow(firstShow, event) 
{
	_super.onShowForm(firstShow,event);
	var isDetailed = utils.stringRight(event.getFormName(),7) == '_detail'; 
	if(isDetailed)
		updateFields(event);
	else
	{
		elements['chk_dettaglio_giorni'].enabled = ( status === globals.Status.ADD);
		elements['fld_base'].enabled = 
			elements['fld_quantita'].enabled = 
				elements['fld_importo'].enabled = (foundset['dettaglio'] != 1);
		if(elements['btn_dettaglio_giorni'])
			elements['btn_dettaglio_giorni'].enabled = (foundset['dettaglio'] == 1);
	}
}

