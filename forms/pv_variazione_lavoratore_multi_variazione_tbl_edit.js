/**
 * @properties={typeid:24,uuid:"9A2A3CCA-1679-410A-9B32-3A5098F89B51"}
 */
function getSpecification(params)
{
	// Just return the standard specs, different rules will be enforced later
	var specification =
	[
		{
			code		 : 'QTA', 
			name		 : 'Quantità', 
			format		 : '#,##0.00|#(9)',
			size		 : 100, 
			lines		 : 1, 
			enabled		 : true, 
			visible		 : true, 
			order		 : 1, 
			group		 : 1, 
			type		 : globals.FieldType.NUMBER, 
			dataprovider : 'quantita',
			hasdefault   : true
		},
		{
			code		 : 'BASE', 
			name		 : 'Base', 
			format		 : '#,##0.00|#(11)', 
			size		 : 100, 
			lines		 : 1, 
			enabled		 : true, 
			visible		 : true, 
			order		 : 2, 
			group		 : 1, 
			type		 : globals.FieldType.NUMBER, 
			dataprovider : 'base',
			hasdefault   : true
		},
		{
			code		 : 'IMP', 
			name		 : 'Importo', 
			format		 : '#,##0.00|#(8)', 
			size		 : 100, 
			lines		 : 1, 
			enabled		 : true, 
			visible		 : true, 
			order		 : 3, 
			group		 : 1, 
			type		 : globals.FieldType.NUMBER, 
			dataprovider : 'importo',
			hasdefault   : true
		}
	];

	return specification;
}

/**
 * @properties={typeid:24,uuid:"C958C731-C36B-48EF-8C0C-FE9280E3FC32"}
 */
function dc_save_pre(fs)
{
	var answer = globals.ma_utl_showYesNoQuestion(i18n.getI18NMessage('i18n:ma.msg.save_all') + '\n<strong>Le richieste non compilate saranno ignorate.</strong>');
	return answer ? _super.dc_save_pre(fs) : -1;
}

/**
 * @properties={typeid:24,uuid:"392B6D6F-9F9F-4454-8578-5DC2A1B87DE6"}
 */
function dc_save_validate(fs, program)
{
	program = vParams.requiredfields || program;
	
	var requiredFieldsProgram = globals.nav.program[program] && globals.nav.program[program].required_fields;
	var success               = _super.dc_save_validate(fs, program, true) !== -1;
	
	if(requiredFieldsProgram)
		success = success && validateRequiredFields(requiredFieldsProgram, fs);
	
	return success ? 0 : -1;
}

/**
 * @param 				requiredFields
 * @param {JSFoundset} 	fs
 *
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"91215C37-C858-4D4C-B88C-A95ED12AC373"}
 */
function validateRequiredFields(requiredFields, fs)
{
	if(!fs)
		return true;
	
	var editedRecords = databaseManager.getEditedRecords(fs);
	
	var error = false;
	for(var r = 0; r < editedRecords.length; r++)
	{
		var record 		   = editedRecords[r];
		if (record.getChangedData().getMaxRowIndex() > 0)
		{
			var msg			   = '';
			
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
				globals.nav.validation_msg += record[getRequestRelationName(vParams)]['descrizione'] + ': ' + msg + '\n';
		}
	}
	
	if(error)
		globals.ma_utl_showErrorDialog(globals.nav.validation_msg);
	
	return !error;
}

/**
 * @param {String} 	dataSource
 * @param {Array}	specification
 * @param 			params
 * 
 * @properties={typeid:24,uuid:"0F670C1F-22E7-493C-9455-5893DF6110CE"}
 */
function setCalculations(dataSource, specification, params)
{
	var rulesSpecification = params.rulesObject.rulesSpecification;
	var calculationSource = { };
	
	for(var s in rulesSpecification)
	{
		specification = rulesSpecification[s];
		
		for (var f in specification)
		{
			var field   = specification[f];
			var formula = field.formula;
			
			// If computed, create a new calculation
			switch(field.displaytype)
			{
				case globals.DisplayType.COMPUTED:
					if(!calculationSource[field.dataprovider])
					{
						calculationSource[field.dataprovider] = "function " + field.dataprovider + "()\
																 {\
																	 switch(idregola)\
																	 {\n";
					}
					
					calculationSource[field.dataprovider]    += "		case " + s + ":\
																			return " + formula + "; break;\n";
					
					break;
			}
		}
	}
	
	for(var c in calculationSource)
	{
		// Don't make any assumption if the field is neither fixed nor computed
		calculationSource[c] +=	"		}\
								 }";
		
		// Remove any previously created calc, since we don't know if rules have changed
		solutionModel.getDataSourceNode(dataSource).removeCalculation(c);
		solutionModel.getDataSourceNode(dataSource).newCalculation(calculationSource[c]);
	}
}

/**
 * @AllowToRunInFind
 * 
 * @properties={typeid:24,uuid:"F2FB98AC-60E7-4D71-8482-058630ECB216"}
 */
function populateDataSet(ds, specification, params, data)
{
	data = getData(specification, params, data);
	
	/** @type {JSFoundSet<db:/ma_anagrafiche/lavoratori>} */
	var lavoratori = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.LAVORATORI);
		lavoratori.loadRecords(params.iddipendenti[0]);
		
	var lavoratore = lavoratori.getSelectedRecord();
	
	if(ds)
	{
		/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocondizioni>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.REGOLE_RICHIESTE);
		if (fs && fs.find())
		{
			fs.idtabrichiestadettagliocondizione = params.idrichieste;
			fs.search();
			
			for(var l = 1; l <= fs.getSize(); l++)
			{
				var regola = fs.getRecord(l);
				var item   = data[regola.idtabrichiestadettaglio];
				
				var row = 
				[
					  regola.idtabrichiestadettaglio
					, regola.idtabrichiestadettagliocondizione
					, regola.codice
					, lavoratore.idditta_sede
					, lavoratore.idlavoratore
					, lavoratore.codice
					, lavoratore.posizioneinps
					, lavoratore.lavoratori_to_persone.nominativo
				];
				
				/**
				 *  Inserisci sempre un valore per la decorrenza, quindi concatena secondo
				 *  l'oggetto contenente i dati, infine aggiungi l'eventuale molteplicità.
				 */
				row.push(item['decorrenza']);
				row.push(item['dettaglio']);
				row.push(item['terminato']);
				
				specification.forEach
					(
						function(field)
						{
							if (!field.dependson && item)
							{
								// 0 e stringa vuota sarebbero valutati false
								if(item[field.dataprovider] === 0 || item[field.dataprovider] === '')
									row.push(item[field.dataprovider]);
								else
									row.push(item[field.dataprovider] || null);
									
								if(field.hasdefault)
									row.push(null);
							}
						}
					);
					
				row.push(item['ammettemolteplicita']);
				
				ds.addRow(l, row);
			}
		}
	}
	
	return ds;
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @protected 
 *
 * @properties={typeid:24,uuid:"17BC58EF-E448-46C6-B7EE-BEBAC2751284"}
 */
function onFieldRender(event) 
{
	var record     = event.getRecord();
	var renderable = event.getRenderable();
	
	if(!record || !renderable)
		return;

	var rulesSpecification = vParams['rulesObject'].rulesSpecification;
	/** @type {Array}*/
	var specification 	   = rulesSpecification[record['idregola']];
	
	if(specification)
		specification.forEach
		(
			function(field)
			{
				if(field.dataprovider === renderable.getDataProviderID())
				{
					// INFO non esiste più l'editable (https://support.servoy.com/browse/SVY-6989)
					renderable.enabled = field.hasdefault || field.enabled;
					
					var dataprovider = renderable.getDataProviderID();
					var hasDefault   = !globals.ma_utl_isNullOrUndefined(record[dataprovider + '_setdefault']);
					
					if(hasDefault && !renderable.enabled)
						record[dataprovider + '_setdefault'] = null;
				}
			}
		);
	else
		// INFO non esiste più l'editable (https://support.servoy.com/browse/SVY-6989)
		renderable.enabled = true;
		
	_super.onFieldRender(event);
}

/**
 * @properties={typeid:24,uuid:"2EAC4390-7EDC-4D8F-BBFA-B94C33CE6B04"}
 */
function setBodyElements(form, params, layoutParams, isMultiple)
{
	form = _super.setBodyElements(form, params, layoutParams, isMultiple);
	
	// Move the copy all button to the farthest right
	var btnCopyAll = form.getLabel('btn_copyall_tbl');
	if (btnCopyAll)
		btnCopyAll.x = form.width;
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"113E12FC-654E-48EA-B1BE-A20B1FE71EE4"}
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

///**
// * @properties={typeid:24,uuid:"EE33279D-B1D9-4A22-9CCC-CDAA087C31D8"}
// */
//function createRequestForm(params, multiple, extendsForm, formName, data, layoutParams)
//{
//	var form = _super.createRequestForm(params, multiple, extendsForm, formName, data, layoutParams);
//	if (form)
//		forms[form.name]['rulesSpecification'] = params.rulesObject.rulesSpecification;
//	
//	return form;
//}

///**
// * @param {JSFoundset} fs
// * @param 			   params
// * @param {Function}   callback
// * 
// * @AllowToRunInFind
// * 
// * @properties={typeid:24,uuid:"46201DC9-6EE4-4C04-81F0-86DCCC841C7E"}
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
////	var editedRecords = databaseManager.getEditedRecords(fs);
////	
////	var reducedFoundset = fs.duplicateFoundSet();
////	if (reducedFoundset && reducedFoundset.find())
////	{
////		reducedFoundset['_sv_rowid'] = editedRecords.filter(function(record){ return record.getChangedData().getMaxRowIndex() > 0; })
////		   										    .map   (function(record){ return record['_sv_rowid']; });
////		reducedFoundset.search();
////	}
////		
////	return _super.creaRichiesta(reducedFoundset, params, callback);
//}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"5F70842C-74A8-4842-B3E2-A7CCE5087193"}
 */
function onActionDuplicateRecord(event) 
{
	duplicateRecord();
}


/**
 * @properties={typeid:24,uuid:"5B90B919-E813-4315-B023-9FF0C468C678"}
 */
function duplicateRecord()
{
	var selectedIndex = foundset.getSelectedIndex();
	var original      = foundset.getSelectedRecord();
	var duplicate     = foundset.getRecord(foundset.newRecord(selectedIndex + 1, true));
	
	/** @type {Array<String>}*/
	var fieldsToCopy = getFieldsToCopy();
	
	return databaseManager.copyMatchingFields(original, duplicate, fieldsToCopy) && databaseManager.saveData(duplicate);
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"C0338088-6C19-489F-AA88-F721E616595A"}
 */
function onDuplicateButtonRender(event) 
{
	var record     = event.getRecord();
	var renderable = event.getRenderable();
	
	if(record && renderable)
		renderable.enabled = record['ammettemolteplicita'] === globals.TRUE;
}

/**
 * @param 							  specification
 * @param 							  params
 * @param {Boolean} 				  multiple
 * @param {String}  				  [formName]
 * @param {Form}					  [extendsForm]
 * 
 * @param {{ sideMargin	  : Number, 
 * 			 topMargin	  : Number,
 * 			 bottomMargin : Number, 
 * 			 fieldHeight  : Number, 
 * 			 fieldSpacing : Number, 
 * 			 rowSpacing	  : Number, 
 * 			 labelHeight  : Number,
 * 			 maxNoOfRows  : Number }} [layoutParams]
 *  
 * @properties={typeid:24,uuid:"304F9B87-8815-4F7F-AA3F-3721CB3D61CA"}
 */
function buildForm(specification, params, multiple, formName, extendsForm, layoutParams)
{
	specification.forEach(function(field){ field.onrender = true; });
	return _super.buildForm(specification, params, multiple, formName, extendsForm, layoutParams);
}

/**
 * @properties={typeid:24,uuid:"5CE71F95-83C3-4BD4-846B-2CB0E234D3A4"}
 */
function getFieldsToCopy()
{
	if(vParams.ruleid && vParams.ruleid > 0)
		return _super.getFieldsToCopy();
	
	var record        = foundset.getSelectedRecord();
	var specification = vParams['rulesObject'].rulesSpecification[record['idregola']];
	
	if (record && vParams['rulesObject'] && specification)
	{
		var fields = _super.getFieldsToCopyBetweenRecords(vParams, specification);
		return fields && fields.fieldsToCopy;
	}
	
	return null;
}

/**
 * @properties={typeid:24,uuid:"14E0A8E0-8962-4B37-8DF3-86B5DCF68E29"}
 */
function getFieldsToSave()
{
	if(vParams.ruleid && vParams.ruleid > 0)
		return _super.getFieldsToCopy();
	
	var record        = foundset.getSelectedRecord();
	var specification = vParams['rulesObject'].rulesSpecification[record['idregola']];
	
	if (record && vParams['rulesObject'] && specification)
	{
		var fields = _super.getFieldsToCopyBetweenRecords(vParams, specification);
		return fields && fields.fieldsToSave;
	}
	
	return null;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"EF365A4D-1FA8-41F7-B180-D8D8CA401740"}
 */
function onAction$btn_save(event) 
{
	var success = dc_save(event, event.getFormName(), event.getFormName());
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
 * @properties={typeid:24,uuid:"78172F04-B996-4FAA-813E-018133C0FD6A"}
 */
function onAction$btn_cancel(event) 
{
	globals.cancel(event);
}
