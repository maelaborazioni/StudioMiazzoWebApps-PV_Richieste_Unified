/**
 * @properties={typeid:24,uuid:"5C7549D3-3FCF-4E5F-B100-A5E5C8829EB8"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	foundset.sort
	(
		function(first, second)
		{
			var requestOrder = first[getRequestRelationName(vParams)]['descrizione'] < second[getRequestRelationName(vParams)]['descrizione'] ? -1 : 1;
			var ruleOrder    = first[getRuleRelationName(vParams)   ]['descrizione'] < second[getRuleRelationName(vParams)   ]['descrizione'] ? -1 : 1;
			  
			return requestOrder * ruleOrder;
		}
	);
}

/**
 * @properties={typeid:24,uuid:"914F0929-D30D-4C85-8152-35C03276DE07"}
 */
function getFormDataSet(specification, params)
{
	var dsObject = _super.getFormDataSet(specification, params);
	if (dsObject)
	{
		var type = JSColumn.INTEGER;
		
		dsObject.dataset.addColumn('ammettemolteplicita', dsObject.dataset.getMaxColumnIndex() + 1, type);
		dsObject.types.push(type);
	}
	
	return dsObject;
}

/**
 * @properties={typeid:24,uuid:"C8AFE951-3952-4DAB-9F93-E4711FECA90E"}
 */
function getData(specification, params, data)
{
	data = _super.getData(specification, params, data);
	
	var validationParams        = globals.copyObject(params, { });
		validationParams.fields = specification;
	
	var rulesObject = params.rulesObject
	if (rulesObject && rulesObject.RulesPerRequest && rulesObject.Rules && rulesObject.RulesSpecification)
	{
		var rules           = rulesObject.RulesSpecification;
		var rulesPerRequest = rulesObject.RulesPerRequest;
		
		for(var request in rulesPerRequest)
		{
			var ruleid 		  = rulesPerRequest[request];
			var datiRichiesta = { };
			
			if(!datiRichiesta.decorrenza)
				datiRichiesta.decorrenza = params.decorrenza;
			if(datiRichiesta.dettaglio == null)
				datiRichiesta.dettaglio = params.dettaglio != null ? params.dettaglio : 0;
			if(datiRichiesta.terminato == null)
				datiRichiesta.terminato = (params.terminato != null ? params.terminato : 1);
			
			/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocondizioni>} */
			var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.REGOLE_RICHIESTE);
				fs.loadRecords(ruleid);
			
			datiRichiesta.idrichiesta  		  = request;
			datiRichiesta.idregola    		  = ruleid;
			datiRichiesta.codiceregola 		  = fs.codice;
			datiRichiesta.ammettemolteplicita = fs.tab_richiestedettagliocondizioni_to_tab_richiestedettaglio.ammettemolteplicita;
			
			var lavoratore = globals.ma_utl_lav_convertId(params.iddipendenti[0]);
			
			/** @type {Array} */
			var rule = rules[ruleid];
			rule.forEach(function(_field){
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
				var field = _field;
				if(!field.DependsOn)
				{
					var value = null;
					if(field.HasDefault)
						value = globals.getDefaultData(field, request, lavoratore);
					
					if(globals.ma_utl_isNullOrUndefined(value))
					{
						switch(field.DisplayType)
						{
							case scopes.richieste.DisplayType.FIXED:
								if(field.Type === globals.FieldType.NUMBER)
									value = globals.ma_utl_parseDecimalString(field.Formula);
								else
									value = field.Formula;
								break;
								
							case scopes.richieste.DisplayType.COMPUTED:
								value = globals.getDefaultValue(globals.fieldTypeToJSColumn(field.Type));
								break;
						}
					}
					
					if(!datiRichiesta[field.DataProvider])
						datiRichiesta[field.DataProvider] = value;
				}
			});
			
			data[request] = datiRichiesta;
		}
	}
	
	return data;
}

/**
 * @param {JSForm} 	form
 * @param			params
 * @param			layoutParams
 * @param {Boolean} [isMultiple]
 * 
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"F34BDB97-613F-41B8-9418-CE80D308EC4C"}
 */
function setBodyElements(form, params, layoutParams, isMultiple)
{
	form = _super.setBodyElements(form, params, layoutParams, isMultiple);
	
	/**
	 * Set the form's height accordingly to the number of rows
	 */
	if(params.idrichieste.length < layoutParams.maxNoOfRows)
		form.getBodyPart().height =   params.idrichieste.length * layoutParams.fieldHeight
									+ layoutParams.labelHeight 
									+ 36;	// add some space for the pager
	else
		form.getBodyPart().height =   layoutParams.maxNoOfRows * layoutParams.fieldHeight
									+ layoutParams.labelHeight 
									+ 36;	// add some space for the pager
									
	// Add 3 px to avoid displaying the horizontal scrollbar								
	form.width += 3;
	
	return form;
}

/**
 * @param {JSRenderEvent} event
 *
 * @properties={typeid:24,uuid:"8AFD326F-43D5-44F8-B85B-8F69DF78889C"}
 */
function onFieldRender(event)
{
	_super.onFieldRender(event);
	
	var record     = event.getRecord();
	var renderable = event.getRenderable();
	
	if (record && renderable)
	{
		// TODO editable non più disponibile (https://support.servoy.com/browse/SVY-6989)
		if(renderable.enabled /*&& renderable.editable*/)
		{
			renderable.bgcolor = '#ffc4c4';
			renderable.fgcolor = '#434343';
		}
	}
}

/**
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"5307BB7B-0D77-4DA9-8B3C-DA5FEA979115"}
 * @AllowToRunInFind
 */
function setFormDataProviders(form, params)
{
	form 															= _super.setFormDataProviders(form, params);
	form.getField(elements.fld_codice.getName()   ).dataProviderID 	= getRequestRelationName(params) + '.codice';
	form.getField(elements.fld_richiesta.getName()).dataProviderID 	= getRequestRelationName(params) + '.descrizione';
	form.getField(elements.fld_regola.getName()   ).dataProviderID	= getRuleRelationName(params)    + '.descrizione';
	
	if(elements.fld_decorrenza)
		form.getField(elements.fld_decorrenza.getName()).dataProviderID	= 'decorrenza';
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"EE7ACB2C-5118-4402-95E8-F6BC4702EBA2"}
 */
function setRelations(dataSource, specification, params)
{
	// Relation for the rules
	var relName   = getRuleRelationName(params);
	var relObject = solutionModel.getRelation(relName);
	var rulesDataSource = globals.ma_utl_getDataSource(globals.Server.MA_RICHIESTE, globals.Table.REGOLE_RICHIESTE);

	if(!relObject)
	{
		relObject = solutionModel.newRelation
		(
			  relName
			, dataSource
			, rulesDataSource
			, JSRelation.LEFT_OUTER_JOIN
		);
		
		var pk = databaseManager.getTable(rulesDataSource).getRowIdentifierColumnNames()[0];
		relObject.newRelationItem('idregola', globals.ComparisonOperator.EQ, pk);
	}
	
	// Relation for the requests
	relName   = getRequestRelationName(params);
	relObject = solutionModel.getRelation(relName);
	rulesDataSource = globals.ma_utl_getDataSource(globals.Server.MA_RICHIESTE, globals.Table.DETTAGLIO_RICHIESTE);

	if(!relObject)
	{
		relObject = solutionModel.newRelation
		(
			  relName
			, dataSource
			, rulesDataSource
			, JSRelation.LEFT_OUTER_JOIN
		);
		
		pk = databaseManager.getTable(rulesDataSource).getRowIdentifierColumnNames()[0];
		relObject.newRelationItem('idrichiesta', globals.ComparisonOperator.EQ, pk);
	}
}