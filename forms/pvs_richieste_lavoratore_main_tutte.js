/**
 * @properties={typeid:24,uuid:"453986B2-4ED6-480D-B50B-0F04051AFF91"}
 */
function getButtonObject()
{
	var btnObj 			          = _super.getButtonObject();
		btnObj.btn_edit.enabled   = false;
		btnObj.btn_delete.enabled = false;
		btnObj.btn_new            = false;
	return btnObj;
}