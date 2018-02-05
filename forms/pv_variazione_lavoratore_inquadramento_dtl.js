/**
 * @properties={typeid:24,uuid:"901FCCD4-4E07-4BA8-AFC1-357FC724B1B5"}
 */
function getLayoutParams(multiple)
{
	var layoutParams 	        = _super.getLayoutParams(multiple);
		layoutParams.topMargin  = 0;
		layoutParams.sideMargin = null;
		
	return layoutParams;
}
