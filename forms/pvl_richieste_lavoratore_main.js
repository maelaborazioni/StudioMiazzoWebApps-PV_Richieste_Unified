/**
 * @properties={typeid:24,uuid:"B29D5E27-8F2E-44F4-A538-E27A3E06484E"}
 */
function getButtonObject()
{
	var btnObj = _super.getButtonObject();
		btnObj.btn_new = { enabled: false };
		
	return btnObj;
}