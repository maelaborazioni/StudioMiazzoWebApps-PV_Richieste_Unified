/**
 * @properties={typeid:24,uuid:"1177882C-7B50-4080-878A-8E30F4220A60"}
 */
function setFormDataProviders(form, params)
{
	return forms.pv_variazione_lavoratore_dtl.setFormDataProviders(form, params);
}

/**
 * @param 				requiredFields
 * @param {JSFoundset} 	fs
 *
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"0D0A6863-0A82-47B8-805F-21D0C1C611A0"}
 */
function validateRequiredFields(requiredFields, fs)
{
	if(!fs)
		return true;
	
	var editedRecords = databaseManager.getEditedRecords(fs);
	
	var error = false;
	for(var r = 0; r < editedRecords.length; r++)
	{
		var record = editedRecords[r];
		if (record.getChangedData().getMaxRowIndex() > 0)
		{
			var msg = '';
			var idregola       = record['idregola'];
			var programName    = 'PV_Req_' + fs.getDataSource() + '_Rule_' + idregola;
			
			if(vParams.rulesObject && vParams.rulesObject.rulesspecification)
			{
				var rulesSpecification = vParams.rulesObject.rulesspecification;
				requiredFields = globals.getRequiredFields(rulesSpecification[idregola], programName, vParams).required_fields;
			}
			
			var fieldsMissing = 0, fieldsNo = 0;
			for(var rf in requiredFields)
			{
				fieldsNo++;
				
				var dataprovider = rf;
				// Don't consider 0 or false as not entered
				if (record[dataprovider] !== 0 && record[dataprovider] !== false && !record[dataprovider]) 
				{
					//field is not entered				
					msg += requiredFields[rf].field_name + i18n.getI18NMessage('svy.fr.dlg.is_required');
					fieldsMissing++;
				}
			}
			
			error = 0 < fieldsMissing && fieldsMissing < fieldsNo;
			
			if(error)
				globals.nav.validation_msg += record['nominativo'] + ': ' + msg + '\n';
		}
	}
	
	if(error)
		globals.ma_utl_showErrorDialog(globals.nav.validation_msg);
	
	return !error;
}

/**
 * @properties={typeid:24,uuid:"C8DA79F4-27A4-419A-A476-0F84AFC8EC43"}
 */
function setFormVariables(form,params,layoutParams,isMultiple)
{
	return forms.pv_variazione_lavoratore_monetaria_dtl.setFormVariables(form,params,layoutParams,isMultiple);
}

/**
 * @properties={typeid:24,uuid:"B102AE98-E051-43CB-B4CA-350AE3D9C8A2"}
 */
function aggiornaRichiesta(fs, params)
{
	return forms.pv_variazione_lavoratore_monetaria_dtl.aggiornaRichiesta(fs, vParams);
}

/**
 * @param {String} 	dataSource
 * @param {Array}	specification
 * @param			params
 * 
 * @properties={typeid:24,uuid:"338F7B93-8784-4E58-88EC-335B5B3FE576"}
 */
function setCalculations(dataSource, specification, params)
{
	if(params.ruleid && params.ruleid > 0)
		_super.setCalculations(dataSource, specification, params);
	else
	{
		var calculationSource = { };
		var rulesSpecification = params.rulesObject.rulesspecification;
		
		for(var s in rulesSpecification)
		{
			specification = rulesSpecification[s];
			
			for (var f in specification)
			{
				/** @type {
				 * 			{ 
				 * 				Code: String, 
				 * 				Name: String, 
				 * 				Format: String, 
				 * 				Size: Number, 
				 * 				Lines: Number, 
				 * 				Enabled: Boolean, 
				 * 				Visible: Boolean, 
				 * 				Order: Number, 
				 * 				Group: Number, 
				 * 				Type: String, 
				 * 				DataProvider: String, 
				 * 				Formula: String, 
				 * 				DisplayType: Number, 
				 * 				Regex: String, 
				 * 				OnAction: { name: String, code: String }, 
				 * 				LookupParams: String, 
				 * 				FilterQuery: String, 
				 * 				FilterArgs: String,
				 * 				Relation: String,
				 * 				ShownDataProvider: String, 
				 *              Tooltip: String,
				 *              HasDefault: Boolean,
				 *              DependsOn: String,
				 *              ContentDataProvider: String
				 * 			}
				 * 		} 
				 */
				var field   = specification[f];
				var formula = field.Formula;
				
				// If computed, create a new calculation
				switch(field.DisplayType)
				{
					case scopes.richieste.DisplayType.COMPUTED:
						if(!calculationSource[field.DataProvider])
						{
							calculationSource[field.DataProvider] = "function " + field.DataProvider + "()\
																	 {\
																		 switch(idregola)\
																		 {\n";
						}
						
						calculationSource[field.DataProvider]    += "		case " + s + ":\
																				return " + formula + "; break;\n";
						
						break;
				}
			}
		}
		
		for(var c in calculationSource)
		{
			// Don't make any assumption if the field is neither fixed nor computed
			calculationSource[c] += "		default: return null;\
										}\
									 }";
			
			// Remove any previously created calc, since we don't know if rules have changed
			solutionModel.getDataSourceNode(dataSource).removeCalculation(c);
			solutionModel.getDataSourceNode(dataSource).newCalculation(calculationSource[c]);
		}
	}
}

/**
 * @param {String} 	dataSource
 * @param {Array}	specification
 * @param			params
 * 
 * @properties={typeid:24,uuid:"30A45223-ED2A-4EB2-AE12-B68A06AEA708"}
 */
function setCalculationsDetail(dataSource, specification, params)
{
//	_super.setCalculations(dataSource,specification,params);
	
	//TODO setCalculationDetail
//	var firstDay = params['vPeriodo'];
	
	if(params.ruleid && params.ruleid > 0)
		_super.setCalculations(dataSource, specification, params);
	else
	{
		var calculationSource = { };
		var rulesSpecification = params.rulesObject.rulesspecification;
		
		for(var s in rulesSpecification)
		{
			
			specification = rulesSpecification[s];
			
			for (var f in specification)
			{
				/** @type {
				 * 			{ 
				 * 				Code: String, 
				 * 				Name: String, 
				 * 				Format: String, 
				 * 				Size: Number, 
				 * 				Lines: Number, 
				 * 				Enabled: Boolean, 
				 * 				Visible: Boolean, 
				 * 				Order: Number, 
				 * 				Group: Number, 
				 * 				Type: String, 
				 * 				DataProvider: String, 
				 * 				Formula: String, 
				 * 				DisplayType: Number, 
				 * 				Regex: String, 
				 * 				OnAction: { name: String, code: String }, 
				 * 				LookupParams: String, 
				 * 				FilterQuery: String, 
				 * 				FilterArgs: String,
				 * 				Relation: String,
				 * 				ShownDataProvider: String, 
				 *              Tooltip: String,
				 *              HasDefault: Boolean,
				 *              DependsOn: String,
				 *              ContentDataProvider: String
				 * 			}
				 * 		} 
				 */
				var field   = specification[f];
				var formula = field.Formula;
				
				// If computed, create a new calculation
				switch(field.DisplayType)
				{
					case scopes.richieste.DisplayType.COMPUTED:
						if(!calculationSource[field.DataProvider])
						{
							calculationSource[field.DataProvider] = "function " + field.DataProvider + "()\
																	 {\
																		 switch(idregola)\
																		 {\n";
						}
						
						calculationSource[field.DataProvider]    += "		case " + s + ":\
																				return " + formula + "; break;\n";
						
						break;
				}
			}
		}
		
		for(var c in calculationSource)
		{
			// Don't make any assumption if the field is neither fixed nor computed
			calculationSource[c] += "		default: return null;\
										}\
									 }";
			
			// Remove any previously created calc, since we don't know if rules have changed
			solutionModel.getDataSourceNode(dataSource).removeCalculation(c);
			solutionModel.getDataSourceNode(dataSource).newCalculation(calculationSource[c]);
		}
	}
}


/**
 * @return {Object}
 * 
 * @properties={typeid:24,uuid:"DE26F803-158D-485C-B864-95A9574D95EA"}
 */
function getData(specification, params, data)
{
	data = _super.getData(specification, params, data);
	
	if(params.ruleid && params.ruleid > 0)
		return data;
	
	/** @type {{ ReturnValue: Object, StatusCode: Number, Message: String, RulesPerEmployee : Object, RulesSpecification : Object }} */
	var response = globals.FiltraRegoleLavoratori(params);
	if(!response || !response.RulesPerEmployee || !response.RulesSpecification)
	   logAndShowGenericError(new Error('getData: errore durante la chiamata al web service'));
	 	
	var rules            = response.RulesSpecification;
	var rulesPerEmployee = response.RulesPerEmployee;
	
	params.rulesObject = response;
	
	for(var employee in rulesPerEmployee)
	{
		var idregola = rulesPerEmployee[employee];
		/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocondizioni>}*/
		var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.REGOLE_RICHIESTE);
			
		if(!fs.loadRecords(idregola))
			throw new Error('Regola con id: ' + idregola + 'non riconosciuta');

		data[employee].idregola     = fs.idtabrichiestadettagliocondizione;
		data[employee].codiceregola = fs.codice;
		
		/** @type {Array} */
		var rule = rules[idregola];
		rule.forEach
		(
			function(field)
			{
				if(!field.dependson)
				{
					var value = null;
					if(field.hasdefault)
						value = globals.getDefaultData(field, params.requestid, employee);
					
					if(globals.ma_utl_isNullOrUndefined(value))
					{
						switch(field.displaytype)
						{
							case scopes.richieste.DisplayType.FIXED:
								if(field.type === globals.FieldType.NUMBER)
									value = globals.ma_utl_parseDecimalString(field.formula);
								else
									value = field.formula;
								break;
								
							case scopes.richieste.DisplayType.COMPUTED:
								value = globals.getDefaultValue(globals.fieldTypeToJSColumn(field.type));
								break;
						}
					}
					
					if(!data[employee][field.dataprovider])
						data[employee][field.dataprovider] = value;
				}
			}
		);
	}
	
	return data;
}
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"69309E0D-6127-419C-B177-29AC88C7A6AD"}
 */
function onAction$btn_save(event) 
{
	var success = dc_save(event, event.getFormName()) !== -1;
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
 * @properties={typeid:24,uuid:"FE211308-2FC3-490E-B359-45F74ABEA191"}
 */
function onAction$btn_cancel(event) 
{
	globals.cancel(event);
}
