/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"6FE75D7D-533D-4A3F-A12D-E86448F15337"}
 */
function copiaTutti(event)
{
	globals.copyAll(event, null, true, getFieldsToCopy());
}

/**
 * @properties={typeid:24,uuid:"A4D63CC7-0833-4C22-84E3-1BC6C7A3F079"}
 */
function setFormDataProviders(form, params)
{
	return forms.pv_variazione_lavoratore_dtl.setFormDataProviders(form, params);
}

/**
 * @properties={typeid:24,uuid:"209A1C5F-D3AB-4527-B5AC-6CC82CBEBFE1"}
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
	
	var bottomLine       = form.getLabel(elements.ln_bottom.getName());
		bottomLine.y    += heightVariation;
		bottomLine.width = form.width;
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"FE3D485A-77E7-478B-8270-DC784115CD1E"}
 * @AllowToRunInFind
 */
function setBodyElements(form, params, layoutParams, isMultiple)
{
	form = _super.setBodyElements(form, params, layoutParams, isMultiple);
	
	if(form)
	{
		if(!params.ammettedecorrenza)
			form = disableDecorrenza(form);
		
		if(!params.ammettemolteplicita)
			form = disableDuplicateButton(form);
		else
		{
			var btn_duplicaterecord = form.getLabel('btn_duplicaterecord');
			var lbl_duplicaterecord = form.getLabel('lbl_duplicaterecord');
			
			if(btn_duplicaterecord && lbl_duplicaterecord)
			{
				btn_duplicaterecord.x =
				lbl_duplicaterecord.x = form.width - btn_duplicaterecord.width;
			}
		}
		
		// Move the copy all button to the farthest right
		var btnCopyAll = form.getLabel('btn_copyall_tbl');
		if (btnCopyAll)
			btnCopyAll.x = form.width;
	}
	
	return form;
}

/**
 * @param {JSForm} form
 * 
 * @properties={typeid:24,uuid:"4DFCE2AF-BDD1-4EE0-B236-4A62DF7EB3FF"}
 */
function disableDecorrenza(form)
{
	var fld_decorrenza = form.getField('fld_decorrenza');
	var lbl_decorrenza = form.getLabel('lbl_decorrenza'); 
	
	if(fld_decorrenza && fld_decorrenza.visible && lbl_decorrenza && lbl_decorrenza.visible)
	{
		fld_decorrenza.visible =
		lbl_decorrenza.visible = false;
		
		form.width -= fld_decorrenza.width;
	}
	
	return form;
}

/**
 * @param {JSForm} form
 * 
 * @properties={typeid:24,uuid:"D1DED8EA-B9E6-41BF-BE1C-C5BD4CB07B16"}
 */
function disableDuplicateButton(form)
{
	var btn_duplicaterecord = form.getLabel('btn_duplicaterecord');
	var lbl_duplicaterecord = form.getLabel('lbl_duplicaterecord'); 

	if(btn_duplicaterecord && btn_duplicaterecord.visible && lbl_duplicaterecord && lbl_duplicaterecord.visible)
	{
		btn_duplicaterecord.visible =
		lbl_duplicaterecord.visible = false;
		
		form.width -= btn_duplicaterecord.width;
	}
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"6B081A80-56F7-4229-BC17-C2B940DF9FD6"}
 */
function dc_save_pre(fs)
{
	var answer = globals.ma_utl_showYesNoQuestion(i18n.getI18NMessage('i18n:ma.msg.save_all') + '\n<strong>Le richieste non compilate saranno ignorate.</strong>');
	if (answer)
		return _super.dc_save_pre(fs);
	else
		return -1;
}

/**
 * @properties={typeid:24,uuid:"25355721-33D9-492D-9C8B-62C450859A3C"}
 */
function dc_save_validate(fs, program)
{
	var requiredFieldsProgram = globals.nav.program[vParams.requiredfields || program] ? globals.nav.program[vParams.requiredfields || program].required_fields : null;
	var success               = _super.dc_save_validate(fs, program, true) !== -1 && validateRequiredFields(requiredFieldsProgram, fs);
	
	return success ? 0 : -1;
}

/**
 * @param 				requiredFields
 * @param {JSFoundset} 	fs
 *
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"9F4E2017-2A5C-4DF7-8B2A-7CF0F6BA7960"}
 */
function validateRequiredFields(requiredFields, fs)
{
	if(!requiredFields || !fs)
		return true;
	
	var editedRecords = databaseManager.getEditedRecords(fs);

	var error = false;
	for(var r = 0; r < editedRecords.length; r++)
	{
		var record = editedRecords[r];
		var changedData = record.getChangedData();
		
		if (changedData.getMaxRowIndex() > 0)
		{
			var msg = '';
			var found = false;
			
			for(var rf in requiredFields)
			{
				var dataprovider = rf;
				// Don't consider 0 or false as not entered
				if (record[dataprovider] !== 0 && record[dataprovider] !== false && !record[dataprovider]) 
				{
					//field is not entered				
					msg += requiredFields[rf].field_name + i18n.getI18NMessage('svy.fr.dlg.is_required');
					error = found = true;
				}
			}
			
			if(found)
				globals.nav.validation_msg = record['nominativo'] + ': ' + msg + '\n';
		}
	}
	
	if(error)
	{
		globals.nav.validation_msg = msg;
		globals.ma_utl_showErrorDialog(globals.nav.validation_msg);
	}
	
	return !error;
}

///**
// * @param {JSFoundset} 	fs
// * @param 				params
// * @param {Function}	callback
// * 
// * @properties={typeid:24,uuid:"38ADBB1C-BD9A-4685-A8E2-FD77B822D59E"}
// * @AllowToRunInFind
// */
//function creaRichiesta(fs, params, callback)
//{
//	var reducedFoundset = fs.duplicateFoundSet();
//	
//	var requiredFieldsProgram = globals.nav.program[params.requiredfields];
//	if (requiredFieldsProgram && reducedFoundset && reducedFoundset.find())
//	{
//		var recordsToSave = globals.foundsetToArray(fs).filter(
//			function(record)
//			{
//				for(var rf in requiredFieldsProgram.required_fields)
//				{
//					var dataprovider = rf;
//					// Don't consider 0 or false as not entered
//					if (globals.ma_utl_isNullOrUndefined(record[dataprovider])) 
//						return false;
//				}
//				
//				return true;
//			}
//		);
//		
//		if(recordsToSave.length > 0)
//			reducedFoundset['_sv_rowid'] = recordsToSave.map(function(record){ return record['_sv_rowid']; });
//		else
//		{
//			var fieldsToCheck = getFieldsToSave();
//			for(var f = 0; f < fieldsToCheck.length; f++)
//				reducedFoundset[fieldsToCheck[f]] = '!=^';
//		}
//		
//		reducedFoundset.search();
//	}
//		
//	return _super.creaRichiesta(reducedFoundset, params, callback);
//}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E97AC93F-88CA-4F15-9553-88D15A4C1D40"}
 */
function onActionDuplicateRecord(event) 
{
	duplicateRecord();
}

/**
 * @properties={typeid:24,uuid:"64DF7E6F-DEC4-4419-8648-75E9A24B6336"}
 */
function duplicateRecord()
{
	var selectedIndex = foundset.getSelectedIndex();
	var original      = foundset.getSelectedRecord();
	var duplicate     = foundset.getRecord(foundset.newRecord(selectedIndex + 1, true));
	/** @type Array<String>*/
	var fieldsToCopy  = getFieldsToCopy();
	
	return databaseManager.copyMatchingFields(original, duplicate, fieldsToCopy) && databaseManager.saveData(duplicate);
}
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"7DEF8FEE-AA15-4FF8-9EB2-86283D1D0978"}
 */
function onAction$btn_save(event) 
{
	var success = dc_save(event, event.getFormName(), event.getFormName()) !== -1;
	if (success)
		closeAndContinue(event);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"452ECB16-8A1F-455F-A317-492A2099EB2D"}
 */
function onAction$btn_cancel(event) 
{
	globals.cancel(event);
}
