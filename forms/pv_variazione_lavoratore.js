/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"8B1C8D8B-BA4D-47FA-86F7-BD2DE9172B23",variableType:4}
 */
var vChkDettaglio = 0;

/**
 * @properties={typeid:24,uuid:"C1DC619E-84B9-4AF4-9AF6-F3ED27BD7858"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	foundset.sort('nominativo asc');
}

/**
 * @param fs
 * @param params
 * @param [callback]
 * 
 * @properties={typeid:24,uuid:"6DA48AEB-17D2-414B-BA63-FDD24C5E4148"}
 * @AllowToRunInFind
 */
function creaRichiesta(fs, params, callback)
{
	try
	{
		fs = filterRecordsToSave(fs, params, callback);
		
		/** @type {JSFoundset<db:/ma_richieste/lavoratori_richieste>} */
		var requestFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
		if(!requestFs)
			return { returnValue: -1 };
		
		// Create a request record for each employee, if in add mode
		for(var l = 1; l <= fs.getSize(); l++)
		{
			fs.setSelectedIndex(l);
			
			var lavoratore = globals.ma_utl_lav_convertId(fs.idlavoratore);
			/** @type {JSRecord<db:/ma_richieste/lavoratori_richieste>}*/
			var newRequest = requestFs.getRecord(requestFs.newRecord());
				
			newRequest 				           			 = mapParamsToRequest(params, newRequest);
			newRequest.idlavoratore 		   			 = lavoratore;
			newRequest.idtabrichiestadettaglio 			 = fs.idrichiesta;
			newRequest.idtabrichiestadettagliocondizione = fs.idregola
			newRequest.codiceregola            			 = fs.codiceregola;
			newRequest.decorrenza 	           			 = fs.decorrenza;
			newRequest.dettaglio                         = fs.dettaglio != null ? fs.dettaglio : 0; 
			newRequest.terminato                         = fs.terminato != null ? fs.terminato : 1;
			
			if(params.rettificaper && params.rettificaper > 0)
			{
				newRequest.rettificaper = params.rettificaper;
			
				// in case of rectify we need to save initial record unless multiple related records insert fails
				if(!databaseManager.commitTransaction())
					throw new Error("Errore durante il salvataggio della richiesta per il lavoratore");
			
			    databaseManager.startTransaction();
			}
			
			// Save the data
			var requestFields = getRequestFields(fs.idrichiesta);
			
			if(callback)
				callback(newRequest, fs.getSelectedRecord());
			
			for(var f = 1; f <= requestFields.getSize(); f++)
			{
				var field 		 = requestFields.getRecord(f);
				var fieldTypeCode = field.tab_richiestedettagliocampi_to_tab_tipicampo.codice;
				var dataprovider = field.dataprovider || field.codice;
									
				if(fs[dataprovider])
				{
					var requestDetailFs = newRequest.lavoratori_richieste_to_lavoratori_richiestecampi;
					if(!requestDetailFs)
						return { returnValue: -1 };
						
					var newRequestDetail 							  = newRequest.lavoratori_richieste_to_lavoratori_richiestecampi.getRecord(newRequest.lavoratori_richieste_to_lavoratori_richiestecampi.newRecord());//requestDetailFs.getRecord(requestDetailFs.newRecord());
						newRequestDetail.idtabrichiestadettagliocampo = field.idtabrichiestadettagliocampo;
						newRequestDetail.codice 					  = field.codice;
						if(fieldTypeCode == 'INT' || scopes.utl.isInt(fs[dataprovider]))
							newRequestDetail.valore                   =  utils.stringLeft(fs[dataprovider].toString(),utils.stringPosition(fs[dataprovider].toString(),'.',0,1))
						else if(fieldTypeCode == 'NUM')	
							newRequestDetail.valore = parseFloat(fs[dataprovider].toFixed(2));
						else
							newRequestDetail.valore = fs[dataprovider];
						
					if(fs[dataprovider + '_setdefault'])
					{
						var defaultValue;
						var defaultValueFs = field.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_valoriadipendente.duplicateFoundSet();

						if(defaultValueFs && defaultValueFs.find())
						{
							defaultValueFs.idlavoratore = lavoratore;
							defaultValueFs.search();
						}
						else
							throw new Error(i18n.getI18NMessage('ma.err.findmode', ['creaRichiesta']));
						
						if(globals.ma_utl_isFoundSetNullOrEmpty(defaultValueFs))
						{
							defaultValue = defaultValueFs.getRecord(defaultValueFs.newRecord());
							defaultValue.idlavoratore = lavoratore;
						}
						else
							defaultValue = defaultValueFs.getSelectedRecord();

						defaultValue.valore = fs[dataprovider];
					}
				}
			}
		}
		
		return { returnValue: 0, requests: requestFs };
	}
	catch(ex)
	{
		application.output(ex, LOGGINGLEVEL.ERROR);
		globals.ma_utl_showErrorDialog('i18n:ma.msg.save_error');
		
		return { returnValue: -1 };
	}
}

/**
 * @param fs
 * @param params
 * @param [callback]
 * 
 * @properties={typeid:24,uuid:"074B2BED-9606-40DA-9B2F-B5515A5D07ED"}
 * @AllowToRunInFind
 */
function creaRichiestaDetail(fs, params, callback)
{
	try
	{
//		fs = filterRecordsToSave(fs, params, callback);
		
		// recupero delle informazioni relative alla form di inserimento
		var frmName = controller.getName() + '_detail';
		var frm = forms[frmName];
		/** @type {Date}*/
		var firstDay = frm['vPeriodo'];
		var daysNumber = globals.getTotGiorniMese(firstDay.getMonth() + 1,firstDay.getFullYear());
		var d = 0;
		
		/** @type {JSFoundset<db:/ma_richieste/lavoratori_richieste>} */
		var requestFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
		if(!requestFs)
			return { returnValue: -1 };
		
		// Create a request record for each employee, if in add mode
		for(var l = 1; l <= fs.getSize(); l++)
		{
			fs.setSelectedIndex(l);
			
			var lavoratore = globals.ma_utl_lav_convertId(fs.idlavoratore);
			/** @type {JSRecord<db:/ma_richieste/lavoratori_richieste>}*/
			var newRequest = requestFs.getRecord(requestFs.newRecord());
				
			newRequest 				           			 = mapParamsToRequest(params, newRequest);
			newRequest.idlavoratore 		   			 = lavoratore;
			newRequest.idtabrichiestadettaglio 			 = fs.idrichiesta;
			newRequest.idtabrichiestadettagliocondizione = fs.idregola
			newRequest.codiceregola            			 = fs.codiceregola;
			newRequest.decorrenza 	           			 = fs.decorrenza;
			newRequest.dettaglio                         = fs.dettaglio != null ? fs.dettaglio : 0;
			newRequest.terminato                         = fs.terminato != null ? fs.terminato : 1;
			
			if(params.rettificaper && params.rettificaper > 0)
			{
				newRequest.rettificaper = params.rettificaper;
			
				// in case of rectify we need to save initial record unless multiple related records insert fails
				if(!databaseManager.commitTransaction())
					throw new Error("Errore durante il salvataggio della richiesta per il lavoratore");
			
			    databaseManager.startTransaction();
			}
			
			// Save the data
			var requestFields = getRequestFields(fs.idrichiesta);
			
			if(callback)
				callback(newRequest, fs.getSelectedRecord());
			
			for(var f = 1; f <= requestFields.getSize(); f++)
			{
				var field 		 = requestFields.getRecord(f);
				var dataprovider = field.dataprovider || field.codice;
				var fieldTypeCode = field.tab_richiestedettagliocampi_to_tab_tipicampo.codice;
				
				// assegnamento della variabile dei totali relativa al dataprovider  
				fs[dataprovider] = frm['v_' + dataprovider + '_tot'];
				
				if(fs[dataprovider])
				{
					var requestDetailFs = newRequest.lavoratori_richieste_to_lavoratori_richiestecampi;
					if(!requestDetailFs)
						return { returnValue: -1 };
						
					var newRequestDetail 							  = newRequest.lavoratori_richieste_to_lavoratori_richiestecampi.getRecord(newRequest.lavoratori_richieste_to_lavoratori_richiestecampi.newRecord());//requestDetailFs.getRecord(requestDetailFs.newRecord());
						newRequestDetail.idtabrichiestadettagliocampo = field.idtabrichiestadettagliocampo;
						newRequestDetail.codice 					  = field.codice;
						if(fieldTypeCode == 'INT' || scopes.utl.isInt(fs[dataprovider]))
							newRequestDetail.valore                   =  utils.stringLeft(fs[dataprovider].toString(),utils.stringPosition(fs[dataprovider].toString(),'.',0,1))
						else if(fieldTypeCode == 'NUM')	
							newRequestDetail.valore = parseFloat(fs[dataprovider].toFixed(2));
						else
							newRequestDetail.valore = fs[dataprovider];
					
					for(d = 0; d < daysNumber; d++)
					{
						var day = new Date(firstDay.getFullYear(),firstDay.getMonth(),firstDay.getDate() + d);
						var varName = 'v_' + dataprovider + '_' + globals.dateFormat(day,globals.ISO_DATEFORMAT);
						var frmVar = frm[varName];
						var cond = (params['fieldstosave'][0] == dataprovider || frm['v_' + params['fieldstosave'][0]  + '_' + globals.dateFormat(day,globals.ISO_DATEFORMAT)]);
                        if(frmVar && cond) 
						{
							var newRequestDetailDay    = newRequestDetail.lavoratori_richiestecampi_to_lavoratori_richiestecampi_dettaglio.getRecord((newRequestDetail.lavoratori_richiestecampi_to_lavoratori_richiestecampi_dettaglio.newRecord()));
							newRequestDetailDay.giorno = day;
							newRequestDetailDay.codice = field.codice;
							newRequestDetailDay.valore = frmVar.toString();
						}
					}
						
//					if(fs[dataprovider + '_setdefault'])
//					{
//						var defaultValue;
//						var defaultValueFs = field.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_valoriadipendente.duplicateFoundSet();
//
//						if(defaultValueFs && defaultValueFs.find())
//						{
//							defaultValueFs.idlavoratore = lavoratore;
//							defaultValueFs.search();
//						}
//						else
//							throw new Error(i18n.getI18NMessage('ma.err.findmode', ['creaRichiesta']));
//						
//						if(globals.ma_utl_isFoundSetNullOrEmpty(defaultValueFs))
//						{
//							defaultValue = defaultValueFs.getRecord(defaultValueFs.newRecord());
//							defaultValue.idlavoratore = lavoratore;
//						}
//						else
//							defaultValue = defaultValueFs.getSelectedRecord();
//
//						defaultValue.valore = fs[dataprovider];
//					}
				}
			}
		}
		
		history.removeForm(frmName);
		solutionModel.removeForm(frmName);
		
		return { returnValue: 0, requests: requestFs };
	}
	catch(ex)
	{
		application.output(ex, LOGGINGLEVEL.ERROR);
		globals.ma_utl_showErrorDialog('i18n:ma.msg.save_error' + ex.message);
		
		return { returnValue: -1 };
	}
}

/**
 * @param {JSFoundset} 	fs
 * @param 				params
 * @param {Function}	callback
 * 
 * @properties={typeid:24,uuid:"81FB71AB-27A8-4545-B676-450C03A81556"}
 * @AllowToRunInFind
 */
function filterRecordsToSave(fs, params, callback)
{
	var reducedFoundset = fs.duplicateFoundSet();
	var recordsToSave   = [];
	
	if(!reducedFoundset.find())
		throw new Error('i19n:ma.err.findmode');
	
	var requiredFieldsProgram = params.requiredfields && globals.nav.program[params.requiredfields];
	if (requiredFieldsProgram)
	{
		recordsToSave = globals.foundsetToArray(fs).filter(
			function(record)
			{
				for(var rf in requiredFieldsProgram['required_fields'])
				{
					var dataprovider = rf;
					// Don't consider 0 or false as not entered
					if (globals.ma_utl_isNullOrUndefined(record[dataprovider])) 
						return false;
				}
				
				return true;
			}
		);
	}
		
	if(recordsToSave.length > 0)
		reducedFoundset['_sv_rowid'] = recordsToSave.map(function(record){ return record['_sv_rowid']; });
	else if(params.controller == globals.PV_Controllers.LAVORATORE)
	{
		var arrValidRowId = [];
		for(var r = 1; r <= fs.getSize(); r++)
		{
			var currRec = fs.getRecord(r);
			var specification = params.rulesObject.rulesSpecification[currRec['idregola']];
			var isValidRec = true;
			for(var f in specification)
			{
				if(specification[f].hasdefault || (specification[f].enabled && !specification[f].dependson))
				   if(currRec[specification[f].dataprovider] == null)
				   {
					   isValidRec = false;
					   continue;
				   }
			}
			if(isValidRec)
				arrValidRowId.push(currRec['_sv_rowid']);
		}
		reducedFoundset['_sv_rowid'] = arrValidRowId;
	}
	else
	{
		/** @type {Array}*/
		var fieldsToCheck = getFieldsToSave();
	    for(var fc = 0; fc < fieldsToCheck.length; fc++)
		    reducedFoundset[fieldsToCheck[fc]] = '!=^';
	}
	
	reducedFoundset.search();
	
	return reducedFoundset;
}

/**
 * @param fs
 * @param params
 * @param [callback]
 * 
 * @properties={typeid:24,uuid:"20E69B5C-3B2C-4193-9431-2F6596BF21FE"}
 * @AllowToRunInFind
 */
function aggiornaRichiesta(fs, params, callback)
{
	try
	{
		/** @type {JSFoundset<db:/ma_richieste/lavoratori_richieste>} */
		var requestFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
		if(!requestFs)
			return { returnValue: -1 };
		
		if(!requestFs.loadRecords(params.recordid))
			throw 'Richiesta con identificativo ' + params.requestid + ' non trovata';
		
		// Aggiorna la decorrenza
		requestFs.decorrenza = fs.decorrenza;
		
		// Aggiorna i dati relativi ai campi della richiesta (base,quantità,importo...)
		var requestDetailFs = requestFs.lavoratori_richieste_to_lavoratori_richiestecampi;
		for(var f = 1; f <= requestDetailFs.getSize(); f++)
		{
			var record = requestDetailFs.getRecord(f);
			
			var field = record.lavoratori_richiestecampi_to_tab_richiestedettagliocampi;
			var dataprovider = field.dataprovider || field.codice;

			record.valore = fs[dataprovider];
			if(fs[dataprovider + '_setdefault'])
			{
				var lavoratore = globals.ma_utl_lav_convertId(fs.idlavoratore);
				var defaultValue;
				var defaultValueFs = field.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_valoriadipendente.duplicateFoundSet();

				if(defaultValueFs && defaultValueFs.find())
				{
					defaultValueFs.idlavoratore = lavoratore;
					defaultValueFs.search();
				}
				else
					throw new Error(i18n.getI18NMessage('i18n:ma.err.findmode'));
				
				if(globals.ma_utl_isFoundSetNullOrEmpty(defaultValueFs))
				{
					defaultValue = defaultValueFs.getRecord(defaultValueFs.newRecord());
					defaultValue.idlavoratore = lavoratore;
				}
				else
					defaultValue = defaultValueFs.getSelectedRecord();

				defaultValue.valore = fs[dataprovider];
			}
		}
		
		// Aggiorna il campo 'terminato'
		requestFs.terminato = fs.terminato;
		
		if(callback)
			callback(requestFs.getSelectedRecord(), fs.getSelectedRecord());
		
		return { returnValue: 0, request: requestFs.getSelectedRecord() };
	}
	catch(ex)
	{
		application.output(ex, LOGGINGLEVEL.ERROR);
		globals.ma_utl_showErrorDialog('i18n:ma.msg.save_error');
		
		return { returnValue: -1 };
	}	
}

/**
 * @param fs
 * @param params
 * @param [callback]
 * 
 * @properties={typeid:24,uuid:"89952D39-42F9-4A60-B90C-79CBB2015862"}
 * @AllowToRunInFind
 */
function aggiornaRichiestaDetail(fs, params, callback)
{
	try
	{
		/** @type {JSFoundset<db:/ma_richieste/lavoratori_richieste>} */
		var requestFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
		if(!requestFs)
			return { returnValue: -1 };
		
		if(!requestFs.loadRecords(params.recordid))
			throw 'Richiesta con identificativo ' + params.requestid + ' non trovata';
		
		// recupero delle informazioni relative alla form di inserimento
		var frmName = controller.getName() + '_detail';
		var frm = forms[frmName];
		
		// se esiste la form di dettaglio inserimento, va fatto l'update di tutti i valori del dettaglio
		if(frm)
		{
			/** @type {Date}*/
			var firstDay = frm['vPeriodo'];
			var daysNumber = globals.getTotGiorniMese(firstDay.getMonth() + 1,firstDay.getFullYear());
			var d = 0;
					
			/** @type {JSFoundset<db:/ma_richieste/lavoratori_richiestecampi_dettaglio>} */
			var requestCampiDettFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_CAMPI_DETTAGLIO);
			
			// Aggiorna la decorrenza
			requestFs.decorrenza = fs.decorrenza;
			
			// Aggiorna i dati
			var requestDetailFs = requestFs.lavoratori_richieste_to_lavoratori_richiestecampi;
			for(var f = 1; f <= requestDetailFs.getSize(); f++)
			{
				var record = requestDetailFs.getRecord(f);
				
				var field = record.lavoratori_richiestecampi_to_tab_richiestedettagliocampi;
				var dataprovider = field.dataprovider || field.codice;
				// Aggiorna i dati di lavoratori_richiestedettaglio
				record.valore = fs[dataprovider];
				
				// Aggiorna i dati del dettaglio a giorni (lavoratori_richiestecampi_dettaglio)
				for(d = 0; d < daysNumber; d++)
				{
					var day = new Date(firstDay.getFullYear(),firstDay.getMonth(),firstDay.getDate() + d);
					/** @type {String}*/
					var day_ISO = globals.dateFormat(day,globals.ISO_DATEFORMAT);
					var varName = 'v_' + dataprovider + '_' + day_ISO;
					/** @type {String}*/
					var frmVar = frm[varName];
					var cond = (params['fieldstosave'][0] == dataprovider || frm['v_' + params['fieldstosave'][0]  + '_' + day_ISO]);
	                if(cond) 
					{
						// se il record è già presente fai update se il nuovo valore è != null altrimenti cancellalo
						var recordDay = globals.getRichiestaCampoDettaglio(record.idlavoratorerichiesta,field.idtabrichiestadettagliocampo,day_ISO);
						if(recordDay)
						{
							if(frmVar != null)
							{
								if(recordDay.valore != frmVar.toString())
								{
									//update
									recordDay.valore = frmVar;
								}
							}
							else
							{
								//delete
								if(!requestCampiDettFs)
									return { returnValue: -1 };
									
								if(requestCampiDettFs.find())
								{
	                               requestCampiDettFs.idlavoratorerichiesta = record.idlavoratorerichiesta;
	                               requestCampiDettFs.giorno = day_ISO + '|yyyyMMdd';
	                               
	                               if(requestCampiDettFs.search())
	                               {
	                            	   if(!requestCampiDettFs.deleteAllRecords())
	                                      throw new Error("Errore durante l\'eliminazione del dettaglio giornaliero");	 
	                               }
	                               else 
	                            	   throw 'Record dettaglio del giorno non trovato'
								}
								else 
									throw 'Record dettaglio del giorno non trovato';
								
							}						
						}
						else
						{
							if(frmVar)
							{
								// altrimenti creane uno nuovo
								var newRequestDetailDay    = record.lavoratori_richiestecampi_to_lavoratori_richiestecampi_dettaglio.getRecord((record.lavoratori_richiestecampi_to_lavoratori_richiestecampi_dettaglio.newRecord()));
								newRequestDetailDay.giorno = day;
								newRequestDetailDay.codice = field.codice;
								newRequestDetailDay.valore = frm[varName];
							}
						}					 
					}
				}
							
	//			if(fs[dataprovider + '_setdefault'])
	//			{
	//				var lavoratore = globals.ma_utl_lav_convertId(fs.idlavoratore);
	//				var defaultValue;
	//				var defaultValueFs = field.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_valoriadipendente.duplicateFoundSet();
	//
	//				if(defaultValueFs && defaultValueFs.find())
	//				{
	//					defaultValueFs.idlavoratore = lavoratore;
	//					defaultValueFs.search();
	//				}
	//				else
	//					throw new Error(i18n.getI18NMessage('i18n:ma.err.findmode'));
	//				
	//				if(globals.ma_utl_isFoundSetNullOrEmpty(defaultValueFs))
	//				{
	//					defaultValue = defaultValueFs.getRecord(defaultValueFs.newRecord());
	//					defaultValue.idlavoratore = lavoratore;
	//				}
	//				else
	//					defaultValue = defaultValueFs.getSelectedRecord();
	//
	//				defaultValue.valore = fs[dataprovider];
	//			}
			}
		}
		// altrimenti aggiorniamo l'unico valore che potrebbe essere stato variato dall'utente (il campo 'terminato') 
		else
			requestFs.getSelectedRecord().terminato = fs.getSelectedRecord().terminato;
		
		if(callback)
			callback(requestFs.getSelectedRecord(), fs.getSelectedRecord());
		
		return { returnValue: 0, request: requestFs.getSelectedRecord() };
	}
	catch(ex)
	{
		databaseManager.rollbackTransaction();
		application.output(ex, LOGGINGLEVEL.ERROR);
		globals.ma_utl_showErrorDialog('i18n:ma.msg.save_error');
		
		return { returnValue: -1 };
	}	
}

/**
 * @properties={typeid:24,uuid:"BF4F3DAC-967F-4E6B-9A99-1E1FEFC83B94"}
 */
function mapParamsToRequest(params,request)
{
	request				 = _super.mapParamsToRequest(params, request);
	request.idditta		 = globals.ma_utl_ditta_toSede(params.idditta);
	request.rettificaper = params.rettificaper;
	
	return request;
}

/**
 * @properties={typeid:24,uuid:"5647391F-B15C-4FFB-9177-C4AC6C7C0583"}
 */
function mapRequestToParams(request, params)
{
	params				= _super.mapRequestToParams(request, params);
	params.idditta		= request.idditta;
	params.rettificaper	= request.rettificaper;
		
	return params;
}

/**
 * @AllowToRunInFind
 * 
 * @properties={typeid:24,uuid:"037C5671-732A-4D42-A867-E0E11BACBF6E"}
 */
function populateDataSet(ds, specification, params, data)
{
	data = getData(specification, params, data);
	
	ds = _super.populateDataSet(ds, specification, params, data);
	if(ds)
	{	
		/** @type {JSFoundset<db:/ma_anagrafiche/lavoratori>} */
		var fs = databaseManager.getFoundSet(globals.Server.MA_ANAGRAFICHE, globals.Table.LAVORATORI);
		if (fs && fs.find())
		{
			fs.idlavoratore = params.iddipendenti;
			fs.search();
			
			for(var l = 1; l <= fs.getSize(); l++)
			{
				var lavoratore = fs.getRecord(l);
				var item = data[lavoratore.idlavoratore_sede] || data[lavoratore.idlavoratore];
				
				var row = 
				[
					  (item && item.idrichiesta ) || params.requestid
					, (item && item.idregola    ) || params.ruleid
					, (item && item.codiceregola) || params.rulecode
					, lavoratore.idditta_sede
					, lavoratore.idlavoratore
					, lavoratore.codice
					, lavoratore.posizioneinps
					, lavoratore.lavoratori_to_persone.nominativo
				];
				
				if(data)
				{
					// Inserisci sempre un valore per la decorrenza ed il dettaglio, quindi concatena secondo
					// l'oggetto contenente i dati
					[{ dataprovider: 'decorrenza' },{ dataprovider:'dettaglio' },{ dataprovider:'terminato' }]
						.concat(specification)
						.forEach
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
				}
				
				ds.addRow(l, row);
			}
		}
	}
	
	return ds;
}

/**
 * @properties={typeid:24,uuid:"AE3B65DB-ED08-40E6-A0D3-EE6CED61001A"}
 */
function dc_save_validate(fs, program, multiple)
{
	return _super.dc_save_validate(fs, vParams.requiredfields || program, multiple);
}

/**
 * @properties={typeid:24,uuid:"BD867698-F11D-41BB-9E5E-3527A71020C1"}
 */
function updateCurrentData(field, idlavoratore, params, alladata)
{
	foundset[field.dataprovider] = globals.getCurrentData(field, params, { 'idlavoratore': idlavoratore, 'alladata': alladata });
}

/**
 * @returns {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"3C70B90F-8F30-4585-88AB-19D389A5EAEC"}
 */
function updateCurrentValue(newValue)
{
	if(!newValue)
		newValue = globals.TODAY;
	
	var specification = getSpecification(vParams);
	if (specification)
	{
		specification.forEach
		(
			function(field)
			{
				if (!field.dependson && field.isCurrentValue)
					updateCurrentData(field, foundset['idlavoratore'], vParams, newValue);
			}
		)
	}
	
	return true;
}
