/**
 * @param {JSForm} 	form
 * @param			params
 * @param			layoutParams
 * @param {Boolean} [isMultiple]
 * 
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"632AB2EC-8D0A-4B0E-BF35-EFC0B68142B5"}
 */
function setBodyElements(form, params, layoutParams, isMultiple)
{
	form = _super.setBodyElements(form, params, layoutParams, isMultiple);
	
	/**
	 * Set the form's height accordingly to the number of rows
	 */
	if(params.iddipendenti.length < layoutParams.maxNoOfRows)
		form.getBodyPart().height =   params.iddipendenti.length * layoutParams.fieldHeight
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
 * @properties={typeid:24,uuid:"6D0566E4-A1D3-4635-8074-2B4856A66CF8"}
 */
function onFieldRender(event)
{
	var renderable = event.getRenderable();
	if (renderable)
	{
		// INFO editable non più disponibile (https://support.servoy.com/browse/SVY-6989)
		if(renderable.enabled)
		{
			renderable.bgcolor = '#ffc4c4';
			renderable.fgcolor = '#434343';
		}
	}
}
